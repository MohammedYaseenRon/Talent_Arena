"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { getSocket } from "@/lib/socket";
import api from "@/lib/axios";

interface ParticipantCounterProps {
  sessionId: string;
}

export default function ParticipantCounter({ sessionId }: ParticipantCounterProps) {
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
    <div className="dark:bg-emerald-950/20 border border-emerald-900/40 p-4 rounded mb-6 flex items-center gap-3">
      <div className="w-8 h-8 dark:bg-emerald-600/20 border border-emerald-600/40 rounded-lg flex items-center justify-center">
        <Users className="w-4 h-4 text-emerald-400" />
      </div>
      <div>
        <p className="text-xs font-mono text-emerald-600 uppercase tracking-widest">
          Participants Joined Live
        </p>
        <p className="text-lg font-bold text-emerald-400">
          {participantCount} candidate{participantCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}