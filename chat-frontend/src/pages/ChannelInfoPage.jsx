import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import api from "../api/api";
import { FiArrowLeft, FiHash, FiUsers, FiClock, FiShield, FiInfo, FiEdit2, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import ConfirmModal from "../components/ConfirmModal";
import { useSocketContext } from "../context/SocketProvider";
import toast from "react-hot-toast";

export default function ChannelInfoPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { presence } = useSocketContext();

  const { data: channel, isLoading, refetch } = useQuery(["channel", channelId], async () => {
    const res = await api.get(`/channels/${channelId}`);
    return res.data;
  }, { enabled: !!channelId });

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  // Sync editedName when channel loads
  React.useEffect(() => {
    if (channel) setEditedName(channel.name);
  }, [channel]);

  const handleSaveName = async () => {
    if (!editedName.trim() || editedName === channel?.name) {
      setIsEditingName(false);
      return;
    }

    setSaving(true);
    try {
      await api.put(`/channels/${channelId}`, { name: editedName.trim() });
      toast.success("Channel renamed successfully!");
      setIsEditingName(false);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to rename channel");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChannel = async () => {
    try {
      await api.delete(`/channels/${channelId}`);
      toast.success("Channel deleted successfully");
      navigate("/app");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete channel");
    }
  };

  if (isLoading || !channel) {
    return <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] font-black uppercase tracking-widest text-sm animate-pulse">Loading channel info...</div>;
  }

  const members = channel.members || [];
  const presenceArray = Object.entries(presence).map(([id, p]) => ({ _id: id, ...p }));
  const onlineCount = members.filter(m => presenceArray.find(p => p._id === m._id && p.isOnline)).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-space overflow-y-auto scrollbar-hide">
      {/* HEADER */}
      <header className="h-14 px-6 flex items-center border-b border-[var(--border-primary)] bg-[var(--bg-primary)] sticky top-0 z-10 shadow-sm backdrop-blur-md bg-opacity-80">
        <button 
          onClick={() => navigate(`/app/channels/${channelId}`)}
          className="mr-4 p-2 rounded-full hover:bg-[var(--bg-secondary)] transition text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <FiInfo className="w-5 h-5 text-[var(--accent-primary)]" />
          <h1 className="font-black text-[var(--text-primary)] tracking-tight">Channel Info</h1>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto w-full p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* HERO SECTION - Simplified to plain UI */}
        <section className="bg-[var(--bg-secondary)] py-8 border-b border-[var(--border-primary)] relative overflow-hidden group">
          <div className="flex items-center gap-6 relative z-10 px-4">
             <div className="w-16 h-16 bg-[#5865f2] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#5865f2]/20 shrink-0">
               {channel.name.charAt(0).toUpperCase()}
             </div>
             <div className="space-y-1 flex-1">
               {isEditingName ? (
                 <div className="flex items-center gap-2 animate-in fade-in duration-200">
                   <input
                     autoFocus
                     value={editedName}
                     onChange={(e) => setEditedName(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === "Enter") handleSaveName();
                       if (e.key === "Escape") setIsEditingName(false);
                     }}
                     className="bg-[var(--bg-primary)] border-2 border-[var(--accent-primary)] text-[var(--text-primary)] text-xl font-bold rounded-xl px-3 py-1 outline-none w-full max-w-sm focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all"
                   />
                   <button 
                     onClick={handleSaveName}
                     disabled={saving}
                     className="p-2 bg-[#23a559] text-white rounded-xl hover:bg-[#1a8545] transition-colors shadow-lg shadow-[#23a559]/20"
                   >
                     <FiCheck className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={() => setIsEditingName(false)}
                     className="p-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--border-primary)] transition-colors"
                   >
                     <FiX className="w-5 h-5" />
                   </button>
                 </div>
               ) : (
                 <div className="flex items-center gap-3">
                   <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">#{channel.name}</h2>
                   <button 
                     onClick={() => setIsEditingName(true)}
                     className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-all opacity-0 group-hover:opacity-100"
                   >
                     <FiEdit2 className="w-4 h-4" />
                   </button>
                 </div>
               )}
               <p className="text-[var(--text-muted)] text-[13px] font-bold uppercase tracking-tight flex items-center gap-2">
                 <FiClock className="w-4 h-4" /> Created {new Date(channel.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
               </p>
             </div>
          </div>
        </section>

        {/* STATS BREADCRUMBS */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-[var(--bg-secondary)]/60 p-5 rounded-2xl border border-[var(--border-primary)] flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
              <div className="w-12 h-12 bg-[#23a559]/10 rounded-xl flex items-center justify-center text-[#23a559]">
                 <FiUsers className="w-6 h-6" />
              </div>
              <div>
                 <div className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest leading-none mb-1">Total Members</div>
                 <div className="text-2xl font-black text-[var(--text-primary)]">{members.length}</div>
              </div>
           </div>
           <div className="bg-[var(--bg-secondary)]/60 p-5 rounded-2xl border border-[var(--border-primary)] flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
              <div className="w-12 h-12 bg-[var(--accent-primary)]/10 rounded-xl flex items-center justify-center text-[var(--accent-primary)]">
                 <FiShield className="w-6 h-6" />
              </div>
              <div>
                 <div className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest leading-none mb-1">Online Now</div>
                 <div className="text-2xl font-black text-[var(--text-primary)]">{onlineCount}</div>
              </div>
           </div>
        </div>

        {/* MEMBER LIST */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-primary)]">
             <h3 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Members — {members.length}</h3>
          </div>
          <div className="grid gap-2">
            {members.map(member => {
              const userPresence = presenceArray.find(p => p._id === member._id) || { isOnline: false };
              return (
                <div 
                  key={member._id}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--bg-secondary)] transition-all group cursor-default"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center font-black text-sm text-[var(--text-primary)] border border-[var(--border-primary)] shadow-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={`
                      absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-[3px] border-[var(--bg-primary)]
                      ${userPresence.isOnline ? 'bg-[#23a559]' : 'bg-[var(--text-muted)]'}
                    `} />
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-[var(--text-primary)]">{member.name}</div>
                    <div className="text-xs text-[var(--text-muted)] font-medium">{member.email}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SIMPLE DELETE OPTION */}
        <section className="pt-12 pb-8 flex justify-center border-t border-[var(--border-primary)] mt-12">
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="group flex items-center gap-2 text-red-500 hover:text-red-700 font-black text-[11px] uppercase tracking-widest transition-all p-3 px-6 rounded-xl hover:bg-red-50"
            >
              <FiTrash2 className="w-4 h-4 transition-transform group-hover:scale-110" /> Delete This Channel
            </button>
        </section>

      </div>

      <ConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteChannel}
        title={`Delete #${channel.name}?`}
        description="This action is permanent and will delete all messages and data associated with this channel. Are you absolutely sure?"
        confirmText="Yes, Delete Channel"
        variant="danger"
      />
    </div>
  );
}
