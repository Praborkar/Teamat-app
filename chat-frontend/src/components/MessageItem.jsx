import React from "react";
import { format } from "date-fns";
import defaultAvatar from "../assets/profile.png";
import { FiFileText, FiGlobe, FiRotateCcw } from "react-icons/fi";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/api";

export default function MessageItem({ message: initialMessage, currentUserId, grouped }) {
  const [message, setMessage] = React.useState(initialMessage);
  const [translation, setTranslation] = React.useState(null);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const { preferredLanguage, languages } = useLanguage();

  const user = message.user || message.userId || {};
  const avatarSrc = user.avatarUrl || defaultAvatar;

  const isMe = user._id === currentUserId;

  const handleTranslate = async () => {
    if (isTranslating) return;
    
    // Check if we already have this translation
    if (message.translations && message.translations[preferredLanguage]) {
      setTranslation(message.translations[preferredLanguage]);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await api.post(`/messages/${message._id}/translate`, {
        targetLanguage: preferredLanguage
      });
      setTranslation(res.data.translatedText);
      
      // Update local message state to cache the translation
      setMessage(prev => ({
        ...prev,
        translations: {
          ...(prev.translations || {}),
          [preferredLanguage]: res.data.translatedText
        }
      }));
    } catch (err) {
      console.error("Translation failed", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const targetLangName = languages.find(l => l.code === preferredLanguage)?.name || preferredLanguage;

  const time = message.createdAt
    ? format(new Date(message.createdAt), "hh:mm a")
    : "";

  return (
    <div
      className={`
        group relative flex gap-3 px-4
        transition-all
        ${grouped ? "py-0.5" : "py-2.5 hover:bg-[var(--bg-secondary)]/50"}
      `}
    >
      {/* Avatar (hidden for grouped messages) */}
      {!grouped && (
        <img
          src={avatarSrc}
          alt="avatar"
          className="
            w-10 h-10 rounded-full object-cover
            border border-[var(--border-primary)]
            shadow-sm
            mt-1
          "
        />
      )}

      {/* Message Block */}
      <div className="flex flex-col min-w-0">

        {/* NAME + TIMESTAMP (hidden for grouped messages) */}
        {!grouped && (
          <div className="flex items-center gap-2 mb-[2px]">
            <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
              {user.name || "User"}
            </span>

            <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-tight">
              {time}
            </span>
          </div>
        )}

        {/* MESSAGE TEXT */}
        {message.text && (
          <div className="flex flex-col">
            <p
              className={`
                text-[15px] leading-6 whitespace-pre-wrap break-words
                transition-colors font-medium
                text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]
                ${grouped ? "ml-[52px]" : ""}
              `}
            >
              {message.text}
            </p>

            {/* Translation Output */}
            {translation && (
              <div className={`mt-2 p-3 rounded-xl bg-[var(--bg-secondary)] border-l-4 border-[var(--accent-primary)] ${grouped ? "ml-[52px]" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <FiGlobe className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                    Translation: {targetLangName}
                  </span>
                </div>
                <p className="text-[14px] text-[var(--text-primary)] font-medium italic leading-relaxed">
                  {translation}
                </p>
                <button 
                  onClick={() => setTranslation(null)}
                  className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-[var(--accent-primary)] hover:underline transition"
                >
                  <FiRotateCcw className="w-3 h-3" />
                  Original
                </button>
              </div>
            )}

            {/* Translate Trigger Button (visible on hover) */}
            {!translation && !isTranslating && (
              <button
                onClick={handleTranslate}
                className={`
                  hidden group-hover:flex items-center gap-1.5 
                  mt-1 p-1 px-2 rounded-lg hover:bg-[var(--bg-secondary)] 
                  text-[11px] font-bold text-[var(--accent-primary)] 
                  transition-all w-fit
                  ${grouped ? "ml-[52px]" : ""}
                `}
              >
                <FiGlobe className="w-3.5 h-3.5" />
                Translate to {targetLangName}
              </button>
            )}

            {isTranslating && (
              <div className={`mt-1 text-[11px] font-bold text-[var(--text-muted)] animate-pulse ${grouped ? "ml-[52px]" : ""}`}>
                Translating…
              </div>
            )}
          </div>
        )}

        {/* FILE ATTACHMENT */}
        {message.fileUrl && (
          <div className={`mt-2 ${grouped ? "ml-[52px]" : ""}`}>
            {message.fileType?.startsWith("image/") ? (
              <a
                href={`${import.meta.env.VITE_API_URL || "http://localhost:4000"}${message.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block relative group/img overflow-hidden rounded-2xl border border-[var(--border-primary)] shadow-sm"
              >
                <img
                  src={`${import.meta.env.VITE_API_URL || "http://localhost:4000"}${message.fileUrl}`}
                  alt="attachment"
                  className="max-w-full sm:max-w-md max-h-[300px] object-contain hover:scale-[1.01] transition-transform"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">View Full Size</span>
                </div>
              </a>
            ) : (
              <a
                href={`${import.meta.env.VITE_API_URL || "http://localhost:4000"}${message.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center gap-4 p-4 rounded-2xl
                  bg-[var(--bg-secondary)] border border-[var(--border-primary)] 
                  hover:bg-[var(--bg-tertiary)] transition-colors w-fit max-w-full
                  shadow-sm
                "
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[var(--accent-primary)] shadow-sm">
                  <FiFileText className="w-6 h-6" />
                </div>
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[200px]">
                    {message.fileUrl.split('/').pop()}
                  </span>
                  <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Download Attachment</span>
                </div>
              </a>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
