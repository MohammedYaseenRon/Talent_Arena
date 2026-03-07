"use client";

import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function Timer({ durationMinutes }: { durationMinutes: number }) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const isWarning = secondsLeft <= 300; // last 5 minutes
  const isDanger = secondsLeft <= 60; // last 1 minute

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-sm font-mono font-medium
      ${
        isDanger
          ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
          : isWarning
            ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
            : "bg-gray-800 border-gray-700 text-gray-300"
      }`}
    >
      <Clock size={13} />
      <span>
        {hours > 0 ? `${pad(hours)}:` : ""} {pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
}

export default Timer;
