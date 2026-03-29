import React from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useChannels } from "../hooks/useChannels";

export default function CreateChannelModal({ onClose }) {
  const { register, handleSubmit } = useForm();
  const { createChannel } = useChannels();

  async function onSubmit(values) {
    try {
      await createChannel.mutateAsync(values);
      onClose();
    } catch (err) {
      alert("Failed to create channel");
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-[#060607]/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-[100] font-space text-[var(--text-primary)]">
      {/* MODAL CARD */}
      <div
        className="
          w-full max-w-md
          bg-white
          rounded-3xl
          p-8
          border border-[var(--border-primary)]
          shadow-[var(--shadow-lg)]
          text-[var(--text-primary)]
        "
      >
        {/* TITLE */}
        <h2 className="text-xl font-black tracking-tight">
          Create Channel
        </h2>

        <p className="text-sm text-[var(--text-muted)] mt-1 mb-6 font-medium">
          Choose a short, descriptive name for your channel.
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* INPUT FIELD */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase font-black text-[var(--text-muted)] tracking-widest ml-1">
              Channel Name
            </label>

            <input
              {...register("name", { required: true })}
              type="text"
              placeholder="general, team-chat, updates"
              className="
                w-full p-4 rounded-xl
                bg-[var(--bg-secondary)]
                border border-[var(--border-primary)]
                text-sm font-medium
                text-[var(--text-primary)]
                placeholder-[var(--text-muted)]
                outline-none
                focus:bg-white
                focus:border-[var(--accent-primary)]
                focus:ring-4 focus:ring-[var(--accent-primary)]/5
                transition-all
              "
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="
                px-6 py-2.5 rounded-xl
                bg-[var(--bg-tertiary)]
                text-[var(--text-primary)]
                font-bold
                hover:bg-[var(--bg-secondary)]
                transition-all
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              className="
                px-8 py-2.5 rounded-xl
                bg-[var(--accent-primary)]
                text-white font-black
                hover:bg-[var(--accent-hover)]
                transition-all
                shadow-[var(--accent-primary)]/20 shadow-lg
                active:scale-95
              "
            >
              Create
            </button>

          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
