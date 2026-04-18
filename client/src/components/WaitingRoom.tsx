"use client";

import { useEffect, useState } from "react";
import { Users, X } from "lucide-react";
import { getSocket } from "@/lib/socket";
import api from "@/lib/axios";

interface WaitingRoomProps {
  sessionId: string;
  challengeId: string;
  onStartChallenge: () => void;
  onClose?: () => void;
}

function formatMs(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function WaitingRoom({
  sessionId,
  challengeId,
  onStartChallenge,
  onClose,
}: WaitingRoomProps) {
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    const fetchParticipantCount = async () => {
      try {
        const res = await api.get(
          `${process.env.NEXT_PUBLIC_API_URL}/challenge/sessions/${sessionId}/participants-count`
        );
        setParticipantCount(res.data.participantCount ?? 0);
      } catch (error) {
        console.error("Failed to fetch participant count:", error);
      }
    };

    fetchParticipantCount();

    // Polling every 2 seconds
    const pollInterval = setInterval(fetchParticipantCount, 2000);

    // WebSocket listener
    try {
      const socket = getSocket();
      socket.emit("join_session", { sessionId });

      socket.on("session:participants", (data: { count: number }) => {
        setParticipantCount(data.count);
      });

      return () => {
        clearInterval(pollInterval);
        socket.off("session:participants");
      };
    } catch (error) {
      console.error("Socket setup error:", error);
      return () => clearInterval(pollInterval);
    }
  }, [sessionId]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="dark:bg-[#080a0f] border border-slate-800 rounded-lg p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-slate-100 mb-1">
            Contest Started! 🎉
          </h2>
          <p className="text-xs font-mono text-black dark:text-slate-500">
            See who joined
          </p>
        </div>

        {/* Participant Count */}
        <div className="dark:bg-slate-900/60 border border-slate-800 p-5 rounded-lg mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-600/20 border border-emerald-600/40 rounded flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              Joined
            </p>
          </div>
          <p className="text-4xl font-bold text-emerald-400">
            {participantCount}
          </p>
          <p className="text-xs font-mono text-slate-600 mt-1">
            candidate{participantCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Button */}
        <button
          onClick={onStartChallenge}
          className="w-full py-3  bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold tracking-wide transition-colors rounded-lg mb-3"
        >
          Go to Challenge
        </button>

        <p className="text-center text-xs font-mono text-slate-600">
          Ready to compete?
        </p>
      </div>
    </div>
  );
}