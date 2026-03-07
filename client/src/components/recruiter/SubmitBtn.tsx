"use client";

import api from "@/lib/axios";
import { useSandpack } from "@codesandbox/sandpack-react";
import { CheckCircle, Loader2, Send } from "lucide-react";
import { useState } from "react";

function SubmitBtn({
  challengeId,
  sessionId,
}: {
  challengeId: string;
  sessionId: string;
}) {
  const sandpack = useSandpack();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [showConfirm, setShowConfirm] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async () => {
    setShowConfirm(false);
    setStatus("loading");
    try {
      const response = await api.post(
        `${API}/challenge/${challengeId}/submit`,
        {
          sessionId,
          // files: sandpack.files
        },
      );
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }
  };

  return (
    <>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6 w-80 flex flex-col gap-4">
            <h3 className="text-white font-semibold text-base">
              Submit Challenge?
            </h3>
            <p className="text-gray-400 text-sm">
              Are you sure you want to submit? You won't be able to make changes
              after submission.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => status === "idle" && setShowConfirm(true)}
        disabled={status === "loading" || status === "success"}
        className={`flex items-center gap-2 px-4 py-1 rounded-md text-sm font-medium border transition-all
          ${status === "success"
            ? "bg-green-600/20 border-green-500/40 text-green-400 cursor-default"
            : status === "error"
            ? "bg-red-600/20 border-red-500/40 text-red-400"
            : status === "loading"
            ? "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-green-600 border-green-500 text-white hover:bg-green-500 cursor-pointer"
          }`}
      >
        {status === "loading" && <Loader2 size={14} className="animate-spin" />}
        {status === "success" && <CheckCircle size={14} />}
        {(status === "idle" || status === "error") && <Send size={14} />}
        <span>
          {status === "loading" ? "Submitting..." : status === "success" ? "Submitted!" : status === "error" ? "Failed — Retry" : "Submit"}
        </span>
      </button>
    </>
  );
}

export default SubmitBtn;