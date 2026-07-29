import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Play, 
  RotateCcw, 
  Download, 
  Share2, 
  Settings, 
  Clock, 
  CheckCircle,
  XCircle,
  Award,
  Target,
  Zap,
  BookOpen,
  Users,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  Eye,
  EyeOff,
  Star,
  Trophy,
  Lightbulb,
  HelpCircle,
  ChevronRight,
  Plus,
  Minus,
  Filter,
  Search,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Link } from 'react-router-dom';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
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
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface QuizApiResponse extends Array<QuizApiQuestion> {}

const QUIZ_CATEGORIES = [
  { id: 'programming', name: 'Programming', icon: '💻', color: 'from-blue-500 to-cyan-500' },
  { id: 'database', name: 'Database', icon: '🗄️', color: 'from-green-500 to-emerald-500' },
  { id: 'networking', name: 'Networking', icon: '🌐', color: 'from-purple-500 to-pink-500' },
  { id: 'algorithms', name: 'Algorithms', icon: '🧮', color: 'from-orange-500 to-red-500' },
  { id: 'web-dev', name: 'Web Development', icon: '🎨', color: 'from-indigo-500 to-purple-500' },
  { id: 'software-eng', name: 'Software Engineering', icon: '⚙️', color: 'from-gray-500 to-slate-500' }
];

// QuizAPI.io service functions
const QUIZ_API_URL = 'https://quizapi.io/api/v1/questions';

// Category mapping for QuizAPI
const getQuizApiCategory = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    'programming': 'code',
    'database': 'sql',
    'networking': 'linux',
    'algorithms': 'code',
    'web-dev': 'html',
    'software-eng': 'docker',
    'all': ''
  };
  return categoryMap[category] || '';
};

// Difficulty mapping for QuizAPI
const getQuizApiDifficulty = (difficulty: string): string => {
  const difficultyMap: { [key: string]: string } = {
    'all': '',
    'Easy': 'Easy',
    'Medium': 'Medium', 
    'Hard': 'Hard'
  };
  return difficultyMap[difficulty] || '';
};

// Transform QuizAPI data to your app format
const transformQuizApiQuestions = (apiQuestions: QuizApiQuestion[]): Question[] => {
  return apiQuestions.map((apiQ, index) => {
    // Extract valid options
    const options = Object.entries(apiQ.answers)
      .filter(([_, value]) => value !== null && value.trim() !== '')
      .map(([_, value]) => value as string);

    // Find correct answer index
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
      explanation: apiQ.explanation || apiQ.tip || `The correct answer is: ${options[correctAnswerIndex]}`,
      difficulty: apiQ.difficulty,
      category: apiQ.category.toLowerCase().replace(/\s+/g, '-'),
      points: apiQ.difficulty === 'Easy' ? 10 : apiQ.difficulty === 'Medium' ? 20 : 30
    };
  });
};

