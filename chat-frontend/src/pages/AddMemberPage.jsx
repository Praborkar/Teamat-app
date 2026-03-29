import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import api from "../api/api";
import { FiArrowLeft, FiUserPlus, FiMail, FiSend, FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AddMemberPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: channel, isLoading, refetch } = useQuery(["channel", channelId], async () => {
    const res = await api.get(`/channels/${channelId}`);
    return res.data;
  }, { enabled: !!channelId });

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/channels/${channelId}/add-member`, { email: email.trim() });
      toast.success(`${email} added to channel!`);
      setEmail("");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !channel) {
    return <div className="flex-1 flex items-center justify-center text-[#b5bac1]">Loading...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-space overflow-y-auto">
      {/* HEADER */}
      <header className="h-14 px-6 flex items-center border-b border-[var(--border-primary)] bg-[var(--bg-primary)] sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => navigate(`/app/channels/${channelId}`)}
          className="mr-4 p-2 rounded-full hover:bg-[var(--bg-secondary)] transition text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <FiUserPlus className="w-5 h-5 text-[var(--accent-primary)]" />
          <h1 className="font-black text-[var(--text-primary)] tracking-tight">Add Member</h1>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-2xl mx-auto w-full p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* ADD MEMBER FORM */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">Invite someone to #{channel.name}</h2>
            <p className="text-[var(--text-muted)] text-sm font-medium">Grow your team by adding collaborators via their email address.</p>
          </div>

          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors">
                 <FiMail className="w-5 h-5" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter@email.com"
                className="
                  w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl py-4 flex items-center pl-12 pr-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] font-medium
                  focus:outline-none focus:bg-white focus:border-[var(--accent-primary)]/50 focus:ring-4 focus:ring-[var(--accent-primary)]/5 transition-all shadow-sm
                "
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={submitting || !email.trim()}
              className="
                w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:bg-[var(--bg-tertiary)]
                text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-[var(--accent-primary)]/20 active:scale-98
              "
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <><FiSend className="w-4 h-4" /> Send Invite</>
              )}
            </button>
          </form>
        </section>

        {/* CURRENT MEMBERS QUICK VIEW */}
        <section className="bg-[var(--bg-secondary)]/50 p-6 rounded-3xl border border-[var(--border-primary)] space-y-5">
           <div className="flex items-center gap-2 text-[var(--text-muted)] font-black text-[11px] uppercase tracking-widest border-b border-[var(--border-primary)] pb-4">
              <FiUsers className="w-4 h-4" />
              <span>Current Members ({channel.members.length})</span>
           </div>
           <div className="flex flex-wrap gap-2.5">
              {channel.members.map(member => (
                <div key={member._id} className="bg-white px-4 py-2 rounded-xl border border-[var(--border-primary)] text-xs font-black text-[var(--text-primary)] shadow-sm">
                   {member.name}
                </div>
              ))}
           </div>
        </section>

      </div>
    </div>
  );
}
