import React from "react";
import { useSocketContext } from "../context/SocketProvider";
import defaultAvatar from "../assets/profile.png";

export default function OnlineUsersPanel() {
  const { presence } = useSocketContext();

  const onlineUsers = Object.entries(presence)
    .filter(([_, p]) => p?.isOnline)
    .map(([userId, p]) => ({
      _id: userId,
      name: p?.name || "Unknown",
      email: p?.email,
      avatarUrl: p?.avatarUrl,
    }));

  if (!onlineUsers.length) {
    return (
      <div className="text-[#8a8e93] text-xs uppercase text-center py-6">
        No users online
      </div>
    );
  }

  return (
    <div
      className="
        relative 
        h-full flex flex-col
        w-full
        bg-[var(--bg-primary)]
        overflow-hidden
      "
    >

      {/* Content */}
      <div className="px-5 py-6 z-10 overflow-y-auto">

        {/* Header */}
        <h3 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-6">
          Online — {onlineUsers.length}
        </h3>

        {/* List of Online Users */}
        <ul className="space-y-4">
          {onlineUsers.map((user) => (
            <li
              key={user._id}
              className="
                flex items-center gap-4 px-3 py-2
                rounded-2xl cursor-pointer
                transition-all
                hover:bg-[var(--bg-secondary)]
              "
            >
              {/* Avatar */}
              <div className="relative">
                <img
                  src={user.avatarUrl || defaultAvatar}
                  alt={user.name}
                  className="
                    w-10 h-10 rounded-full object-cover
                    border border-black/30
                    shadow-[0_2px_5px_rgba(0,0,0,0.5)]
                  "
                />

                {/* Status dot */}
                <span
                  className="
                    absolute bottom-0.5 right-0.5
                    w-3.5 h-3.5 rounded-full bg-[#23a559]
                    ring-2 ring-[var(--bg-primary)]
                  "
                />
              </div>

              {/* Name + Status */}
              <div className="leading-tight">
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {user.name}
                </p>

                <p className="text-[11px] text-[var(--text-muted)] font-medium">
                  Online
                </p>
              </div>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}
