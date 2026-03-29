import React, { useState, useRef, useEffect } from "react";
import { FiSearch, FiPhone, FiVideo, FiMoreVertical, FiMenu, FiHash, FiUserPlus, FiLogOut, FiAlertTriangle, FiInfo } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery } from "react-query";
import api from "../api/api";
import ConfirmModal from "./ConfirmModal";
import { useSocketContext } from "../context/SocketProvider";
import { useLanguage } from "../context/LanguageContext";
import { FiGlobe } from "react-icons/fi";

export default function ChatHeader({ channelId, onMenuToggle }) {
  const navigate = useNavigate();
  const { presence } = useSocketContext();
  const { preferredLanguage, setPreferredLanguage, languages } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: channel, isLoading, refetch } = useQuery(
    ["channel", channelId],
    async () => {
      const res = await api.get(`/channels/${channelId}`);
      return res.data;
    },
    { enabled: !!channelId }
  );

  if (isLoading || !channel) {
    return (
      <div className="h-14 flex items-center px-4 md:px-6 bg-[var(--bg-primary)] border-b border-[var(--border-primary)] text-[var(--text-secondary)]">
        <button onClick={onMenuToggle} className="lg:hidden mr-3 p-1 text-[var(--text-secondary)]">
          <FiMenu className="w-6 h-6" />
        </button>
        Loading…
      </div>
    );
  }

  const members = channel.members || [];
  const presenceArray = Object.entries(presence).map(([id, p]) => ({ _id: id, ...p }));
  const onlineMembers = members.filter((m) =>
    presenceArray.some((p) => p._id === m._id && p.isOnline)
  );

  const handleAddMember = () => {
    setIsMenuOpen(false);
    navigate(`/app/channels/${channelId}/add-member`);
  };

  const handleLeaveChannel = () => {
    setIsMenuOpen(false);
    setShowLeaveModal(true);
  };

  const confirmLeaveChannel = async () => {
    setShowLeaveModal(false);
    try {
      await api.post(`/channels/${channelId}/leave`);
      toast.success(`Left ${channel.name}`);
      navigate("/");
    } catch (err) {
      toast.error("Failed to leave channel");
    }
  };

  const handleReportChannel = async () => {
    setIsMenuOpen(false);
    try {
      await api.post(`/channels/${channelId}/report`);
      toast.success("Channel reported successfully");
    } catch (err) {
      toast.error("Failed to report channel");
    }
  };

  const handleChannelInfo = () => {
    setIsMenuOpen(false);
    navigate(`/app/channels/${channelId}/info`);
  };

  return (
    <header
      className="
        h-14 px-4 md:px-6 flex items-center justify-between
        bg-[var(--bg-primary)]
        border-b border-[var(--border-primary)]
        select-none
      "
    >
      {/* LEFT: Channel Info */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition"
        >
          <FiMenu className="w-6 h-6" />
        </button>

        <div className="flex flex-col justify-center leading-tight min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <FiHash className="text-[var(--text-muted)] w-4 h-4 shrink-0" />
            <span className="text-[var(--text-primary)] font-bold text-sm md:text-base tracking-tight truncate">
              {channel.name}
            </span>
            {onlineMembers.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-[2px] text-[11px] md:text-xs text-[var(--text-muted)]">
            <span className="font-medium">{onlineMembers.length} Online</span>
            <span className="w-1 h-1 rounded-full bg-[var(--border-primary)]" />
            <span className="hidden sm:inline font-medium">{members.length} Members</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Language Selector */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[var(--text-muted)] transition mr-2">
          <FiGlobe className="w-4 h-4 text-[var(--text-secondary)]" />
          <select
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            className="bg-transparent text-xs text-[var(--text-primary)] border-none focus:ring-0 cursor-pointer outline-none font-bold"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-white text-black">
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`
              p-2 rounded-md
              hover:bg-[var(--bg-secondary)] 
              hover:text-[var(--text-primary)]
              transition-colors
              ${isMenuOpen ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}
            `}
          >
            <FiMoreVertical className="w-5 h-5" />
          </button>

          {/* DROPDOWN MENU */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[var(--border-primary)] rounded-xl shadow-[var(--shadow-lg)] py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
              <button
                onClick={handleChannelInfo}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition font-medium"
              >
                <FiInfo className="w-4 h-4" /> Channel Info
              </button>

              <button
                onClick={handleAddMember}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition font-medium"
              >
                <FiUserPlus className="w-4 h-4" /> Add Member
              </button>
              <button
                onClick={handleReportChannel}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition font-medium"
              >
                <FiAlertTriangle className="w-4 h-4" /> Report Channel
              </button>

              <div className="my-1 border-t border-[var(--border-primary)]" />

              <button
                onClick={handleLeaveChannel}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 transition font-medium"
              >
                <FiLogOut className="w-4 h-4" /> Leave Channel
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={confirmLeaveChannel}
        title={`Leave #${channel?.name}?`}
        description={`Are you sure you want to leave this channel? you can always join back later if you have an invite.`}
        confirmText="Leave Channel"
        variant="danger"
      />
    </header>
  );
}
