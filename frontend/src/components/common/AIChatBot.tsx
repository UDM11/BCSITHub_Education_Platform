// src/components/common/AIChatBot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, X, Send, Sparkles, Loader2, User, ChevronDown,
  BookOpen, Copy, Check, Trash2
} from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

// Simple markdown-to-JSX renderer for code blocks and bold text
function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    // Fenced code block
    if (part.startsWith('```') && part.endsWith('```')) {
      const lines = part.slice(3, -3).split('\n');
      const lang = lines[0].trim();
      const code = lines.slice(1).join('\n');
      return (
        <CodeBlock key={i} code={code.trim()} lang={lang} />
      );
    }
    // Inline code
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded text-[11px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    // Bold text
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
    }
    // Normal text — handle newlines
    return part.split('\n').map((line, j) => (
      <React.Fragment key={`${i}-${j}`}>
        {line}
        {j < part.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  });
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="my-2 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-left">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{lang || 'code'}</span>
        <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors border-0 bg-transparent cursor-pointer p-0.5">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="p-3 text-[11px] text-slate-200 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

const QUICK_QUESTIONS = [
  "Explain OSI model layers",
  "What is normalization in DBMS?",
  "Explain TCP vs UDP",
  "What is recursion? Give example",
  "Explain sorting algorithms",
];

export function AIChatBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [anonMessageCount, setAnonMessageCount] = useState<number>(() => {
    const saved = localStorage.getItem('bcsithub_anon_ai_chats');
    return saved ? parseInt(saved, 10) : 0;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check if AI is configured on mount
  useEffect(() => {
    apiClient.get('/ai/health')
      .then((res: any) => setIsConfigured(res.configured))
      .catch(() => setIsConfigured(false));
  }, []);

  // Scroll to bottom when new messages come
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    if (!user && anonMessageCount >= 3) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build history for context (last 10 messages)
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await apiClient.post('/ai/chat', {
        message: messageText,
        history
      }) as any;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: res.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Increment anonymous message count
      if (!user) {
        const nextCount = anonMessageCount + 1;
        setAnonMessageCount(nextCount);
        localStorage.setItem('bcsithub_anon_ai_chats', nextCount.toString());
      }
    } catch (err: any) {
      const errMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `Sorry, I encountered an error: ${err.message || 'Please try again.'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[200] w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl shadow-xl shadow-indigo-500/30 flex items-center justify-center cursor-pointer border-0 hover:scale-110 transition-transform"
            title="AI Study Assistant"
          >
            <Bot className="w-6 h-6" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-2xl bg-indigo-500 opacity-20 animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-4 right-4 z-[200] w-full max-w-sm h-[580px] flex flex-col bg-white rounded-3xl shadow-2xl shadow-slate-900/20 border border-slate-200/60 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/15 flex items-center justify-center">
                  <img src="/logo.jpg" alt="BCSITHub Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white leading-snug">BCSITHub AI</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-indigo-200 uppercase tracking-wider">
                      {isConfigured ? 'Online · Gemini 2.0 Flash Lite' : 'Not configured'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all border-0 bg-transparent cursor-pointer"
                    title="Clear chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all border-0 bg-transparent cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              
              {/* Welcome State (Empty) */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center pb-8">
                  <h3 className="text-base font-extrabold text-slate-800">AI Study Assistant</h3>
                  <p className="text-xs text-slate-500 mt-1.5 max-w-[220px] leading-relaxed">
                    Ask any BCSIT question — concepts, code, exam prep, or past papers.
                  </p>

                  {/* Quick question pills */}
                  <div className="mt-5 w-full space-y-2">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="w-full text-left px-3 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer flex items-center gap-2 group"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-600 flex-shrink-0" />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-tr from-indigo-500 to-violet-600' 
                      : 'bg-slate-200'
                  }`}>
                    {msg.role === 'user' 
                      ? <User className="w-3.5 h-3.5 text-white" />
                      : <Bot className="w-3.5 h-3.5 text-slate-600" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-tr-sm'
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'
                  }`}>
                    <div className="whitespace-pre-wrap break-words">
                      {msg.role === 'model' ? renderMarkdown(msg.content) : msg.content}
                    </div>
                    <p className={`text-[9px] mt-1.5 font-bold ${
                      msg.role === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold ml-1">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 p-3 border-t border-slate-100 bg-white">
              {isConfigured === false ? (
                <div className="text-center py-2 text-xs text-rose-500 font-bold">
                  AI not configured. Add GEMINI_API_KEY to backend .env
                </div>
              ) : !user && anonMessageCount >= 3 ? (
                <div className="text-center py-3.5 px-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2.5">
                  <p className="text-[11px] font-semibold text-slate-700 leading-relaxed">
                    You've reached the free limit of 3 preview messages.
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/signup';
                    }}
                    className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-105 text-white rounded-xl text-[10px] font-bold shadow-md shadow-indigo-100 transition-all cursor-pointer border-0"
                  >
                    Sign up to continue chatting
                  </button>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask any BCSIT question..."
                    rows={1}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none transition-all"
                    style={{ maxHeight: '80px', overflowY: 'auto' }}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = 'auto';
                      el.style.height = Math.min(el.scrollHeight, 80) + 'px';
                    }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer border-0 transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading 
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </button>
                </div>
              )}
              <p className="text-center text-[9px] text-slate-400 font-medium mt-2">
                Powered by Google Gemini · BCSIT-focused AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
