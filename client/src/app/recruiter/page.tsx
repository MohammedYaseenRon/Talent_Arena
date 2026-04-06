"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import {
  Code2,
  Users,
  FileText,
  Trophy,
  Bot,
  Radio,
  Clock,
  ArrowRight,
  TrendingUp,
  Zap,
  CheckCircle2,
} from "lucide-react";
import StatsCard from "@/components/recruiter/StatsCard";
import { Difficulty } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const difficultyStyles: Record<Difficulty, string> = {
  EASY: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-900",
  MEDIUM:
    "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900",
  HARD: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900",
};

function useCountdown(target: string) {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) {
        setDisplay("Starting soon");
        return;
      }
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

function ScoreDistributionBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-500 dark:text-slate-500">
          {label}
        </span>
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
          {count}{" "}
          <span className="text-slate-400 dark:text-slate-600">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function UpcomingSessionCard({ session }: { session: any }) {
  const countdown = useCountdown(session.startTime);
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
          {session.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span
            className={`text-xs font-mono px-1.5 py-0.5 border rounded-sm ${difficultyStyles[session.difficulty as Difficulty]}`}
          >
            {session.difficulty}
          </span>
          <span className="text-xs font-mono text-slate-400 dark:text-slate-600">
            {session.participantCount ?? 0} registered
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Clock size={11} className="text-blue-500 dark:text-blue-400" />
        <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-medium tabular-nums">
          {countdown}
        </span>
      </div>
    </div>
  );
}

