"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import { ArrowLeft, Bot, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { PageData } from "@/types";
import { ParallaxScroll } from "@/components/ui/parallax-scroll";
import { ResizableDivider } from "@/components/ResizableDivider";

export default function CodeReviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const challengeId = params.challengeId as string;
  const userId = params.userId as string;
  const sessionId = searchParams.get("session") as string;

  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiPanelCollapsed, setAiPanelCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorFlex, setEditorFlex] = useState(50); 

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(
          `/submission/${challengeId}/submissions/${userId}?session=${sessionId}`
        );
        setData(res.data);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401) { router.replace("/recruiter/login"); return; }
        if (status === 403) { router.replace("/recruiter/challenges"); return; }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
        <div className="text-xs font-mono text-slate-700 tracking-widest animate-pulse">
          Loading code…
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { submission, challengeTitle } = data;

  const scoreColor =
    submission.aiScore === null ? "text-slate-500"
    : submission.aiScore >= 80 ? "text-emerald-400"
    : submission.aiScore >= 60 ? "text-amber-400"
    : "text-red-400";

  const AI_PANEL_WIDTH = 300;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#0d0d14]"
      style={{ position: "fixed", inset: 0, zIndex: 50 }}>

      <div
        className="relative flex flex-col border-r border-slate-800 bg-[#0a0a12] shrink-0 transition-[width] duration-200 h-full"
        style={{ width: aiPanelCollapsed ? 32 : AI_PANEL_WIDTH }}
      >
        {/* Top bar inside AI panel */}
        {!aiPanelCollapsed && (
          <div className="flex items-center gap-3 px-4 border-b border-slate-800 bg-[#0d0d14] shrink-0" style={{ height: 44 }}>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-200 transition-colors shrink-0"
            >
              <ArrowLeft size={12} />
              Back
            </button>
          </div>
        )}

        <button
          onClick={() => setAiPanelCollapsed(!aiPanelCollapsed)}
          className="absolute -right-3.5 top-3 z-10 w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors shadow-lg"
        >
          {aiPanelCollapsed
            ? <ChevronRight size={13} className="text-slate-300" />
            : <ChevronLeft size={13} className="text-slate-300" />
          }
        </button>

        {aiPanelCollapsed && (
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <span className="text-xs font-mono text-slate-700 uppercase tracking-widest select-none"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
              AI Eval
            </span>
          </div>
        )}

        {!aiPanelCollapsed && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-5">
              <div className="flex items-center gap-2">
                <Bot size={12} className="text-violet-400" />
                <span className="text-xs font-mono text-violet-400 uppercase tracking-widest">AI Evaluation</span>
              </div>

              {submission.aiScore !== null && (
                <div className="flex items-center gap-4 p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <span className={`text-5xl font-black font-mono leading-none ${scoreColor}`}>
                    {submission.aiScore}
                  </span>
                  <div>
                    <p className="text-xs font-mono text-slate-500">out of 100</p>
                    <p className={`text-sm font-bold font-mono ${scoreColor}`}>
                      {submission.aiScore >= 80 ? "Excellent" : submission.aiScore >= 60 ? "Good" : "Needs Work"}
                    </p>
                  </div>
                </div>
              )}

              {submission.aiSummary && (
                <div>
                  <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1.5">Summary</p>
                  <p className="text-xs font-mono text-slate-400 leading-relaxed">{submission.aiSummary}</p>
                </div>
              )}

              {submission.aiBreakdown && (
                <div>
                  <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-2">Breakdown</p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Requirements",  key: "requirements",     color: "bg-emerald-500" },
                      { label: "Code Quality",  key: "codeQuality",      color: "bg-blue-500" },
                      { label: "Features",      key: "features",         color: "bg-violet-500" },
                      { label: "Optional",      key: "optionalFeatures", color: "bg-amber-500" },
                    ].map(({ label, key, color }) => (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-mono text-slate-500">{label}</span>
                          <span className="text-xs font-mono text-slate-400">{(submission.aiBreakdown as any)[key]}</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${(submission.aiBreakdown as any)[key]}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {submission.featuresCompleted && submission.featuresCompleted.length > 0 && (
                <div>
                  <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-2">Completed</p>
                  <div className="flex flex-wrap gap-1">
                    {submission.featuresCompleted.map((f, i) => (
                      <span key={i} className="text-xs font-mono px-1.5 py-0.5 bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 rounded">✓ {f}</span>
                    ))}
                  </div>
                </div>
              )}

              {submission.featuresMissing && submission.featuresMissing.length > 0 && (
                <div>
                  <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-2">Missing</p>
                  <div className="flex flex-wrap gap-1">
                    {submission.featuresMissing.map((f, i) => (
                      <span key={i} className="text-xs font-mono px-1.5 py-0.5 bg-red-950/50 border border-red-900/50 text-red-400 rounded">✗ {f}</span>
                    ))}
                  </div>
                </div>
              )}

              {submission.aiStrengths && submission.aiStrengths.length > 0 && (
                <div>
                  <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-2">Strengths</p>
                  <ul className="space-y-1.5">
                    {submission.aiStrengths.map((s, i) => (
                      <li key={i} className="text-xs font-mono text-slate-400 flex items-start gap-1.5">
                        <span className="text-emerald-500 shrink-0 mt-0.5">+</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {submission.aiImprovements && submission.aiImprovements.length > 0 && (
                <div>
                  <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-2">Improvements</p>
                  <ul className="space-y-1.5">
                    {submission.aiImprovements.map((s, i) => (
                      <li key={i} className="text-xs font-mono text-slate-400 flex items-start gap-1.5">
                        <span className="text-amber-500 shrink-0 mt-0.5">→</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 px-4 border-b border-slate-800 bg-[#0d0d14] shrink-0" style={{ height: 44 }}>
          {aiPanelCollapsed && (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-200 transition-colors shrink-0"
            >
              <ArrowLeft size={12} />
              Back
            </button>
          )}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs font-mono text-slate-600 shrink-0">{challengeTitle}</span>
            <span className="text-slate-700 shrink-0">/</span>
            <span className="text-sm font-semibold text-slate-200 truncate">{submission.candidateName}</span>
            <span className="text-xs font-mono text-slate-600 hidden lg:block truncate">{submission.candidateEmail}</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <Clock size={11} className="text-slate-600" />
            <span className="text-xs font-mono text-slate-500">
              {new Date(submission.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          {submission.autoSubmitted && (
            <span className="text-xs font-mono text-slate-600 px-2 py-0.5 border border-slate-800 rounded-full shrink-0">
              auto-submitted
            </span>
          )}
          {submission.aiScore !== null && (
            <div className="flex items-center gap-2 shrink-0 pl-3 border-l border-slate-800">
              <Bot size={11} className="text-violet-400" />
              <span className="text-xs font-mono text-slate-500">AI Score</span>
              <span className={`text-xl font-black font-mono ${scoreColor}`}>{submission.aiScore}</span>
            </div>
          )}
        </div>

        <div ref={containerRef} className="flex-1 min-w-0 overflow-hidden">
          <SandpackProvider
            theme="dark"
            template="react"
            files={submission.codeFiles}
          >
            <SandpackLayout
              style={{
                height: "100vh",
                width: "100%",
                border: "none",
                borderRadius: 0,
                display: "flex",
              }}
            >
              <div style={{
                width: "180px",
                height: "100%",
                borderRight: "1px solid #374151",
                overflow: "auto",
                background: "#111827",
                flexShrink: 0,
              }}>
                <SandpackFileExplorer />
              </div>

              <div style={{ display: "flex", flex: 1, height: "100%", minWidth: 0 }}>
                <div style={{ width: `${editorFlex}%`, height: "100%", flexShrink: 0, minWidth: 0 }}>
                  <SandpackCodeEditor
                    showTabs
                    showLineNumbers
                    readOnly
                    style={{ height: "100%" }}
                  />
                </div>

                <ResizableDivider
                  containerRef={containerRef}
                  onResize={setEditorFlex}
                  minPercent={20}
                  maxPercent={80}
                  direction="horizontal"
                />
                <div style={{ width: `${100 - editorFlex}%`, height: "100%", flexShrink: 0, minWidth: 0, overflow: "hidden" }}>
                  <SandpackPreview
                    showRefreshButton
                    showOpenInCodeSandbox={false}
                    style={{ height: "100%", width: "100%", minHeight: "100%" }}
                  />
                </div>
              </div>

            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>

    </div>
  );
}