import { motion } from "framer-motion";
import { Brain, Zap, Search, Clock, Monitor, FileText } from "lucide-react";

const recruiterFeatures = [
  {
    icon: Brain,
    title: "AI Evaluation",
    description: "Detailed breakdowns across multiple scoring dimensions",
  },
  {
    icon: Zap,
    title: "Live Leaderboard",
    description: "Real-time ranking updates as candidates submit",
  },
  {
    icon: Search,
    title: "Code Review",
    description: "Browse candidate code with live preview in a read-only editor",
  },
  {
    icon: Clock,
    title: "Automated Lifecycle",
    description: "Sessions flow from Scheduled → Live → Ended automatically",
  },
];

const candidateFeatures = [
  {
    icon: Monitor,
    title: "In-Browser IDE",
    description: "No downloads, no setup — just open and code",
  },
  {
    icon: Clock,
    title: "Auto-Submit Timer",
    description: "Live coding with clear time constraints",
  },
  {
    icon: FileText,
    title: "Clear Instructions",
    description: "Smooth flow with well-structured challenge briefs",
  },
  {
    icon: Brain,
    title: "Instant Results",
    description: "AI feedback and scores delivered immediately",
  },
];

const Features = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 font-serif">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to bg-clip-text text-transparent to-emerald-300">Evaluate Developers</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500"></span>
              For Recruiters
            </h3>

            <div className="space-y-5">
              {recruiterFeatures.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 p-7 rounded-xl border border-border bg-card/50 backdrop-blur-md transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              For Candidates
            </h3>

            <div className="space-y-5">
              {candidateFeatures.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 p-7 rounded-xl border border-border bg-card/50 backdrop-blur-md transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;