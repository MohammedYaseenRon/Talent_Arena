"use client";

import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function Timer({ endTime }: { endTime: string }) {
  const [msLeft, setMsLeft] = useState<number>(() =>
    Math.max(0, new Date(endTime).getTime() - Date.now())
  );

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setMsLeft(0);
        clearInterval(intervalRef.current!);
        return;
      }
      setMsLeft(diff);
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [endTime]);

  const hours = Math.floor(msLeft / 3600000);
  const minutes = Math.floor((msLeft % 3600000) / 60000);
  const seconds = Math.floor((msLeft % 60000) / 1000);

  const isWarning = msLeft <= 10 * 60 * 1000; // under 10 mins
  const isDanger = msLeft <= 5 * 60 * 1000;   // under 5 mins

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-sm font-mono font-medium
      ${isDanger
        ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
        : isWarning
        ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
        : "bg-gray-800 border-gray-700 text-gray-300"
      }`}
    >
      <Clock size={13} />
      <span>
        {hours > 0 ? `${pad(hours)}:` : ""}{pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
}

export default Timer;