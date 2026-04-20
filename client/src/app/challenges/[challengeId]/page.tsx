"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChallengePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  useEffect(() => {
    // Redirect to instructions page
    if (sessionId) {
      router.replace(`/challenges/${window.location.pathname.split('/')[2]}/instructions?session=${sessionId}`);
    } else {
      router.replace("/challenges");
    }
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-800 border-t-slate-400 rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-600 tracking-widest">Redirecting…</p>
      </div>
    </div>
  );
}