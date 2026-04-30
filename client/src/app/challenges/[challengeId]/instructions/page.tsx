"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  User,
  Globe,
  Clock,
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
  Timer,
} from "lucide-react";
import api from "@/lib/axios";
import WaitingRoom from "@/components/WaitingRoom";
import ParticipantCounter from "@/components/ParticipantCounter";


interface InstructionData {
  challengeId: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  challengeType: string;
  recruiterName: string;
  recruiterEmail: string;
  companyName: string;
  designation: string;
  companyWebsite: string;
  session: {
    sessionId: string;
    startTime: string;
    endTime: string;
    status: "SCHEDULED" | "LIVE" | "ENDED";
    durationMins: number;
  };
}

const difficultyConfig = {
  EASY: {
    label: "Easy",
    classes: "text-emerald-400 border-emerald-800 dark:bg-emerald-950",
  },
  MEDIUM: {
    label: "Medium",
    classes: "text-amber-400 border-amber-800 dark:bg-amber-950",
  },
  HARD: { label: "Hard", classes: "text-red-400 border-red-800 bg-red-950" },
};

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function useCountdown(target: string) {
  const [ms, setMs] = useState(0);
  useEffect(() => {
    const tick = () =>
      setMs(Math.max(0, new Date(target).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return ms;
}

function formatMs(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function InstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const challengeId = params.challengeId as string;
  const sessionId = searchParams.get("session") as string;

  const [data, setData] = useState<InstructionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [showScheduledModal, setShowScheduledModal] = useState(false);
  const [error, setError] = useState("");
  const hasAutoNavigated = useRef(false);

  const timeToStart = useCountdown(data?.session?.startTime ?? "");
  const timeToEnd = useCountdown(data?.session?.endTime ?? "");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(
          `/challenge/${challengeId}/instructions?session=${sessionId}`,
        );
        setData(res.data.challenge);

        const participantRes = await api
          .get(`/challenge/sessions/${sessionId}/participant`)
          .catch(() => null);
        console.log(participantRes?.data);

        if (participantRes?.data?.isRegistered) {
          setIsRegistered(true);
        }
        if (participantRes?.data?.hasSubmitted) {
          setIsCompleted(true);
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load challenge");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!data || hasAutoNavigated.current) return;
    if (
      data.session.status === "SCHEDULED" &&
      timeToStart === 0 &&
      isRegistered
    ) {
      hasAutoNavigated.current = true;
      setShowScheduledModal(true);
      // router.replace(`/challenges/${challengeId}/attempt?session=${sessionId}`);
    }
  }, [timeToStart, data, isRegistered]);

  const handleRegisterOrJoin = async () => {
    if (!agreed) return;
    setRegistering(true);
    setError("");
    try {
      await api.post(`/challenge/sessions/${sessionId}/join`);

      if (data?.session.status === "LIVE") {
        setIsRegistered(true);
      } else {
        setIsRegistered(true);
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to register");
    } finally {
      setRegistering(false);
    }
  };

  const handleStartFromWaitingRoom = () => {
    setShowScheduledModal(false);
    setIsRegistered(true);
    router.push(`/challenges/${challengeId}/attempt?session=${sessionId}`);
  };
  const handleContinue = () => {
    router.push(`/challenges/${challengeId}/attempt?session=${sessionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-slate-800 border-t-slate-400 rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-600 tracking-[0.2em] uppercase">
            Loading challenge…
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center">
        <p className="text-sm font-mono text-red-500">
          {error || "Challenge not found"}
        </p>
      </div>
    );
  }

  const isLive = data.session.status === "LIVE";
  const isScheduled = data.session.status === "SCHEDULED";
  const diff = difficultyConfig[data.difficulty] ?? difficultyConfig.EASY;

  return (
    <div className="min-h-screen dark:bg-[#080a0f] text-slate-100">
      {/* <div
        className={`h-px w-full ${isLive ? "bg-gradient-to-r from-transparent via-emerald-500 to-transparent" : "bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"}`}
      /> */}

      <div className="max-w-2xl mx-auto px-6 py-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-slate-400 transition-colors mb-8"
        >
          ← Back to challenges
        </button>

        {/* Status pill */}
        <div className="flex items-center gap-3 mb-8">
          {isLive ? (
            <span className="inline-flex items-center gap-2 text-xs font-mono font-bold px-3 py-1 dark:bg-emerald-950 border border-emerald-800 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full dark:bg-emerald-400 animate-pulse" />
              LIVE NOW
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-xs font-mono font-bold px-3 py-1 bg-blue-950 border border-blue-900 text-blue-400">
              <Clock className="w-3 h-3" />
              UPCOMING
            </span>
          )}
          <span
            className={`text-xs font-mono font-bold px-3 py-1 border ${diff.classes}`}
          >
            {diff.label}
          </span>
          <span className="text-xs font-mono text-slate-600 px-3 py-1 border border-slate-800">
            {data.challengeType}
          </span>
        </div>

        {/* Challenge title */}
        <h1 className="text-2xl font-bold text-black dark:text-slate-100 tracking-tight mb-2 leading-snug">
          {data.title}
        </h1>
        {data.description && (
          <p className="text-sm font-mono text-slate-500 mb-8 leading-relaxed">
            {data.description}
          </p>
        )}

        {/* Two column info */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {/* Company card */}
          <div className="dark:bg-slate-900/60 border border-slate-800 p-4">
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-3">
              Posted by
            </p>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-black dark:text-slate-200 leading-tight">
                  {data.companyName ?? "Company"}
                </p>
                <p className="text-xs font-mono text-slate-600 mt-0.5">
                  {data.recruiterName}
                </p>
                <p className="text-xs font-mono text-slate-700">
                  {data.designation ?? "Recruiter"}
                </p>
                {data.companyWebsite && (
                  <Link
                    href={data.companyWebsite}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-mono text-violet-500 hover:text-violet-400 mt-1 transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    Website
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="dark:bg-slate-900/60 border border-slate-800 p-4">
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-3">
              Session
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-slate-600 shrink-0" />
                <span className="text-xs font-mono text-slate-400">
                  {formatDateTime(data.session.startTime)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-3 h-3 text-slate-600 shrink-0" />
                <span className="text-xs font-mono text-slate-400">
                  {data.session.durationMins} minutes
                </span>
              </div>
            </div>
          </div>
        </div>

        {isLive && !showScheduledModal && (
          <ParticipantCounter sessionId={sessionId} />
        )}

        <div
          className={`mb-8 p-5 border text-center
          ${
            isLive
              ? "dark:bg-emerald-950/20 border-emerald-900/40"
              : "dark:bg-slate-900/40 border-slate-800"
          }`}
        >
          {isLive ? (
            <>
              <p className="text-xs font-mono text-emerald-600 uppercase tracking-[0.2em] mb-2">
                Time Remaining
              </p>
              <p className="text-4xl font-mono font-bold text-emerald-400 tracking-wider">
                {formatMs(timeToEnd)}
              </p>
              <p className="text-xs font-mono text-slate-600 mt-2">
                Challenge ends at{" "}
                {new Date(data.session.endTime).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-mono text-slate-600 uppercase tracking-[0.2em] mb-2">
                Starts In
              </p>
              <p className="text-4xl font-mono font-bold text-blue-400 tracking-wider">
                {formatMs(timeToStart)}
              </p>
              <p className="text-xs font-mono text-slate-700 mt-2">
                {isRegistered
                  ? "You will be redirected automatically when it starts"
                  : "Register below to get access when it starts"}
              </p>
            </>
          )}
        </div>

        <div className="mb-8 p-5 dark:bg-slate-900/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-slate-500" />
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              Rules & Guidelines
            </p>
          </div>
          <ul className="space-y-3">
            {[
              "Do not refresh or close the browser once the challenge starts",
              `You have ${data.session.durationMins} minutes from the moment you begin`,
              "All submissions are final once the timer ends — auto-submitted",
              "No external help, AI tools, or collaboration allowed",
              "Your code will be reviewed by the recruiter after submission",
              "Any suspicious activity may result in disqualification",
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-xs font-mono text-slate-700 mt-0.5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs font-mono text-slate-400 leading-relaxed">
                  {rule}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {!isCompleted && isRegistered && isLive && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 dark:bg-emerald-950/30 border border-emerald-900/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-sm font-mono text-emerald-400">
                You're registered for this challenge
              </p>
            </div>
            <button
              onClick={handleContinue}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              Continue to Challenge <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {isCompleted && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-950/30 border border-emerald-900/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-sm font-mono text-emerald-400">
                You're completed this challenge
              </p>
            </div>
            <button
              // onClick={handleContinue}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              Your result
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {!isCompleted && isRegistered && isScheduled && (
          <div className="flex items-center gap-3 p-4 dark:bg-blue-950/30 border border-blue-900/50">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <p className="text-sm font-mono text-blue-400">
                You're registered ✓
              </p>
              <p className="text-xs font-mono text-slate-600 mt-0.5">
                This page will redirect you automatically when the challenge
                starts
              </p>
            </div>
          </div>
        )}

        {!isCompleted && !isRegistered && (
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group p-4 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 border transition-colors flex items-center justify-center
                  ${
                    agreed
                      ? "bg-violet-600 border-violet-600"
                      : "border-slate-600 group-hover:border-slate-500"
                  }`}
                >
                  {agreed && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      viewBox="0 0 10 10"
                      fill="none"
                    >
                      <path
                        d="M1.5 5L4 7.5L8.5 2.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                I have read and understood all the rules. I agree to participate
                fairly and accept that violations may result in
                disqualification.
              </span>
            </label>

            {error && (
              <p className="text-xs font-mono text-red-500 px-1">{error}</p>
            )}

            <button
              onClick={handleRegisterOrJoin}
              disabled={!agreed || registering}
              className={`w-full py-3.5 text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed
                ${
                  isLive
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-violet-600 hover:bg-violet-500 text-white"
                }`}
            >
              {registering ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLive ? "Joining…" : "Registering…"}
                </>
              ) : (
                <>
                  {isLive ? (
                    <>
                      Join & Start Challenge <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Register for Challenge <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </>
              )}
            </button>

            <p className="text-center text-xs font-mono text-slate-700">
              {isLive
                ? "You'll be taken to the challenge immediately after joining"
                : "You'll be automatically redirected when the challenge goes live"}
            </p>
          </div>
        )}
      </div>
      {showScheduledModal && data.session.status === "SCHEDULED" && (
        <WaitingRoom
          sessionId={sessionId}
          challengeId={challengeId}
          onStartChallenge={handleStartFromWaitingRoom}
        />
      )}
    </div>
  );
}