export default function RecruiterDashboard() {
  const router = useRouter();
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`${API_URL}/submission/dashboard`);
        setDashData(res.data);
      } catch (err: any) {
        if (err?.response?.status === 401) router.replace("/recruiter/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#080810] flex items-center justify-center">
        <div className="text-xs font-mono text-slate-400 dark:text-slate-700 tracking-widest animate-pulse">
          Loading dashboard…
        </div>
      </div>
    );
  }
  if(!dashData) return null;
  const d = dashData;
  const stats = [
    {
      title: "Challenges",
      value: String(d.totalChallenges),
      change: `${d.counts.LIVE ?? 0} live now`,
      icon: Code2,
    },
    {
      title: "Candidates",
      value: String(d.totalParticipants),
      change: `${d.counts.SCHEDULED ?? 0} sessions upcoming`,
      icon: Users,
    },
    {
      title: "Submissions",
      value: String(d.totalSubmitted),
      change: `${d.totalEvaluated} evaluated by AI`,
      icon: FileText,
    },
    {
      title: "Avg AI Score",
      value: d.avgScore ? String(d.avgScore) : "—",
      change: `${d.scoreHigh} scored 80+`,
      icon: Bot,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810] text-slate-900 dark:text-slate-100">
      <div className="w-full space-y-6 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5">
              Overview of your hiring activity
            </p>
          </div>
          <button
            onClick={() => router.push("/recruiter/challenges/create")}
            className="text-xs font-mono px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white transition-colors rounded-lg"
          >
            + New Challenge
          </button>
        </div>

        {d.counts.LIVE > 0 && (
          <div
            onClick={() => router.push("/recruiter/live")}
            className="flex items-center justify-between px-4 py-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Radio
                size={15}
                className="text-emerald-500 dark:text-emerald-400 animate-pulse"
              />
              <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                {d.counts.LIVE} challenge{d.counts.LIVE > 1 ? "s" : ""} live
                right now
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs font-mono text-emerald-500 dark:text-emerald-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              View Live <ArrowRight size={11} />
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code2
                  size={13}
                  className="text-slate-400 dark:text-slate-500"
                />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Challenges
                </h2>
              </div>
              <button
                onClick={() => router.push("/recruiter/challenges")}
                className="text-xs font-mono text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={10} />
              </button>
            </div>
            <div className="space-y-2.5">
              {[
                {
                  label: "Draft",
                  count: d.counts.DRAFT ?? 0,
                  color: "bg-slate-400",
                },
                {
                  label: "Published",
                  count: d.counts.PUBLISHED ?? 0,
                  color: "bg-violet-500",
                },
                {
                  label: "Scheduled",
                  count: d.counts.SCHEDULED ?? 0,
                  color: "bg-blue-500",
                },
                {
                  label: "Live",
                  count: d.counts.LIVE ?? 0,
                  color: "bg-emerald-500",
                },
                {
                  label: "Ended",
                  count: d.counts.ENDED ?? 0,
                  color: "bg-slate-300 dark:bg-slate-600",
                },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500 w-20 shrink-0">
                    {label}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{
                        width: `${d.totalChallenges > 0 ? (count / d.totalChallenges) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400 w-4 text-right shrink-0">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bot
                  size={13}
                  className="text-violet-500 dark:text-violet-400"
                />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  AI Score Distribution
                </h2>
              </div>
              {d.avgScore && (
                <span className="text-xs font-mono text-slate-400 dark:text-slate-600">
                  avg{" "}
                  <span className="text-violet-600 dark:text-violet-400 font-bold">
                    {d.avgScore}
                  </span>
                </span>
              )}
            </div>
            {d.totalEvaluated === 0 ? (
              <div className="flex items-center justify-center h-20">
                <p className="text-xs font-mono text-slate-400 dark:text-slate-600">
                  No evaluations yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <ScoreDistributionBar
                  label="80 – 100 (Excellent)"
                  count={d.scoreHigh}
                  total={d.totalEvaluated}
                  color="bg-emerald-500"
                />
                <ScoreDistributionBar
                  label="60 – 79  (Good)"
                  count={d.scoreMid}
                  total={d.totalEvaluated}
                  color="bg-amber-500"
                />
                <ScoreDistributionBar
                  label="0 – 59   (Needs Work)"
                  count={d.scoreLow}
                  total={d.totalEvaluated}
                  color="bg-red-500"
                />
                <p className="text-xs font-mono text-slate-400 dark:text-slate-600 pt-1">
                  {d.totalEvaluated} total evaluated
                </p>
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-blue-500 dark:text-blue-400" />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Upcoming Sessions
                </h2>
              </div>
              <button
                onClick={() => router.push("/recruiter/challenges")}
                className="text-xs font-mono text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={10} />
              </button>
            </div>
            {d.upcoming.length === 0 ? (
              <div className="flex items-center justify-center h-20">
                <p className="text-xs font-mono text-slate-400 dark:text-slate-600">
                  No upcoming sessions
                </p>
              </div>
            ) : (
              <div>
                {d.upcoming.map((s: any) => (
                  <UpcomingSessionCard
                    key={s.challengeId + s.sessionId}
                    session={s}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap size={13} className="text-amber-500 dark:text-amber-400" />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Recent Submissions
                </h2>
              </div>
              <button
                onClick={() => router.push("/recruiter/submission")}
                className="text-xs font-mono text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={10} />
              </button>
            </div>
            {d.recentSubs.length === 0 ? (
              <div className="flex items-center justify-center h-20">
                <p className="text-xs font-mono text-slate-400 dark:text-slate-600">
                  No submissions yet
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {d.recentSubs.map((p: any, i: number) => {
                  const scoreColor =
                    p.aiScore === null
                      ? ""
                      : p.aiScore >= 80
                        ? "text-emerald-600 dark:text-emerald-400"
                        : p.aiScore >= 60
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400";
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {p.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {p.name}
                        </p>
                        <p className="text-xs font-mono text-slate-400 dark:text-slate-600 truncate">
                          {p.challengeTitle}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.aiScore !== null ? (
                          <span
                            className={`text-base font-bold font-mono ${scoreColor}`}
                          >
                            {p.aiScore}
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-slate-300 dark:text-slate-700">
                            —
                          </span>
                        )}
                        <button
                          onClick={() =>
                            router.push(
                              `/recruiter/challenges/${p.challengeId}/review/${p.userId}?session=${p.sessionId}`,
                            )
                          }
                          className="text-xs font-mono text-violet-600 dark:text-violet-400 px-2 py-0.5 border border-violet-200 dark:border-violet-900/60 bg-violet-50 dark:bg-violet-950/40 rounded hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy
                  size={13}
                  className="text-amber-500 dark:text-amber-400"
                />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Top Performers
                </h2>
              </div>
              <button
                onClick={() => router.push("/recruiter/leaderboard")}
                className="text-xs font-mono text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                Leaderboard <ArrowRight size={10} />
              </button>
            </div>
            {d.topPerformers.length === 0 ? (
              <div className="flex items-center justify-center h-20">
                <p className="text-xs font-mono text-slate-400 dark:text-slate-600">
                  No evaluated submissions yet
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {d.topPerformers.map((p: any, i: number) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const scoreColor =
                    p.aiScore >= 80
                      ? "text-emerald-600 dark:text-emerald-400"
                      : p.aiScore >= 60
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400";
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                    >
                      <span className="text-base w-6 text-center shrink-0">
                        {i < 3 ? medals[i] : `#${i + 1}`}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {p.name}
                        </p>
                        <p className="text-xs font-mono text-slate-400 dark:text-slate-600 truncate">
                          {p.challengeTitle}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-base font-bold font-mono ${scoreColor}`}
                        >
                          {p.aiScore}
                        </span>
                        {p.autoSubmitted && (
                          <span className="text-xs font-mono text-slate-400 dark:text-slate-600 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded">
                            auto
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
