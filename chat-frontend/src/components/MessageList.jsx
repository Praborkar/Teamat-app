import React, { useEffect, useRef, useCallback } from "react";
import MessageItem from "./MessageItem";
import { format, isSameDay } from "date-fns";

export default function MessageList({
  pages,
  loadMore,
  hasMore,
  loadingMore,
  currentUserId,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  // Flatten messages
  const messages = (pages || []).flatMap((page) => page.messages || []);

  // Oldest → Newest
  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Near bottom check
  const isNearBottom = () => {
    const el = containerRef.current;
    if (!el) return false;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (el.scrollTop < 50 && hasMore && !loadingMore) {
      const prevHeight = el.scrollHeight;
      loadMore();

      setTimeout(() => {
        const newHeight = el.scrollHeight;
        el.scrollTop = newHeight - prevHeight;
      }, 50);
    }
  }, [hasMore, loadingMore, loadMore]);

  // Auto-scroll logic
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // If it's the first time messages are loaded (scrollTop is at the very top and we have messages)
    // or if we are already near the bottom when a new message arrives
    if (el.scrollTop === 0 || isNearBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [sorted.length]);

  // Date separator logic
  const needsDateSeparator = (current, previous) => {
    if (!previous) return true;
    return !isSameDay(new Date(current.createdAt), new Date(previous.createdAt));
  };

  const formatDateLabel = (date) => {
    const d = new Date(date);
    const today = new Date();

    if (isSameDay(d, today)) return "Today";

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (isSameDay(d, yesterday)) return "Yesterday";

    return format(d, "dd MMM yyyy");
  };

  if (!sorted.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-sm bg-[var(--bg-primary)]">
        Start a conversation…
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="
        flex-1 overflow-y-auto
        px-6 py-5
        bg-[var(--bg-primary)]
        text-[var(--text-primary)]
        flex flex-col
        scroll-smooth
        scrollbar-thin scrollbar-thumb-[var(--border-primary)] scrollbar-track-transparent
      "
    >
      {/* LOADING MORE */}
      {loadingMore && (
        <div className="text-center text-[11px] text-[var(--text-muted)] mb-4 font-black uppercase tracking-widest animate-pulse">
          Loading older messages…
        </div>
      )}

      {/* ALL MESSAGES */}
      {sorted.map((msg, index) => {
        const prev = sorted[index - 1];

        const showDate = needsDateSeparator(msg, prev);

        const sameUser =
          prev &&
          (prev.user?._id || prev.userId?._id) ===
            (msg.user?._id || msg.userId?._id);

        const grouped =
          sameUser &&
          !needsDateSeparator(msg, prev) &&
          Math.abs(new Date(msg.createdAt) - new Date(prev.createdAt)) <
            3 * 60 * 1000;

        return (
          <div key={msg._id}>
            {/* DATE SEPARATOR */}
            {showDate && (
              <div className="flex items-center justify-center my-6">
                <span
                  className="
                    text-[11px] text-[var(--text-muted)]
                    px-5 py-2
                    bg-[var(--bg-secondary)]
                    border border-[var(--border-primary)]
                    rounded-full
                    tracking-widest font-black uppercase
                    shadow-[var(--shadow-sm)]
                  "
                >
                  {formatDateLabel(msg.createdAt)}
                </span>
              </div>
            )}

            {/* MESSAGE ITEM */}
            <MessageItem
              message={msg}
              currentUserId={currentUserId}
              grouped={grouped}
            />
          </div>
        );
      })}

      {/* SCROLL TARGET */}
      <div ref={bottomRef} />
    </div>
  );
}
