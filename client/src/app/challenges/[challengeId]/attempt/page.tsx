"use client";

import { ChallengeSidebar } from "@/components/recruiter/SideBarModal";
import SubmitBtn from "@/components/recruiter/SubmitBtn";
import Timer from "@/components/recruiter/Timer";
import { ResizableDivider } from "@/components/ResizableDivider";
import api from "@/lib/axios";
import { AttemptChallenge, AttemptSession } from "@/types";
import {
  SandpackProvider,
  SandpackFileExplorer,
  SandpackPreview,
  SandpackLayout,
  SandpackCodeEditor,
  useSandpack,
} from "@codesandbox/sandpack-react";
import {
  MoreVertical,
  X,
  FolderTree,
  Files,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { useSubmitChallenge } from "@/hooks/useSubmitChallenge";

function MoreOptionsDropdown({
  isOpen,
  onClose,
  onToggleFileExplorer,
  isFileExplorerOpen,
  position,
}: {
  isOpen: boolean;
  onClose: () => void;
  onToggleFileExplorer: () => void;
  isFileExplorerOpen: boolean;
  position: { top: number; right: number };
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-52 overflow-hidden"
      style={{ top: position.top, right: position.right }}
    >
      <div className="py-1">
        <button
          onClick={() => {
            onToggleFileExplorer();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <FolderTree size={16} className="text-blue-400" />
          <span>
            {isFileExplorerOpen ? "Hide File Explorer" : "Show File Explorer"}
          </span>
        </button>
        <div className="border-t border-gray-700 my-1" />
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors">
          <Files size={16} className="text-green-400" />
          <span>All Files</span>
        </button>
      </div>
    </div>
  );
}

function TopBar({
  challengeId,
  sessionId,
  endTime,
  onMoreClick,
  openTabs,
  activeFile,
  onTabClick,
  onTabClose,
}: {
  challengeId: string;
  sessionId: string;
  endTime: string;
  onMoreClick: (e: React.MouseEvent) => void;
  openTabs: string[];
  activeFile: string;
  onTabClick: (path: string) => void;
  onTabClose: (path: string) => void;
}) {
  return (
    <div className="flex items-center bg-gray-900 border-b border-gray-700 h-11 flex-shrink-0 absolute top-0 left-0 right-0 z-10">
      <div className="flex items-center overflow-x-auto flex-1 scrollbar-none h-full">
        {openTabs.length === 0 ? (
          <div className="px-4 text-xs text-gray-500 italic">
            No files open — select a file from the explorer
          </div>
        ) : (
          openTabs.map((path) => (
            <div
              key={path}
              onClick={() => onTabClick(path)}
              className={`
                flex items-center gap-2 h-full text-base px-4 border-r border-gray-700
                cursor-pointer whitespace-nowrap select-none
                ${activeFile === path ? "bg-gray-800 text-white" : "bg-gray-900 text-gray-400 hover:bg-gray-800/60"}
              `}
            >
              <span>{path.split("/").pop()}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(path);
                }}
                className="hover:text-white rounded-sm hover:bg-gray-700 p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 px-2 flex-shrink-0 border-l border-gray-700 h-full">
        <Timer endTime={endTime} />
        <SubmitBtn challengeId={challengeId} sessionId={sessionId} />
        <button
          onClick={onMoreClick}
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-800 transition-colors"
        >
          <MoreVertical size={14} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}

function EditorWithTopBar({
  onMoreClick,
  challengeId,
  sessionId,
  endTime,
  sandpackRef,
}: {
  onMoreClick: (e: React.MouseEvent) => void;
  challengeId: string;
  sessionId: string;
  endTime: string;
  sandpackRef: React.MutableRefObject<any>;
}) {
  const { sandpack } = useSandpack();
  const { activeFile } = sandpack;
  const [openTabs, setOpenTabs] = useState<string[]>([activeFile]);
  const closedTabsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (
      activeFile &&
      !openTabs.includes(activeFile) &&
      !closedTabsRef.current.has(activeFile)
    ) {
      setOpenTabs((prev) => [...prev, activeFile]);
    }
    if (closedTabsRef.current.has(activeFile)) {
      closedTabsRef.current.delete(activeFile);
    }
  }, [activeFile]);

  const closeTab = (path: string) => {
    closedTabsRef.current.add(path);
    const newTabs = openTabs.filter((tab) => tab !== path);
    setOpenTabs(newTabs);
    if (newTabs.length === 0) return;
    if (path === activeFile)
      sandpack.setActiveFile(newTabs[newTabs.length - 1]);
  };

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        minWidth: 0,
      }}
    >
      <TopBar
        challengeId={challengeId}
        sessionId={sessionId}
        endTime={endTime}
        onMoreClick={onMoreClick}
        openTabs={openTabs}
        activeFile={activeFile}
        onTabClick={(path) => sandpack.setActiveFile(path)}
        onTabClose={closeTab}
      />
      <div style={{ flex: 1, marginTop: "40px", overflow: "hidden" }}>
        <SandpackCodeEditor
          showTabs={false}
          showLineNumbers={true}
          showInlineErrors={true}
          wrapContent={true}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
}

export default function Attempt() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const API = process.env.NEXT_PUBLIC_API_URL;
  const challengeId = params.challengeId as string;
  const sessionId = searchParams.get("session") as string;
  const [challengeDetail, setChallengeDetail] =
    useState<AttemptChallenge | null>(null);
  const [session, setSession] = useState<AttemptSession | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorFlex, setEditorFlex] = useState(50);
  const sandpackRef = useRef<any>(null);

  const { submit } = useSubmitChallenge(challengeId, sessionId);

  const handleAutoSubmit = async () => {
    if (!sandpackRef.current) return;
    const codeFiles = Object.entries(sandpackRef.current.files).reduce(
      (acc, [path, file]: any) => {
        acc[path] = file.code;
        return acc;
      },
      {} as Record<string, string>,
    );
    await submit(codeFiles, true);
  };

  const load = async () => {
    try {
      const res = await api.get(
        `${API}/challenge/${challengeId}/attempt-data?session=${sessionId}`,
      );
      setChallengeDetail(res.data.challenge);
      setSession(res.data.session);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.error;
      if (status === 401) {
        router.replace("/login");
        return;
      }
      if (status === 403) {
        router.replace(
          `/challenges/${challengeId}/instructions?session=${sessionId}`,
        );
        return;
      }
      setError(message || "Failed to load challenge");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
        setIsFileExplorerOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMoreClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    if (!sessionId) return;

    const socket = getSocket();

    //tell server we are in the contest
    socket.emit("join:session", sessionId);

    socket.on("session:participants", ({ count }: { count: number }) => {
      setParticipantCount(count);
    });

    // Listen for session status changes from cron
    socket.on("session:status", ({ status }: { status: string }) => {
      if (status === "ENDED") {
        // trigger auto submit then redirect
        handleAutoSubmit();
      }
    });

    return () => {
      socket.emit("leave:session", sessionId);
      socket.off("session:participants");
      socket.off("session:status");
    };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-800 border-t-slate-400 rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-600 tracking-widest">
            Loading challenge…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-950">
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-2 left-2 z-40 p-1.5 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 transition-colors"
        >
          <PanelLeftOpen size={16} className="text-gray-300" />
        </button>
      )}

      <div
        className={`h-full flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden ${isSidebarOpen ? "w-64 md:w-112" : "w-0"}`}
      >
        <div className="h-full relative">
          <ChallengeSidebar challenge={challengeDetail!} />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-2 right-2 z-10 p-1 bg-gray-800/80 border border-gray-700/50 rounded-md hover:bg-gray-700 transition-colors"
          >
            <PanelLeftClose size={14} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-w-0 h-full overflow-hidden">
        <SandpackProvider theme="dark" template="react">
          <SandpackLayout
            style={{
              height: "100vh",
              width: "100%",
              border: "none",
              borderRadius: 0,
              display: "flex",
            }}
          >
            {/* File Explorer */}
            {isFileExplorerOpen && (
              <div
                style={{
                  width: "180px",
                  height: "100%",
                  borderRight: "1px solid #374151",
                  overflow: "auto",
                  background: "#111827",
                  flexShrink: 0,
                }}
              >
                <SandpackFileExplorer />
              </div>
            )}

            <div
              ref={containerRef}
              style={{ display: "flex", flex: 1, height: "100%", minWidth: 0 }}
            >
              <div
                style={{
                  width: `${editorFlex}%`,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  minWidth: 0,
                  flexShrink: 0,
                }}
              >
                <EditorWithTopBar
                  onMoreClick={handleMoreClick}
                  challengeId={challengeId}
                  sessionId={sessionId}
                  endTime={session?.endTime || ""}
                  sandpackRef={sandpackRef}
                />
              </div>
              <div
                style={{
                  width: `${100 - editorFlex}%`,
                  height: "100%",
                  minWidth: 0,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <SandpackPreview
                  showRefreshButton={true}
                  showOpenInCodeSandbox={false}
                  style={{ height: "100%", width: "100%" }}
                />
              </div>
            </div>
          </SandpackLayout>

          <MoreOptionsDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            onToggleFileExplorer={() =>
              setIsFileExplorerOpen(!isFileExplorerOpen)
            }
            isFileExplorerOpen={isFileExplorerOpen}
            position={dropdownPosition}
          />
        </SandpackProvider>
      </div>
    </div>
  );
}
