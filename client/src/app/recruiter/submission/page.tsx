"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Bot, ChevronDown, Loader2, Users, BarChart2, CheckCircle2, AlertCircle, Search, Filter } from "lucide-react";
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

const sessionDot: Record<SessionStatus, string> = {
  SCHEDULED: "bg-blue-500",
  LIVE:      "bg-emerald-500 animate-pulse",
  ENDED:     "bg-slate-400 dark:bg-slate-600",
};

const subStatusConfig: Record<SubmissionStatus, { label: string; dot: string; text: string; border: string }> = {
  EVALUATED:   { label: "Evaluated",   dot: "bg-emerald-500",             text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-900/40" },
  PENDING:     { label: "Evaluating…", dot: "bg-amber-500 animate-pulse", text: "text-amber-600 dark:text-amber-400",     border: "border-amber-200 dark:border-amber-900/40" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-blue-500 animate-pulse",  text: "text-blue-600 dark:text-blue-400",       border: "border-blue-200 dark:border-blue-900/40" },
  REGISTERED:  { label: "Registered",  dot: "bg-slate-400",               text: "text-slate-500 dark:text-slate-400",     border: "border-slate-200 dark:border-slate-800" },
};

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-xs font-mono text-slate-500">{label}</span>
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{score}</span>
      </div>
      <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function ParticipantRow({ p, rank, challengeId, sessionId }: {
  p: Participant; rank: number; challengeId: string; sessionId: string;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const cfg = subStatusConfig[p.status];
  const scoreColor = p.aiScore === null ? "" : p.aiScore >= 80 ? "text-emerald-600 dark:text-emerald-400" : p.aiScore >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";

  return (
    <div className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">

        <span className="text-xs font-mono text-slate-400 dark:text-slate-700 w-5 text-center shrink-0">
          {p.status === "EVALUATED" ? `#${rank}` : "—"}
        </span>

        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{p.name[0]?.toUpperCase()}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
          <p className="text-xs font-mono text-slate-400 dark:text-slate-600 truncate">{p.email}</p>
        </div>

        {p.autoSubmitted && (
          <span className="hidden md:inline text-xs font-mono text-slate-400 dark:text-slate-600 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 rounded">auto</span>
        )}

        <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 border shrink-0 rounded-full ${cfg.border} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>

        <div className="w-12 text-right shrink-0">
          {p.aiScore !== null ? (
            <span className={`text-base font-bold font-mono ${scoreColor}`}>{p.aiScore}</span>
          ) : p.status === "PENDING" ? (
            <Loader2 size={13} className="animate-spin text-amber-500 ml-auto" />
          ) : (
            <span className="text-xs font-mono text-slate-300 dark:text-slate-700">—</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {p.submissionId && (
            <button
              onClick={() => router.push(`/recruiter/challenges/${challengeId}/review/${p.userId}?session=${sessionId}`)}
              className="text-xs font-mono text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 px-2 py-1 border border-violet-200 dark:border-violet-900/60 hover:border-violet-300 dark:hover:border-violet-700 bg-violet-50 dark:bg-violet-950/40 transition-colors rounded"
            >
              Code →
            </button>
          )}
          {p.submissionId && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors rounded"
            >
              <ChevronDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {expanded && p.status === "EVALUATED" && (
        <div className="px-6 pb-4 pt-3 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Bot size={11} className="text-violet-500 dark:text-violet-400" />
                <span className="text-xs font-mono text-violet-600 dark:text-violet-400 tracking-widest uppercase">AI Summary</span>
              </div>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 leading-relaxed">{p.aiSummary}</p>
            </div>
            {p.aiBreakdown && (
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 dark:text-slate-600 tracking-widest uppercase block">Breakdown</span>
                <ScoreBar label="Requirements"      score={p.aiBreakdown.requirements}     color="bg-emerald-500" />
                <ScoreBar label="Code Quality"      score={p.aiBreakdown.codeQuality}      color="bg-blue-500" />
                <ScoreBar label="Features"          score={p.aiBreakdown.features}         color="bg-violet-500" />
                <ScoreBar label="Optional Features" score={p.aiBreakdown.optionalFeatures} color="bg-amber-500" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
            {p.featuresCompleted && p.featuresCompleted.length > 0 && (
              <div>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-600 tracking-widest uppercase block mb-1.5">Completed</span>
                <div className="flex flex-wrap gap-1">
                  {p.featuresCompleted.map((f, i) => (
                    <span key={i} className="text-xs font-mono px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded">✓ {f}</span>
                  ))}
                </div>
              </div>
            )}
            {p.featuresMissing && p.featuresMissing.length > 0 && (
              <div>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-600 tracking-widest uppercase block mb-1.5">Missing</span>
                <div className="flex flex-wrap gap-1">
                  {p.featuresMissing.map((f, i) => (
                    <span key={i} className="text-xs font-mono px-1.5 py-0.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded">✗ {f}</span>
                  ))}
                </div>
              </div>
            )}
            {p.aiStrengths && p.aiStrengths.length > 0 && (
              <div>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-600 tracking-widest uppercase block mb-1.5">Strengths</span>
                <ul className="space-y-0.5">
                  {p.aiStrengths.map((s, i) => (
                    <li key={i} className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                      <span className="text-emerald-500 shrink-0">+</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {p.aiImprovements && p.aiImprovements.length > 0 && (
              <div>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-600 tracking-widest uppercase block mb-1.5">Improvements</span>
                <ul className="space-y-0.5">
                  {p.aiImprovements.map((s, i) => (
                    <li key={i} className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                      <span className="text-amber-500 shrink-0">→</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {expanded && p.status === "PENDING" && (
        <div className="px-6 py-3 bg-amber-50/50 dark:bg-slate-950/60 border-t border-amber-100 dark:border-slate-800/40 flex items-center gap-2">
          <Loader2 size={12} className="animate-spin text-amber-500" />
          <span className="text-xs font-mono text-amber-600 dark:text-amber-400">AI is evaluating this submission…</span>
        </div>
      )}
    </div>
  );
}

function ChallengeBlock({ ch, isSelected, onSelect }: {
  ch: ChallengeResult; isSelected: boolean; onSelect: () => void;
}) {
  const evaluated = ch.participants.filter(p => p.status === "EVALUATED");
  const pending   = ch.participants.filter(p => p.status === "PENDING");
  const sorted = [
    ...evaluated.sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0)),
    ...pending,
    ...ch.participants.filter(p => p.status === "IN_PROGRESS"),
    ...ch.participants.filter(p => p.status === "REGISTERED"),
  ];

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden bg-white dark:bg-slate-950/60 backdrop-blur-sm ${isSelected ? "border-slate-300 dark:border-slate-600 shadow-lg shadow-black/5 dark:shadow-black/30" : "border-slate-200 dark:border-slate-800/80"}`}>
      
      <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors" onClick={onSelect}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
              <span className={`w-1.5 h-1.5 rounded-full ${sessionDot[ch.sessionStatus]}`} />
              {ch.sessionStatus}
            </span>
            <span className={`text-xs font-mono px-2 py-0.5 border rounded-sm ${difficultyStyles[ch.difficulty]}`}>{ch.difficulty}</span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-600">{typeLabels[ch.challengeType]}</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{ch.title}</h3>
        </div>

        <div className="hidden md:flex items-center divide-x divide-slate-100 dark:divide-slate-800 shrink-0">
          {[
            { label: "Candidates", value: ch.totalParticipants, color: "text-slate-700 dark:text-slate-300" },
            { label: "Submitted",  value: ch.totalSubmitted,    color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Avg",        value: ch.avgScore ?? "—",   color: "text-violet-600 dark:text-violet-400" },
            { label: "Top",        value: ch.topScore ?? "—",   color: "text-amber-600 dark:text-amber-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center px-4">
              <p className="text-xs font-mono text-slate-400 dark:text-slate-600 mb-0.5">{label}</p>
              <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <ChevronDown size={14} className={`text-slate-400 dark:text-slate-600 shrink-0 transition-transform duration-200 ${isSelected ? "rotate-180" : ""}`} />
      </div>

      {isSelected && (
        <div className="border-t border-slate-100 dark:border-slate-800/60">
          <div className="md:hidden flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/40 flex-wrap">
            <span className="text-xs font-mono text-slate-500">{ch.totalParticipants} candidates</span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{ch.totalSubmitted} submitted</span>
            <span className="text-xs font-mono text-violet-600 dark:text-violet-400">avg {ch.avgScore ?? "—"}</span>
            <span className="text-xs font-mono text-amber-600 dark:text-amber-400">top {ch.topScore ?? "—"}</span>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/20">
            <span className="text-xs font-mono text-slate-400 dark:text-slate-700 w-5">#</span>
            <span className="w-7" />
            <span className="text-xs font-mono text-slate-400 dark:text-slate-700 flex-1">Candidate</span>
            <span className="hidden sm:block text-xs font-mono text-slate-400 dark:text-slate-700 w-28">Status</span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-700 w-12 text-right">Score</span>
            <span className="w-24" />
          </div>

          {sorted.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <AlertCircle size={14} className="text-slate-300 dark:text-slate-700" />
              <span className="text-xs font-mono text-slate-400 dark:text-slate-700">No participants yet</span>
            </div>
          ) : sorted.map((p, i) => (
            <ParticipantRow key={p.userId} p={p} rank={i + 1} challengeId={ch.challengeId} sessionId={ch.sessionId} />
          ))}

          {pending.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 border-t border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10">
              <Loader2 size={11} className="animate-spin text-amber-500" />
              <span className="text-xs font-mono text-amber-600 dark:text-amber-400">{pending.length} submission{pending.length > 1 ? "s" : ""} being evaluated…</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SubmissionsPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<ChallengeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<SessionStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get(`${API_URL}/challenge/submissions/all`);
      const data: ChallengeResult[] = (res.data.challenges ?? []).filter((c: ChallengeResult) => c.sessionStatus !== "SCHEDULED");
      setChallenges(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].challengeId);
    } catch (err: any) {
      if (err?.response?.status === 401) { router.replace("/login"); return; }
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    let list = statusFilter === "ALL" ? challenges : challenges.filter(c => c.sessionStatus === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.participants.some(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
      );
    }
    return list;
  }, [challenges, statusFilter, search]);

  const totalCandidates = challenges.reduce((s, c) => s + c.totalParticipants, 0);
  const totalSubmitted  = challenges.reduce((s, c) => s + c.totalSubmitted, 0);
  const allScores       = challenges.flatMap(c => c.participants.filter(p => p.aiScore !== null).map(p => p.aiScore!));
  const overallAvg      = allScores.length > 0 ? Math.round(allScores.reduce((s, n) => s + n, 0) / allScores.length) : null;

  const filterOptions: { value: SessionStatus | "ALL"; label: string }[] = [
    { value: "ALL",   label: "All Challenges" },
    { value: "LIVE",  label: "Live" },
    { value: "ENDED", label: "Ended" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#080810] flex items-center justify-center">
        <div className="text-xs font-mono text-slate-400 dark:text-slate-700 tracking-widest animate-pulse">Loading submissions…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080810] text-slate-900 dark:text-slate-100">

      <div className="border-b border-slate-200 dark:border-slate-800/50 bg-white/90 dark:bg-[#080810]/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="w-full px-6 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Submissions</h1>
            <p className="text-xs font-mono text-slate-400 dark:text-slate-500">{challenges.length} challenges · {totalCandidates} candidates</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search challenge or candidate…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-4 py-1.5 text-xs font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-800/80 rounded-lg w-60 transition-all"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800/80 transition-all rounded-lg"
              >
                <Filter size={11} className="text-slate-400 dark:text-slate-500" />
                {filterOptions.find(f => f.value === statusFilter)?.label}
                <ChevronDown size={11} className={`text-slate-400 dark:text-slate-500 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-xl shadow-black/5 dark:shadow-black/40 z-30 overflow-hidden">
                  {filterOptions.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { setStatusFilter(value); setFilterOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono text-left transition-colors ${statusFilter === value ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"}`}
                    >
                      {value !== "ALL" && <span className={`w-1.5 h-1.5 rounded-full ${sessionDot[value as SessionStatus]}`} />}
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Challenges",   value: challenges.length, icon: BarChart2,    color: "text-slate-800 dark:text-slate-100" },
            { label: "Candidates",   value: totalCandidates,   icon: Users,        color: "text-slate-800 dark:text-slate-100" },
            { label: "Submitted",    value: totalSubmitted,    icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Avg AI Score", value: overallAvg ?? "—", icon: Bot,          color: "text-violet-600 dark:text-violet-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={12} className="text-slate-400 dark:text-slate-500" />
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{label}</span>
              </div>
              <span className={`text-2xl font-bold font-mono ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        <div className="relative md:hidden mb-4">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 text-xs font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 rounded-lg"
          />
        </div>

        {search && (
          <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mb-3">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/20">
            <AlertCircle size={20} className="text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-mono text-slate-400 dark:text-slate-600">No challenges found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(ch => (
              <ChallengeBlock
                key={ch.challengeId}
                ch={ch}
                isSelected={selectedId === ch.challengeId}
                onSelect={() => setSelectedId(selectedId === ch.challengeId ? null : ch.challengeId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}