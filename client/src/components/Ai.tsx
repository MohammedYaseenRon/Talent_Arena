// data/aiFeatures.ts
import { CheckCircle, Layers, TrendingUp, Brain } from "lucide-react";
import { motion } from "framer-motion";


const aiFeatures = [
  {
    icon: CheckCircle,
    title: "Code quality analysis",
  },
  {
    icon: Layers,
    title: "Feature completion tracking",
  },
  {
    icon: TrendingUp,
    title: "Strengths & improvement insights",
  },
  {
    icon: Brain,
    title: "Multi-dimensional scoring",
  },
];

const AISection = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto text-center">

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-bold font-serif mb-4"
        >
          Powered by{" "}
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-300 bg-clip-text text-transparent">
            AI
          </span>
          . Built for Accuracy.
        </motion.h2>

        <p className="text-muted-foreground text-lg mb-12">
          Our AI doesn &&’ t just score — it{" "}
          <span className="text-foreground font-medium">understands</span> code.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {aiFeatures.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card/50 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_50px_rgba(34,197,94,0.2)]"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-orange-400">
                <item.icon className="w-5 h-5" />
              </div>

              <p className="text-lg font-medium text-foreground">
                {item.title}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AISection;