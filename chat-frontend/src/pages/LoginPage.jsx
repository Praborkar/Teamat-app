import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../hooks/useAuth";
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

// NO BACKGROUND IMAGE IMPORT

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  async function onSubmit(values) {
    try {
      const { data } = await api.post("/auth/login", values);
      login(data.token, data.user);
      toast.success("Welcome back to Teamat!");
      navigate("/app");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="h-screen w-screen bg-[var(--bg-secondary)] flex justify-center items-center px-4 font-space">
      <div className="relative w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* BRANDING */}
        <div className="text-center mb-10 space-y-2">
           <img 
             src={logo} 
             alt="Teamat Logo" 
             className="w-48 h-auto mx-auto mb-4"
           />
           <p className="text-[#b5bac1] text-xs font-medium tracking-wide uppercase opacity-70">
             Where teams communicate effortlessly
           </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* EMAIL */}
          <div className="space-y-2">
            <label className="text-[11px] text-[var(--text-muted)] font-black uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors">
                 <FiMail className="w-5 h-5" />
              </div>
              <input
                {...register("email", { required: true })}
                type="email"
                placeholder="name@company.com"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] p-4 rounded-xl pl-12 focus:outline-none focus:bg-white focus:border-[var(--accent-primary)]/50 focus:ring-4 focus:ring-[var(--accent-primary)]/5 transition-all placeholder-[var(--text-muted)] font-medium"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
               <label className="text-[11px] text-[var(--text-muted)] font-black uppercase tracking-widest">Password</label>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors">
                 <FiLock className="w-5 h-5" />
              </div>
              <input
                {...register("password", { required: true })}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-white border border-[var(--border-primary)] text-[var(--text-primary)] p-4 rounded-xl pl-12 pr-12 focus:outline-none focus:border-[var(--accent-primary)]/50 focus:ring-4 focus:ring-[var(--accent-primary)]/5 transition-all placeholder-[var(--text-muted)] font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button className="w-full py-4 bg-[#5865f2] hover:bg-[#4752c4] text-white font-black rounded-xl transition-all shadow-lg shadow-[#5865f2]/20 flex items-center justify-center gap-2 group active:scale-[0.98]">
            Log In <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-[var(--border-primary)]/50">
          <p className="text-sm text-[var(--text-muted)] font-bold">
            New to the team?{" "}
            <Link to="/signup" className="text-[var(--accent-primary)] hover:underline font-black ml-1 transition">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
