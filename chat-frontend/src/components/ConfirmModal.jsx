import React from "react";
import { createPortal } from "react-dom";
import { FiAlertTriangle, FiX } from "react-icons/fi";

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  description = "This action cannot be undone.", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "danger"
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-space">
      {/* OVERLAY */}
      <div 
        className="fixed inset-0 bg-[#060607]/40 backdrop-blur-[4px] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* MODAL CONTAINER */}
      <div 
        className="
          relative w-full max-w-[440px] bg-white rounded-[32px] 
          border border-[var(--border-primary)] shadow-2xl overflow-hidden
          animate-in zoom-in-95 fade-in duration-300 z-10
        "
      >
        {/* HEADER AREA (Visual highlight) */}
        <div className={`h-2 w-full ${variant === 'danger' ? 'bg-[#f23f42]' : 'bg-[#5865f2]'}`} />

        <div className="p-6 pt-5">
          {/* TOP ACTIONS */}
          <div className="flex justify-between items-start mb-4">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              ${variant === 'danger' ? 'bg-[#f23f42]/10 text-[#f23f42]' : 'bg-[#5865f2]/10 text-[#5865f2]'}
            `}>
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1 mb-8">
            <h3 className="text-[22px] font-black text-[var(--text-primary)] tracking-tighter">
              {title}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onConfirm}
              className={`
                flex-1 py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-[0.98] tracking-tight
                ${variant === 'danger' ? 'bg-[#f23f42] hover:bg-[#d8373a] shadow-[#f23f42]/20' : 'bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] shadow-[var(--accent-primary)]/20'}
              `}
            >
              {confirmText}
            </button>
            <button 
              onClick={onClose}
              className="
                flex-1 py-4 rounded-2xl font-black text-[var(--text-primary)] bg-[var(--bg-tertiary)] 
                hover:bg-[var(--bg-secondary)] transition-all active:scale-[0.98] tracking-tight
              "
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
