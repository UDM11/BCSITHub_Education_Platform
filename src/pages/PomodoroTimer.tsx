// src/pages/PomodoroTimer.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, RotateCcw, Settings, Timer, Coffee, Target,
  TrendingUp, Clock, CheckCircle, BarChart3, Volume2, VolumeX,
  Zap, Award, Calendar, ArrowLeft, ExternalLink, Sparkles
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Link } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";

interface PomodoroSession {
  id: string;
  type: "work" | "shortBreak" | "longBreak";
  duration: number;
  completedAt: Date;
}

interface PomodoroStats {
  totalSessions: number;
  totalFocusTime: number;
  todaySessions: number;
  weekSessions: number;
  streak: number;
}

const TIMER_TYPES = {
  work: { 
    duration: 25 * 60, 
    label: "Focus Time", 
    color: "from-rose-500 to-indigo-600", 
    stop1: "#f43f5e", 
    stop2: "#4f46e5", 
    icon: Target 
  },
  shortBreak: { 
    duration: 5 * 60, 
    label: "Short Break", 
    color: "from-emerald-400 to-teal-600", 
    stop1: "#34d399", 
    stop2: "#0d9488", 
    icon: Coffee 
  },
  longBreak: { 
    duration: 15 * 60, 
    label: "Long Break", 
    color: "from-cyan-400 to-blue-600", 
    stop1: "#22d3ee", 
    stop2: "#2563eb", 
    icon: Coffee 
  }
};

