"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type ChallengeType = "FRONTEND" | "BACKEND" | "DSA" | "SYSTEM_DESIGN";
type SessionStatus = "SCHEDULED" | "LIVE" | "ENDED";
type UIStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "LIVE" | "ENDED";

interface Challenge {
  challengeId: string;
  title: string;
  description?: string;
  difficulty: Difficulty;
  challengeType: ChallengeType;
  isDraft: boolean;
  createdAt: string;
  sessionId?: string;
  startTime?: string;
  endTime?: string;
  status?: SessionStatus;
  uiStatus: UIStatus;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:4000/challenge";
const PAGE_LIMIT = 10;
const FILTERS: Array<UIStatus | "ALL"> = ["ALL", "DRAFT", "PUBLISHED", "SCHEDULED", "LIVE", "ENDED"];

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

const statusConfig: Record<UIStatus, { label: string; dot: string; text: string; border: string }> = {
  DRAFT:     { label: "Draft",     dot: "bg-slate-500",                 text: "text-slate-400",  border: "border-slate-800" },
  PUBLISHED: { label: "Published", dot: "bg-violet-500",                text: "text-violet-400", border: "border-violet-900/40" },
  SCHEDULED: { label: "Scheduled", dot: "bg-blue-500",                  text: "text-blue-400",   border: "border-blue-900/40" },
  LIVE:      { label: "Live",      dot: "bg-emerald-500 animate-pulse", text: "text-emerald-400",border: "border-emerald-900/40" },
  ENDED:     { label: "Ended",     dot: "bg-slate-600",                 text: "text-slate-500",  border: "border-slate-800" },
};

// ─── Countdown ────────────────────────────────────────────────────────────────

function useCountdown(target: string) {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) { setDisplay("ended"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setDisplay(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return display;
}

function TimerChip({ label, time, color }: { label: string; time: string; color: string }) {
  const display = useCountdown(time);
  return (
    <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-slate-900 border border-slate-800 w-fit">
      <span className="text-xs font-mono text-slate-500">{label}</span>
      <span className={`text-xs font-mono font-medium ${color}`}>{display}</span>
    </div>
  );
}

// ─── Filter Tab ───────────────────────────────────────────────────────────────

function FilterTab({ label, count, active, onClick }: {
  label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-mono tracking-widest uppercase border-b-2 transition-all duration-150 flex items-center gap-2
        ${active ? "border-violet-500 text-slate-200" : "border-transparent text-slate-600 hover:text-slate-400"}`}
    >
      {label}
      <span className={`text-xs px-1.5 py-0.5 rounded font-mono
        ${active ? "bg-violet-950 text-violet-400" : "bg-slate-900 text-slate-600"}`}>
        {count}
      </span>
    </button>
  );
}

// ─── Challenge Card ───────────────────────────────────────────────────────────

function ChallengeCard({ challenge, onRefresh }: { challenge: Challenge; onRefresh: () => void }) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const status = challenge.uiStatus;
  const cfg = statusConfig[status];

  const handlePublish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setPublishing(true);
    try {
      await api.patch(`${BASE_URL}/${challenge.challengeId}/publish`, {}, { withCredentials: true });
      toast.success("Challenge published!");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div
      className={`group relative bg-slate-950 border ${cfg.border} hover:border-slate-600 transition-all duration-200 cursor-pointer`}
      onClick={() => router.push(`/recruiter/challenges/${challenge.challengeId}`)}
    >
      {status === "LIVE" && (
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0" />
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 border ${cfg.border} ${cfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
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
          <p className="text-xs font-mono text-slate-600 line-clamp-2 leading-relaxed">
            {challenge.description}
          </p>
        )}

        {status === "LIVE" && challenge.endTime && (
          <TimerChip label="ends in" time={challenge.endTime} color="text-emerald-400" />
        )}
        {status === "SCHEDULED" && challenge.startTime && (
          <TimerChip label="starts in" time={challenge.startTime} color="text-blue-400" />
        )}

        <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-slate-700">
            {new Date(challenge.createdAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            })}
          </span>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {status === "DRAFT" && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(`/recruiter/challenges/${challenge.challengeId}/edit`); }}
                  className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 border border-slate-800 hover:border-slate-600"
                >
                  Edit
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="text-xs font-mono text-violet-400 hover:text-violet-300 transition-colors px-3 py-1.5 border border-violet-900/60 hover:border-violet-700 bg-violet-950/40 disabled:opacity-40"
                >
                  {publishing ? "Publishing…" : "Publish →"}
                </button>
              </>
            )}
            {status === "PUBLISHED" && (
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/recruiter/challenges/${challenge.challengeId}/schedule`); }}
                className="text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 border border-blue-900/60 hover:border-blue-700 bg-blue-950/40"
              >
                Schedule Session →
              </button>
            )}
            {(status === "SCHEDULED" || status === "LIVE") && (
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/recruiter/challenges/${challenge.challengeId}`); }}
                className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 border border-slate-700 hover:border-slate-500"
              >
                View Sessions →
              </button>
            )}
            {status === "ENDED" && (
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/recruiter/challenges/${challenge.challengeId}`); }}
                className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 border border-slate-800 hover:border-slate-600"
              >
                View Results →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default function ChallengesListPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<UIStatus | "ALL">("ALL");
  const [counts, setCounts] = useState<Record<string, number>>({
    ALL: 0, DRAFT: 0, PUBLISHED: 0, SCHEDULED: 0, LIVE: 0, ENDED: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 1, hasNext: false, hasPrev: false,
  });

  // Single fetch function — used everywhere
  const fetchChallenges = async (statusFilter: UIStatus | "ALL", page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await api.get(`${BASE_URL}?${params.toString()}`, { withCredentials: true });

      setChallenges(res.data.challenges ?? []);
      setCounts(res.data.counts);           
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load challenges");
    } finally {
      setLoading(false);
    }
  };

  // Mount
  useEffect(() => {
    fetchChallenges("ALL", 1);
  }, []);

  // Tab change — always reset to page 1
  const handleFilterChange = (f: UIStatus | "ALL") => {
    setFilter(f);
    fetchChallenges(f, 1);
  };

  // Page change — keep current filter
  const handlePageChange = (page: number) => {
    fetchChallenges(filter, page);
  };

  // After publish — stay on current page + filter
  const handleRefresh = () => {
    fetchChallenges(filter, pagination.page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-purple-900 text-slate-100 p-3">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-mono text-slate-600 tracking-widest uppercase mb-2">
              Recruiter Dashboard
            </p>
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
              Challenges
            </h1>
          </div>
          <button
            onClick={() => router.push("/recruiter/challenges/create")}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold tracking-wide transition-colors duration-150"
          >
            + New Challenge
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800 mb-8 overflow-x-auto">
          {FILTERS.map(f => (
            <FilterTab
              key={f}
              label={f}
              count={counts[f] ?? 0}
              active={filter === f}
              onClick={() => handleFilterChange(f)}
            />
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xs font-mono text-slate-700 tracking-widest animate-pulse">
              Loading challenges…
            </div>
          </div>
        ) : challenges.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="text-4xl opacity-20">◫</div>
            <p className="text-sm font-mono text-slate-700">
              No {filter !== "ALL" ? filter.toLowerCase() : ""} challenges yet
            </p>
            {filter === "ALL" && (
              <button
                onClick={() => router.push("/recruiter/challenges/create")}
                className="mt-2 text-xs font-mono text-violet-500 hover:text-violet-400 underline underline-offset-4"
              >
                Create your first challenge →
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map(c => (
                <ChallengeCard
                  key={c.challengeId + (c.sessionId ?? "")}
                  challenge={c}
                  onRefresh={handleRefresh}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
                <span className="text-xs font-mono text-slate-600">
                  Showing {challenges.length} of {pagination.total}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev || loading}
                    className="px-3 py-1.5 text-xs font-mono border border-slate-800 text-white hover:border-slate-600 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1.5 text-xs font-mono border transition-colors
                        ${pagination.page === p
                          ? "border-violet-500 text-violet-400 bg-violet-950/40"
                          : "border-slate-800 text-slate-600 hover:border-slate-600 hover:text-slate-300"
                        }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
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