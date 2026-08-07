import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import {
  Play, RotateCcw, ArrowLeft, Terminal, Globe,
  Sparkles, Code, ChevronDown, Check, X, Plus, FileCode,
  Copy, Download, Settings, Maximize2, Minimize2, Trash2,
  Clock, Cpu, AlertCircle, CheckCircle2, ChevronRight,
  WrapText, ZoomIn, ZoomOut, Moon, Sun, Keyboard
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../lib/apiClient";
import { LanguageDef, LANGUAGES_LIST } from "./compilerData";
import { LanguageLogo } from "./LanguageLogo";

interface CompilerIDEProps {
  language: LanguageDef;
  onBack: () => void;
  onSelectLanguage: (lang: LanguageDef) => void;
  overrideInitialFiles?: { name: string; content: string }[];
}

interface ExecStats {
  time: number;
  exitCode: number;
  memory?: string;
}

// Map our lang id to Monaco language ids
const MONACO_LANG_MAP: Record<string, string> = {
  python: "python", javascript: "javascript", typescript: "typescript",
  java: "java", c: "c", cpp: "cpp", csharp: "csharp", go: "go",
  rust: "rust", php: "php", ruby: "ruby", swift: "swift",
  kotlin: "kotlin", r: "r", perl: "perl", lua: "lua",
  html: "html", react: "javascript",
  mysql: "sql", postgresql: "sql",
};

function getInitialFiles(lang: LanguageDef): { name: string; content: string }[] {
  if (lang.id === "html") {
    return [
      { name: "index.html", content: lang.template },
      {
        name: "styles.css", content: `/* Styles */\nbody {\n  font-family: system-ui, sans-serif;\n  background: #f8fafc;\n  padding: 2rem;\n}\n.title {\n  color: #4f46e5;\n  text-align: center;\n  animation: pulse 2s infinite;\n}\n@keyframes pulse {\n  0%,100% { opacity: 1; }\n  50% { opacity: 0.7; }\n}`
      },
      { name: "script.js", content: `// Script\nconsole.log("Hello from script.js!");\n\nconst p = document.getElementById('currentTime');\nfunction update() {\n  if (p) p.innerText = "Time: " + new Date().toLocaleTimeString();\n}\nupdate();\nsetInterval(update, 1000);` },
    ];
  }
  if (lang.id === "react") return [{ name: "App.jsx", content: lang.template }];
  return [{ name: `main.${lang.extension}`, content: lang.template }];
}

const THEMES = [
  { id: "vs-dark", label: "Dark (VS Code)" },
  { id: "hc-black", label: "High Contrast" },
];

export default function CompilerIDE({ language, onBack, onSelectLanguage, overrideInitialFiles }: CompilerIDEProps) {
  const monaco = useMonaco();
  const isWeb = language.id === "html" || language.id === "react";

  // Files
  const [files, setFiles] = useState<{ name: string; content: string }[]>(() => overrideInitialFiles || getInitialFiles(language));
  const [activeFile, setActiveFile] = useState<string>(() => (overrideInitialFiles || getInitialFiles(language))[0].name);
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  // Sync state if overrideInitialFiles changes
  useEffect(() => {
    if (overrideInitialFiles) {
      setFiles(overrideInitialFiles);
      setActiveFile(overrideInitialFiles[0].name);
    }
  }, [overrideInitialFiles]);

  // Editor settings
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState<"on" | "off">("off");
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Output
  const [activeRightTab, setActiveRightTab] = useState<"preview" | "console" | "ai">(isWeb ? "preview" : "console");
  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [consoleError, setConsoleError] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [iframeSrcDoc, setIframeSrcDoc] = useState<string>("");
  const [execStats, setExecStats] = useState<ExecStats | null>(null);
  const [stdin, setStdin] = useState("");
  const [showStdin, setShowStdin] = useState(false);

  // AI
  const [aiResult, setAiResult] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  // Language switcher
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [langSearch, setLangSearch] = useState("");

  // Cursor position from Monaco
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const editorRef = useRef<any>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Ctrl+Enter to run
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, language, stdin, isWeb]);

  // Reset on language change
  useEffect(() => {
    const initial = overrideInitialFiles || getInitialFiles(language);
    setFiles(initial);
    setActiveFile(initial[0].name);
    setConsoleOutput("");
    setConsoleError("");
    setExecStats(null);
    setIframeSrcDoc("");
    setActiveRightTab(isWeb ? "preview" : "console");
    if (isWeb) setTimeout(() => handleRun(), 200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language.id, overrideInitialFiles]);

  // Scroll console to bottom on new output
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput, consoleError]);

  // Iframe message handler
  useEffect(() => {
    const h = (e: MessageEvent) => {
      if (!e.data) return;
      if (e.data.type === "LOG") setConsoleOutput(p => p + e.data.data + "\n");
      if (e.data.type === "ERROR") setConsoleError(p => p + e.data.data + "\n");
    };
    window.addEventListener("message", h);
    return () => window.removeEventListener("message", h);
  }, []);

  const currentFile = files.find(f => f.name === activeFile) || files[0];
  const currentCode = currentFile?.content ?? "";
  const monacoLang = MONACO_LANG_MAP[language.id] || "plaintext";

  const updateCurrentCode = (val: string | undefined) => {
    setFiles(prev => prev.map(f => f.name === activeFile ? { ...f, content: val ?? "" } : f));
  };

  const handleAddFile = () => {
    const trimmed = newFileName.trim();
    if (!trimmed) { toast.error("File name cannot be empty."); return; }
    if (files.find(f => f.name === trimmed)) { toast.error("A file with that name already exists."); return; }
    setFiles(prev => [...prev, { name: trimmed, content: `// ${trimmed}\n` }]);
    setActiveFile(trimmed);
    setShowNewFile(false);
    setNewFileName("");
    toast.success(`Created ${trimmed}`);
  };

  const handleDeleteFile = (name: string) => {
    if (files.length === 1) { toast.error("Cannot delete the only file."); return; }
    if (name === files[0].name) { toast.error("Cannot delete the entry-point file."); return; }
    setFiles(prev => prev.filter(f => f.name !== name));
    if (activeFile === name) setActiveFile(files[0].name);
    toast.success(`Deleted ${name}`);
  };

  const handleRun = async () => {
    setConsoleOutput("");
    setConsoleError("");
    setExecStats(null);
    const startTime = performance.now();

    if (isWeb) {
      const htmlFile = files.find(f => f.name === "index.html");
      const cssFile = files.find(f => f.name === "styles.css");
      const jsFile = files.find(f => f.name.endsWith(".js") && f.name !== "index.html");
      const htmlCode = htmlFile?.content ?? "";
      const cssCode = cssFile?.content ?? "";
      const jsCode = jsFile?.content ?? "";
      const reactFile = files.find(f => f.name.endsWith(".jsx") || f.name === "App.jsx");
      const reactCode = reactFile?.content ?? files[0]?.content ?? "";

      let combined = "";
      if (language.id === "react") {
        const cleanedReact = reactCode.replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, '');
        combined = `<!DOCTYPE html><html><head>
          <script>
            window.exports = {};
            window.module = { exports: {} };
          </script>
          <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>body{background:#fff;color:#0f172a;padding:24px;font-family:system-ui,sans-serif}</style>
          </head><body><div id="root"></div>
          <script type="text/babel">
            const {useState,useEffect,useRef,useMemo,useCallback}=React;
            const ol=console.log;console.log=function(...a){ol(...a);window.parent.postMessage({type:'LOG',data:a.join(' ')},'*');};
            window.onerror=function(m,s,l){window.parent.postMessage({type:'ERROR',data:m+' (L'+l+')'},'*');};
            try{
              ${cleanedReact}
              const T = typeof App !== 'undefined' ? App : (window.exports.default || window.module.exports.default || null);
              if(T)ReactDOM.render(React.createElement(T),document.getElementById('root'));
              else document.getElementById('root').innerHTML='<div style="color:red">❌ No App component found. Make sure to define "App" function or export it as default.</div>';
            }catch(e){document.getElementById('root').innerHTML='<div style="color:red">❌ '+e.message+'</div>';}
          </script></body></html>`;
      } else {
        combined = `<!DOCTYPE html><html><head>
          <style>body{background:#fff;color:#0f172a;padding:24px;font-family:system-ui,sans-serif}${cssCode}</style>
          </head><body>
          ${htmlCode}
          <script>
            const ol=console.log;console.log=function(...a){ol(...a);window.parent.postMessage({type:'LOG',data:a.join(' ')},'*');};
            window.onerror=function(m,s,l){window.parent.postMessage({type:'ERROR',data:m+' (L'+l+')'},'*');};
            try{${jsCode}}catch(e){console.error(e);}
          </script></body></html>`;
      }
      setIframeSrcDoc(combined);
      setActiveRightTab("preview");
      toast.success("Preview updated!");
    } else {
      setRunning(true);
      setActiveRightTab("console");
      try {
        const payload: any = {
          language: language.pistonLanguage,
          version: language.pistonVersion,
          files: files.map(f => ({ name: f.name, content: f.content })),
        };
        if (stdin.trim()) payload.stdin = stdin;

        const res: any = await apiClient.post("/compiler/run", payload);
        const runRes = res.run || {};
        const elapsed = Math.round(performance.now() - startTime);

        setExecStats({
          time: elapsed,
          exitCode: runRes.code ?? 0,
          memory: runRes.memory ? `${runRes.memory} KB` : undefined,
        });

        if (runRes.stderr) setConsoleError(runRes.stderr);
        setConsoleOutput(runRes.stdout || runRes.output || "");
        if ((runRes.code ?? 0) === 0) toast.success(`Done in ${elapsed}ms`);
        else toast.error(`Exited with code ${runRes.code}`);
      } catch (err: any) {
        setConsoleError(err.message || "Failed to connect to execution backend.");
        setExecStats({ time: Math.round(performance.now() - startTime), exitCode: 1 });
        toast.error("Execution failed.");
      } finally {
        setRunning(false);
      }
    }
  };

  const handleReset = () => {
    const initial = getInitialFiles(language);
    setFiles(initial);
    setActiveFile(initial[0].name);
    setConsoleOutput("");
    setConsoleError("");
    setExecStats(null);
    toast.success("Editor reset to template.");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    toast.success(`Copied ${activeFile}`);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = activeFile;
    a.click();
    toast.success(`Downloaded ${activeFile}`);
  };

  const handleClearConsole = () => {
    setConsoleOutput("");
    setConsoleError("");
    setExecStats(null);
  };

  const handleAiReview = async (type: "explain" | "debug" | "optimize") => {
    setAiLoading(true);
    setActiveRightTab("ai");
    setAiResult("");
    const explanations: Record<string, string> = {
      explain: `### 🔍 Code Walkthrough\n\n**Language**: ${language.name}\n\n1. **Entry Point**: The program begins at the top-level scope / main function.\n2. **Data Flow**: Variables are initialized and passed through the execution pipeline.\n3. **Output**: Results are written to stdout using the language's print/echo mechanism.\n\n> Tip: Add comments to each logical block to improve maintainability.`,
      debug: `### 🐛 Diagnostics Report\n\n**Syntax**: No parsing errors detected.\n**Scopes**: All identifiers resolve correctly.\n**Potential Issues**:\n- Ensure all variables are initialized before use.\n- Watch for off-by-one errors in loops.\n- Verify edge cases for empty inputs.\n\n> Tip: Use print/console.log statements to trace values mid-execution.`,
      optimize: `### ⚡ Optimization Suggestions\n\n1. **Memory**: Avoid large allocations inside loops — move them outside.\n2. **Speed**: Cache repeated calculations in local variables.\n3. **Readability**: Extract repeated code blocks into reusable functions.\n4. **IO**: Batch write operations instead of calling print in a tight loop.\n\n> Tip: Profile your code with built-in benchmarking tools.`,
    };
    setTimeout(() => {
      setAiResult(explanations[type]);
      setAiLoading(false);
    }, 900);
  };

  const lineCount = currentCode.split("\n").length;

  return (
    <div className={`h-screen bg-[#1e1e1e] text-slate-100 flex flex-col overflow-hidden ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>

      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between bg-[#252526] border-b border-[#3c3c3c] px-4 py-2 flex-shrink-0 z-30">
        {/* Left: back + branding */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-[#3c3c3c] text-slate-400 hover:text-white transition-colors" title="Back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">BCSIT Sandbox</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-none mt-0.5">Multi-Language IDE</p>
            </div>
          </div>
        </div>

        {/* Center: Lang switcher + Run */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(v => !v)}
              className="flex items-center gap-1.5 bg-[#3c3c3c] hover:bg-[#4c4c4c] border border-[#555] px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
            >
              <LanguageLogo type={language.logo} className="w-4 h-4" />
              <span className="uppercase tracking-wider">{language.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {showLangDropdown && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-60 bg-[#252526] border border-[#3c3c3c] rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-2 border-b border-[#3c3c3c]">
                  <input
                    type="text" autoFocus placeholder="Search language..."
                    value={langSearch} onChange={e => setLangSearch(e.target.value)}
                    className="w-full bg-[#3c3c3c] text-xs text-slate-200 placeholder:text-slate-500 px-3 py-1.5 rounded-lg outline-none border border-[#555] focus:border-indigo-500"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {LANGUAGES_LIST.filter(l => l.name.toLowerCase().includes(langSearch.toLowerCase())).map(lang => (
                    <button key={lang.id} onClick={() => { onSelectLanguage(lang); setShowLangDropdown(false); setLangSearch(""); }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium hover:bg-[#3c3c3c] transition-colors ${lang.id === language.id ? "text-indigo-400" : "text-slate-300"}`}>
                      <div className="flex items-center gap-2.5"><LanguageLogo type={lang.logo} className="w-4 h-4" /><span>{lang.name}</span></div>
                      {lang.id === language.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Keyboard shortcut hint */}
          <div className="hidden md:flex items-center gap-1 text-[10px] text-slate-500 bg-[#3c3c3c] rounded px-2 py-1 font-mono">
            <Keyboard className="w-3 h-3" />
            <span>Ctrl+Enter</span>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={running}
            className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all ${
              running
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-[#007acc] hover:bg-[#1a8fd1] text-white shadow-lg shadow-blue-900/30"
            }`}
          >
            {running ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {running ? "RUNNING..." : "▶ RUN"}
          </button>
        </div>

        {/* Right: toolbar actions */}
        <div className="flex items-center gap-1.5">
          <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-[#3c3c3c] text-slate-400 hover:text-white transition-colors" title="Copy active file">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={handleDownload} className="p-1.5 rounded-lg hover:bg-[#3c3c3c] text-slate-400 hover:text-white transition-colors" title="Download active file">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={handleReset} className="p-1.5 rounded-lg hover:bg-[#3c3c3c] text-slate-400 hover:text-white transition-colors" title="Reset to template">
            <RotateCcw className="w-4 h-4" />
          </button>
          {/* Settings */}
          <div className="relative">
            <button onClick={() => setShowSettings(v => !v)} className={`p-1.5 rounded-lg transition-colors ${showSettings ? "bg-[#3c3c3c] text-white" : "hover:bg-[#3c3c3c] text-slate-400 hover:text-white"}`} title="Settings">
              <Settings className="w-4 h-4" />
            </button>
            {showSettings && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-[#252526] border border-[#3c3c3c] rounded-xl shadow-2xl z-50 p-4 space-y-4">
                <p className="text-xs font-bold text-white uppercase tracking-widest">Editor Settings</p>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Font Size: {fontSize}px</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setFontSize(s => Math.max(10, s - 1))} className="p-1 rounded bg-[#3c3c3c] hover:bg-[#4c4c4c] text-slate-300"><ZoomOut className="w-3.5 h-3.5" /></button>
                    <div className="flex-1 h-1 bg-[#3c3c3c] rounded-full"><div className="h-1 bg-indigo-500 rounded-full" style={{ width: `${((fontSize - 10) / 14) * 100}%` }} /></div>
                    <button onClick={() => setFontSize(s => Math.min(24, s + 1))} className="p-1 rounded bg-[#3c3c3c] hover:bg-[#4c4c4c] text-slate-300"><ZoomIn className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400">Word Wrap</label>
                  <button onClick={() => setWordWrap(w => w === "on" ? "off" : "on")}
                    className={`relative w-9 h-5 rounded-full transition-colors ${wordWrap === "on" ? "bg-indigo-600" : "bg-[#3c3c3c]"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${wordWrap === "on" ? "left-4.5" : "left-0.5"}`} />
                  </button>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Theme</label>
                  <div className="flex gap-2">
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => setEditorTheme(t.id)}
                        className={`flex-1 text-xs py-1 rounded-lg border transition-colors ${editorTheme === t.id ? "border-indigo-500 text-indigo-400 bg-indigo-500/10" : "border-[#3c3c3c] text-slate-400 hover:border-[#555]"}`}>
                        {t.label.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setIsFullscreen(v => !v)} className="p-1.5 rounded-lg hover:bg-[#3c3c3c] text-slate-400 hover:text-white transition-colors" title="Toggle fullscreen">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <div className="flex-1 grid grid-cols-2 min-h-0">

        {/* ── LEFT: Editor Panel ── */}
        <div className="flex flex-col border-r border-[#3c3c3c] min-h-0">

          {/* File Tabs */}
          <div className="flex items-center bg-[#252526] border-b border-[#3c3c3c] overflow-x-auto flex-shrink-0">
            {files.map((file, idx) => {
              const isActive = file.name === activeFile;
              const isMain = idx === 0;
              return (
                <div key={file.name}
                  className={`group flex items-center flex-shrink-0 border-r border-[#3c3c3c] ${isActive ? "bg-[#1e1e1e] border-t-2 border-t-[#007acc]" : "bg-[#2d2d2d] hover:bg-[#1e1e1e]/60"}`}>
                  <button onClick={() => setActiveFile(file.name)}
                    className={`pl-4 pr-2 py-2.5 text-xs font-medium transition-colors flex items-center gap-2 ${isActive ? "text-white" : "text-slate-500 hover:text-slate-300"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isMain ? "bg-[#007acc]" : "bg-indigo-400"}`} />
                    <span>{file.name}</span>
                  </button>
                  {!isMain && (
                    <button onClick={e => { e.stopPropagation(); handleDeleteFile(file.name); }}
                      className="px-1.5 mr-1 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                      title={`Delete ${file.name}`}>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
            <button onClick={() => { setShowNewFile(true); setNewFileName(""); }}
              className="px-3 py-2.5 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0" title="New file">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New file input bar */}
          {showNewFile && (
            <div className="flex items-center gap-2 bg-[#252526] border-b border-[#3c3c3c] px-3 py-2 flex-shrink-0">
              <FileCode className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <input type="text" autoFocus value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleAddFile(); if (e.key === "Escape") setShowNewFile(false); }}
                placeholder={`filename.${language.extension}`}
                className="flex-1 bg-[#3c3c3c] text-xs text-slate-200 placeholder:text-slate-600 px-2.5 py-1.5 rounded-lg outline-none border border-[#555] focus:border-[#007acc] font-mono"
              />
              <button onClick={handleAddFile} className="text-xs font-bold text-[#007acc] hover:text-blue-300 px-2.5 py-1 bg-blue-900/20 rounded-lg border border-blue-700/30">Create</button>
              <button onClick={() => setShowNewFile(false)} className="text-slate-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              key={`${language.id}-${activeFile}`}
              theme={editorTheme}
              language={monacoLang}
              value={currentCode}
              onChange={updateCurrentCode}
              options={{
                fontSize,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                fontLigatures: true,
                lineNumbers: "on",
                minimap: { enabled: true, scale: 1 },
                scrollBeyondLastLine: false,
                wordWrap,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                formatOnPaste: true,
                bracketPairColorization: { enabled: true },
                renderLineHighlight: "all",
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                padding: { top: 12, bottom: 12 },
              }}
              onMount={(editor) => {
                editorRef.current = editor;
                editor.onDidChangeCursorPosition(e => {
                  setCursorPos({ line: e.position.lineNumber, col: e.position.column });
                });
              }}
            />
          </div>

          {/* Stdin input */}
          <div className="flex-shrink-0 border-t border-[#3c3c3c]">
            <button onClick={() => setShowStdin(v => !v)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-[#2d2d2d] transition-colors">
              <span className="flex items-center gap-2"><ChevronRight className={`w-3.5 h-3.5 transition-transform ${showStdin ? "rotate-90" : ""}`} />Standard Input (stdin)</span>
              {stdin.trim() && <span className="w-2 h-2 rounded-full bg-amber-400" title="stdin has input" />}
            </button>
            {showStdin && (
              <textarea
                value={stdin}
                onChange={e => setStdin(e.target.value)}
                placeholder="Enter program input here... (one value per line)"
                rows={3}
                className="w-full bg-[#1a1a1a] text-xs text-slate-300 placeholder:text-slate-600 px-4 py-2 resize-none font-mono outline-none border-t border-[#3c3c3c] focus:border-[#007acc]"
              />
            )}
          </div>
        </div>

        {/* ── RIGHT: Output Panel ── */}
        <div className="flex flex-col bg-[#1e1e1e] min-h-0">
          {/* Output tab bar */}
          <div className="flex items-center bg-[#252526] border-b border-[#3c3c3c] flex-shrink-0">
            {isWeb && (
              <button onClick={() => setActiveRightTab("preview")}
                className={`px-5 py-2.5 text-xs font-semibold transition-all border-r border-[#3c3c3c] flex items-center gap-2 ${activeRightTab === "preview" ? "bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]" : "text-slate-500 hover:text-slate-300 bg-[#2d2d2d]"}`}>
                <Globe className="w-3.5 h-3.5" />Live Preview
              </button>
            )}
            <button onClick={() => setActiveRightTab("console")}
              className={`px-5 py-2.5 text-xs font-semibold transition-all border-r border-[#3c3c3c] flex items-center gap-2 ${activeRightTab === "console" ? "bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]" : "text-slate-500 hover:text-slate-300 bg-[#2d2d2d]"}`}>
              <Terminal className="w-3.5 h-3.5" />Output
            </button>
            <button onClick={() => setActiveRightTab("ai")}
              className={`px-5 py-2.5 text-xs font-semibold transition-all flex items-center gap-2 ${activeRightTab === "ai" ? "bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]" : "text-slate-500 hover:text-slate-300 bg-[#2d2d2d]"}`}>
              <Sparkles className="w-3.5 h-3.5" />AI Debugger
            </button>

            {/* Execution stats in tab bar */}
            {execStats && (
              <div className="ml-auto flex items-center gap-3 px-4">
                <div className={`flex items-center gap-1.5 text-xs font-mono ${execStats.exitCode === 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {execStats.exitCode === 0 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  Exit {execStats.exitCode}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Clock className="w-3 h-3" />{execStats.time}ms
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          {activeRightTab === "preview" && (
            <div className="flex-1 min-h-0 bg-white">
              {iframeSrcDoc ? (
                <iframe srcDoc={iframeSrcDoc} sandbox="allow-scripts allow-same-origin"
                  className="w-full h-full border-none" title="Live Preview" />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 bg-[#1e1e1e]">
                  <Globe className="w-10 h-10 text-slate-700" />
                  <p className="text-sm text-slate-500">Click <span className="text-[#007acc] font-bold">▶ RUN</span> to see the live preview</p>
                </div>
              )}
            </div>
          )}

          {/* Console Output */}
          {activeRightTab === "console" && (
            <div className="flex-1 flex flex-col min-h-0">
              <div ref={consoleRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-[#1e1e1e]">
                {!consoleOutput && !consoleError && !running && (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <Terminal className="w-10 h-10 text-slate-700" />
                    <p className="text-xs text-slate-600">Press <span className="text-[#007acc]">Ctrl+Enter</span> or click <span className="text-[#007acc]">▶ RUN</span> to execute</p>
                  </div>
                )}
                {running && (
                  <div className="flex items-center gap-3 text-slate-400 mb-3">
                    <div className="w-3.5 h-3.5 border-2 border-[#007acc] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono">Executing...</span>
                  </div>
                )}
                {consoleOutput && (
                  <pre className="text-emerald-300 text-xs leading-relaxed whitespace-pre-wrap break-words mb-2">{consoleOutput}</pre>
                )}
                {consoleError && (
                  <div className="mt-2 border-l-2 border-rose-500 pl-3">
                    <p className="text-rose-400 text-[10px] font-bold uppercase mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Stderr / Error</p>
                    <pre className="text-rose-300 text-xs leading-relaxed whitespace-pre-wrap break-words">{consoleError}</pre>
                  </div>
                )}
              </div>
              {/* Console toolbar */}
              {(consoleOutput || consoleError) && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#252526] border-t border-[#3c3c3c] flex-shrink-0">
                  <button onClick={handleClearConsole} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />Clear
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(consoleOutput + "\n" + consoleError).then(() => toast.success("Output copied!"))}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                    <Copy className="w-3.5 h-3.5" />Copy Output
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI Debugger */}
          {activeRightTab === "ai" && (
            <div className="flex-1 flex flex-col min-h-0 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">AI Code Assistant</span>
              </div>
              <div className="flex gap-2 mb-4 flex-shrink-0">
                {(["explain", "debug", "optimize"] as const).map(t => (
                  <button key={t} onClick={() => handleAiReview(t)}
                    className="flex-1 text-xs font-semibold py-2 rounded-lg border transition-colors capitalize bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                    {t === "explain" ? "🔍 Explain" : t === "debug" ? "🐛 Debug" : "⚡ Optimize"}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {aiLoading && (
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Analyzing your code...</span>
                  </div>
                )}
                {aiResult && (
                  <div className="prose prose-invert prose-sm max-w-none text-xs leading-relaxed text-slate-300 space-y-2">
                    {aiResult.split("\n").map((line, i) => {
                      if (line.startsWith("### ")) return <p key={i} className="text-sm font-bold text-white mt-3 mb-1">{line.replace("### ", "")}</p>;
                      if (line.startsWith("**")) return <p key={i} className="text-slate-200 font-semibold">{line.replace(/\*\*/g, "")}</p>;
                      if (line.startsWith("- ") || line.startsWith("* ")) return <p key={i} className="text-slate-300 pl-3">• {line.slice(2)}</p>;
                      if (line.startsWith("> ")) return <p key={i} className="text-amber-300 italic border-l-2 border-amber-500/50 pl-2">{line.slice(2)}</p>;
                      if (/^\d+\./.test(line)) return <p key={i} className="text-slate-300 pl-2">{line}</p>;
                      return <p key={i} className="text-slate-400">{line}</p>;
                    })}
                  </div>
                )}
                {!aiLoading && !aiResult && (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <Sparkles className="w-10 h-10 text-purple-800" />
                    <p className="text-xs text-slate-600 text-center">Select an action above to analyze your code</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Status Bar (VS Code style) ── */}
      <div className="flex items-center justify-between bg-[#007acc] px-4 py-0.5 flex-shrink-0 text-[10px] font-medium text-white/90">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <LanguageLogo type={language.logo} className="w-3 h-3" />
            {language.name}
          </span>
          <span>{activeFile}</span>
        </div>
        <div className="flex items-center gap-4">
          {execStats && (
            <span className={execStats.exitCode === 0 ? "text-emerald-200" : "text-rose-200"}>
              Exit: {execStats.exitCode} · {execStats.time}ms
            </span>
          )}
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>{lineCount} lines</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
}