export function QuizGenerator() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);
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

  // Fetch questions from QuizAPI
  const fetchQuestionsFromQuizApi = async (): Promise<Question[]> => {
    const apiKey = import.meta.env.VITE_QUIZ_API_KEY;
    
    if (!apiKey) {
      throw new Error('QuizAPI API key not found. Please check your .env file');
    }

    const params = new URLSearchParams();
    params.append('limit', questionCount.toString());
    
    const category = getQuizApiCategory(selectedCategory);
    if (category) params.append('category', category);
    
    const difficultyParam = getQuizApiDifficulty(difficulty);
    if (difficultyParam) params.append('difficulty', difficultyParam);

    try {
      console.log('Fetching questions from QuizAPI...');
      const response = await fetch(`${QUIZ_API_URL}?${params}`, {
        headers: {
          'X-Api-Key': apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`QuizAPI Error: ${response.status} - ${response.statusText}`);
      }

      const data: QuizApiResponse = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error('No questions received from QuizAPI');
      }

      return transformQuizApiQuestions(data);
    } catch (error) {
      console.error('QuizAPI fetch error:', error);
      throw error;
    }
  };

  const generateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting quiz generation...');
      
      let questions: Question[];
      
      // Fetch questions from QuizAPI
      console.log('Attempting to fetch from QuizAPI...');
      questions = await fetchQuestionsFromQuizApi();
      console.log(`Successfully fetched ${questions.length} questions from QuizAPI`);

      // Validate we have questions
      if (!questions || questions.length === 0) {
        throw new Error('No questions available for the selected criteria');
      }

      // Apply shuffling if enabled
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
      
      console.log(`Quiz started with ${questions.length} questions`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate quiz';
      setError(errorMessage);
      console.error('Quiz generation error:', err);
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
    
    // Update stats
    setQuizStats(prev => ({
      totalQuizzes: prev.totalQuizzes + 1,
      averageScore: Math.round(((prev.averageScore * prev.totalQuizzes) + percentage) / (prev.totalQuizzes + 1)),
      bestScore: Math.max(prev.bestScore, percentage),
      totalTime: prev.totalTime + timeSpent
    }));
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (percentage: number) => {
    if (percentage >= 90) return 'from-green-500 to-emerald-600';
    if (percentage >= 70) return 'from-blue-500 to-indigo-600';
    if (percentage >= 50) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Header */}
      <div className="bg-white/85 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-slate-600 hover:text-purple-650 transition-colors text-sm font-semibold">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Home
              </Link>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600 animate-pulse" />
                <h1 className="text-lg font-bold text-slate-800">Quiz Generator</h1>
                {quizStarted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-3 px-2.5 py-0.5 bg-purple-50 border border-purple-100/50 text-purple-600 text-xs font-bold rounded-full animate-pulse"
                  >
                    Active
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!quizStarted && !showResults && (
                <>
                  <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="flex items-center bg-white border border-slate-200 text-slate-755 hover:text-purple-600 hover:border-purple-500 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm"
                  >
                    <BarChart3 className="w-4 h-4 mr-1.5" />
                    Analytics
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center bg-white border border-slate-200 text-slate-755 hover:text-purple-600 hover:border-purple-500 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm"
                  >
                    <Settings className="w-4 h-4 mr-1.5" />
                    Settings
                  </button>
                </>
              )}
              {quizStarted && (
                <>
                  <motion.div
                    animate={{ scale: timeRemaining < 60 ? [1, 1.05, 1] : 1 }}
                    transition={{ duration: 1, repeat: timeRemaining < 60 ? Infinity : 0 }}
                    className="flex items-center bg-slate-100/80 px-3.5 py-2 rounded-xl border border-slate-200/50"
                  >
                    <Clock className="w-4 h-4 mr-2 text-slate-500" />
                    <span className={`font-mono text-xs font-extrabold ${timeRemaining < 60 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </motion.div>
                  <div className="flex items-center bg-purple-50 border border-purple-100/50 px-3.5 py-2 rounded-xl">
                    <Activity className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="text-xs font-bold text-purple-600">
                      {currentQuestionIndex + 1} / {currentQuiz.length}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!quizStarted && !showResults ? (
          /* Quiz Setup */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-650 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/10">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-850 mb-4 tracking-tight leading-tight">
                  AI-Powered Quiz Generator
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                  Evaluate your Pokhara University syllabus knowledge with customized dynamic quizzes.
                </p>
              </motion.div>
            </div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                <input
                  type="text"
                  placeholder="Search quiz topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all duration-300 bg-white text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </motion.div>

            {/* Quiz Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Categories */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="border border-slate-100 shadow-premium bg-white">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                      <Filter className="w-4 h-4 mr-2 text-purple-650" />
                      Select Category
                    </h3>
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCategory('all')}
                        className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all duration-300 border flex items-center ${
                          selectedCategory === 'all'
                            ? 'bg-purple-55 border-purple-200 text-purple-700 shadow-sm'
                            : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Target className="w-3.5 h-3.5 mr-2 text-purple-600" />
                        All Categories
                      </motion.button>
                      {QUIZ_CATEGORIES.map((category, index) => (
                        <motion.button
                          key={category.id}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all duration-300 border flex items-center justify-between ${
                            selectedCategory === category.id
                              ? 'bg-purple-55 border-purple-200 text-purple-700 shadow-sm'
                              : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="mr-2 text-sm">{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="border border-slate-100 shadow-premium bg-white">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                      <Settings className="w-4 h-4 mr-2 text-purple-655" />
                      Quiz Settings
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                          Difficulty Level
                        </label>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 font-semibold transition-all"
                        >
                          <option value="all">All Levels</option>
                          <option value="Easy">🟢 Easy</option>
                          <option value="Medium">🟡 Medium</option>
                          <option value="Hard">🔴 Hard</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-550 mb-2 uppercase tracking-wider flex items-center justify-between">
                          <span>Questions count</span>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">{questionCount} Qs</span>
                        </label>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setQuestionCount(Math.max(5, questionCount - 1))}
                            className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="range"
                            min="5"
                            max="20"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                            className="flex-1 h-1.5 bg-slate-105 rounded-lg appearance-none cursor-pointer accent-purple-605"
                          />
                          <button
                            onClick={() => setQuestionCount(Math.min(20, questionCount + 1))}
                            className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-550 mb-2 uppercase tracking-wider flex items-center justify-between">
                          <span>Time limit</span>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">{timeLimit} Mins</span>
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="30"
                          value={timeLimit}
                          onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-purple-105 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-2">
                        <label className="flex items-center text-xs font-bold text-slate-550 uppercase tracking-wider">
                          <Shuffle className="w-4 h-4 mr-2 text-purple-600" />
                          Shuffle Questions
                        </label>
                        <button
                          onClick={() => setShuffleQuestions(!shuffleQuestions)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-305 ${
                            shuffleQuestions ? 'bg-purple-650' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-305 ${
                              shuffleQuestions ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card className="border-0 shadow-premium bg-gradient-to-br from-purple-605 via-pink-650 to-indigo-900 text-white rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-bold mb-4 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2 text-yellow-350" />
                      Academic Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/10">
                        <span className="text-xs font-semibold text-purple-100 flex items-center">
                          <Brain className="w-4 h-4 mr-2" />
                          Quizzes Taken
                        </span>
                        <span className="font-extrabold text-lg">{quizStats.totalQuizzes}</span>
                      </div>
                      <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/10">
                        <span className="text-xs font-semibold text-purple-100 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Average Score
                        </span>
                        <span className="font-extrabold text-lg">{quizStats.averageScore}%</span>
                      </div>
                      <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/10">
                        <span className="text-xs font-semibold text-purple-100 flex items-center">
                          <Trophy className="w-4 h-4 mr-2" />
                          Best Score
                        </span>
                        <span className="font-extrabold text-lg">{quizStats.bestScore}%</span>
                      </div>
                      <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/10">
                        <span className="text-xs font-semibold text-purple-100 flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Total Time
                        </span>
                        <span className="font-extrabold text-lg">{Math.round(quizStats.totalTime / 60)}m</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 max-w-xl mx-auto"
                >
                  <Card className="border-red-200 bg-red-50/50 rounded-2xl">
                    <CardContent className="p-5">
                      <div className="flex items-start">
                        <XCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-bold text-red-800 text-sm">Quiz Generation Failed</h4>
                          <p className="text-red-750 text-xs mt-1">{error}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={generateQuiz}
                          className="bg-red-650 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                        >
                          Try Again
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate Quiz Button */}
            <div className="text-center">
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block"
              >
                <button
                  onClick={generateQuiz}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-650 to-pink-600 hover:brightness-110 text-white font-bold px-12 py-4 rounded-xl shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed border-0 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      <span>Generating Quiz Pool...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-yellow-355" />
                      <span>Generate Smart Quiz</span>
                    </>
                  )}
                </button>
              </motion.div>
              
              {/* API Status Indicator */}
              {import.meta.env.VITE_QUIZ_API_KEY && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 flex items-center justify-center text-xs font-semibold text-slate-505"
                >
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                  QuizAPI.io Connected
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : quizStarted ? (
          /* Quiz Interface */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border border-slate-100 shadow-premium bg-white rounded-2xl">
              <CardContent className="p-8">
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2 text-xs font-bold text-slate-550">
                    <span>Progress</span>
                    <span>
                      {Math.round(((currentQuestionIndex + 1) / currentQuiz.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-105 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestionIndex + 1) / currentQuiz.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2.5">
                      <span className="bg-purple-50 text-purple-650 px-3 py-1 rounded-full text-xs font-bold border border-purple-100/50">
                        Question {currentQuestionIndex + 1}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        currentQuiz[currentQuestionIndex]?.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' :
                        currentQuiz[currentQuestionIndex]?.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200/50' :
                        'bg-rose-50 text-rose-700 border-rose-100/50'
                      }`}>
                        {currentQuiz[currentQuestionIndex]?.difficulty}
                      </span>
                      <span className="bg-slate-50 border border-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-semibold">
                        {currentQuiz[currentQuestionIndex]?.points} pts
                      </span>
                    </div>
                    <button
                      onClick={() => setShowExplanation(!showExplanation)}
                      className="flex items-center text-xs font-bold text-purple-600 hover:text-purple-805 transition-colors"
                    >
                      {showExplanation ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                      <span>{showExplanation ? 'Hide' : 'Show'} Hint</span>
                    </button>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 leading-relaxed">
                    {currentQuiz[currentQuestionIndex]?.question}
                  </h3>
                  
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-indigo-50 border-l-4 border-indigo-400 p-4.5 mb-6 rounded-r-xl shadow-sm text-xs font-semibold"
                    >
                      <div className="flex items-center mb-2">
                        <Lightbulb className="w-4 h-4 text-indigo-650 mr-2" />
                        <span className="font-bold text-indigo-855">Explanation</span>
                      </div>
                      <p className="text-indigo-700 font-medium">{currentQuiz[currentQuestionIndex]?.explanation}</p>
                    </motion.div>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-4 mb-8">
                  {currentQuiz[currentQuestionIndex]?.options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full p-4.5 text-left rounded-2xl border transition-all duration-300 text-sm flex items-center justify-between ${
                        selectedAnswers[currentQuiz[currentQuestionIndex].id] === index
                          ? 'border-purple-500 bg-purple-50/40 text-purple-700 font-bold shadow-sm'
                          : 'border-slate-200 bg-white text-slate-705 hover:border-purple-305 hover:bg-purple-50/10'
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                          selectedAnswers[currentQuiz[currentQuestionIndex].id] === index
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {selectedAnswers[currentQuiz[currentQuestionIndex].id] === index && (
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                        <span className="font-bold mr-1.5 text-slate-400">{String.fromCharCode(65 + index)}.</span>
                        <span>{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center border-t border-slate-50 pt-6">
                  <Button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="flex items-center border-slate-200 text-slate-700"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex space-x-2">
                    {currentQuiz.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          index === currentQuestionIndex
                            ? 'bg-purple-600 scale-125'
                            : selectedAnswers[currentQuiz[index].id] !== undefined
                            ? 'bg-emerald-450'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button
                    onClick={handleNextQuestion}
                    className="bg-gradient-to-r from-purple-650 to-pink-650 hover:brightness-110 text-white flex items-center border-0"
                  >
                    <span>{currentQuestionIndex === currentQuiz.length - 1 ? 'Finish Quiz' : 'Next'}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Results */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border border-slate-100 shadow-premium bg-white overflow-hidden rounded-2xl">
              <div className={`bg-gradient-to-br ${getScoreGradient(quizResult?.percentage || 0)} p-10 text-white text-center rounded-t-2xl relative`}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                  <h2 className="text-3xl font-extrabold mb-2 text-white">Quiz Completed!</h2>
                  <p className="text-sm opacity-90 font-semibold text-purple-100">Review your final dashboard performance summary</p>
                </motion.div>
              </div>
              
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <div className="p-5 bg-slate-50 rounded-2xl text-center border border-slate-100 shadow-sm">
                    <div className={`text-4xl font-black mb-1.5 ${getScoreColor(quizResult?.percentage || 0)}`}>
                      {quizResult?.percentage}%
                    </div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Final Score</div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl text-center border border-slate-105 shadow-sm">
                    <div className="text-4xl font-black text-emerald-650 mb-1.5">
                      {quizResult?.correctAnswers}
                    </div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Correct</div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl text-center border border-slate-105 shadow-sm">
                    <div className="text-4xl font-black text-indigo-650 mb-1.5">
                      {quizResult?.score}
                    </div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Points</div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl text-center border border-slate-105 shadow-sm">
                    <div className="text-4xl font-black text-purple-650 mb-1.5">
                      {formatTime(quizResult?.timeSpent || 0)}
                    </div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Time Spent</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={resetQuiz}
                    className="bg-gradient-to-r from-purple-650 to-pink-655 hover:brightness-110 text-white flex items-center border-0 font-bold"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Take Another Quiz
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center border-slate-200 text-slate-700 font-semibold"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Results
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center border-slate-200 text-slate-700 font-semibold"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Features Section */}
        {!quizStarted && !showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16"
          >
            <Card className="border border-slate-100 shadow-premium bg-gradient-to-r from-slate-50 to-indigo-50/20 rounded-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-10">
                  <Zap className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                  <h3 className="text-2xl font-bold text-slate-800">
                    Advanced Smart Quiz Utilities
                  </h3>
                  <p className="text-xs font-bold text-slate-455 uppercase tracking-widest mt-1">
                    Simulate PU board examinations using smart AI-generated templates
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { 
                      icon: Brain, 
                      title: "Smart Question Pool", 
                      description: "Access a structured quiz bank covering operating systems, DBMS, networks, and coding."
                    },
                    { 
                      icon: Target, 
                      title: "Adaptive Selectors", 
                      description: "Filter questions by exact difficulty level - Easy, Medium, or Hard immediately."
                    },
                    { 
                      icon: BarChart3, 
                      title: "Score Breakdown", 
                      description: "Monitor your performance percentage, correct responses, and virtual points."
                    },
                    { 
                      icon: Clock, 
                      title: "Simulated Timers", 
                      description: "Simulate PU semester midterms and finals with strict session time limits."
                    },
                    { 
                      icon: Award, 
                      title: "Streak Analytics", 
                      description: "Gamified achievement system tracking streak statistics and performance reviews."
                    },
                    { 
                      icon: Users, 
                      title: "Offline Sharing", 
                      description: "Export results as local transcripts and share key stats with peer groups."
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-premium transition-all duration-300"
                    >
                      <div className="w-11 h-11 bg-gradient-to-br from-purple-550 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-base font-bold text-slate-805 mb-2 text-center">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold text-center leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analytics Modal */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
              onClick={() => setShowAnalytics(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/95 backdrop-blur-lg border border-slate-100 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-premium"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-3">
                  <h3 className="text-xl font-bold text-slate-850 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                    Quiz Performance Dashboard
                  </h3>
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className="p-1 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-blue-500 to-indigo-650 text-white rounded-2xl border-0 shadow-md">
                    <CardContent className="p-6 text-center">
                      <PieChart className="w-7 h-7 mx-auto mb-3 text-white" />
                      <h4 className="text-sm font-bold mb-1.5">Average Performance</h4>
                      <div className="text-3xl font-black">{quizStats.averageScore}%</div>
                      <div className="text-[10px] uppercase font-bold text-indigo-100 mt-1">Syllabus Grade</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-emerald-500 to-teal-650 text-white rounded-2xl border-0 shadow-md">
                    <CardContent className="p-6 text-center">
                      <Activity className="w-7 h-7 mx-auto mb-3 text-white" />
                      <h4 className="text-sm font-bold mb-1.5">Total Assessments</h4>
                      <div className="text-3xl font-black">{quizStats.totalQuizzes}</div>
                      <div className="text-[10px] uppercase font-bold text-emerald-100 mt-1">Completed Pools</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-500 to-pink-655 text-white rounded-2xl border-0 shadow-md">
                    <CardContent className="p-6 text-center">
                      <Calendar className="w-7 h-7 mx-auto mb-3 text-white" />
                      <h4 className="text-sm font-bold mb-1.5">Time Logged</h4>
                      <div className="text-3xl font-black">{Math.round(quizStats.totalTime / 60)}</div>
                      <div className="text-[10px] uppercase font-bold text-pink-100 mt-1">Minutes Spent</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-8 border-t border-slate-50 pt-6">
                  <h4 className="text-sm font-bold text-slate-805 mb-4 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-purple-600 animate-bounce" />
                    Quiz Completion Chart
                  </h4>
                  <div className="bg-slate-50/50 rounded-2xl border border-slate-105 p-6">
                    <div className="flex items-center justify-center h-32 text-slate-400">
                      <div className="text-center">
                        <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-550" />
                        <p className="text-xs font-semibold">Weekly statistics analytics will load here</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-3">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-purple-600" />
                    Quiz Preferences
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-1 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-xs font-bold text-slate-550 uppercase tracking-wider">
                      <Shuffle className="w-4 h-4 mr-2 text-purple-655" />
                      Auto-shuffle Questions
                    </label>
                    <button
                      onClick={() => setShuffleQuestions(!shuffleQuestions)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                        shuffleQuestions ? 'bg-purple-650' : 'bg-slate-250'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                          shuffleQuestions ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-xs font-bold text-slate-555 uppercase tracking-wider">
                      <BookOpen className="w-4 h-4 mr-2 text-purple-655" />
                      Show Explanations
                    </label>
                    <button
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-650"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-xs font-bold text-slate-555 uppercase tracking-wider">
                      <Star className="w-4 h-4 mr-2 text-purple-655" />
                      Save Progress
                    </label>
                    <button
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-650"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8 border-t border-slate-50 pt-5">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-3 rounded-xl shadow-sm transition-all duration-300"
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 bg-slate-105 hover:bg-slate-250 text-slate-700 font-semibold text-xs py-3 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/95 backdrop-blur-lg border border-slate-100 rounded-2xl p-8 text-center max-w-sm mx-4 shadow-premium"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-purple-200 border-t-purple-650 rounded-full mx-auto mb-4"
                />
                <h3 className="text-lg font-bold text-slate-805 mb-2">Generating smart quiz...</h3>
                <p className="text-xs text-slate-500 font-semibold">Compiling curriculum questions from database</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}