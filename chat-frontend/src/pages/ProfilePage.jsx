import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../api/api";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiSave } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.put("/users/me", formData);
      updateUser(data.user);
      toast.success("Profile updated successfully!");
      // Clear password fields
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)] p-6 md:p-10 font-space animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <div>
             <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">Profile Settings</h1>
             <p className="text-[var(--text-muted)] font-medium">Update your account information and security</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* PERSONAL INFO SECTION */}
          <section className="space-y-4">
             <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-70 ml-1">Personal Details</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NAME */}
                <div className="space-y-2">
                  <label className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative group">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" />
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] p-4 rounded-xl pl-12 focus:outline-none focus:bg-white focus:border-[var(--accent-primary)]/50 focus:ring-4 focus:ring-[var(--accent-primary)]/5 transition-all font-medium"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div className="space-y-2">
                  <label className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative group">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] p-4 rounded-xl pl-12 focus:outline-none focus:bg-white focus:border-[var(--accent-primary)]/50 focus:ring-4 focus:ring-[var(--accent-primary)]/5 transition-all font-medium"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
             </div>
          </section>

          {/* SECURITY SECTION */}
          <section className="space-y-4 pt-4 border-t border-[var(--border-primary)]/50">
             <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-70 ml-1">Security & Password</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CURRENT PASSWORD */}
                <div className="space-y-2">
                  <label className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">Current Password</label>
                  <div className="relative group">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" />
                    <input
                      name="currentPassword"
                      type={showCurrent ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] p-4 rounded-xl pl-12 pr-12 focus:outline-none focus:bg-white focus:border-[var(--accent-primary)]/50 focus:ring-4 focus:ring-[var(--accent-primary)]/5 transition-all font-medium"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {showCurrent ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* NEW PASSWORD */}
                <div className="space-y-2">
                  <label className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">New Password</label>
                  <div className="relative group">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors" />
                    <input
                      name="newPassword"
                      type={showNew ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] p-4 rounded-xl pl-12 pr-12 focus:outline-none focus:bg-white focus:border-[var(--accent-primary)]/50 focus:ring-4 focus:ring-[var(--accent-primary)]/5 transition-all font-medium"
                      placeholder="Leave blank to keep same"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {showNew ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
             </div>
          </section>

          {/* ACTIONS */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-10 py-4 bg-[#5865f2] hover:bg-[#4752c4] text-white font-black rounded-xl transition-all shadow-lg shadow-[#5865f2]/20 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <FiSave className="w-5 h-5" />
              {loading ? "Saving Changes..." : "Save Profile Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
