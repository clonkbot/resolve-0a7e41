import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Send,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { ContextQuestions } from "./ContextQuestions";
import { PerspectiveForm } from "./PerspectiveForm";

type View =
  | { type: "landing" }
  | { type: "dashboard" }
  | { type: "create" }
  | { type: "join"; code?: string }
  | { type: "conflict"; conflictId: string };

interface ConflictRoomProps {
  conflictId: string;
  onNavigate: (view: View) => void;
}

export function ConflictRoom({ conflictId, onNavigate }: ConflictRoomProps) {
  const conflict = useQuery(api.conflicts.get, {
    conflictId: conflictId as Id<"conflicts">,
  });
  const participants = useQuery(api.conflicts.getParticipants, {
    conflictId: conflictId as Id<"conflicts">,
  });
  const myPerspective = useQuery(api.perspectives.getMyPerspective, {
    conflictId: conflictId as Id<"conflicts">,
  });
  const myAnswers = useQuery(api.questions.getMyAnswers, {
    conflictId: conflictId as Id<"conflicts">,
  });
  const perspectiveData = useQuery(api.perspectives.getAllForResolution, {
    conflictId: conflictId as Id<"conflicts">,
  });

  const generateResolution = useAction(api.ai.generateResolution);

  const [step, setStep] = useState<"overview" | "questions" | "perspective" | "waiting" | "resolution">(
    "overview"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (conflict === undefined || participants === undefined) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded-lg w-48" />
          <div className="h-48 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!conflict) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center">
        <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
        <h2 className="text-xl font-bold text-white mb-2">Conflict Not Found</h2>
        <p className="text-white/40 mb-6">This conflict may have been deleted or you don't have access.</p>
        <motion.button
          onClick={() => onNavigate({ type: "dashboard" })}
          className="px-5 py-3 bg-purple-600 text-white font-medium rounded-xl text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back to Dashboard
        </motion.button>
      </div>
    );
  }

  const copyCode = () => {
    navigator.clipboard.writeText(conflict.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allSubmitted = participants.every((p: { hasSubmitted: boolean }) => p.hasSubmitted);
  const hasQuestions = myAnswers && myAnswers.length > 0;
  const hasPerspective = myPerspective !== null && myPerspective !== undefined;

  // Auto-detect step
  const currentStep =
    step === "overview"
      ? "overview"
      : step === "questions"
      ? "questions"
      : step === "perspective"
      ? "perspective"
      : step;

  const handleGenerateResolution = async () => {
    setIsGenerating(true);
    try {
      await generateResolution({ conflictId: conflictId as Id<"conflicts"> });
    } catch (error) {
      console.error("Failed to generate resolution:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Show resolution if available
  if (conflict.resolution && conflict.status === "resolved") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="p-2.5 sm:p-3 rounded-xl bg-green-500/20">
              <Sparkles className="text-green-400" size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{conflict.title}</h1>
              <p className="text-xs sm:text-sm text-green-400">Resolution Available</p>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-8 prose prose-invert prose-sm sm:prose-base max-w-none">
            <div
              className="text-white/80 text-sm sm:text-base leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: "system-ui" }}
            >
              {conflict.resolution.split("\n").map((line: string, i: number) => {
                if (line.startsWith("# ")) {
                  return (
                    <h1 key={i} className="text-xl sm:text-2xl font-bold text-white mt-6 mb-4">
                      {line.replace("# ", "")}
                    </h1>
                  );
                }
                if (line.startsWith("## ")) {
                  return (
                    <h2 key={i} className="text-lg sm:text-xl font-semibold text-white mt-6 mb-3">
                      {line.replace("## ", "")}
                    </h2>
                  );
                }
                if (line.startsWith("### ")) {
                  return (
                    <h3 key={i} className="text-base sm:text-lg font-semibold text-purple-300 mt-4 mb-2">
                      {line.replace("### ", "")}
                    </h3>
                  );
                }
                if (line.startsWith("---")) {
                  return <hr key={i} className="border-white/10 my-6" />;
                }
                if (line.startsWith("- ")) {
                  return (
                    <p key={i} className="ml-4 text-white/70 mb-1 text-sm sm:text-base">
                      • {line.replace("- ", "")}
                    </p>
                  );
                }
                if (line.startsWith("**") && line.endsWith("**")) {
                  return (
                    <p key={i} className="font-semibold text-white mt-3 mb-1 text-sm sm:text-base">
                      {line.replace(/\*\*/g, "")}
                    </p>
                  );
                }
                if (line.startsWith("*") && line.endsWith("*")) {
                  return (
                    <p key={i} className="italic text-white/60 my-4 text-sm sm:text-base">
                      {line.replace(/\*/g, "")}
                    </p>
                  );
                }
                if (line.trim() === "") {
                  return <br key={i} />;
                }
                return (
                  <p key={i} className="text-white/70 mb-2 text-sm sm:text-base">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>

          <div className="mt-6 sm:mt-8 text-center">
            <motion.button
              onClick={() => onNavigate({ type: "dashboard" })}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl text-sm hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <AnimatePresence mode="wait">
        {/* Overview */}
        {currentStep === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <span className="px-2 py-1 text-[10px] sm:text-xs bg-purple-500/20 text-purple-300 rounded-full capitalize">
                  {conflict.category}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white mt-2">{conflict.title}</h1>
                <p className="text-xs sm:text-sm text-white/40 mt-1">You are {conflict.currentParticipant.role}</p>
              </div>
            </div>

            {/* Join Code */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-white/40 mb-1">Share this code with other parties</p>
                  <p className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-widest">
                    {conflict.joinCode}
                  </p>
                </div>
                <motion.button
                  onClick={copyCode}
                  className="px-4 py-2.5 bg-white/10 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy"}
                </motion.button>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-white/40" size={18} />
                <h3 className="text-sm sm:text-base font-semibold text-white">Participants</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {participants.map((p: { _id: string; role: string; isMe: boolean; hasSubmitted: boolean }) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg sm:rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-sm font-semibold ${
                          p.isMe
                            ? "bg-purple-500/20 text-purple-300"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {p.role.split(" ")[1]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {p.role} {p.isMe && <span className="text-purple-400">(You)</span>}
                        </p>
                      </div>
                    </div>
                    {p.hasSubmitted ? (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle size={14} />
                        <span className="hidden sm:inline">Submitted</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-400">
                        <Clock size={14} />
                        <span className="hidden sm:inline">Pending</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {conflict.description && (
              <div className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="text-sm sm:text-base font-semibold text-white mb-2">About this conflict</h3>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{conflict.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 sm:space-y-4">
              {!hasPerspective && (
                <motion.button
                  onClick={() => setStep(hasQuestions ? "perspective" : "questions")}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/20 text-sm sm:text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send size={18} />
                  Share Your Perspective
                </motion.button>
              )}

              {hasPerspective && !allSubmitted && (
                <div className="text-center py-6 sm:py-8">
                  <CheckCircle className="mx-auto mb-3 text-green-400" size={36} />
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    Perspective Submitted
                  </h3>
                  <p className="text-xs sm:text-sm text-white/40">
                    Waiting for other participants to submit...
                  </p>
                </div>
              )}

              {allSubmitted && participants.length >= 2 && (
                <motion.button
                  onClick={handleGenerateResolution}
                  disabled={isGenerating}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:from-purple-500 hover:to-purple-600 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20 text-sm sm:text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating Resolution...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate AI Resolution
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Context Questions */}
        {currentStep === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ContextQuestions
              conflictId={conflictId}
              category={conflict.category}
              onBack={() => setStep("overview")}
              onComplete={() => setStep("perspective")}
            />
          </motion.div>
        )}

        {/* Perspective Form */}
        {currentStep === "perspective" && (
          <motion.div
            key="perspective"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PerspectiveForm
              conflictId={conflictId}
              onBack={() => setStep("questions")}
              onComplete={() => setStep("overview")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
