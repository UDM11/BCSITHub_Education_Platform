// src/pages/QuizGenerator.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Play, RotateCcw, Download, Share2, Settings, Clock, 
  CheckCircle, XCircle, Award, Target, Zap, BookOpen, Users, 
  TrendingUp, ArrowLeft, ArrowRight, Shuffle, Eye, EyeOff, 
  Star, Trophy, Lightbulb, HelpCircle, ChevronRight, Plus, 
  Minus, Filter, Search, Calendar, BarChart3, PieChart, Activity, 
  Sparkles, CheckCircle2, AlertCircle
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useSEO } from "../hooks/useSEO";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  points: number;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  percentage: number;
}

interface QuizApiQuestion {
  id: number;
  question: string;
  description: string | null;
  answers: {
    answer_a: string | null;
    answer_b: string | null;
    answer_c: string | null;
    answer_d: string | null;
    answer_e: string | null;
    answer_f: string | null;
  };
  multiple_correct_answers: boolean;
  correct_answers: {
    answer_a_correct: boolean;
    answer_b_correct: boolean;
    answer_c_correct: boolean;
    answer_d_correct: boolean;
    answer_e_correct: boolean;
    answer_f_correct: boolean;
  };
  correct_answer: string | null;
  explanation: string | null;
  tip: string | null;
  tags: { name: string }[];
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const QUIZ_CATEGORIES = [
  { id: "programming", name: "Programming", icon: "💻", color: "from-blue-500 to-cyan-500" },
  { id: "database", name: "Database", icon: "🗄️", color: "from-green-500 to-emerald-500" },
  { id: "networking", name: "Networking", icon: "🌐", color: "from-purple-500 to-pink-500" },
  { id: "algorithms", name: "Algorithms", icon: "🧮", color: "from-orange-500 to-red-500" },
  { id: "web-dev", name: "Web Development", icon: "🎨", color: "from-indigo-500 to-purple-500" },
  { id: "software-eng", name: "Software Engineering", icon: "⚙️", color: "from-slate-500 to-slate-700" }
];

const QUIZ_API_URL = "https://quizapi.io/api/v1/questions";

const getQuizApiCategory = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    programming: "code",
    database: "sql",
    networking: "linux",
    algorithms: "code",
    "web-dev": "html",
    "software-eng": "docker",
    all: ""
  };
  return categoryMap[category] || "";
};

const getQuizApiDifficulty = (difficulty: string): string => {
  const difficultyMap: { [key: string]: string } = {
    all: "",
    Easy: "Easy",
    Medium: "Medium", 
    Hard: "Hard"
  };
  return difficultyMap[difficulty] || "";
};

const transformQuizApiQuestions = (apiQuestions: QuizApiQuestion[]): Question[] => {
  return apiQuestions.map((apiQ, index) => {
    const options = Object.entries(apiQ.answers)
      .filter(([_, value]) => value !== null && value.trim() !== "")
      .map(([_, value]) => value as string);

    let correctAnswerIndex = 0;
    Object.entries(apiQ.correct_answers).forEach(([key, isCorrect], idx) => {
      if (isCorrect === true && options[idx]) {
        correctAnswerIndex = idx;
      }
    });

    return {
      id: `quizapi-${apiQ.id || index}-${Date.now()}`,
      question: apiQ.question,
      options: options,
      correctAnswer: correctAnswerIndex,
      explanation: apiQ.explanation || apiQ.tip || `The correct answer is option: ${String.fromCharCode(65 + correctAnswerIndex)}`,
      difficulty: apiQ.difficulty || "Medium",
      category: apiQ.category ? apiQ.category.toLowerCase().replace(/\s+/g, "-") : "programming",
      points: apiQ.difficulty === "Easy" ? 10 : apiQ.difficulty === "Medium" ? 20 : 30
    };
  });
};

