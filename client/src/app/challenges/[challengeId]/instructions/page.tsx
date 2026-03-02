"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function InstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const challengeId = params.challengeId as string;
  const sessionId = searchParams.get("session");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [timeToStart, setTimeToStart] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/challenge/${challengeId}/instructions?session=${sessionId}`,
          { withCredentials: true }
        );
        setData(res.data.challenge);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!data?.session?.startTime) return;

    const tick = () => {
      const diff = new Date(data.session.startTime).getTime() - Date.now();
      
      if (diff <= 0) {
        router.replace(
          `/challenges/${challengeId}/attempt?session=${sessionId}`
        );
        return;
      }
      setTimeToStart(diff);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data]);

  const formatCountdown = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  };

  const handleStart = () => {
    if (!agreed) return;
    if (data?.session?.status === "LIVE") {
      router.push(`/challenges/${challengeId}/attempt?session=${sessionId}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Not found</div>;

  const isLive = data.session.status === "LIVE";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Company info */}
        <div className="mb-8 p-5 bg-slate-900 border border-slate-800">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">
            Challenge by
          </p>
          <h2 className="text-lg font-bold text-slate-100 mb-1">
            {data.companyName ?? "Unknown Company"}
          </h2>
          <p className="text-sm font-mono text-slate-500">
            {data.recruiterName} · {data.designation ?? "Recruiter"}
          </p>
          {data.companyWebsite && (
            <Link
              href={data.companyWebsite}
              target="_blank"
              className="text-xs font-mono text-violet-400 hover:underline mt-1 block"
            >
              {data.companyWebsite}
            </Link>
          )}
        </div>

        {/* Challenge info */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
          <p className="text-sm font-mono text-slate-500 mb-4">{data.description}</p>
          <div className="flex gap-3">
            <span className="text-xs font-mono px-2 py-1 border border-slate-700 text-slate-400">
              {data.challengeType}
            </span>
            <span className="text-xs font-mono px-2 py-1 border border-slate-700 text-slate-400">
              {data.difficulty}
            </span>
            <span className="text-xs font-mono px-2 py-1 border border-slate-700 text-slate-400">
              {data.session.durationMins} mins
            </span>
          </div>
        </div>

        {/* Countdown or Live indicator */}
        <div className="mb-8 p-5 bg-slate-900 border border-slate-800 text-center">
          {isLive ? (
            <>
              <p className="text-xs font-mono text-emerald-500 uppercase tracking-widest mb-1">
                Challenge is Live
              </p>
              <p className="text-2xl font-mono font-bold text-emerald-400">
                Go!
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">
                Starts in
              </p>
              <p className="text-3xl font-mono font-bold text-blue-400">
                {timeToStart !== null ? formatCountdown(timeToStart) : "—"}
              </p>
              <p className="text-xs font-mono text-slate-600 mt-2">
                Page will auto-redirect when challenge starts
              </p>
            </>
          )}
        </div>

        {/* Rules */}
        <div className="mb-8">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">
            Rules
          </p>
          <ul className="space-y-2 text-sm font-mono text-slate-400">
            <li>→ Do not refresh or close the browser during the challenge</li>
            <li>→ You have {data.session.durationMins} minutes once you start</li>
            <li>→ All submissions are final after the timer ends</li>
            <li>→ No external help or AI tools allowed</li>
            <li>→ Your code will be reviewed by the recruiter</li>
          </ul>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer mb-6 group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 accent-violet-500"
          />
          <span className="text-sm font-mono text-slate-400 group-hover:text-slate-300 transition-colors">
            I have read and agree to the rules. I understand this is a timed challenge.
          </span>
        </label>

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={!agreed || !isLive}
          className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold tracking-wide transition-colors"
        >
          {isLive ? "Start Challenge →" : "Waiting for challenge to start…"}
        </button>

      </div>
    </div>
  );
}
