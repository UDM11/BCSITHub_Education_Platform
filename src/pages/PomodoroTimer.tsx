import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Timer, 
  Coffee, 
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart3,
  Volume2,
  VolumeX,
  Zap,
  Award,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Link } from 'react-router-dom';

interface PomodoroSession {
  id: string;
  type: 'work' | 'shortBreak' | 'longBreak';
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
  work: { duration: 25 * 60, label: 'Focus Time', color: 'from-red-500 to-pink-500', icon: Target },
  shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'from-green-500 to-emerald-500', icon: Coffee },
  longBreak: { duration: 15 * 60, label: 'Long Break', color: 'from-blue-500 to-cyan-500', icon: Coffee }
};

export function PomodoroTimer() {
  const [currentType, setCurrentType] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
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

  // Initialize audio
  useEffect(() => {
    // Create a simple beep sound using Web Audio API as fallback
    const createBeepSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };
    
    // Try to load notification sound, fallback to beep
    audioRef.current = {
      play: () => {
        try {
          createBeepSound();
        } catch (error) {
          console.log('Audio notification not available');
        }
      }
    } as HTMLAudioElement;
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);
  
  // Update document title with timer
  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(timeLeft)} - ${TIMER_TYPES[currentType].label} | BCSITHub`;
    } else {
      document.title = 'Pomodoro Timer | BCSITHub';
    }
    
    return () => {
      document.title = 'BCSITHub - Master BCSIT with Confidence';
    };
  }, [timeLeft, isRunning, currentType]);

  // Load data from localStorage and request notification permission
  useEffect(() => {
    const savedSessions = localStorage.getItem('pomodoroSessions');
    const savedStats = localStorage.getItem('pomodoroStats');
    const savedSettings = localStorage.getItem('pomodoroSettings');

    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setCustomDurations(settings.durations);
      setSoundEnabled(settings.soundEnabled);
    }
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Play notification sound
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
    
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const sessionType = TIMER_TYPES[currentType].label;
      new Notification(`${sessionType} Complete!`, {
        body: currentType === 'work' ? 'Time for a break!' : 'Ready to focus again?',
        icon: '/favicon.ico',
        tag: 'pomodoro-timer'
      });
    }

    const newSession: PomodoroSession = {
      id: Date.now().toString(),
      type: currentType,
      duration: TIMER_TYPES[currentType].duration,
      completedAt: new Date()
    };

    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    localStorage.setItem('pomodoroSessions', JSON.stringify(updatedSessions));

    // Update stats
    const newStats = {
      ...stats,
      totalSessions: stats.totalSessions + 1,
      totalFocusTime: currentType === 'work' ? stats.totalFocusTime + TIMER_TYPES[currentType].duration : stats.totalFocusTime,
      todaySessions: stats.todaySessions + 1,
      weekSessions: stats.weekSessions + 1,
      streak: currentType === 'work' ? stats.streak + 1 : stats.streak
    };
    setStats(newStats);
    localStorage.setItem('pomodoroStats', JSON.stringify(newStats));

    // Auto-switch to next timer type
    if (currentType === 'work') {
      setCompletedCycles(prev => prev + 1);
      const nextType = completedCycles > 0 && (completedCycles + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
      setCurrentType(nextType);
      setTimeLeft(TIMER_TYPES[nextType].duration);
    } else {
      setCurrentType('work');
      setTimeLeft(TIMER_TYPES.work.duration);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_TYPES[currentType].duration);
  };

  const switchTimerType = (type: 'work' | 'shortBreak' | 'longBreak') => {
    setCurrentType(type);
    setTimeLeft(TIMER_TYPES[type].duration);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = TIMER_TYPES[currentType].duration;
    return ((total - timeLeft) / total) * 100;
  };

  const saveSettings = () => {
    const settings = {
      durations: customDurations,
      soundEnabled
    };
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    
    // Update timer types with custom durations
    TIMER_TYPES.work.duration = customDurations.work * 60;
    TIMER_TYPES.shortBreak.duration = customDurations.shortBreak * 60;
    TIMER_TYPES.longBreak.duration = customDurations.longBreak * 60;
    
    // Reset current timer if not running
    if (!isRunning) {
      setTimeLeft(TIMER_TYPES[currentType].duration);
    }
    
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Header */}
      <div className={`bg-white/85 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm transition-all duration-300 ${isRunning ? 'border-l-4 border-l-rose-500' : 'border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors text-sm font-semibold">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Home
              </Link>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center">
                <Timer className="w-5 h-5 text-indigo-600 mr-2" />
                <h1 className="text-lg font-bold text-slate-800">Pomodoro Timer</h1>
                {isRunning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-3 px-2.5 py-0.5 bg-rose-50 border border-rose-100/50 text-rose-600 text-xs font-bold rounded-full"
                  >
                    Active
                  </motion.div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center justify-center w-9 h-9 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-500 transition-all duration-300 bg-white"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-500 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300"
              >
                <Settings className="w-4 h-4 mr-1.5" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Timer */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card hover={false} className="bg-white border border-slate-100 shadow-premium overflow-hidden">
                <CardContent className="p-8 sm:p-12">
                  {/* Timer Type Selector */}
                  <div className="flex flex-wrap justify-center gap-2 mb-10 bg-slate-50 p-1.5 rounded-2xl border border-slate-100/50 max-w-md mx-auto">
                    {Object.entries(TIMER_TYPES).map(([key, type]) => (
                      <motion.button
                        key={key}
                        onClick={() => switchTimerType(key as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center ${
                          currentType === key
                            ? `bg-gradient-to-r ${type.color} text-white shadow-md`
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <type.icon className="w-3.5 h-3.5 mr-1.5" />
                        {type.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Timer Display */}
                  <div className="text-center mb-8">
                    <motion.div
                      className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto mb-8"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8 }}
                    >
                      {/* Progress Ring */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                          className="text-slate-100"
                        />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="url(#gradient)"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Timer Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                          className="text-5xl sm:text-7xl font-bold text-slate-800 mb-2 tracking-tight"
                          key={timeLeft}
                          initial={{ scale: 1.05 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {formatTime(timeLeft)}
                        </motion.div>
                        <div className={`text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${TIMER_TYPES[currentType].color} bg-clip-text text-transparent`}>
                          {TIMER_TYPES[currentType].label}
                        </div>
                      </div>
                    </motion.div>

                    {/* Control Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-sm mx-auto">
                      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:flex-1">
                        <button
                          onClick={toggleTimer}
                          className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${TIMER_TYPES[currentType].color} hover:brightness-110 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all duration-300 border-0`}
                        >
                          {isRunning ? (
                            <>
                              <Pause className="w-5 h-5" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-5 h-5" />
                              <span>Start</span>
                            </>
                          )}
                        </button>
                      </motion.div>
                      
                      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:flex-1">
                        <button
                          onClick={resetTimer}
                          className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3.5 rounded-xl transition-all duration-300"
                        >
                          <RotateCcw className="w-5 h-5 text-slate-500" />
                          <span>Reset</span>
                        </button>
                      </motion.div>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="text-center border-t border-slate-50 pt-8 mt-4">
                    <div className="text-xs font-bold text-slate-455 mb-2.5">Session Progress</div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full bg-gradient-to-r ${TIMER_TYPES[currentType].color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgress()}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="text-xs font-bold text-slate-500 mt-2">
                      {Math.round(getProgress())}% Complete
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Today's Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card hover={false} className="bg-white border border-slate-100 shadow-premium">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-50">
                    <h3 className="font-bold text-slate-800 text-sm">Today's Progress</h3>
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Sessions</span>
                      <span className="font-extrabold text-xl text-indigo-600">{stats.todaySessions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Focus Time</span>
                      <span className="font-extrabold text-xl text-emerald-650">
                        {Math.round(stats.totalFocusTime / 60)}m
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Streak</span>
                      <span className="font-extrabold text-xl text-orange-600">{stats.streak}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card hover={false} className="bg-gradient-to-br from-indigo-600 via-purple-650 to-indigo-900 text-white shadow-premium border-0 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm">Achievement</h3>
                    <Award className="w-4 h-4 text-yellow-350" />
                  </div>
                  <div className="text-center py-2">
                    <div className="text-4xl font-black text-yellow-300 mb-1">{completedCycles}</div>
                    <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Cycles Completed</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Sessions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card hover={false} className="bg-white border border-slate-100 shadow-premium">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-50">
                    <h3 className="font-bold text-slate-800 text-sm">Recent Sessions</h3>
                    <BarChart3 className="w-4 h-4 text-indigo-600 animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    {sessions.slice(-5).reverse().map((session) => (
                      <div key={session.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                        <div className="flex items-center">
                          <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${TIMER_TYPES[session.type].color} mr-3`} />
                          <span className="text-xs font-bold text-slate-700">
                            {TIMER_TYPES[session.type].label}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-400">
                          {new Date(session.completedAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    ))}
                    {sessions.length === 0 && (
                      <div className="text-center text-slate-400 py-6 text-xs font-semibold">
                        No sessions completed yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12"
        >
          <Card hover={false} className="bg-gradient-to-r from-slate-50 to-indigo-50/20 border border-slate-100 shadow-premium">
            <CardContent className="p-8">
              <div className="text-center mb-10">
                <Zap className="w-6 h-6 text-indigo-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-slate-850 mb-2">Pomodoro Guidelines</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Maximize your focus hours with these basic routines</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Target, title: "Stay Focused", tip: "Eliminate distractions during focus blocks." },
                  { icon: Coffee, title: "Take Breaks", tip: "Get up, stretch, and relax your eyes." },
                  { icon: TrendingUp, title: "Track Progress", tip: "Build a persistent streak day by day." },
                  { icon: CheckCircle, title: "Finish Tasks", tip: "Commit completely to one task at a time." }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
                    className="text-center"
                  >
                    <div className="w-11 h-11 bg-indigo-50 border border-indigo-100/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-550 font-semibold leading-relaxed px-4">{item.tip}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-lg border border-slate-100 rounded-2xl p-6 w-full max-w-md shadow-premium"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-50 pb-3">Timer Configs</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                    Work Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={customDurations.work}
                    onChange={(e) => setCustomDurations(prev => ({ ...prev, work: parseInt(e.target.value) || 25 }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white text-slate-800"
                    min="1"
                    max="60"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={customDurations.shortBreak}
                    onChange={(e) => setCustomDurations(prev => ({ ...prev, shortBreak: parseInt(e.target.value) || 5 }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white text-slate-800"
                    min="1"
                    max="30"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={customDurations.longBreak}
                    onChange={(e) => setCustomDurations(prev => ({ ...prev, longBreak: parseInt(e.target.value) || 15 }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white text-slate-800"
                    min="1"
                    max="60"
                  />
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-2">
                  <label className="text-xs font-bold text-slate-550 uppercase tracking-wider">
                    Sound Notifications
                  </label>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                      soundEnabled ? 'bg-indigo-650' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        soundEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 border-t border-slate-50 pt-5">
                <button
                  onClick={saveSettings}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-3 rounded-xl shadow-sm transition-all duration-300"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-250 text-slate-700 font-semibold text-xs py-3 rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}