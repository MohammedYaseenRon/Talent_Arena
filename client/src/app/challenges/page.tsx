"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  Zap,
  Calendar,
  ChevronRight,
  Timer,
  Radio,
  Flag,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

type Difficulty = "EASY" | "MEDIUM" | "HARD" | "All";
type ChallengeType = "FRONTEND" | "BACKEND" | "DSA" | "SYSTEM_DESIGN" | "All";
type Status = "LIVE" | "SCHEDULED" | "ENDED" | "All";

export interface Challenge {
  sessionId: string;
  challengeId: string;
  title: string;
  description: string;
  difficulty: string;
  challengeType: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "LIVE" | "ENDED";
}

function useCountdown(target: string) {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) {
        setDisplay("Ended");
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

const difficultyConfig: Record<string, { label: string; classes: string }> = {
  EASY: {
    label: "Easy",
    classes: "text-emerald-400 bg-emerald-950 border-emerald-800",
  },
  MEDIUM: {
    label: "Medium",
    classes: "text-amber-400 bg-amber-950 border-amber-800",
  },
  HARD: { label: "Hard", classes: "text-red-400 bg-red-950 border-red-800" },
};

const typeConfig: Record<string, { label: string; color: string }> = {
  FRONTEND: { label: "Frontend", color: "text-violet-400" },
  BACKEND: { label: "Backend", color: "text-blue-400" },
  DSA: { label: "DSA", color: "text-cyan-400" },
  SYSTEM_DESIGN: { label: "System Design", color: "text-orange-400" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDuration(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}` : `${m}m`;
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const router = useRouter();
  const countdown = useCountdown(
    challenge.status === "LIVE" ? challenge.endTime : challenge.startTime,
  );
  const diff = difficultyConfig[challenge.difficulty] ?? difficultyConfig.EASY;
  const type = typeConfig[challenge.challengeType] ?? {
    label: challenge.challengeType,
    color: "text-slate-400",
  };
  const duration = getDuration(challenge.startTime, challenge.endTime);

  const handleNavigate = () => {
    if (challenge.status === "LIVE" || challenge.status === "SCHEDULED") {
      router.push(
        `/challenges/${challenge.challengeId}/instructions?session=${challenge.sessionId}`,
      );
    } else if (challenge.status === "ENDED") {
      router.push(`/challenges/${challenge.challengeId}/results`);
    }
  };

  return (
    <div
      onClick={handleNavigate}
      className={`group relative bg-slate-950 border transition-all duration-200 cursor-pointer overflow-hidden
        ${
          challenge.status === "LIVE"
            ? "border-emerald-900/60 hover:border-emerald-700"
            : challenge.status === "SCHEDULED"
              ? "border-slate-800 hover:border-blue-800"
              : "border-slate-900 hover:border-slate-700 opacity-70 hover:opacity-100"
        }`}
    >
      {/* Live top glow bar */}
      {challenge.status === "LIVE" && (
        <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
      )}
      {challenge.status === "SCHEDULED" && (
        <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-600/50 to-transparent" />
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left — main content */}
          <div className="flex-1 min-w-0">
            {/* Status + type row */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {challenge.status === "LIVE" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              )}
              {challenge.status === "SCHEDULED" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2 py-0.5 bg-blue-950 border border-blue-900 text-blue-400">
                  <Calendar className="w-3 h-3" />
                  UPCOMING
                </span>
              )}
              {challenge.status === "ENDED" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-500">
                  ENDED
                </span>
              )}

              {/* Difficulty */}
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 border ${diff.classes}`}
              >
                {diff.label}
              </span>

              {/* Type */}
              <span className={`text-xs font-mono ${type.color}`}>
                {type.label}
              </span>
            </div>

            {/* Title */}
            <h3
              className={`text-base font-bold mb-1.5 leading-snug transition-colors
                ${
                  challenge.status === "LIVE"
                    ? "text-slate-100 group-hover:text-emerald-300"
                    : "text-slate-100 group-hover:text-white"
                }`}
            >
              {challenge.title}
            </h3>

            {/* Description */}
            {challenge.description && (
              <p className="text-xs font-mono text-slate-600 line-clamp-1 leading-relaxed">
                {challenge.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-600" />
                <span className="text-xs font-mono text-slate-600">
                  {formatDate(challenge.startTime)} ·{" "}
                  {formatTime(challenge.startTime)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Timer className="w-3 h-3 text-slate-600" />
                <span className="text-xs font-mono text-slate-600">
                  {duration}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            {challenge.status === "LIVE" && (
              <div className="text-right">
                <p className="text-xs font-mono text-slate-600 mb-0.5">
                  ends in
                </p>
                <p className="text-sm font-mono font-bold text-emerald-400">
                  {countdown}
                </p>
              </div>
            )}
            {challenge.status === "SCHEDULED" && (
              <div className="text-right">
                <p className="text-xs font-mono text-slate-600 mb-0.5">
                  starts in
                </p>
                <p className="text-sm font-mono font-bold text-blue-400">
                  {countdown}
                </p>
              </div>
            )}
            {challenge.status === "ENDED" && (
              <div className="text-right">
                <p className="text-xs font-mono text-slate-700">
                  {formatDate(challenge.endTime)}
                </p>
              </div>
            )}

            {challenge.status === "LIVE" && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  router.push(
                    `/challenges/${challenge.challengeId}/instructions?session=${challenge.sessionId}`,
                  );
                }}
                className="..."
              >
                Join Now →
              </button>
            )}
            {challenge.status === "SCHEDULED" && (
              <button onClick={handleNavigate} className="inline-flex items-center gap-1 text-xs font-mono px-3 py-1.5 border border-slate-700 text-slate-400 group-hover:border-blue-700 group-hover:text-blue-400 transition-colors">
                View Details <ChevronRight className="w-3 h-3" />
              </button>
            )}
            {challenge.status === "ENDED" && (
              <button className="inline-flex items-center gap-1 text-xs font-mono px-3 py-1.5 border border-slate-800 text-slate-600 group-hover:border-slate-600 group-hover:text-slate-400 transition-colors">
                Results <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  label,
  count,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className={color}>{icon}</span>
      <span className="text-sm font-mono font-bold text-slate-300 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-xs font-mono text-slate-600 px-2 py-0.5 bg-slate-900 border border-slate-800">
        {count}
      </span>
    </div>
  );
}

const ChallengesPage = () => {
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("All");
  const [selectedType, setSelectedType] = useState<ChallengeType>("All");
  const [selectedStatus, setSelectedStatus] = useState<Status>("All");

  const [liveChallenges, setLiveChallenges] = useState<Challenge[]>([]);
  const [upcomingChallenges, setUpcomingChallenges] = useState<Challenge[]>([]);
  const [endedChallenges, setEndedChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLive = async () => {
    try {
      const res = await api.get(
        `${process.env.NEXT_PUBLIC_API_URL}/challenge/live`);
      setLiveChallenges(res.data.challenges || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUpcoming = async () => {
    try {
      const res = await api.get(
        `${process.env.NEXT_PUBLIC_API_URL}/challenge/upcoming`);
      setUpcomingChallenges(res.data.challenges || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEnded = async () => {
    try {
      const res = await api.get(
        `${process.env.NEXT_PUBLIC_API_URL}/challenge/ended`);
      setEndedChallenges(res.data.challenges || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchLive(), fetchUpcoming(), fetchEnded()]);
      setLoading(false);
    };
    init();

    const liveInterval = setInterval(fetchLive, 10000);
    const upcomingInterval = setInterval(fetchUpcoming, 30000);
    return () => {
      clearInterval(liveInterval);
      clearInterval(upcomingInterval);
    };
  }, []);

  const allChallenges = [
    ...liveChallenges,
    ...upcomingChallenges,
    ...endedChallenges,
  ];

  const applyFilters = (list: Challenge[]) =>
    list.filter((c) => {
      const matchesDifficulty =
        selectedDifficulty === "All" || c.difficulty === selectedDifficulty;
      const matchesType =
        selectedType === "All" || c.challengeType === selectedType;
      return matchesDifficulty && matchesType;
    });

  const filteredLive = applyFilters(liveChallenges);
  const filteredUpcoming = applyFilters(upcomingChallenges);
  const filteredEnded = applyFilters(endedChallenges);

  // When status filter is active — show flat filtered list
  const isStatusFiltered = selectedStatus !== "All";
  const flatFiltered = applyFilters(allChallenges).filter(
    (c) => selectedStatus === "All" || c.status === selectedStatus,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-800 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-600 tracking-widest">
            Loading challenges…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-mono text-slate-600 tracking-widest uppercase mb-2">
            Candidate Dashboard
          </p>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-1">
            Challenges
          </h1>
          <p className="text-sm font-mono text-slate-600">
            {allChallenges.length} total ·{" "}
            <span className="text-emerald-500">
              {liveChallenges.length} live
            </span>{" "}
            ·{" "}
            <span className="text-blue-500">
              {upcomingChallenges.length} upcoming
            </span>{" "}
            ·{" "}
            <span className="text-gray-500">
              {endedChallenges.length} ended
            </span>
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <Select
            value={selectedStatus}
            onValueChange={(v) => setSelectedStatus(v as Status)}
          >
            <SelectTrigger className="w-36 bg-slate-900 border-slate-800 text-slate-300 text-xs font-mono">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="All">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4" />
                    <span>All Status</span>
                  </div>
                </SelectItem>

                <SelectItem value="LIVE">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-red-500" />
                    <span>Live</span>
                  </div>
                </SelectItem>

                <SelectItem value="SCHEDULED">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>Upcoming</span>
                  </div>
                </SelectItem>

                <SelectItem value="ENDED">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-gray-500" />
                    <span>Ended</span>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={selectedDifficulty}
            onValueChange={(v) => setSelectedDifficulty(v as Difficulty)}
          >
            <SelectTrigger className="w-36 bg-slate-900 border-slate-800 text-slate-300 text-xs font-mono">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="All">All Levels</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={selectedType}
            onValueChange={(v) => setSelectedType(v as ChallengeType)}
          >
            <SelectTrigger className="w-40 bg-slate-900 border-slate-800 text-slate-300 text-xs font-mono">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="FRONTEND">Frontend</SelectItem>
                <SelectItem value="BACKEND">Backend</SelectItem>
                <SelectItem value="DSA">DSA</SelectItem>
                <SelectItem value="SYSTEM_DESIGN">System Design</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <span className="ml-auto text-xs font-mono text-slate-600">
            {isStatusFiltered ? flatFiltered.length : allChallenges.length}{" "}
            results
          </span>
        </div>

        {isStatusFiltered ? (
          <div className="flex flex-col gap-3">
            {flatFiltered.length === 0 ? (
              <div className="text-center py-16 text-slate-700 font-mono text-sm">
                No {selectedStatus.toLowerCase()} challenges found
              </div>
            ) : (
              flatFiltered.map((c) => (
                <ChallengeCard key={c.sessionId} challenge={c} />
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {filteredLive.length > 0 && (
              <section>
                <SectionHeader
                  icon={<Zap className="w-4 h-4" />}
                  label="Live Now"
                  count={filteredLive.length}
                  color="text-emerald-400"
                />
                <div className="flex flex-col gap-3">
                  {filteredLive.map((c) => (
                    <ChallengeCard key={c.sessionId} challenge={c} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {filteredUpcoming.length > 0 && (
              <section>
                <SectionHeader
                  icon={<Calendar className="w-4 h-4" />}
                  label="Upcoming"
                  count={filteredUpcoming.length}
                  color="text-blue-400"
                />
                <div className="flex flex-col gap-3">
                  {filteredUpcoming.map((c) => (
                    <ChallengeCard key={c.sessionId} challenge={c} />
                  ))}
                </div>
              </section>
            )}

            {/* Ended */}
            {filteredEnded.length > 0 && (
              <section>
                <SectionHeader
                  icon={<Clock className="w-4 h-4" />}
                  label="Past Challenges"
                  count={filteredEnded.length}
                  color="text-slate-500"
                />
                <div className="flex flex-col gap-3">
                  {filteredEnded.map((c) => (
                    <ChallengeCard key={c.sessionId} challenge={c} />
                  ))}
                </div>
              </section>
            )}

            {filteredLive.length === 0 &&
              filteredUpcoming.length === 0 &&
              filteredEnded.length === 0 && (
                <div className="text-center py-16 text-slate-700 font-mono text-sm">
                  No challenges match your filters
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;
