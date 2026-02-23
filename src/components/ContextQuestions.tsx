import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";

interface ContextQuestionsProps {
  conflictId: string;
  category: string;
  onBack: () => void;
  onComplete: () => void;
}

export function ContextQuestions({ conflictId, category, onBack, onComplete }: ContextQuestionsProps) {
  const questions = useQuery(api.questions.getQuestionsForCategory, { category });
  const submitAnswers = useMutation(api.questions.submitAnswers);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!questions) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Submit all answers
      setIsSubmitting(true);
      try {
        await submitAnswers({
          conflictId: conflictId as Id<"conflicts">,
          answers: questions.map((q: string, i: number) => ({
            question: q,
            answer: answers[i] || "",
            questionOrder: i,
          })),
        });
        onComplete();
      } catch (error) {
        console.error("Failed to submit answers:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const canProceed = answers[currentQuestion]?.trim().length > 0;
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-xl sm:rounded-2xl bg-purple-500/20 flex items-center justify-center">
            <MessageCircle className="text-purple-400" size={24} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Context Questions</h2>
          <p className="text-xs sm:text-sm text-white/40">
            Help us understand the situation better
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
          {questions.map((_: string, i: number) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= currentQuestion ? "bg-purple-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6"
        >
          <p className="text-[10px] sm:text-xs text-purple-400 mb-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
            {questions[currentQuestion]}
          </h3>
          <textarea
            value={answers[currentQuestion] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Type your answer..."
            rows={3}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] transition-all resize-none"
            autoFocus
          />
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <motion.button
            onClick={currentQuestion > 0 ? () => setCurrentQuestion(currentQuestion - 1) : onBack}
            className="px-4 sm:px-5 py-2.5 sm:py-3 text-white/60 font-medium rounded-xl flex items-center gap-2 hover:text-white transition-all text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={18} />
            Back
          </motion.button>
          <motion.button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl flex items-center gap-2 hover:from-purple-500 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLastQuestion ? "Continue" : "Next"}
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
