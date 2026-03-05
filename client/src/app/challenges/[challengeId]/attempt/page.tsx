"use client";

import { ChallengeSidebar } from "@/components/recruiter/SideBarModal";
import api from "@/lib/axios";
import { AttemptChallenge } from "@/types";
import {
  SandpackProvider,
  SandpackFileExplorer,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";
import Editor from "@monaco-editor/react";
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

// ─── Dropdown Menu ───────────────────────────────────────────────
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

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileExplorerClick = () => {
    onToggleFileExplorer();
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-52 overflow-hidden"
      style={{ top: position.top, right: position.right }}
    >
      <div className="py-1">
        <button
          onClick={handleFileExplorerClick}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <FolderTree size={16} className="text-blue-400" />
          <span>
            {isFileExplorerOpen ? "Hide File Explorer" : "Show File Explorer"}
          </span>
        </button>

        <div className="border-t border-gray-700 my-1"></div>

        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors">
          <Files size={16} className="text-green-400" />
          <span>All Files</span>
        </button>
      </div>
    </div>
  );
}


function EditorTabs({
  onMoreClick,
}: {
  onMoreClick: (e: React.MouseEvent) => void;
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

    if (newTabs.length === 0) {
      return;
    }

    if (path === activeFile) {
      sandpack.setActiveFile(newTabs[newTabs.length - 1]);
    }
  };

  return (
    <div className="flex items-center bg-gray-900 border-b border-gray-700 h-9 flex-shrink-0">
      <div className="flex items-center overflow-x-auto flex-1 scrollbar-none">
        {openTabs.length === 0 ? (
          <div className="px-4 py-2 text-xs text-gray-500 italic">
            No files open — select a file from the explorer
          </div>
        ) : (
          openTabs.map((path) => (
            <div
              key={path}
              onClick={() => sandpack.setActiveFile(path)}
              className={`
                flex items-center gap-2 h-full text-md px-4 py-3 border-r border-gray-700 cursor-pointer whitespace-nowrap select-none
                ${
                  activeFile === path
                    ? "bg-gray-800 text-white"
                    : "bg-gray-900 text-gray-400 hover:bg-gray-800/60"
                }
              `}
            >
              <span>{path.split("/").pop()}</span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(path);
                }}
                className="hover:text-white rounded-sm hover:bg-gray-700 p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      <button
        onClick={onMoreClick}
        className="flex items-center justify-center w-9 h-full border-l border-gray-700 hover:bg-gray-800 transition-colors flex-shrink-0"
        aria-label="More options"
      >
        <MoreVertical size={14} className="text-gray-400" />
      </button>
    </div>
  );
}


function MonacoEditor() {
  const { sandpack } = useSandpack();
  const { activeFile, files } = sandpack;
  const code = files[activeFile]?.code || "";

  const getLanguage = (filename: string) => {
    if (filename.endsWith(".tsx") || filename.endsWith(".ts"))
      return "typescript";
    if (filename.endsWith(".jsx") || filename.endsWith(".js"))
      return "javascript";
    if (filename.endsWith(".css")) return "css";
    if (filename.endsWith(".html")) return "html";
    if (filename.endsWith(".json")) return "json";
    return "javascript";
  };

  return (
    <Editor
      height="100%"
      language={getLanguage(activeFile)}
      theme="vs-dark"
      value={code}
      onChange={(value) => sandpack.updateFile(activeFile, value || "")}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        wordWrap: "on",
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 12 },
        lineNumbersMinChars: 3,
        folding: true,
        renderLineHighlight: "gutter",
      }}
    />
  );
}

function EditorArea({
  onMoreClick,
}: {
  onMoreClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="basis-1/2 flex-1 h-full flex flex-col bg-gray-950 min-w-0">
      <EditorTabs onMoreClick={onMoreClick} />
      <div className="flex-1 min-h-0">
        <MonacoEditor />
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
  const [challengeDetail, setChallengeDetail] = useState<AttemptChallenge | null>(null);
  const [session, setSession] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = async() => {
    try {
      const res = await api.get(`${API}/challenge/${challengeId}/attempt-data?session=${sessionId}`);
      setChallengeDetail(res.data.challenge)
      setSession(res.data.session);
    }catch (err: any) {
        const status = err?.response?.status;
        const message = err?.response?.data?.error;

        if (status === 401) {
          router.replace("/login");
          return;
        }
        if (status === 403) {
          router.replace(`/challenges/${challengeId}/instructions?session=${sessionId}`);
          return;
        }
        setError(message || "Failed to load challenge");
      }finally{
        setLoading(false);
      }
  }

  useEffect(() => {
    load();
  }, []);

  // const challenge = {
  //   title: "Build a Todo App",
  //   difficulty: "medium",
  //   challengeType: "FRONTEND",
  //   description:
  //     "Create a fully functional todo application with add, edit, delete, and filter capabilities.",
  //   createdAt: "2026-02-21T10:30:00Z",
  //   tags: ["React", "TypeScript", "Tailwind"],
  //   candidates: 5,
  // };

  const toggleFileExplorer = () => {
    setIsFileExplorerOpen(!isFileExplorerOpen);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    setIsDropdownOpen(!isDropdownOpen);
  };

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
          aria-label="Open sidebar"
        >
          <PanelLeftOpen size={16} className="text-gray-300" />
        </button>
      )}

      <div
        className={`
          h-full flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden
          ${isSidebarOpen ? "w-64 md:w-72" : "w-0"}
        `}
      >
        <div className="h-full w-64 md:w-72 relative">
          <ChallengeSidebar challenge={challengeDetail!} />

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-2 right-2 z-10 p-1 bg-gray-800/80 border border-gray-700/50 rounded-md hover:bg-gray-700 transition-colors"
            aria-label="Close sidebar"
          >
            <PanelLeftClose size={14} className="text-gray-400" />
          </button>
        </div>
      </div>

      
      <SandpackProvider
        theme="dark"
        template="react"
        style={{ display: "flex", flex: 1, minWidth: 0, height: "100%" }}
      >
        <div className="flex-1 flex h-full min-w-0 overflow-hidden">
          <div
            className={`
                h-full border-r border-gray-700 overflow-y-auto bg-gray-900 flex-shrink-0
                transition-all duration-200 ease-in-out
                ${isFileExplorerOpen ? "w-48 lg:w-56 opacity-100" : "w-0 opacity-0 overflow-hidden"}
              `}
          >
            <SandpackFileExplorer />
          </div>

          <EditorArea onMoreClick={handleMoreClick} />
          <div className="flex-1 h-full border-l border-gray-700 min-w-0 overflow-hidden">
            <SandpackPreview
              showRefreshButton={true}
              showOpenInCodeSandbox={false}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>

        <MoreOptionsDropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          onToggleFileExplorer={toggleFileExplorer}
          isFileExplorerOpen={isFileExplorerOpen}
          position={dropdownPosition}
        />
      </SandpackProvider>


    </div>
  );
}
