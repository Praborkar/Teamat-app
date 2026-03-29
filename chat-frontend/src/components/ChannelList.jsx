import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useChannels } from "../hooks/useChannels";
import { useMutation, useQueryClient } from "react-query";
import api from "../api/api";
import { Trash2 } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import toast from "react-hot-toast";
import channelIcon from "../assets/channel.png";

export default function ChannelList({ search = "", onSelect }) {
  const { data, isLoading } = useChannels();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/channels/${id}`),
    onSuccess: () => {
      toast.success("Channel deleted");
      queryClient.invalidateQueries("channels");
    },
    onError: () => toast.error("Failed to delete"),
  });

  if (isLoading) {
    return <div className="text-[var(--text-muted)] text-[11px] px-4 font-black uppercase tracking-widest animate-pulse">Loading…</div>;
  }

  const channels = Array.isArray(data) ? data : [];

  const filtered = channels
    .filter((ch) => ch.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!filtered.length) {
    return <div className="text-[var(--text-muted)] text-[11px] px-4 font-black uppercase tracking-widest">No channels</div>;
  }

  return (
    <>
      <ul className="space-y-1.5">
        {filtered.map((channel) => {
          const isActive = location.pathname.includes(channel._id);

          return (
            <li key={channel._id} className="relative group">
              {/* ACTIVE BAR — subtle + minimal */}
              {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-[4px] bg-[var(--accent-primary)] rounded-r-full shadow-[0_0_8px_rgba(88,101,242,0.4)]" />
              )}

              <Link
                to={`/app/channels/${channel._id}`}
                onClick={() => onSelect && onSelect()}
                className={`
                  flex items-center gap-3
                  px-3 py-2 rounded-lg text-sm
                  transition-all duration-150 select-none

                  ${
                    isActive
                      ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-sm font-bold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50 hover:text-[var(--text-primary)] font-medium"
                  }
                `}
              >
                {/* ICON */}
                <div
                  className={`
                    w-7 h-7 flex items-center justify-center rounded-md
                    border transition

                    ${
                      isActive
                        ? "bg-white border-[var(--border-primary)] shadow-sm"
                        : "bg-[var(--bg-tertiary)] border-[var(--border-primary)] group-hover:bg-white group-hover:border-[var(--text-muted)] group-hover:shadow-sm"
                    }
                  `}
                >
                  <img src={channelIcon} className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* CHANNEL NAME */}
                <span className="flex-1 truncate tracking-tight">#{channel.name}</span>

                {/* UNREAD DOT */}
                {!isActive && channel.unread > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_rgba(88,101,242,0.6)]" />
                )}
              </Link>

              {/* DELETE BUTTON — clean + minimal */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setConfirmDelete(channel);
                }}
                className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  text-[var(--text-muted)] hover:text-red-500
                  opacity-0 group-hover:opacity-100
                  transition-all duration-200
                "
              >
                <Trash2 size={16} />
              </button>
            </li>
          );
        })}
      </ul>

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal 
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          deleteMutation.mutate(confirmDelete._id);
          setConfirmDelete(null);
        }}
        title="Delete Channel"
        description={`Are you sure you want to delete #${confirmDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
