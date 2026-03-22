"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { io as socketIO, Socket } from "socket.io-client";
import { ChevronDown, Loader2, Trophy, Bot, Users, BarChart2, CheckCircle2, AlertCircle, Clock, Zap } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Difficulty, ChallengeType, SessionStatus, SubmissionStatus, Participant, ChallengeResult } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const difficultyStyles: Record<Difficulty, string> = {
  EASY:   "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-900",
  MEDIUM: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900",
  HARD:   "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900",
};

const typeLabels: Record<ChallengeType, string> = {
  FRONTEND: "Frontend", BACKEND: "Backend", DSA: "DSA", SYSTEM_DESIGN: "System Design",
};

const sessionStatusConfig: Record<SessionStatus, { label: string; dot: string; text: string; border: string }> = {
  SCHEDULED: { label: "Scheduled", dot: "bg-blue-500",                  text: "text-blue-600 dark:text-blue-400",       border: "border-blue-200 dark:border-blue-900/40" },
  LIVE:      { label: "Live",      dot: "bg-emerald-500 animate-pulse", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-900/40" },
  ENDED:     { label: "Ended",     dot: "bg-slate-400 dark:bg-slate-600", text: "text-slate-500 dark:text-slate-500",   border: "border-slate-200 dark:border-slate-800" },
};

const subStatusConfig: Record<SubmissionStatus, { label: string; dot: string; text: string }> = {
  EVALUATED:   { label: "Evaluated",   dot: "bg-emerald-500",             text: "text-emerald-600 dark:text-emerald-400" },
  PENDING:     { label: "Evaluating…", dot: "bg-amber-500 animate-pulse", text: "text-amber-600 dark:text-amber-400" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-blue-500 animate-pulse",  text: "text-blue-600 dark:text-blue-400" },
  REGISTERED:  { label: "Registered",  dot: "bg-slate-400",               text: "text-slate-500 dark:text-slate-400" },
};

const medalEmoji  = ["🥇", "🥈", "🥉"];
const medalColors = ["text-amber-500 dark:text-amber-400", "text-slate-500 dark:text-slate-300", "text-orange-500 dark:text-orange-400"];
const medalRowBg  = [
  "bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30",
  "bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/60",
  "bg-orange-50 dark:bg-orange-950/10 hover:bg-orange-100 dark:hover:bg-orange-950/20",
];

function RankCell({ rank, status }: { rank: number; status: SubmissionStatus }) {
  if (status === "IN_PROGRESS") return <span className="flex justify-center"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /></span>;
  if (status === "PENDING") return <span className="flex justify-center"><Loader2 size={13} className="animate-spin text-amber-500" /></span>;
  if (status === "REGISTERED") return <span className="text-xs font-mono text-slate-400 dark:text-slate-700 text-center block">—</span>;
  if (rank <= 3) return <span className="text-lg block text-center">{medalEmoji[rank - 1]}</span>;
  return <span className="text-sm font-bold font-mono text-slate-400 dark:text-slate-500 block text-center">#{rank}</span>;
}

function MiniBreakdownBars({ breakdown }: { breakdown: NonNullable<Participant["aiBreakdown"]> }) {
  return (
    <div className="flex flex-col gap-1 w-32">
      {[
        { key: "requirements",     color: "bg-emerald-500/80" },
        { key: "codeQuality",      color: "bg-blue-500/80" },
        { key: "features",         color: "bg-violet-500/80" },
        { key: "optionalFeatures", color: "bg-amber-500/80" },
      ].map(({ key, color }) => (
        <div key={key} className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${(breakdown as any)[key]}%` }} />
        </div>
      ))}
    </div>
  );
}

function ExpandedDetail({ p }: { p: Participant }) {
  return (
    <TableRow className="hover:bg-transparent border-0">
      <TableCell colSpan={8} className="p-0 border-0">
        <div className="mx-3 mb-3 p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 break-words whitespace-pre-wrap">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Bot size={11} className="text-violet-500 dark:text-violet-400" />
                <span className="text-xs font-mono text-violet-600 dark:text-violet-400 uppercase tracking-widest">AI Summary</span>
              </div>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 leading-relaxed">{p.aiSummary}</p>
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest block mb-3">Score Breakdown</span>
              {p.aiBreakdown && (
                <div className="space-y-2.5">
                  {[
                    { label: "Requirements",      key: "requirements",     color: "bg-emerald-500" },
                    { label: "Code Quality",      key: "codeQuality",      color: "bg-blue-500" },
                    { label: "Features",          key: "features",         color: "bg-violet-500" },
                    { label: "Optional Features", key: "optionalFeatures", color: "bg-amber-500" },
                  ].map(({ label, key, color }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-500">{label}</span>
                        <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{(p.aiBreakdown as any)[key]}</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${(p.aiBreakdown as any)[key]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/60">
            {p.featuresCompleted && p.featuresCompleted.length > 0 && (
              <div>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest block mb-2">Completed</span>
                <div className="flex flex-wrap gap-1.5">
                  {p.featuresCompleted.map((f, i) => (
                    <span key={i} className="text-xs font-mono px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-md">✓ {f}</span>
                  ))}
                </div>
              </div>
            )}
            {p.featuresMissing && p.featuresMissing.length > 0 && (
              <div>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest block mb-2">Missing</span>
                <div className="flex flex-wrap gap-1.5">
                  {p.featuresMissing.map((f, i) => (
                    <span key={i} className="text-xs font-mono px-2 py-0.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-md">✗ {f}</span>
                  ))}
                </div>
              </div>
            )}
            {p.aiStrengths && p.aiStrengths.length > 0 && (
              <div>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest block mb-2">Strengths</span>
                <ul className="space-y-1">
                  {p.aiStrengths.map((s, i) => (
                    <li key={i} className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                      <span className="text-emerald-500 shrink-0 mt-0.5">+</span><span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {p.aiImprovements && p.aiImprovements.length > 0 && (
              <div>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest block mb-2">Improvements</span>
                <ul className="space-y-1">
                  {p.aiImprovements.map((s, i) => (
                    <li key={i} className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                      <span className="text-amber-500 shrink-0 mt-0.5">→</span><span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

function LeaderboardTableRow({ p, rank, challengeId, sessionId, isNew }: {
  p: Participant; rank: number; challengeId: string; sessionId: string; isNew?: boolean;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const isTop3 = p.status === "EVALUATED" && rank <= 3;
  const scoreColor = p.aiScore === null ? "text-slate-400 dark:text-slate-600" : p.aiScore >= 80 ? "text-emerald-600 dark:text-emerald-400" : p.aiScore >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
  const rowBg = isTop3 ? medalRowBg[rank - 1] : "hover:bg-slate-50 dark:hover:bg-white/[0.02]";

  return (
    <>
      <TableRow className={`border-slate-200 dark:border-slate-800/40 transition-all duration-500 cursor-default ${rowBg} ${isNew ? "animate-pulse" : ""}`}>
        <TableCell className="w-12 text-center py-3">
          <RankCell rank={rank} status={p.status} />
        </TableCell>

        <TableCell className="py-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
              ${isTop3
                ? rank === 1 ? "border-2 border-amber-500/50 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300"
                : rank === 2 ? "border-2 border-slate-400/50 dark:border-slate-500/50 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                : "border-2 border-orange-500/50 dark:border-orange-600/50 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400"
                : "border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}>
              {p.name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-semibold truncate ${isTop3 ? medalColors[rank - 1] : "text-slate-800 dark:text-slate-200"}`}>{p.name}</p>
              <p className="text-xs font-mono text-slate-400 dark:text-slate-600 truncate">{p.email}</p>
            </div>
          </div>
        </TableCell>

        <TableCell className="hidden lg:table-cell py-3">
          {p.aiBreakdown && p.status === "EVALUATED"
            ? <MiniBreakdownBars breakdown={p.aiBreakdown} />
            : <span className="text-xs font-mono text-slate-300 dark:text-slate-700">—</span>
          }
        </TableCell>

        <TableCell className="hidden md:table-cell py-3">
          {p.submittedAt ? (
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="text-slate-400 dark:text-slate-600 shrink-0" />
              <span className="text-xs font-mono text-slate-500 dark:text-slate-500">
                {new Date(p.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ) : <span className="text-xs font-mono text-slate-300 dark:text-slate-700">—</span>}
        </TableCell>

        <TableCell className="hidden md:table-cell py-3">
          {p.autoSubmitted
            ? <span className="text-xs font-mono text-slate-400 dark:text-slate-600 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded">auto</span>
            : <span className="text-xs font-mono text-slate-300 dark:text-slate-700">—</span>
          }
        </TableCell>

        <TableCell className="hidden sm:table-cell py-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-mono ${subStatusConfig[p.status].text}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${subStatusConfig[p.status].dot}`} />
            {subStatusConfig[p.status].label}
          </span>
        </TableCell>

        <TableCell className="py-3 text-right">
          {p.aiScore !== null ? (
            <span className={`text-xl font-black font-mono ${scoreColor}`}>{p.aiScore}</span>
          ) : p.status === "PENDING" ? (
            <Loader2 size={14} className="animate-spin text-amber-500 ml-auto" />
          ) : (
            <span className="text-xs font-mono text-slate-300 dark:text-slate-700">—</span>
          )}
        </TableCell>

        <TableCell className="py-3">
          <div className="flex items-center gap-1.5 justify-end">
            {p.submissionId && (
              <button
                onClick={() => router.push(`/recruiter/challenges/${challengeId}/review/${p.userId}?session=${sessionId}`)}
                className="text-xs font-mono text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 px-2 py-1 border border-violet-200 dark:border-violet-900/60 hover:border-violet-300 dark:hover:border-violet-700 bg-violet-50 dark:bg-violet-950/40 transition-colors rounded whitespace-nowrap"
              >
                Code →
              </button>
            )}
            {p.submissionId && p.status === "EVALUATED" && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors rounded"
              >
                <ChevronDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {expanded && <ExpandedDetail p={p} />}
    </>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<ChallengeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [newUserIds, setNewUserIds] = useState<Set<string>>(new Set());
  const hasInitializedRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`${API_URL}/challenge/submissions/all`);
      const data: ChallengeResult[] = (res.data.challenges ?? []).filter((c: ChallengeResult) => c.sessionStatus !== "SCHEDULED");
      setChallenges(data);
      if (data.length > 0 && !hasInitializedRef.current) {
        setSelectedChallengeId(data[0].challengeId);
        hasInitializedRef.current = true;
      }
    } catch (err: any) {
      if (err?.response?.status === 401) { router.replace("/recruiter/login"); return; }
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const selected = challenges.find(c => c.challengeId === selectedChallengeId);
  const isLive = selected?.sessionStatus === "LIVE";

  useEffect(() => {
    if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; setConnected(false); }
    if (!selectedChallengeId || !isLive) return;

    const socket = socketIO(API_URL!, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => { setConnected(true); socket.emit("join:leaderboard", { challengeId: selectedChallengeId }); });
    socket.on("disconnect", () => setConnected(false));

    socket.on("submission:new", (data: { challengeId: string; userId: string; name: string; email: string; submittedAt: string }) => {
      if (data.challengeId !== selectedChallengeId) return;
      setNewUserIds(prev => new Set(prev).add(data.userId));
      setTimeout(() => { setNewUserIds(prev => { const next = new Set(prev); next.delete(data.userId); return next; }); }, 2000);
      setChallenges(prev => prev.map(ch => {
        if (ch.challengeId !== data.challengeId) return ch;
        return { ...ch, totalSubmitted: ch.totalSubmitted + 1, participants: ch.participants.map(p => p.userId === data.userId ? { ...p, status: "PENDING" as SubmissionStatus, submittedAt: data.submittedAt, submissionId: "pending" } : p) };
      }));
      toast.success(`${data.name} submitted!`, { duration: 2000 });
    });

    socket.on("submission:evaluated", (data: { challengeId: string; userId: string; aiScore: number; aiSummary: string; aiBreakdown: any; aiStrengths: string[]; aiImprovements: string[]; featuresCompleted: string[]; featuresMissing: string[]; evaluatedAt: string }) => {
      if (data.challengeId !== selectedChallengeId) return;
      setChallenges(prev => prev.map(ch => {
        if (ch.challengeId !== data.challengeId) return ch;
        return { ...ch, participants: ch.participants.map(p => p.userId === data.userId ? { ...p, status: "EVALUATED" as SubmissionStatus, aiScore: data.aiScore, aiSummary: data.aiSummary, aiBreakdown: data.aiBreakdown, aiStrengths: data.aiStrengths, aiImprovements: data.aiImprovements, featuresCompleted: data.featuresCompleted, featuresMissing: data.featuresMissing, evaluatedAt: data.evaluatedAt } : p) };
      }));
    });

    return () => { socket.emit("leave:leaderboard", { challengeId: selectedChallengeId }); socket.disconnect(); socketRef.current = null; setConnected(false); };
  }, [selectedChallengeId, isLive]);

  const sorted = useMemo(() => {
    if (!selected) return [];
    return [
      ...selected.participants.filter(p => p.status === "EVALUATED").sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0)),
      ...selected.participants.filter(p => p.status === "PENDING"),
      ...selected.participants.filter(p => p.status === "IN_PROGRESS"),
      ...selected.participants.filter(p => p.status === "REGISTERED"),
    ];
  }, [selected]);

  const evaluated = sorted.filter(p => p.status === "EVALUATED");
  const pending   = sorted.filter(p => p.status === "PENDING");
  const avgScore  = evaluated.length > 0 ? Math.round(evaluated.reduce((s, p) => s + (p.aiScore ?? 0), 0) / evaluated.length) : null;
  const topScore  = evaluated.length > 0 ? Math.max(...evaluated.map(p => p.aiScore ?? 0)) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#080810] flex items-center justify-center">
        <div className="text-xs font-mono text-slate-400 dark:text-slate-700 tracking-widest animate-pulse">Loading leaderboard…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810] text-slate-900 dark:text-slate-100">

      <div className="border-b border-slate-200 dark:border-slate-800/50 bg-white/90 dark:bg-[#080810]/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="w-full px-6 py-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Trophy size={18} className="text-amber-500 dark:text-amber-400 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {selected ? `Ranking of ${selected.title}` : "Leaderboard"}
                </h1>
                {isLive && (
                  <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full border ${connected ? "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30" : "text-slate-500 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"}`}>
                    <Zap size={10} className={connected ? "text-emerald-500 dark:text-emerald-400" : "text-slate-400 dark:text-slate-600"} />
                    {connected ? "Live" : "Connecting…"}
                  </span>
                )}
              </div>
              {selected && (
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`inline-flex items-center gap-1 text-xs font-mono ${sessionStatusConfig[selected.sessionStatus].text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sessionStatusConfig[selected.sessionStatus].dot}`} />
                    {sessionStatusConfig[selected.sessionStatus].label}
                  </span>
                  <span className={`text-xs font-mono px-1.5 py-0.5 border rounded-sm ${difficultyStyles[selected.difficulty]}`}>{selected.difficulty}</span>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-600">{typeLabels[selected.challengeType]}</span>
                </div>
              )}
            </div>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors rounded-lg min-w-56"
            >
              <span className="flex-1 text-left truncate">{selected?.title ?? "Select challenge"}</span>
              <ChevronDown size={12} className={`text-slate-400 dark:text-slate-500 shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl shadow-black/5 dark:shadow-2xl dark:shadow-black/40 z-30 max-h-64 overflow-y-auto">
                {challenges.length === 0 ? (
                  <div className="px-4 py-3 text-xs font-mono text-slate-400 dark:text-slate-600">No challenges yet</div>
                ) : challenges.map(ch => (
                  <button
                    key={ch.challengeId}
                    onClick={() => { setSelectedChallengeId(ch.challengeId); setDropdownOpen(false); }}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${selectedChallengeId === ch.challengeId ? "bg-violet-50 dark:bg-violet-950/40" : ""}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${sessionStatusConfig[ch.sessionStatus].dot}`} />
                    <div className="min-w-0">
                      <p className={`text-xs font-mono truncate ${selectedChallengeId === ch.challengeId ? "text-violet-600 dark:text-violet-300" : "text-slate-700 dark:text-slate-300"}`}>{ch.title}</p>
                      <p className="text-xs font-mono text-slate-400 dark:text-slate-600 mt-0.5">{ch.totalParticipants} candidates · {ch.sessionStatus}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-6">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-60 gap-3">
            <Trophy size={32} className="text-slate-300 dark:text-slate-800" />
            <p className="text-sm font-mono text-slate-400 dark:text-slate-600">Select a challenge to view rankings</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Participants", value: selected.totalParticipants, icon: Users,       color: "text-slate-800 dark:text-slate-100" },
                { label: "Submitted",   value: selected.totalSubmitted,    icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Avg Score",   value: avgScore ?? "—",            icon: BarChart2,    color: "text-violet-600 dark:text-violet-400" },
                { label: "Top Score",   value: topScore ?? "—",            icon: Trophy,       color: "text-amber-600 dark:text-amber-400" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={12} className="text-slate-400 dark:text-slate-600" />
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-600">{label}</span>
                  </div>
                  <span className={`text-2xl font-bold font-mono ${color}`}>{value}</span>
                </div>
              ))}
            </div>

            {isLive && (
              <div className={`flex items-center gap-2 mb-4 px-4 py-2.5 rounded-lg border transition-colors ${connected ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40" : "bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"}`}>
                {connected ? (
                  <>
                    <Zap size={12} className="text-emerald-500 dark:text-emerald-400" />
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">Real-time updates active — leaderboard updates instantly when candidates submit</span>
                  </>
                ) : (
                  <>
                    <Loader2 size={12} className="animate-spin text-slate-400 dark:text-slate-500" />
                    <span className="text-xs font-mono text-slate-500">Connecting to live feed…</span>
                  </>
                )}
              </div>
            )}

            {pending.length > 0 && (
              <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                <Loader2 size={12} className="animate-spin text-amber-500" />
                <span className="text-xs font-mono text-amber-600 dark:text-amber-400">{pending.length} submission{pending.length > 1 ? "s" : ""} being evaluated by AI…</span>
              </div>
            )}

            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-transparent">
                <AlertCircle size={20} className="text-slate-300 dark:text-slate-700" />
                <p className="text-xs font-mono text-slate-400 dark:text-slate-700">No participants yet</p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-800/60 hover:bg-transparent bg-slate-50 dark:bg-transparent">
                      <TableHead className="w-12 text-center text-xs font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest">Rank</TableHead>
                      <TableHead className="text-xs font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest">Candidate</TableHead>
                      <TableHead className="hidden lg:table-cell text-xs font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest">Breakdown</TableHead>
                      <TableHead className="hidden md:table-cell text-xs font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest">Time</TableHead>
                      <TableHead className="hidden md:table-cell text-xs font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest">Submitted</TableHead>
                      <TableHead className="hidden sm:table-cell text-xs font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest">Status</TableHead>
                      <TableHead className="text-right text-xs font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest">Score</TableHead>
                      <TableHead className="w-24" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((p, i) => (
                      <LeaderboardTableRow
                        key={p.userId}
                        p={p}
                        rank={i + 1}
                        challengeId={selected.challengeId}
                        sessionId={selected.sessionId}
                        isNew={newUserIds.has(p.userId)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}