import React, { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { useSocketContext } from "../context/SocketProvider";
import api from "../api/api";
import { FiSmile, FiPaperclip, FiSend, FiX, FiFileText } from "react-icons/fi";
import { useMessages } from "../hooks/useMessages";
import toast from "react-hot-toast";
import Filter from "bad-words";
const filter = new Filter();

export default function ChatInput({ channelId }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const { socket } = useSocketContext();
  const { addLocalMessage } = useMessages(channelId);

  // --- TYPING INDICATOR LOGIC ---
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  function handleTyping() {
    if (!socket || !channelId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing", { channelId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  }

  function stopTyping() {
    if (isTypingRef.current && socket && channelId) {
      socket.emit("stopTyping", { channelId });
      isTypingRef.current = false;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 25 * 1024 * 1024) {
      toast.error("File is too large (max 25MB)");
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreview(url);
    } else {
      setFilePreview("doc"); // string flag for non-image files
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  async function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed && !file) return;

    setUploading(true);
    stopTyping();

    let fileUrl = null;
    let fileType = null;

    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.post("/messages/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        fileUrl = data.fileUrl;
        fileType = data.fileType;
      }

      let filteredText = trimmed;
      if (trimmed) {
        try {
          filteredText = filter.clean(trimmed);
        } catch (err) {
          console.error("Filter error:", err);
        }
      }

      const tempMessage = {
        _id: `temp-${Date.now()}`,
        text: filteredText,
        fileUrl,
        fileType,
        channelId,
        createdAt: new Date(),
        user: { _id: "me" },
        optimistic: true,
      };

      addLocalMessage(tempMessage);

      if (socket) {
        socket.emit("sendMessage", { 
          channelId, 
          text: filteredText, 
          fileUrl, 
          fileType, 
          clientSideId: tempMessage._id 
        });
      } else {
        await api.post("/messages", { channelId, text: filteredText, fileUrl, fileType });
      }

      setText("");
      removeFile();
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    } finally {
      setUploading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-primary)]/50 backdrop-blur-md">
      {/* File Preview */}
      {filePreview && (
        <div className="mb-3 flex items-center gap-3 bg-[var(--bg-secondary)] p-2.5 rounded-2xl border border-[var(--border-primary)] w-fit relative group animate-in fade-in duration-200 shadow-sm">
          {filePreview === "doc" ? (
            <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center text-[var(--accent-primary)] shadow-inner">
              <FiFileText className="w-8 h-8" />
            </div>
          ) : (
            <img
              src={filePreview}
              alt="preview"
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          <div className="flex flex-col pr-4">
            <span className="text-xs text-[var(--text-primary)] font-bold truncate max-w-[140px]">
              {file.name}
            </span>
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
          <button
            onClick={removeFile}
            className="absolute -top-2 -right-2 bg-[#ed4245] text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <FiX className="w-3 h-3" />
          </button>
        </div>
      )}

      <div
        className="
          flex items-center gap-3
          px-5 py-3.5
          rounded-2xl
          bg-[var(--bg-secondary)] 
          border border-[var(--border-primary)]
          shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]
          relative
          transition-all
        "
      >
        {/* Glow top highlight */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-b from-white/5 to-transparent opacity-20" />

        {/* Emoji Selector */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="
              text-[var(--text-secondary)] hover:text-[var(--text-primary)]
              hover:scale-110 active:scale-95
              transition transform
            "
          >
            <FiSmile className="w-5 h-5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-50 animate-in slide-in-from-bottom-2 duration-200">
              <EmojiPicker 
                onEmojiClick={onEmojiClick}
                theme="light"
                searchDisabled
                skinTonesDisabled
                width={300}
                height={400}
              />
            </div>
          )}
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          disabled={uploading}
          rows={1}
          className="
            flex-1 bg-transparent outline-none resize-none
            text-[15px] text-[var(--text-primary)] placeholder-[var(--text-muted)]
            caret-[var(--accent-primary)] font-medium
            leading-5
            disabled:opacity-50
          "
          placeholder={uploading ? "Uploading..." : "Write a message..."}
        />

        {/* Attachment */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="
            text-[var(--text-secondary)] hover:text-[var(--text-primary)]
            hover:scale-110 active:scale-95 
            transition transform
            disabled:opacity-50
          "
        >
          <FiPaperclip className="w-5 h-5" />
        </button>

        {/* Send */}
        <button
          onClick={sendMessage}
          disabled={uploading || (!text.trim() && !file)}
          className="
            flex items-center justify-center
            bg-[#5865f2] text-white 
            w-9 h-9 rounded-xl
            hover:bg-[#4752c4]
            hover:scale-[1.05] active:scale-95
            transition transform
            shadow-[0_4px_14px_rgba(88,101,242,0.35)]
            disabled:opacity-50 disabled:scale-100 disabled:shadow-none
          "
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <FiSend className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
