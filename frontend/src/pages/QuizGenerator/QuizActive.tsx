import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, HelpCircle, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Bookmark, Star } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Question } from "./quizData";

interface QuizActiveProps {
  subjectName: string;
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswers: { [questionId: string]: number };
  markedQuestions: Set<string>;
  savedQuestionIds: Set<string>;
  timeRemaining: number;
  timeLimit: number; // in minutes
  onAnswerSelect: (answerIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleMarkReview: () => void;
  onToggleSaveQuestion: () => void;
  onJumpToQuestion: (index: number) => void;
  onSubmit: () => void;
}

export default function QuizActive({
  subjectName,
  questions,
  currentQuestionIndex,
  selectedAnswers,
  markedQuestions,
  savedQuestionIds,
  timeRemaining,
  timeLimit,
  onAnswerSelect,
  onNext,
  onPrev,
  onToggleMarkReview,
  onToggleSaveQuestion,
  onJumpToQuestion,
  onSubmit
}: QuizActiveProps) {
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  // Format time remaining (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isAnswered = (qId: string) => selectedAnswers[qId] !== undefined;
  const isMarked = (qId: string) => markedQuestions.has(qId);
  const isSaved = (qId: string) => savedQuestionIds.has(qId);

  // Time progress bar percentage
  const totalSeconds = timeLimit * 60;
  const timePercent = (timeRemaining / totalSeconds) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      {/* Sidebar Question Palette */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="rounded-3xl border border-slate-200 shadow-premium overflow-hidden bg-white">
          <CardContent className="p-6">
            <h3 className="font-extrabold text-sm text-slate-800 mb-4 flex items-center justify-between">
              <span>Question Palette</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-500">
                {currentQuestionIndex + 1} of {questions.length}
              </span>
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                let btnStyle = "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100";
                
                if (idx === currentQuestionIndex) {
                  btnStyle = "bg-indigo-50 border-indigo-500 text-indigo-600 ring-2 ring-indigo-500/20 font-black";
                } else if (isMarked(q.id)) {
                  btnStyle = "bg-amber-50 border-amber-400 text-amber-600 font-bold";
                } else if (isAnswered(q.id)) {
                  btnStyle = "bg-indigo-600 border-indigo-600 text-white font-bold";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => onJumpToQuestion(idx)}
                    className={`w-10 h-10 rounded-xl text-xs flex items-center justify-center border transition-all ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-[10px] font-bold text-slate-500">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-indigo-600" />
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-amber-50 border border-amber-400" />
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />
                <span>Unvisited / Unanswered</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Question Sheet */}
      <div className="lg:col-span-3 space-y-6">
        {/* Question Header: Subject, Timer, Progress Bar */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-premium p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">Exam Session</span>
              <h2 className="text-base font-extrabold text-slate-800 leading-snug">{subjectName}</h2>
            </div>
            {/* Countdown timer */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border font-black text-sm transition-all ${
              timeRemaining < 60 
                ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              style={{ width: `${timePercent}%` }}
              className={`h-full rounded-full transition-all duration-1000 ${
                timeRemaining < 60 ? "bg-rose-500" : "bg-indigo-600"
              }`}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            <Card className="rounded-3xl border border-slate-200 shadow-premium overflow-hidden bg-white">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-600 uppercase">
                      Q{currentQuestionIndex + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      currentQuestion.difficulty === "Easy"
                        ? "bg-emerald-50 text-emerald-600"
                        : currentQuestion.difficulty === "Medium"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-rose-50 text-rose-600"
                    }`}>
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-800 leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => onAnswerSelect(idx)}
                        className={`w-full p-4 rounded-2xl border text-left font-bold text-xs flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                            : "bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center space-x-3.5 pr-4">
                          <span className={`w-6 h-6 rounded-lg text-[10px] font-extrabold flex items-center justify-center border transition-all ${
                            isSelected
                              ? "bg-white/20 border-white/10 text-white"
                              : "bg-white border-slate-200 text-slate-500"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="leading-relaxed">{option}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex space-x-2">
            <Button
              onClick={onPrev}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              icon={ArrowLeft}
              className="py-5 text-xs font-bold rounded-2xl border-slate-200 hover:bg-slate-50"
            >
              Previous
            </Button>
            <Button
              onClick={onToggleMarkReview}
              variant="outline"
              icon={Bookmark}
              className={`py-5 text-xs font-bold rounded-2xl border-slate-200 ${
                isMarked(currentQuestion.id)
                  ? "bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100/50"
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              {isMarked(currentQuestion.id) ? "Marked" : "Review Later"}
            </Button>
            <Button
              onClick={onToggleSaveQuestion}
              variant="outline"
              icon={Star}
              className={`py-5 text-xs font-bold rounded-2xl border-slate-200 ${
                isSaved(currentQuestion.id)
                  ? "bg-yellow-50 border-yellow-300 text-yellow-600 hover:bg-yellow-100/50"
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              {isSaved(currentQuestion.id) ? "Saved" : "Save Question"}
            </Button>
          </div>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={onNext}
              icon={ArrowRight}
              iconPosition="right"
              className="py-5 text-xs font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700"
            >
              Next Question
            </Button>
          ) : (
            <Button
              onClick={onSubmit}
              icon={CheckCircle2}
              className="py-5 text-xs font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10"
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
