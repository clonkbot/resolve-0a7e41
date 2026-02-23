import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Plus, Clock, CheckCircle, Users, ArrowRight } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

type View =
  | { type: "landing" }
  | { type: "dashboard" }
  | { type: "create" }
  | { type: "join"; code?: string }
  | { type: "conflict"; conflictId: string };

interface DashboardProps {
  onNavigate: (view: View) => void;
}

const categoryLabels: Record<string, string> = {
  couple: "Couple",
  roommates: "Roommates",
  colleagues: "Work",
  friends: "Friends",
  other: "Other",
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  gathering: { label: "Gathering Perspectives", color: "text-amber-400", icon: Clock },
  analyzing: { label: "Analyzing", color: "text-blue-400", icon: Users },
  resolved: { label: "Resolved", color: "text-green-400", icon: CheckCircle },
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const conflicts = useQuery(api.conflicts.listMyConflicts);

  if (conflicts === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded-lg w-48" />
          <div className="h-24 bg-white/5 rounded-xl" />
          <div className="h-24 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Conflicts</h1>
          <p className="text-sm text-white/40 mt-1">Track and manage your mediation sessions</p>
        </div>
        <motion.button
          onClick={() => onNavigate({ type: "create" })}
          className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/20 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          New Conflict
        </motion.button>
      </motion.div>

      {conflicts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 sm:py-20"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <span className="text-3xl sm:text-4xl">⚖️</span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">No conflicts yet</h2>
          <p className="text-sm text-white/40 mb-6 sm:mb-8 max-w-sm mx-auto">
            Start your first conflict resolution or join an existing one with a code
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              onClick={() => onNavigate({ type: "create" })}
              className="w-full sm:w-auto px-5 py-3 bg-purple-600 text-white font-medium rounded-xl text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Conflict
            </motion.button>
            <motion.button
              onClick={() => onNavigate({ type: "join" })}
              className="w-full sm:w-auto px-5 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Join with Code
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {conflicts.map((conflict: { _id: string; title: string; category: string; status: string; myRole: string; participantCount: number; submittedCount: number; hasSubmitted: boolean }, index: number) => {
            const status = statusConfig[conflict.status] || statusConfig.gathering;
            const StatusIcon = status.icon;

            return (
              <motion.button
                key={conflict._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() =>
                  onNavigate({ type: "conflict", conflictId: conflict._id as string })
                }
                className="w-full p-4 sm:p-6 bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl hover:bg-white/[0.05] hover:border-white/20 transition-all text-left group"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-[10px] sm:text-xs bg-purple-500/20 text-purple-300 rounded-full">
                        {categoryLabels[conflict.category]}
                      </span>
                      <span className="text-[10px] sm:text-xs text-white/30">
                        {conflict.myRole}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-white truncate mb-1">
                      {conflict.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/40">
                      <span className={`flex items-center gap-1 ${status.color}`}>
                        <StatusIcon size={14} />
                        {status.label}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {conflict.submittedCount}/{conflict.participantCount} submitted
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    {!conflict.hasSubmitted && conflict.status === "gathering" && (
                      <span className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-amber-500/20 text-amber-300 rounded-full">
                        Action needed
                      </span>
                    )}
                    <ArrowRight
                      size={20}
                      className="text-white/20 group-hover:text-white/50 transition-colors hidden sm:block"
                    />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