export function PomodoroTimer() {
  useSEO({
    title: "Pomodoro Focus Study Timer",
    description: "Boost your studying productivity with the Pomodoro technique. Use customizable focus sessions and rest cycles matching your syllabus tasks.",
    keywords: "pomodoro timer, study timer, productivity tool, bcsit study focus"
  });

  const [currentType, setCurrentType] = useState<"work" | "shortBreak" | "longBreak">("work");
  const [timeLeft, setTimeLeft] = useState(TIMER_TYPES.work.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [stats, setStats] = useState<PomodoroStats>({
    totalSessions: 0,
    totalFocusTime: 0,
    todaySessions: 0,
    weekSessions: 0,
    streak: 0
  });
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customDurations, setCustomDurations] = useState({
    work: 25,
    shortBreak: 5,
    longBreak: 15
  });
  const [completedCycles, setCompletedCycles] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    const createBeepSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 850;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.6);
    };
    
    audioRef.current = {
      play: async () => {
        try {
          createBeepSound();
        } catch (error) {
          console.log("Audio Web-synth not supported in sandbox");
        }
      }
    } as HTMLAudioElement;
  }, []);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    
    if (soundEnabled && audioRef.current) {
      audioRef.current.play();
    }
    
    if ("Notification" in window && Notification.permission === "granted") {
      const sessionType = TIMER_TYPES[currentType].label;
      new Notification(`${sessionType} Complete!`, {
        body: currentType === "work" ? "Time for a well-deserved break!" : "Break is over. Ready to focus?",
        icon: "/favicon.ico",
        tag: "pomodoro-timer"
      });
    }

    const newSession: PomodoroSession = {
      id: Date.now().toString(),
      type: currentType,
      duration: customDurations[currentType] * 60,
      completedAt: new Date()
    };

    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    localStorage.setItem("pomodoroSessions", JSON.stringify(updatedSessions));

    const newStats = {
      ...stats,
      totalSessions: stats.totalSessions + 1,
      totalFocusTime: currentType === "work" ? stats.totalFocusTime + (customDurations.work * 60) : stats.totalFocusTime,
      todaySessions: stats.todaySessions + 1,
      weekSessions: stats.weekSessions + 1,
      streak: currentType === "work" ? stats.streak + 1 : stats.streak
    };
    setStats(newStats);
    localStorage.setItem("pomodoroStats", JSON.stringify(newStats));

    if (currentType === "work") {
      setCompletedCycles(prev => prev + 1);
      const nextType = completedCycles > 0 && (completedCycles + 1) % 4 === 0 ? "longBreak" : "shortBreak";
      setCurrentType(nextType);
      setTimeLeft(customDurations[nextType] * 60);
    } else {
      setCurrentType("work");
      setTimeLeft(customDurations.work * 60);
    }
  }, [currentType, customDurations, sessions, stats, completedCycles, soundEnabled]);

  // Timer logic ticker
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, handleTimerComplete]);
  
  // Tab Title ticker
  useEffect(() => {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (isRunning) {
      document.title = `${formatTime(timeLeft)} - ${TIMER_TYPES[currentType].label} | BCSITHub`;
    } else {
      document.title = "Pomodoro Timer | BCSITHub";
    }
    
    return () => {
      document.title = "BCSITHub - Master BCSIT with Confidence";
    };
  }, [timeLeft, isRunning, currentType]);

  // Sync settings and permissions
  useEffect(() => {
    const savedSessions = localStorage.getItem("pomodoroSessions");
    const savedStats = localStorage.getItem("pomodoroStats");
    const savedSettings = localStorage.getItem("pomodoroSettings");

    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedStats) setStats(JSON.parse(savedStats));
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setCustomDurations(settings.durations);
      setSoundEnabled(settings.soundEnabled);
      setTimeLeft(settings.durations[currentType] * 60);
    }
    
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customDurations[currentType] * 60);
  };

  const switchTimerType = (type: "work" | "shortBreak" | "longBreak") => {
    setCurrentType(type);
    setTimeLeft(customDurations[type] * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    const total = customDurations[currentType] * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const saveSettings = () => {
    const settings = {
      durations: customDurations,
      soundEnabled
    };
    localStorage.setItem("pomodoroSettings", JSON.stringify(settings));
    
    if (!isRunning) {
      setTimeLeft(customDurations[currentType] * 60);
    }
    
    setShowSettings(false);
    toast.success("Timer settings updated!");
  };

  const activeGrad = TIMER_TYPES[currentType];

  return (
    <div className="min-h-screen bg-slate-50/30 pb-16 relative">
      
      {/* Background decoration glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-24 left-10 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Floating Header */}
      <div className={`bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm relative transition-all duration-300 ${isRunning ? "border-l-4 border-l-rose-500" : "border-slate-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-slate-600 hover:text-indigo-650 transition-colors text-xs font-black uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Home
              </Link>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center">
                <Timer className="w-5 h-5 text-indigo-600 mr-2" />
                <h1 className="text-lg font-black text-slate-800 tracking-tight">BCSIT Focus Workspace</h1>
                {isRunning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-3 px-2.5 py-0.5 bg-rose-50 border border-rose-100/50 text-rose-600 text-[10px] font-black rounded-full uppercase tracking-wider"
                  >
                    Active
                  </motion.div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center justify-center w-9 h-9 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-500 transition-all bg-white cursor-pointer"
                title="Toggle Audio Feedback"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-500 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-1.5" />
                Timer Config
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main timer display portal */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/95 border border-slate-200/60 shadow-premium rounded-3xl overflow-hidden">
                <CardContent className="p-6 sm:p-10">
                  
                  {/* Timer Type Toggles */}
                  <div className="flex flex-wrap justify-center gap-2 mb-10 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl max-w-md mx-auto">
                    {Object.entries(TIMER_TYPES).map(([key, type]) => {
                      const Icon = type.icon;
                      const isActive = currentType === key;
                      return (
                        <button
                          key={key}
                          onClick={() => switchTimerType(key as any)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center border-0 cursor-pointer ${
                            isActive
                              ? `bg-gradient-to-r ${type.color} text-white shadow-md`
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 mr-1.5" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Timer SVG Progress Ring Dial */}
                  <div className="text-center mb-8 relative">
                    <motion.div
                      className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto mb-8"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Dynamic Dial Rings */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="44"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                          className="text-slate-100"
                        />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="44"
                          stroke="url(#timerGradient)"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 44}`}
                          strokeDashoffset={`${2 * Math.PI * 44 * (1 - getProgress() / 100)}`}
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={activeGrad.stop1} />
                            <stop offset="100%" stopColor={activeGrad.stop2} />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Timer Digital text values */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                          className="text-5xl sm:text-6xl font-black text-slate-800 mb-1 tracking-tight"
                          key={timeLeft}
                          initial={{ scale: 1.03 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.15 }}
                        >
                          {formatTime(timeLeft)}
                        </motion.div>
                        
                        <div className={`text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${activeGrad.color} bg-clip-text text-transparent`}>
                          {activeGrad.label}
                        </div>
                      </div>
                    </motion.div>

                    {/* Timer controls group */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-sm mx-auto">
                      <button
                        onClick={toggleTimer}
                        className={`w-full sm:flex-1 flex items-center justify-center gap-2 bg-gradient-to-r ${activeGrad.color} hover:brightness-110 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-md border-0 transition-all cursor-pointer`}
                      >
                        {isRunning ? (
                          <>
                            <Pause className="w-4 h-4" />
                            <span>Pause focus</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Start Focus</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={resetTimer}
                        className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-6 py-3.5 rounded-xl border-0 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-slate-500" />
                        <span>Reset Dial</span>
                      </button>
                    </div>
                  </div>

                  {/* Dial progress values */}
                  <div className="text-center border-t border-slate-100 pt-6 mt-4">
                    <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Session Ratio</span>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full bg-gradient-to-r ${activeGrad.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgress()}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 mt-2">
                      {Math.round(getProgress())}% Session Complete
                    </div>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Stats & Session log side columns */}
          <div className="space-y-6">
            
            {/* Focus status card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Card className="bg-white/95 border border-slate-200/60 shadow-premium rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-50">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Today's Progress</h3>
                    <Calendar className="w-4.5 h-4.5 text-indigo-650" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Sessions Logged</span>
                      <span className="font-extrabold text-lg text-indigo-600">{stats.todaySessions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Total Focus Time</span>
                      <span className="font-extrabold text-lg text-emerald-600">
                        {Math.round(stats.totalFocusTime / 60)}m
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Current Streak</span>
                      <span className="font-extrabold text-lg text-orange-600">{stats.streak}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievement card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Card className="bg-gradient-to-br from-indigo-900 via-[#1e1b4b] to-purple-950 text-white shadow-premium border-0 rounded-3xl overflow-hidden relative">
                <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider">Cycle Achievements</h3>
                    <Award className="w-4.5 h-4.5 text-yellow-400" />
                  </div>
                  <div className="text-center py-2">
                    <span className="text-3xl font-black text-yellow-300 block leading-tight">{completedCycles}</span>
                    <span className="text-indigo-200 text-[9px] font-extrabold uppercase tracking-widest mt-1 block">Full Cycles Logged</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Sessions list */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <Card className="bg-white/95 border border-slate-200/60 shadow-premium rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-50">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Recent Sessions</h3>
                    <BarChart3 className="w-4.5 h-4.5 text-indigo-650" />
                  </div>
                  
                  <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                    {sessions.slice(-5).reverse().map((session) => (
                      <div key={session.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${TIMER_TYPES[session.type].color} mr-2.5`} />
                          <span className="text-xs font-bold text-slate-700">
                            {TIMER_TYPES[session.type].label}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {new Date(session.completedAt).toLocaleTimeString([], { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </span>
                      </div>
                    ))}
                    {sessions.length === 0 && (
                      <div className="text-center text-slate-400 py-6 text-xs font-semibold">
                        No focus sessions completed yet today.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>

        {/* Guidelines section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-12"
        >
          <Card className="bg-white/95 border border-slate-200/60 shadow-premium rounded-3xl">
            <CardContent className="p-8">
              <div className="text-center mb-8 border-b border-slate-50 pb-4">
                <Zap className="w-5.5 h-5.5 text-indigo-600 mx-auto mb-3 animate-pulse" />
                <h3 className="text-lg font-black text-slate-850 tracking-tight">Syllabus Focus Guidelines</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Maximize your study hours with structured focus habits</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Target, title: "Eliminate Distractions", tip: "Mute other device alerts and concentrate entirely on syllabus pages." },
                  { icon: Coffee, title: "Relaxing Breaks", tip: "Use brief 5m breaks to stretch, rest eyes, and drink clean water." },
                  { icon: TrendingUp, title: "Daily Consistency", tip: "Complete at least 4 cycles daily to build study streaks." },
                  { icon: CheckCircle, title: "Single Task Focus", tip: "Work on one chapter topic at a time. Avoid multitasking." }
                ].map((item, index) => (
                  <div key={item.title} className="text-center space-y-2">
                    <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center mx-auto transition-transform hover:scale-105">
                      <item.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{item.title}</h4>
                    <p className="text-[11px] font-semibold text-slate-500 leading-relaxed px-2">{item.tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* Configuration Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white/95 border border-slate-200/60 rounded-3xl p-6 w-full max-w-sm shadow-premium relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-200/10 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-base font-extrabold text-slate-850 mb-6 border-b border-slate-50 pb-3 flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-indigo-600" />
                Timer Configuration
              </h3>
              
              <div className="space-y-4">
                
                {/* Work duration */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Work Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={customDurations.work}
                    onChange={(e) => setCustomDurations(prev => ({ ...prev, work: parseInt(e.target.value) || 25 }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white text-slate-700"
                    min="1"
                    max="60"
                  />
                </div>
                
                {/* Short break */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={customDurations.shortBreak}
                    onChange={(e) => setCustomDurations(prev => ({ ...prev, shortBreak: parseInt(e.target.value) || 5 }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white text-slate-700"
                    min="1"
                    max="30"
                  />
                </div>
                
                {/* Long break */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={customDurations.longBreak}
                    onChange={(e) => setCustomDurations(prev => ({ ...prev, longBreak: parseInt(e.target.value) || 15 }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white text-slate-700"
                    min="1"
                    max="60"
                  />
                </div>
                
                {/* Audio switch */}
                <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sound Notifications</span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 border-0 cursor-pointer ${
                      soundEnabled ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        soundEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {/* Settings Action Buttons */}
              <div className="flex gap-3 mt-6 border-t border-slate-50 pt-4">
                <button
                  onClick={saveSettings}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-xs py-2.5 rounded-xl border-0 transition-all cursor-pointer"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-655 font-extrabold text-xs py-2.5 rounded-xl border-0 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}