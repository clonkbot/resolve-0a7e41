import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Send, Eye, Heart, Target, Handshake, Star } from "lucide-react";

interface PerspectiveFormProps {
  conflictId: string;
  onBack: () => void;
  onComplete: () => void;
}

const steps = [
  {
    key: "whatHappened",
    title: "What happened?",
    subtitle: "Describe the situation from your perspective",
    icon: Eye,
    placeholder:
      "Explain what occurred, focusing on facts and events as you experienced them...",
  },
  {
    key: "howItMadeYouFeel",
    title: "How did it make you feel?",
    subtitle: "Share your emotions honestly",
    icon: Heart,
    placeholder:
      "Describe how this situation affected you emotionally. Be specific about your feelings...",
  },
  {
    key: "whatYouNeed",
    title: "What do you need?",
    subtitle: "What would help you feel better about this?",
    icon: Target,
    placeholder:
      "What do you need from the other party? What changes would make a difference?",
  },
  {
    key: "willingToCompromise",
    title: "What are you willing to compromise on?",
    subtitle: "Finding middle ground requires flexibility",
    icon: Handshake,
    placeholder:
      "What are you open to changing or accepting? Where can you meet halfway?",
  },
  {
    key: "idealOutcome",
    title: "What's your ideal outcome?",
    subtitle: "If everything worked out perfectly...",
    icon: Star,
    placeholder:
      "Describe your best-case scenario. What does resolution look like to you?",
  },
];

export function PerspectiveForm({ conflictId, onBack, onComplete }: PerspectiveFormProps) {
  const submit = useMutation(api.perspectives.submit);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [steps[currentStep].key]: value });
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit perspective
      setIsSubmitting(true);
      try {
        await submit({
          conflictId: conflictId as Id<"conflicts">,
          whatHappened: answers.whatHappened || "",
          howItMadeYouFeel: answers.howItMadeYouFeel || "",
          whatYouNeed: answers.whatYouNeed || "",
          willingToCompromise: answers.willingToCompromise || "",
          idealOutcome: answers.idealOutcome || "",
        });
        onComplete();
      } catch (error) {
        console.error("Failed to submit perspective:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const step = steps[currentStep];
  const StepIcon = step.icon;
  const canProceed = answers[step.key]?.trim().length > 10;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-xl sm:rounded-2xl bg-purple-500/20 flex items-center justify-center">
            <Send className="text-purple-400" size={24} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Share Your Perspective</h2>
          <p className="text-xs sm:text-sm text-white/40 px-4">
            Your responses are private until everyone submits
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= currentStep ? "bg-purple-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <StepIcon className="text-purple-400" size={18} />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-purple-400 mb-0.5">
                  Step {currentStep + 1} of {steps.length}
                </p>
                <h3 className="text-base sm:text-lg font-semibold text-white">{step.title}</h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/50 mb-4">{step.subtitle}</p>

            <textarea
              value={answers[step.key] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder={step.placeholder}
              rows={5}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] transition-all resize-none"
              autoFocus
            />

            <p className="text-[10px] sm:text-xs text-white/30 mt-2 text-right">
              {(answers[step.key] || "").length} characters (min 10)
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <motion.button
            onClick={handleBack}
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
                {isLastStep ? (
                  <>
                    Submit
                    <Send size={18} />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={18} />
                  </>
                )}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
