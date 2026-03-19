"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Radio, Users, Clock, ArrowLeft } from "lucide-react";
import { Difficulty, ChallengeType } from "@/types";
import { LiveChallenge,Pagination } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/challenge";
const PAGE_LIMIT = 9;


const difficultyStyles: Record<Difficulty, string> = {
  EASY: "text-emerald-400 bg-emerald-950 border-emerald-900",
  MEDIUM: "text-amber-400 bg-amber-950 border-amber-900",
  HARD: "text-red-400 bg-red-950 border-red-900",
};

const typeLabels: Record<ChallengeType, string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  DSA: "DSA",
  SYSTEM_DESIGN: "System Design",
};

function useCountdown(target: string) {
  const [display, setDisplay] = useState("");
  const [msLeft, setMsLeft] = useState(0);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) { setDisplay("Ending…"); setMsLeft(0); return; }
      setMsLeft(diff);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setDisplay(h > 0
        ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return { display, msLeft };
}

function LiveCard({ challenge }: { challenge: LiveChallenge }) {
  const router = useRouter();
  const { display, msLeft } = useCountdown(challenge.endTime);

  const isUrgent = msLeft > 0 && msLeft < 10 * 60 * 1000;
  const isDanger = msLeft > 0 && msLeft < 5 * 60 * 1000;

  return (
    <div
      className="group relative bg-slate-950 border border-emerald-900/40 hover:border-emerald-700/60 transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={() => router.push(`/recruiter/challenges/${challenge.challengeId}/sessions/${challenge.sessionId}/submissions`)}
    >
      <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0" />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 border border-emerald-900/40 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
            <span className={`text-xs font-mono px-2 py-0.5 border ${difficultyStyles[challenge.difficulty]}`}>
              {challenge.difficulty}
            </span>
          </div>
          <span className="text-xs font-mono text-slate-600 shrink-0">
            {typeLabels[challenge.challengeType]}
          </span>
        </div>

        <h3 className="text-sm font-bold text-slate-100 leading-snug mb-1 group-hover:text-white transition-colors">
          {challenge.title}
        </h3>

        {challenge.description && (
          <p className="text-xs font-mono text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {challenge.description}
          </p>
        )}

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-slate-500" />
            <span className="text-xs font-mono text-slate-400">
              {challenge.participantCount ?? 0} joined
            </span>
          </div>
          {(challenge.submittedCount ?? 0) > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <span className="text-xs font-mono text-violet-400">
                {challenge.submittedCount} submitted
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock size={12} className={isDanger ? "text-red-400" : isUrgent ? "text-amber-400" : "text-slate-500"} />
            <span className={`text-sm font-mono font-bold tabular-nums
              ${isDanger ? "text-red-400" : isUrgent ? "text-amber-400" : "text-emerald-400"}`}
            >
              {display}
            </span>
            <span className="text-xs font-mono text-slate-600">remaining</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/recruiter/challenges/${challenge.challengeId}/sessions/${challenge.sessionId}/submissions`);
            }}
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1.5 border border-emerald-900/60 hover:border-emerald-700 bg-emerald-950/40"
          >
            View Submissions →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LivePage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<LiveChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 1, hasNext: false, hasPrev: false,
  });

  const fetchLive = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: "LIVE",
        page: String(page),
        limit: String(PAGE_LIMIT),
      });
      const res = await api.get(`${BASE_URL}?${params.toString()}`);
      setChallenges(res.data.challenges ?? []);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load live challenges");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLive(1);
    const id = setInterval(() => fetchLive(1), 30000);
    return () => clearInterval(id);
  }, [fetchLive]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-emerald-950 text-slate-100 p-3">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/recruiter/challenges")}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-600 hover:text-slate-400 transition-colors mb-3"
          >
            <ArrowLeft size={12} />
            Back to Challenges
          </button>
          <div className="flex items-center gap-3">
            <Radio size={20} className="text-emerald-400 animate-pulse" />
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Live Now</h1>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xs font-mono text-slate-700 tracking-widest animate-pulse">
              Loading live challenges…
            </div>
          </div>
        ) : challenges.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Radio size={32} className="text-slate-800" />
            <p className="text-sm font-mono text-slate-700">No challenges are live right now</p>
            <button
              onClick={() => router.push("/recruiter/challenges")}
              className="mt-2 text-xs font-mono text-violet-500 hover:text-violet-400 underline underline-offset-4"
            >
              ← Back to challenges
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-mono text-slate-600 mb-4">
              {pagination.total} challenge{pagination.total > 1 ? "s" : ""} currently live
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map(c => (
                <LiveCard key={c.challengeId + c.sessionId} challenge={c} />
              ))}
            </div>

            {}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
                <span className="text-xs font-mono text-slate-600">
                  Showing {challenges.length} of {pagination.total}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchLive(pagination.page - 1)}
                    disabled={!pagination.hasPrev || loading}
                    className="px-3 py-1.5 text-xs font-mono border border-slate-800 text-white hover:border-slate-600 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => fetchLive(p)}
                      className={`px-3 py-1.5 text-xs font-mono border transition-colors
                        ${pagination.page === p
                          ? "border-emerald-500 text-emerald-400 bg-emerald-950/40"
                          : "border-slate-800 text-slate-600 hover:border-slate-600 hover:text-slate-300"
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => fetchLive(pagination.page + 1)}
                    disabled={!pagination.hasNext || loading}
                    className="px-3 py-1.5 text-xs font-mono border border-slate-800 text-white hover:border-slate-600 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}