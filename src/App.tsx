import { useConvexAuth } from "convex/react";
import { useState } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { CreateConflict } from "./components/CreateConflict";
import { JoinConflict } from "./components/JoinConflict";
import { ConflictRoom } from "./components/ConflictRoom";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu, X, Home } from "lucide-react";

type View =
  | { type: "landing" }
  | { type: "dashboard" }
  | { type: "create" }
  | { type: "join"; code?: string }
  | { type: "conflict"; conflictId: string };

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [view, setView] = useState<View>({ type: "landing" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-white/60 font-light">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleNavigate = (newView: View) => {
    setView(newView);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <motion.button
            onClick={() => handleNavigate({ type: "landing" })}
            className="flex items-center gap-2 sm:gap-3 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
              <span className="text-base sm:text-lg">⚖️</span>
            </div>
            <span className="text-lg sm:text-xl font-semibold tracking-tight">Resolve</span>
          </motion.button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNavigate({ type: "dashboard" })}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              My Conflicts
            </button>
            <button
              onClick={() => handleNavigate({ type: "create" })}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              New Conflict
            </button>
            <button
              onClick={() => handleNavigate({ type: "join" })}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Join
            </button>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                <button
                  onClick={() => handleNavigate({ type: "landing" })}
                  className="flex items-center gap-3 px-4 py-3 text-left text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Home size={18} />
                  Home
                </button>
                <button
                  onClick={() => handleNavigate({ type: "dashboard" })}
                  className="flex items-center gap-3 px-4 py-3 text-left text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  My Conflicts
                </button>
                <button
                  onClick={() => handleNavigate({ type: "create" })}
                  className="flex items-center gap-3 px-4 py-3 text-left text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  New Conflict
                </button>
                <button
                  onClick={() => handleNavigate({ type: "join" })}
                  className="flex items-center gap-3 px-4 py-3 text-left text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Join Conflict
                </button>
                <div className="border-t border-white/10 my-2" />
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-left text-white/40 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-16">
        <AnimatePresence mode="wait">
          {view.type === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LandingPage onNavigate={handleNavigate} />
            </motion.div>
          )}
          {view.type === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Dashboard onNavigate={handleNavigate} />
            </motion.div>
          )}
          {view.type === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CreateConflict onNavigate={handleNavigate} />
            </motion.div>
          )}
          {view.type === "join" && (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <JoinConflict initialCode={view.code} onNavigate={handleNavigate} />
            </motion.div>
          )}
          {view.type === "conflict" && (
            <motion.div
              key="conflict"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ConflictRoom conflictId={view.conflictId} onNavigate={handleNavigate} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 sm:py-4 bg-[#0a0a0a]/80 backdrop-blur-sm border-t border-white/5">
        <p className="text-center text-[10px] sm:text-xs text-white/30">
          Requested by <span className="text-purple-400/50">@andreisilver89</span> · Built by <span className="text-purple-400/50">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}