export function QuizGenerator() {
  useSEO({
    title: "AI Practice Exam Quiz Generator",
    description: "Generate mock exams and practice quizzes in computer science and software topics to prepare for your semester finals.",
    keywords: "bcsit quiz, practice exam, ai quiz generator, computer science mock test"
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(10);
  const [currentQuiz, setCurrentQuiz] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: number}>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizStats, setQuizStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizStarted && timeRemaining > 0 && !showResults) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, timeRemaining, showResults]);

  useEffect(() => {
    const savedStats = localStorage.getItem("quizStats");
    const savedSettings = localStorage.getItem("quizSettings");

    if (savedStats) setQuizStats(JSON.parse(savedStats));
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setShuffleQuestions(settings.shuffleQuestions);
    }
  }, []);

  const fetchQuestionsFromQuizApi = async (): Promise<Question[]> => {
    const apiKey = import.meta.env.VITE_QUIZ_API_KEY;
    
    if (!apiKey) {
      throw new Error("QuizAPI token missing. Please register your environment key first.");
    }

    const params = new URLSearchParams();
    params.append("limit", questionCount.toString());
    
    const category = getQuizApiCategory(selectedCategory);
    if (category) params.append("category", category);
    
    const difficultyParam = getQuizApiDifficulty(difficulty);
    if (difficultyParam) params.append("difficulty", difficultyParam);

    try {
      const response = await fetch(`${QUIZ_API_URL}?${params}`, {
        headers: {
          "X-Api-Key": apiKey,
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`API Connection Failed: ${response.status} ${response.statusText}`);
      }

      const data: QuizApiResponse = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error("No syllabus questions found matching parameters.");
      }

      return transformQuizApiQuestions(data);
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const generateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let questions = await fetchQuestionsFromQuizApi();

      if (shuffleQuestions) {
        questions = questions.sort(() => Math.random() - 0.5);
      }

      setCurrentQuiz(questions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowResults(false);
      setQuizStarted(true);
      setTimeRemaining(timeLimit * 60);
      setShowExplanation(false);
      toast.success("Exam pool generated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to generate quiz. Please verify internet connection.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showResults) {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuiz[currentQuestionIndex].id]: answerIndex
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      handleQuizComplete();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const handleQuizComplete = () => {
    const correctAnswers = currentQuiz.reduce((count, question) => {
      return selectedAnswers[question.id] === question.correctAnswer ? count + 1 : count;
    }, 0);
    
    const totalPoints = currentQuiz.reduce((sum, question) => {
      return selectedAnswers[question.id] === question.correctAnswer ? sum + question.points : sum;
    }, 0);
    
    const percentage = Math.round((correctAnswers / currentQuiz.length) * 100);
    const timeSpent = (timeLimit * 60) - timeRemaining;
    
    const result: QuizResult = {
      score: totalPoints,
      totalQuestions: currentQuiz.length,
      correctAnswers,
      timeSpent,
      percentage
    };
    
    setQuizResult(result);
    setShowResults(true);
    setQuizStarted(false);
    
    const newStats = {
      totalQuizzes: quizStats.totalQuizzes + 1,
      averageScore: Math.round(((quizStats.averageScore * quizStats.totalQuizzes) + percentage) / (quizStats.totalQuizzes + 1)),
      bestScore: Math.max(quizStats.bestScore, percentage),
      totalTime: quizStats.totalTime + timeSpent
    };
    setQuizStats(newStats);
    localStorage.setItem("quizStats", JSON.stringify(newStats));
    toast.success("Exam completed!");
  };

  const resetQuiz = () => {
    setCurrentQuiz([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizStarted(false);
    setTimeRemaining(0);
    setQuizResult(null);
    setShowExplanation(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-emerald-600";
    if (percentage >= 70) return "text-indigo-650 text-indigo-600";
    if (percentage >= 50) return "text-amber-600";
    return "text-rose-600";
  };

  const getScoreGradient = (percentage: number) => {
    if (percentage >= 80) return "from-emerald-500 to-teal-600";
    if (percentage >= 60) return "from-indigo-600 to-purple-600";
    if (percentage >= 40) return "from-amber-400 to-orange-500";
    return "from-rose-500 to-pink-600";
  };

  const filteredCategories = QUIZ_CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/30 pb-16 relative">
      
      {/* Background decoration glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-24 left-10 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Floating Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-105 sticky top-0 z-40 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors text-xs font-black uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Home
              </Link>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center">
                <Brain className="w-5 h-5 mr-2 text-indigo-600 animate-pulse" />
                <h1 className="text-lg font-black text-slate-800 tracking-tight">AI Quiz Generator</h1>
                {quizStarted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-3 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-wider animate-pulse"
                  >
                    Assessment Live
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!quizStarted && !showResults && (
                <>
                  <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="flex items-center bg-white border border-slate-250 text-slate-700 hover:text-indigo-600 hover:border-indigo-500 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 mr-1.5" />
                    Analytics
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center bg-white border border-slate-250 text-slate-700 hover:text-indigo-600 hover:border-indigo-500 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Settings className="w-4 h-4 mr-1.5" />
                    Config Setup
                  </button>
                </>
              )}
              
              {quizStarted && (
                <>
                  <motion.div
                    animate={{ scale: timeRemaining < 60 ? [1, 1.05, 1] : 1 }}
                    transition={{ duration: 1, repeat: timeRemaining < 60 ? Infinity : 0 }}
                    className="flex items-center bg-slate-100/80 px-3.5 py-2 border border-slate-200 rounded-xl"
                  >
                    <Clock className="w-4 h-4 mr-2 text-slate-500" />
                    <span className={`font-mono text-xs font-extrabold ${timeRemaining < 60 ? "text-rose-600 animate-pulse" : "text-slate-800"}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </motion.div>
                  <div className="flex items-center bg-indigo-50 border border-indigo-100 px-3.5 py-2 rounded-xl">
                    <Activity className="w-4 h-4 mr-2 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-600">
                      {currentQuestionIndex + 1} / {currentQuiz.length}
                    </span>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* SETUP SCREEN */}
        {!quizStarted && !showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            {/* Title Greeting */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-tight">
                Curriculum Assessment Hub
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 max-w-lg mx-auto leading-relaxed mt-1">
                Evaluate your engineering & computing syllabus parameters with dynamic exam sheets compiled by AI modules.
              </p>
            </div>

            {/* Search filter input */}
            <div className="relative max-w-md mx-auto">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search subject topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
              />
            </div>

            {/* Grid options */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Category selector */}
              <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
                <CardContent className="p-6">
                  <h3 className="text-xs font-extrabold text-slate-800 mb-4 flex items-center gap-1.5 border-b border-slate-50 pb-2">
                    <Filter className="w-4 h-4 text-indigo-650 text-indigo-600" />
                    Select Category
                  </h3>
                  
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full p-3.5 rounded-2xl text-left text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                        selectedCategory === "all"
                          ? "bg-indigo-50 border-indigo-150 text-indigo-700 shadow-sm"
                          : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-650 text-indigo-600" />
                        All General Topics
                      </span>
                    </button>

                    {filteredCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full p-3.5 rounded-2xl text-left text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                          selectedCategory === category.id
                            ? "bg-indigo-50 border-indigo-150 text-indigo-700 shadow-sm"
                            : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base leading-none">{category.icon}</span>
                          <span>{category.name}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Preferences Settings */}
              <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
                <CardContent className="p-6">
                  <h3 className="text-xs font-extrabold text-slate-800 mb-6 flex items-center gap-1.5 border-b border-slate-50 pb-2">
                    <Settings className="w-4 h-4 text-indigo-600" />
                    Configure Range
                  </h3>
                  
                  <div className="space-y-6 text-xs font-semibold text-slate-750">
                    
                    {/* Difficulty */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Difficulty Level</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer"
                      >
                        <option value="all">All Difficulties</option>
                        <option value="Easy">🟢 Easy (10 pts)</option>
                        <option value="Medium">🟡 Medium (20 pts)</option>
                        <option value="Hard">🔴 Hard (30 pts)</option>
                      </select>
                    </div>

                    {/* Count slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Questions Quantity</span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">{questionCount} Questions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQuestionCount(Math.max(5, questionCount - 1))}
                          className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-655 transition-colors cursor-pointer border-0"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="range"
                          min="5"
                          max="20"
                          value={questionCount}
                          onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                          className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <button
                          type="button"
                          onClick={() => setQuestionCount(Math.min(20, questionCount + 1))}
                          className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-655 transition-colors cursor-pointer border-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Timer limit */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Timer Limit</span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">{timeLimit} Minutes</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-105 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>

                    {/* Shuffling toggle */}
                    <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shuffle Questions</span>
                      <button
                        type="button"
                        onClick={() => setShuffleQuestions(!shuffleQuestions)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 border-0 cursor-pointer ${
                          shuffleQuestions ? "bg-indigo-600" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                            shuffleQuestions ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* Academic Achievements Stats */}
              <Card className="border-0 shadow-premium bg-gradient-to-br from-indigo-900 via-[#1e1b4b] to-purple-950 text-white rounded-3xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <h3 className="text-xs font-extrabold mb-4 flex items-center gap-1.5 uppercase tracking-wider text-indigo-300">
                    <Trophy className="w-4.5 h-4.5 text-yellow-400" />
                    Assessments Stats
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-2xl bg-white/10 border border-white/5">
                      <span className="text-xs font-bold text-indigo-200 flex items-center gap-2">
                        <Brain className="w-4.5 h-4.5 text-indigo-300" />
                        Quizzes Completed
                      </span>
                      <span className="font-black text-lg">{quizStats.totalQuizzes}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-2xl bg-white/10 border border-white/5">
                      <span className="text-xs font-bold text-indigo-200 flex items-center gap-2">
                        <TrendingUp className="w-4.5 h-4.5 text-indigo-300" />
                        Average Score
                      </span>
                      <span className="font-black text-lg">{quizStats.averageScore}%</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-2xl bg-white/10 border border-white/5">
                      <span className="text-xs font-bold text-indigo-200 flex items-center gap-2">
                        <Trophy className="w-4.5 h-4.5 text-indigo-300" />
                        Personal Best
                      </span>
                      <span className="font-black text-lg text-yellow-300">{quizStats.bestScore}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Error prompt */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-xl mx-auto"
                >
                  <Card className="border border-rose-200 bg-rose-50/50 rounded-2xl text-xs font-semibold">
                    <CardContent className="p-4 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-rose-800">Quiz Compilation Error</h4>
                        <p className="text-rose-700 leading-relaxed font-medium">{error}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Trigger */}
            <div className="text-center">
              <button
                onClick={generateQuiz}
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-extrabold text-xs px-10 py-4 rounded-xl shadow-md border-0 transition-all cursor-pointer flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Compiling curriculum pool...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                    <span>Start Practice Session</span>
                  </>
                )}
              </button>
            </div>

          </motion.div>
        )}

        {/* ACTIVE TEST INTERFACE */}
        {quizStarted && currentQuiz.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1">
              <CardContent className="p-6 sm:p-10 space-y-6">
                
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Session Progress</span>
                    <span>{Math.round(((currentQuestionIndex + 1) / currentQuiz.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-indigo-600 to-purple-650 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestionIndex + 1) / currentQuiz.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Question Info & Hint Toggles */}
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Question {currentQuestionIndex + 1}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      currentQuiz[currentQuestionIndex].difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      currentQuiz[currentQuestionIndex].difficulty === "Medium" ? "bg-amber-50 text-amber-700 border-amber-100" :
                      "bg-rose-50 text-rose-700 border-rose-100"
                    }`}>
                      {currentQuiz[currentQuestionIndex].difficulty}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-850 cursor-pointer border-0 bg-transparent transition-colors"
                  >
                    {showExplanation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showExplanation ? "Hide Explanation Hint" : "Show Hint"}</span>
                  </button>
                </div>

                {/* Question Statement */}
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-relaxed pt-2">
                  {currentQuiz[currentQuestionIndex].question}
                </h3>

                {/* Explanation Drawer */}
                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-indigo-50/50 border border-indigo-100/50 p-4.5 rounded-2xl shadow-sm text-xs font-semibold leading-relaxed"
                    >
                      <div className="flex items-center mb-1.5">
                        <Lightbulb className="w-4 h-4 text-indigo-600 mr-2" />
                        <span className="font-extrabold text-indigo-900">Study Explanations</span>
                      </div>
                      <p className="text-slate-600 font-semibold">{currentQuiz[currentQuestionIndex].explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Multiple choice Options list */}
                <div className="space-y-3.5 pt-2">
                  {currentQuiz[currentQuestionIndex].options.map((option, index) => {
                    const isSelected = selectedAnswers[currentQuiz[currentQuestionIndex].id] === index;
                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full p-4 text-left rounded-2xl border transition-all duration-300 text-xs flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50/40 text-indigo-800 font-extrabold shadow-sm"
                            : "border-slate-200 bg-white text-slate-655 hover:border-indigo-305 hover:bg-slate-50"
                        }`}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center min-w-0">
                          {/* Option selector circle */}
                          <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-slate-300 bg-white text-slate-400"
                          }`}>
                            {isSelected ? (
                              <CheckCircle className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <span className="text-[10px] font-black">{String.fromCharCode(65 + index)}</span>
                            )}
                          </div>
                          <span className="truncate leading-relaxed">{option}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Navigation Controls */}
                <div className="flex justify-between items-center border-t border-slate-100 pt-6 mt-4">
                  <Button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="flex items-center border-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  {/* Indicator Dots */}
                  <div className="hidden sm:flex space-x-2">
                    {currentQuiz.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          index === currentQuestionIndex
                            ? "bg-indigo-600 scale-125 shadow-sm"
                            : selectedAnswers[currentQuiz[index].id] !== undefined
                            ? "bg-emerald-500"
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={handleNextQuestion}
                    className="bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl border-0 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{currentQuestionIndex === currentQuiz.length - 1 ? "Finish Session" : "Next Question"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* RESULTS DASHBOARD SCREEN */}
        {showResults && quizResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <Card className="border border-slate-200/60 shadow-premium bg-white overflow-hidden rounded-3xl p-1">
              {/* Golden Trophy Header */}
              <div className={`bg-gradient-to-br ${getScoreGradient(quizResult.percentage)} p-8 sm:p-10 text-white text-center rounded-2xl relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none" />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3 relative z-10"
                >
                  <Trophy className="w-14 h-14 mx-auto text-yellow-300 animate-bounce" />
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">Assessment Completed!</h2>
                  <p className="text-xs font-semibold text-indigo-100 max-w-sm mx-auto opacity-90">
                    Review your exam metrics, syllabus marks, and correct answer breakdowns below.
                  </p>
                </motion.div>
              </div>
              
              <CardContent className="p-6 sm:p-8">
                
                {/* Score Decks */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  
                  <div className="p-5 bg-slate-50 rounded-2xl text-center border border-slate-100/50 shadow-sm">
                    <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Accuracy Ratio</span>
                    <div className={`text-3xl font-black ${getScoreColor(quizResult.percentage)}`}>
                      {quizResult.percentage}%
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl text-center border border-slate-105 shadow-sm">
                    <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Correct Answers</span>
                    <div className="text-3xl font-black text-emerald-600">
                      {quizResult.correctAnswers} / {quizResult.totalQuestions}
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl text-center border border-slate-105 shadow-sm">
                    <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Score Points</span>
                    <div className="text-3xl font-black text-indigo-650 text-indigo-600">
                      {quizResult.score} pts
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl text-center border border-slate-105 shadow-sm">
                    <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Duration Logged</span>
                    <div className="text-3xl font-black text-purple-650 text-purple-600">
                      {formatTime(quizResult.timeSpent)}
                    </div>
                  </div>

                </div>

                {/* Operations links */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center border-b border-slate-50 pb-8 mb-8">
                  <button
                    onClick={resetQuiz}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-xs py-3 px-6 rounded-xl border-0 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Take Another Quiz</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      toast.success("Exam report downloaded as PDF (mockup)!");
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3 px-6 rounded-xl border-0 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>Download Transcript</span>
                  </button>
                </div>

                {/* Detailed Answer Key Review Section */}
                <div className="space-y-5">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">
                    Review Answer Key
                  </h3>
                  
                  <div className="space-y-4">
                    {currentQuiz.map((question, index) => {
                      const userAnswerIdx = selectedAnswers[question.id];
                      const isCorrect = userAnswerIdx === question.correctAnswer;
                      
                      return (
                        <div 
                          key={question.id} 
                          className={`p-5 rounded-2xl border text-xs font-semibold leading-relaxed ${
                            isCorrect 
                              ? "bg-emerald-50/30 border-emerald-100/50 text-emerald-950" 
                              : "bg-rose-50/30 border-rose-100/50 text-rose-955"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-extrabold text-slate-700">Question {index + 1}:</span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase border ${
                              isCorrect 
                                ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                : "bg-rose-50 border-rose-100 text-rose-700"
                            }`}>
                              {isCorrect ? "Correct" : "Incorrect"}
                            </span>
                          </div>

                          <p className="font-bold text-slate-800 text-sm mb-3">{question.question}</p>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400">Correct Answer:</span>
                              <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1 rounded-xl font-bold">
                                {question.options[question.correctAnswer]}
                              </span>
                            </div>
                            
                            {!isCorrect && userAnswerIdx !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400">Your Selection:</span>
                                <span className="bg-rose-50 border border-rose-100 text-rose-800 px-3 py-1 rounded-xl font-bold">
                                  {question.options[userAnswerIdx]}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-slate-100/50 pt-3 mt-3 flex gap-2">
                            <Lightbulb className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Syllabus Explanation</span>
                              <p className="text-slate-600 font-medium mt-0.5 leading-relaxed">{question.explanation}</p>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>

              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </div>
  );
}