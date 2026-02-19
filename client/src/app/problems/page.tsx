"use client";

import { 
  SandpackProvider, 
  SandpackFileExplorer, 
  SandpackPreview,
  useSandpack 
} from "@codesandbox/sandpack-react";
import Editor from "@monaco-editor/react";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

// Tabs Component
function EditorTabs() {
  const { sandpack } = useSandpack();
  const { activeFile } = sandpack;
  const [openTabs, setOpenTabs] = useState<string[]>([activeFile]);

  useEffect(() => {
    if (!openTabs.includes(activeFile)) {
      setOpenTabs([...openTabs, activeFile]);
    }
  }, [activeFile]);

  const closeTab = (path: string) => {
    const newTabs = openTabs.filter(tab => tab !== path);
    setOpenTabs(newTabs);
    
    if (path === activeFile && newTabs.length > 0) {
      sandpack.setActiveFile(newTabs[newTabs.length - 1]);
    }
  };

  return (
    <div className="flex items-center bg-gray-900 border-b border-gray-700 overflow-x-auto h-10 flex-shrink-0">
      {openTabs.map((path) => (
        <div
          key={path}
          className={`
            flex items-center gap-2 px-4 h-full text-sm border-r border-gray-700 cursor-pointer whitespace-nowrap
            ${activeFile === path ? 'bg-gray-800 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}
          `}
        >
          <span onClick={() => sandpack.setActiveFile(path)}>
            {path.split('/').pop()}
          </span>
          
          {openTabs.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(path);
              }}
              className="hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function MonacoEditor() {
  const { sandpack } = useSandpack();
  const { activeFile, files } = sandpack;
  const code = files[activeFile]?.code || "";

  const getLanguage = (filename: string) => {
    if (filename.endsWith('.tsx')) return 'typescript';
    if (filename.endsWith('.jsx')) return 'javascript';
    if (filename.endsWith('.ts')) return 'typescript';
    if (filename.endsWith('.js')) return 'javascript';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.json')) return 'json';
    return 'javascript';
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
        padding: { top: 16 },
      }}
    />
  );
}

function EditorArea() {
  return (
    <div className="flex-1 h-full flex flex-col bg-gray-950">
      <EditorTabs />
      <div className="flex-1 min-h-0">
        <MonacoEditor />
      </div>
    </div>
  );
}

export default function CodeEditor() {
  return (
    <SandpackProvider theme="dark" template="react">
      <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
        <div className="w-56 h-full border-r border-gray-700 overflow-auto bg-gray-900">
          <SandpackFileExplorer />
        </div>
        <EditorArea />
        <div className="w-1/2 h-full border-l border-gray-700">
          <SandpackPreview 
            showRefreshButton={true}
            showOpenInCodeSandbox={false}
            style={{height: "100vh"}}
          />
        </div>
      </div>
    </SandpackProvider>
  );
}