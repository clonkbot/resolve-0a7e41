import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, User } from "lucide-react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError("Could not continue as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-900/30 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12 text-center"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center shadow-xl shadow-purple-500/20">
            <span className="text-3xl sm:text-4xl">⚖️</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">Resolve</h1>
          <p className="text-sm sm:text-base text-white/40 max-w-xs mx-auto">Find peace through understanding</p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm sm:max-w-md"
        >
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-semibold mb-1 sm:mb-2 text-white">
              {flow === "signIn" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-xs sm:text-sm text-white/40 mb-6 sm:mb-8">
              {flow === "signIn"
                ? "Sign in to access your conflicts"
                : "Join to start resolving conflicts"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    required
                    className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-sm sm:text-base text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] transition-all"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    minLength={6}
                    className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-sm sm:text-base text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] transition-all"
                  />
                </div>
              </div>

              <input name="flow" type="hidden" value={flow} />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs sm:text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:from-purple-500 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 text-sm sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {flow === "signIn" ? "Sign In" : "Create Account"}
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="my-6 sm:my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <motion.button
              onClick={handleAnonymous}
              disabled={isLoading}
              className="w-full py-3 sm:py-4 bg-white/5 border border-white/10 text-white/70 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <User size={18} />
              Continue as Guest
            </motion.button>

            <p className="mt-6 text-center text-xs sm:text-sm text-white/40">
              {flow === "signIn" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                {flow === "signIn" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-[10px] sm:text-xs text-white/30">
          Requested by <span className="text-purple-400/50">@andreisilver89</span> · Built by <span className="text-purple-400/50">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}
