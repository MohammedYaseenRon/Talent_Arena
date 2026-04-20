"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import api from "@/lib/axios";


interface Challenge {
  challengeId: string;
  title: string;
  description?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  challengeType: string;
}

interface Session {
  sessionId: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "LIVE" | "ENDED";
}


const DURATION_PRESETS = [
  { label: "30 min",  minutes: 30 },
  { label: "1 hr",    minutes: 60 },
  { label: "2 hrs",   minutes: 120 },
  { label: "3 hrs",   minutes: 180 },
];


function SessionRow({ session }: { session: Session }) {
  const statusStyles = {
    SCHEDULED: "text-blue-400 border-blue-900/40 bg-blue-950/30",
    LIVE:      "text-emerald-400 border-emerald-900/40 bg-emerald-950/30",
    ENDED:     "text-slate-500 border-slate-800 bg-slate-900/30",
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border border-slate-800">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-mono text-slate-300">
          {new Date(session.startTime).toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric",
          })}
          {" · "}
          {new Date(session.startTime).toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit",
          })}
          {" → "}
          {new Date(session.endTime).toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit",
          })}
        </span>
      </div>
      <span className={`text-xs font-mono px-2 py-0.5 border ${statusStyles[session.status]}`}>
        {session.status}
      </span>
    </div>
  );
}


export default function ScheduleSessionPage() {
  const router = useRouter();
  const params = useParams();
  const challengeId = params?.challengeId as string;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const toLocalInput = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const [startTime, setStartTime] = useState(toLocalInput(tomorrow));
  const [endTime, setEndTime] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [challengeRes, sessionsRes] = await Promise.all([
          api.get(`${process.env.NEXT_PUBLIC_API_URL}/challenge/${challengeId}`, { withCredentials: true }),
          api.get(`${process.env.NEXT_PUBLIC_API_URL}/challenge/${challengeId}/sessions`, { withCredentials: true }),
        ]);
        setChallenge(challengeRes.data.challenge);
        setSessions(sessionsRes.data.sessions ?? []);
      } catch {
        toast.error("Failed to load challenge");
      } finally {
        setLoading(false);
      }
    };
    if (challengeId) load();
  }, [challengeId]);

  const applyPreset = (minutes: number, idx: number) => {
    setSelectedPreset(idx);
    if (!startTime) return;
    const start = new Date(startTime);
    const end = new Date(start.getTime() + minutes * 60 * 1000);
    setEndTime(toLocalInput(end));
  };

  // Auto-calc end when start changes and preset is selected
  const handleStartChange = (val: string) => {
    setStartTime(val);
    if (selectedPreset !== null) {
      const mins = DURATION_PRESETS[selectedPreset].minutes;
      const start = new Date(val);
      const end = new Date(start.getTime() + mins * 60 * 1000);
      setEndTime(toLocalInput(end));
    }
  };

  const handleSubmit = async () => {
    if (!startTime || !endTime) {
      toast.error("Please set start and end time");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(
        `${process.env.NEXT_PUBLIC_API_URL}/challenge/${challengeId}/sessions`,
        {
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        },
        { withCredentials: true }
      );
      toast.success("Session scheduled!");
      router.push("/recruiter/challenges");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to schedule");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-xs font-mono text-slate-700 tracking-widest animate-pulse">Loading…</p>
      </div>
    );
  }

  const getDurationLabel = () => {
    if (!startTime || !endTime) return null;
    const diff = new Date(endTime).getTime() - new Date(startTime).getTime();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}` : `${m}m`;
  };

  const duration = getDurationLabel();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-slate-400 transition-colors mb-8"
        >
          ← Back to challenges
        </button>

        {/* Challenge context */}
        {challenge && (
          <div className="mb-8 pb-8 border-b border-slate-800">
            <p className="text-xs font-mono text-slate-600 tracking-widest uppercase mb-2">
              Scheduling session for
            </p>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
              {challenge.title}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-600 px-2 py-0.5 border border-slate-800">
                {challenge.challengeType}
              </span>
              <span className={`text-xs font-mono px-2 py-0.5 border
                ${challenge.difficulty === "EASY" ? "text-emerald-400 border-emerald-900" :
                  challenge.difficulty === "MEDIUM" ? "text-amber-400 border-amber-900" :
                  "text-red-400 border-red-900"}`}>
                {challenge.difficulty}
              </span>
            </div>
          </div>
        )}

        {/* Existing sessions */}
        {sessions.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-mono text-slate-600 tracking-widest uppercase mb-3">
              Existing Sessions ({sessions.length})
            </p>
            <div className="flex flex-col gap-2">
              {sessions.map(s => <SessionRow key={s.sessionId} session={s} />)}
            </div>
          </div>
        )}

        {/* Schedule form */}
        <div>
          <p className="text-xs font-mono text-slate-600 tracking-widest uppercase mb-6">
            New Session
          </p>

          {/* Duration presets */}
          <div className="mb-6">
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
              Duration
            </label>
            <div className="flex gap-2 flex-wrap">
              {DURATION_PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.minutes, i)}
                  className={`px-4 py-2 text-xs font-mono border transition-colors duration-150
                    ${selectedPreset === i
                      ? "border-violet-500 text-violet-300 bg-violet-950/50"
                      : "border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                    }`}
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => { setSelectedPreset(null); setEndTime(""); }}
                className={`px-4 py-2 text-xs font-mono border transition-colors duration-150
                  ${selectedPreset === null && endTime
                    ? "border-violet-500 text-violet-300 bg-violet-950/50"
                    : "border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                  }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Start time */}
          <div className="mb-4">
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={e => handleStartChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-4 py-3 text-sm font-mono outline-none focus:border-slate-600 transition-colors color-scheme-dark"
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* End time */}
          <div className="mb-2">
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={e => { setEndTime(e.target.value); setSelectedPreset(null); }}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-4 py-3 text-sm font-mono outline-none focus:border-slate-600 transition-colors"
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Duration summary */}
          {duration && (
            <p className="text-xs font-mono text-slate-600 mb-6">
              Session duration: <span className="text-violet-400">{duration}</span>
            </p>
          )}

          {/* Summary card */}
          {startTime && endTime && new Date(endTime) > new Date(startTime) && (
            <div className="mb-6 p-4 bg-slate-900 border border-slate-800">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Summary</p>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-xs font-mono text-slate-600">Starts</span>
                  <span className="text-xs font-mono text-slate-300">
                    {new Date(startTime).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric",
                    })}{" · "}
                    {new Date(startTime).toLocaleTimeString("en-US", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-mono text-slate-600">Ends</span>
                  <span className="text-xs font-mono text-slate-300">
                    {new Date(endTime).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric",
                    })}{" · "}
                    {new Date(endTime).toLocaleTimeString("en-US", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 mt-1">
                  <span className="text-xs font-mono text-slate-600">Duration</span>
                  <span className="text-xs font-mono text-violet-400">{duration}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="px-5 py-3 text-sm font-mono text-slate-500 border border-slate-800 hover:border-slate-600 hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !startTime || !endTime}
              className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold tracking-wide transition-colors duration-150"
            >
              {submitting ? "Scheduling…" : "Confirm Session"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}