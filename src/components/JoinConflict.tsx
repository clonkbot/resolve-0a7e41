import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Link, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

type View =
  | { type: "landing" }
  | { type: "dashboard" }
  | { type: "create" }
  | { type: "join"; code?: string }
  | { type: "conflict"; conflictId: string };

interface JoinConflictProps {
  initialCode?: string;
  onNavigate: (view: View) => void;
}

export function JoinConflict({ initialCode = "", onNavigate }: JoinConflictProps) {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = useMutation(api.conflicts.join);
  const preview = useQuery(
    api.conflicts.getByJoinCode,
    code.length === 6 ? { joinCode: code } : "skip"
  );

  const handleJoin = async () => {
    if (code.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await join({ joinCode: code });
      onNavigate({ type: "conflict", conflictId: result.conflictId as string });
    } catch (err: any) {
      setError(err.message || "Could not join conflict");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setCode(cleaned);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-12"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-2xl bg-purple-500/20 flex items-center justify-center">
          <Link className="text-purple-400" size={26} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Join a Conflict</h1>
        <p className="text-sm text-white/40">Enter the 6-character code shared with you</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8"
      >
        {/* Code Input */}
        <div className="mb-6">
          <label className="block text-xs sm:text-sm text-white/40 mb-3 text-center">Join Code</label>
          <div className="flex justify-center gap-1.5 sm:gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-10 h-12 sm:w-12 sm:h-14 rounded-lg sm:rounded-xl border flex items-center justify-center text-xl sm:text-2xl font-mono font-bold transition-all ${
                  code[i]
                    ? "bg-purple-500/20 border-purple-500/50 text-white"
                    : "bg-white/5 border-white/10 text-white/20"
                }`}
              >
                {code[i] || "·"}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="sr-only"
            autoFocus
          />
          {/* Visible input for mobile */}
          <input
            type="text"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="Enter code"
            className="w-full mt-4 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-center text-lg font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-all uppercase tracking-widest"
            maxLength={6}
          />
        </div>

        {/* Preview */}
        <AnimatePresence mode="wait">
          {code.length === 6 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              {preview === undefined ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : preview === null ? (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
                  <p className="text-sm text-red-300">Invalid code. Please check and try again.</p>
                </div>
              ) : (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-400 flex-shrink-0" size={18} />
                    <p className="text-sm text-green-300">Conflict found!</p>
                  </div>
                  <p className="text-white font-medium">{preview.title}</p>
                  <p className="text-xs text-white/40 mt-1 capitalize">{preview.category} conflict</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Join Button */}
        <motion.button
          onClick={handleJoin}
          disabled={code.length !== 6 || !preview || isLoading}
          className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:from-purple-500 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 text-sm sm:text-base"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Join Conflict
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Help Text */}
      <p className="text-center text-xs text-white/30 mt-6 px-4">
        Ask the person who created the conflict for the join code. It's a 6-character code like "ABC123".
      </p>
    </div>
  );
}
