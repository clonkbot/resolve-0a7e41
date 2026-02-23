import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Home, Briefcase, Users, HelpCircle, ArrowRight, ArrowLeft, Check } from "lucide-react";

type View =
  | { type: "landing" }
  | { type: "dashboard" }
  | { type: "create" }
  | { type: "join"; code?: string }
  | { type: "conflict"; conflictId: string };

interface CreateConflictProps {
  onNavigate: (view: View) => void;
}

type Category = "couple" | "roommates" | "colleagues" | "friends" | "other";

const categories: { id: Category; label: string; icon: typeof Heart; description: string }[] = [
  { id: "couple", label: "Couple", icon: Heart, description: "Romantic relationship" },
  { id: "roommates", label: "Roommates", icon: Home, description: "Living together" },
  { id: "colleagues", label: "Work", icon: Briefcase, description: "Professional setting" },
  { id: "friends", label: "Friends", icon: Users, description: "Friendship" },
  { id: "other", label: "Other", icon: HelpCircle, description: "Something else" },
];

export function CreateConflict({ onNavigate }: CreateConflictProps) {
  const createConflict = useMutation(api.conflicts.create);

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ conflictId: string; joinCode: string } | null>(null);

  const handleCreate = async () => {
    if (!category || !title.trim()) return;

    setIsLoading(true);
    try {
      const res = await createConflict({
        title: title.trim(),
        category,
        description: description.trim(),
      });
      setResult({ conflictId: res.conflictId, joinCode: res.joinCode });
      setStep(4);
    } catch (error) {
      console.error("Failed to create conflict:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    if (result) {
      navigator.clipboard.writeText(result.joinCode);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 sm:mb-12"
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 sm:gap-3">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                  step >= s
                    ? "bg-purple-600 text-white"
                    : "bg-white/5 text-white/30"
                }`}
              >
                {step > s ? <Check size={14} /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-8 sm:w-12 h-0.5 rounded-full transition-all ${
                    step > s ? "bg-purple-600" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: Category */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
              What type of conflict?
            </h2>
            <p className="text-sm text-white/40 text-center mb-6 sm:mb-8">
              This helps us ask the right questions
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    setStep(2);
                  }}
                  className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all text-left ${
                    category === cat.id
                      ? "bg-purple-500/20 border-purple-500/50"
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <cat.icon
                    className={`mb-2 sm:mb-3 ${
                      category === cat.id ? "text-purple-400" : "text-white/40"
                    }`}
                    size={22}
                  />
                  <h3 className="text-sm sm:text-base font-semibold text-white">{cat.label}</h3>
                  <p className="text-[10px] sm:text-xs text-white/40 mt-0.5">{cat.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Title */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
              Give it a title
            </h2>
            <p className="text-sm text-white/40 text-center mb-6 sm:mb-8">
              A brief name for this conflict (only you will see this)
            </p>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chores disagreement, Project deadline conflict"
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-sm sm:text-base text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] transition-all mb-6 sm:mb-8"
              autoFocus
            />

            <div className="flex items-center justify-between gap-3">
              <motion.button
                onClick={() => setStep(1)}
                className="px-4 sm:px-5 py-2.5 sm:py-3 text-white/60 font-medium rounded-xl flex items-center gap-2 hover:text-white transition-all text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft size={18} />
                Back
              </motion.button>
              <motion.button
                onClick={() => setStep(3)}
                disabled={!title.trim()}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-purple-600 text-white font-medium rounded-xl flex items-center gap-2 hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue
                <ArrowRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Description */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
              Describe the situation
            </h2>
            <p className="text-sm text-white/40 text-center mb-6 sm:mb-8">
              A neutral overview that all parties will see
            </p>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what the conflict is about without taking sides..."
              rows={4}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-sm sm:text-base text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] transition-all resize-none mb-6 sm:mb-8"
            />

            <div className="flex items-center justify-between gap-3">
              <motion.button
                onClick={() => setStep(2)}
                className="px-4 sm:px-5 py-2.5 sm:py-3 text-white/60 font-medium rounded-xl flex items-center gap-2 hover:text-white transition-all text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft size={18} />
                Back
              </motion.button>
              <motion.button
                onClick={handleCreate}
                disabled={isLoading}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl flex items-center gap-2 hover:from-purple-500 hover:to-purple-600 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20 text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Conflict
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 4 && result && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <Check className="text-green-400" size={32} />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Conflict Created!</h2>
            <p className="text-sm text-white/40 mb-6 sm:mb-8">
              Share this code with the other parties
            </p>

            <motion.div
              className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs sm:text-sm text-white/40 mb-3">Join Code</p>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-widest mb-4">
                {result.joinCode}
              </div>
              <motion.button
                onClick={copyCode}
                className="px-4 sm:px-5 py-2.5 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Copy Code
              </motion.button>
            </motion.div>

            <motion.button
              onClick={() => onNavigate({ type: "conflict", conflictId: result.conflictId })}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/20 text-sm mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Go to Conflict Room
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
