"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface ChallengeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
  challengeTitle?: string;
}

export function ChallengeSuccessModal({
  isOpen,
  onClose,
  challengeId,
  challengeTitle = "Your Challenge",
}: ChallengeSuccessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToChallenges = () => {
    onClose();
    router.push("/recruiter/challenges");
  };

  const handleEditDraft = () => {
    onClose();
    router.push(`/recruiter/challenges/${challengeId}/edit`);
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      {/* Modal box */}
      <div
        className="relative w-full max-w-md bg-slate-950 border border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "modalIn 0.2s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* Top accent line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

        {/* Content */}
        <div className="px-8 py-10 flex flex-col items-center text-center">

          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Text */}
          <p className="text-xs font-mono tracking-widest text-emerald-500 uppercase mb-2">
            Draft Saved
          </p>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-2">
            {challengeTitle}
          </h2>
          <p className="text-sm text-slate-500 font-mono leading-relaxed max-w-xs">
            Your challenge is saved as a draft. Publish it when you're ready — then schedule sessions from your dashboard.
          </p>

          {/* What happens next hint */}
          <div className="mt-6 w-full bg-slate-900 border border-slate-800 px-4 py-3 flex items-start gap-3 text-left">
            <span className="text-slate-600 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
              </svg>
            </span>
            <p className="text-xs text-slate-500 font-mono leading-relaxed">
              After publishing, you can create multiple sessions — schedule different batches of candidates to the same challenge.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 w-full flex flex-col gap-3">
            {/* Primary */}
            <button
              onClick={handleGoToChallenges}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold tracking-wide transition-colors duration-150"
            >
              Go to Challenges
            </button>

            {/* Secondary */}
            <button
              onClick={handleEditDraft}
              className="w-full py-3 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 text-sm font-mono tracking-wide transition-colors duration-150"
            >
              Keep editing draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}