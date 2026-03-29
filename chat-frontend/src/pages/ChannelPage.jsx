import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";
import { useMessages } from "../hooks/useMessages";
import { useSocketContext } from "../context/SocketProvider";

export default function ChannelPage({ onMenuToggle }) {
  const { channelId } = useParams();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    addLocalMessage,
    updateConfirmedMessage,
  } = useMessages(channelId);

  const { socket, ready } = useSocketContext();
  const [typingUsers, setTypingUsers] = React.useState({}); // { userId: userName }

  useEffect(() => {
    if (!socket || !ready || !channelId) return;

    socket.emit("joinChannel", { channelId });

    const handleNewMessage = (msg) => {
      if (msg.channelId !== channelId) return;

      // If it's an optimistic broadcast from the socket:
      if (msg.optimistic) {
        // SENDER: Already added it locally in ChatInput. Ignore the socket broadcast of our own message.
        if (msg.user?._id === data?.currentUserId) return;
        
        // RECEIVER: Add it instantly to the message list.
        addLocalMessage(msg);
      } else {
        // FINAL MESSAGE (after DB save): Usually handled by message:update, 
        // but if it comes through newMessage, add it.
        addLocalMessage(msg);
      }
    };

    const handleUpdatedMessage = (msg) => {
      if (msg.channelId === channelId) updateConfirmedMessage(msg);
    };

    const handleUserTyping = ({ channelId: tid, userId, userName }) => {
      if (tid === channelId) {
        setTypingUsers((prev) => ({ ...prev, [userId]: userName }));
      }
    };

    const handleUserStopTyping = ({ channelId: tid, userId }) => {
      if (tid === channelId) {
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }
    };

    socket.off("newMessage");
    socket.off("message:update");
    socket.off("user:typing");
    socket.off("user:stopTyping");

    socket.on("newMessage", handleNewMessage);
    socket.on("message:update", handleUpdatedMessage);
    socket.on("user:typing", handleUserTyping);
    socket.on("user:stopTyping", handleUserStopTyping);

    return () => {
      socket.emit("leaveChannel", { channelId });
      socket.off("newMessage");
      socket.off("message:update");
      socket.off("user:typing");
      socket.off("user:stopTyping");
    };
  }, [socket, ready, channelId]);

  const typingCount = Object.keys(typingUsers).length;
  const typingText = typingCount === 0
    ? ""
    : typingCount === 1
      ? `${Object.values(typingUsers)[0]} is typing...`
      : `${typingCount} users are typing...`;

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] text-[var(--text-primary)]">

      {/* Chat Header */}
      <ChatHeader channelId={channelId} onMenuToggle={onMenuToggle} />

      {/* Entire chat container */}
      <div
        className="
          flex-1 overflow-hidden 
          md:border md:border-[var(--border-primary)] 
          md:rounded-lg md:mt-2 
          flex flex-col 
          bg-[var(--bg-primary)]
          relative
        "
      >
        {/* Message List */}
        <MessageList
          pages={data?.pages}
          loadMore={fetchNextPage}
          hasMore={hasNextPage}
          loadingMore={isFetchingNextPage}
          currentUserId={data?.currentUserId}
        />

        {/* Typing Indicator Overlay */}
        {typingCount > 0 && (
          <div className="px-4 py-1 text-xs text-[var(--text-muted)] italic animate-pulse">
            {typingText}
          </div>
        )}

        {/* Chat Input */}
        <ChatInput channelId={channelId} />
      </div>
    </div>
  );
}
