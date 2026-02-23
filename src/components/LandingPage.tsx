import { motion } from "framer-motion";
import { Heart, Home, Briefcase, Users, Plus, Link, ArrowRight } from "lucide-react";

type View =
  | { type: "landing" }
  | { type: "dashboard" }
  | { type: "create" }
  | { type: "join"; code?: string }
  | { type: "conflict"; conflictId: string };

interface LandingPageProps {
  onNavigate: (view: View) => void;
}

const categories = [
  {
    id: "couple",
    label: "Couple",
    icon: Heart,
    description: "Relationship disagreements",
    color: "from-pink-500/20 to-purple-500/20",
    borderColor: "border-pink-500/30",
    iconColor: "text-pink-400",
  },
  {
    id: "roommates",
    label: "Roommates",
    icon: Home,
    description: "Living space conflicts",
    color: "from-blue-500/20 to-purple-500/20",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
  },
  {
    id: "colleagues",
    label: "Work Colleagues",
    icon: Briefcase,
    description: "Professional disputes",
    color: "from-amber-500/20 to-purple-500/20",
    borderColor: "border-amber-500/30",
    iconColor: "text-amber-400",
  },
  {
    id: "friends",
    label: "Friends",
    icon: Users,
    description: "Friendship issues",
    color: "from-green-500/20 to-purple-500/20",
    borderColor: "border-green-500/30",
    iconColor: "text-green-400",
  },
];

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col relative">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-32 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-40 -right-32 w-80 h-80 bg-purple-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12 relative z-10">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-block mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500/10 border border-purple-500/20 rounded-full"
          >
            <span className="text-xs sm:text-sm text-purple-300">AI-Powered Mediation</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
            <span className="text-white">Resolve conflicts</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
              with understanding
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/50 max-w-xl mx-auto mb-8 sm:mb-12 px-4">
            Share your perspective privately. Our AI analyzes all sides fairly and suggests balanced solutions for everyone.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <motion.button
              onClick={() => onNavigate({ type: "create" })}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/20 text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={18} />
              Start a Conflict
            </motion.button>
            <motion.button
              onClick={() => onNavigate({ type: "join" })}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link size={18} />
              Join with Code
            </motion.button>
          </div>
        </motion.section>

        {/* Categories Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-center text-white/40 text-xs sm:text-sm uppercase tracking-widest mb-6 sm:mb-8">
            What type of conflict?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {categories.map((cat, index) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => onNavigate({ type: "create" })}
                className={`group relative overflow-hidden p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.borderColor} hover:border-white/20 transition-all duration-300 text-left`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 sm:p-3 rounded-lg bg-black/20 ${cat.iconColor}`}>
                    <cat.icon size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{cat.label}</h3>
                    <p className="text-xs sm:text-sm text-white/50">{cat.description}</p>
                  </div>
                  <ArrowRight className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" size={20} />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* How it Works */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 sm:mt-24"
        >
          <h2 className="text-center text-white/40 text-xs sm:text-sm uppercase tracking-widest mb-8 sm:mb-12">
            How it works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Create & Share",
                description: "Start a conflict ticket and share the unique code with all parties involved",
              },
              {
                step: "02",
                title: "Share Perspectives",
                description: "Each person privately shares their side - no one sees others' responses",
              },
              {
                step: "03",
                title: "Get Resolution",
                description: "AI analyzes all perspectives fairly and suggests balanced solutions",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="inline-block mb-3 sm:mb-4 text-3xl sm:text-4xl font-bold text-purple-500/30">
                  {item.step}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-white/40">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
