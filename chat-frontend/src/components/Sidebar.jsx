import React, { useState } from "react";
import ChannelList from "./ChannelList";
import CreateChannelModal from "./CreateChannelModal";
import ConfirmModal from "./ConfirmModal";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import logo from "../assets/logo.png";

export default function Sidebar({ onSelect }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div
      className="
        h-full w-full flex flex-col
        bg-[var(--bg-secondary)]
        text-[var(--text-primary)]
      "
    >
      {/* HEADER */}
      <div
        className="
          px-5 py-4
          border-b border-[var(--border-primary)]
          flex items-center justify-between
        "
      >
        <img 
          src={logo} 
          alt="Teamat" 
          className="h-7 w-auto object-contain" 
        />
        {/* Mobile Close Button */}
        <button
          onClick={() => onSelect && onSelect()}
          className="lg:hidden p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      {/* CREATE CHANNEL BUTTON */}
      <div className="px-4 py-4">
        <button
          onClick={() => setShowModal(true)}
          className="
            w-full py-2.5 rounded-lg
            bg-[#5865f2] hover:bg-[#4752c4]
            text-white font-medium
            transition shadow-[0_4px_12px_rgba(88,101,242,0.35)]
            active:scale-95
          "
        >
          + Create Channel
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="px-4">
        <input
          type="text"
          placeholder="Search channels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full px-3 py-2
            rounded-lg text-sm
            bg-[var(--bg-tertiary)]/60
            border border-[var(--border-primary)]
            placeholder-[var(--text-secondary)]
            text-[var(--text-primary)]
            focus:ring-2 focus:ring-[var(--accent-primary)]
            outline-none transition
          "
        />
      </div>

      {/* CHANNELS TITLE */}
      <h3
        className="
          px-4 mt-4 mb-2
          text-[11px] uppercase tracking-wider
          font-bold text-[var(--text-secondary)]
        "
      >
        Text Channels
      </h3>

      {/* CHANNEL LIST */}
      <div
        className="
          flex-1 overflow-y-auto 
          px-2 pb-4
          scrollbar-thin scrollbar-thumb-[#2b2d31] scrollbar-track-transparent
        "
      >
        <ChannelList search={search} onSelect={onSelect} />
      </div>

      {/* USER FOOTER */}
      <div
        className="
          px-4 py-4
          bg-[var(--bg-tertiary)]/30
          border-t border-[var(--border-primary)]
          flex items-center justify-between shadow-inner
        "
      >
          {/* Avatar + Status + Info */}
          <div 
            onClick={() => navigate("/app/profile")}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all group"
          >
            {/* Avatar */}
            <div className="relative">
              <div
                className="
                  w-10 h-10 rounded-full
                  bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)]
                  flex items-center justify-center
                  font-bold text-sm text-[var(--text-primary)]
                  border border-[var(--border-primary)]
                  shadow-sm group-hover:border-[var(--accent-primary)]/50
                  transition-all
                "
              >
                {user?.name?.[0]?.toUpperCase()}
              </div>
  
              {/* Status dot */}
              <span
                className="
                  absolute bottom-0 right-0
                  w-3.5 h-3.5 rounded-full
                  bg-green-500 
                  ring-2 ring-[var(--bg-secondary)]
                "
              />
            </div>
  
            {/* User info */}
            <div className="leading-tight">
              <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">{user?.name}</p>
              <p className="text-[11px] text-[var(--text-secondary)]">{user?.email}</p>
            </div>
          </div>

        {/* LOGOUT BUTTON (RED) */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="
            px-4 py-1.5
            bg-red-500 
            text-white text-[12px] font-medium
            rounded-md
            hover:bg-red-600 
            active:scale-95
            transition-all
            shadow-[0_2px_6px_rgba(255,0,0,0.4)]
          "
        >
          Logout
        </button>
      </div>

      {/* MODAL */}
      {showModal && <CreateChannelModal onClose={() => setShowModal(false)} />}

      <ConfirmModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
        title="Log Out"
        description="Are you sure you want to log out? You will need to sign in again to access your channels."
        confirmText="Log Out"
        variant="danger"
      />
    </div>
  );
}
