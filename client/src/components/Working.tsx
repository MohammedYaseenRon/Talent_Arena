import { motion } from "framer-motion";
import { ClipboardList, Code2, Trophy } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Create a Challenge",
    description: "Define the task, required features, and upload design references. Set a time limit.",
  },
  {
    icon: Code2,
    step: "02",
    title: "Candidates Code Live",
    description: "They build in a browser-based IDE — no local setup, no excuses. Just real code.",
  },
  {
    icon: Trophy,
    step: "03",
    title: "AI Ranks Everyone",
    description: "Submissions are evaluated and ranked instantly across requirements, quality, and features.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-glow-hero opacity-50 pointer-events-none" />
      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">
            From Challenge to Hire <span className="text-gradient-primary">— In Minutes</span>
          </h2>
          <p className="text-muted-foreground text-lg font-serif">Three steps. Zero friction.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            className="relative text-center rounded-2xl border border-border bg-card/50 backdrop-blur-md p-8 transition-all hover:border-primary/30"            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary border border-border mb-6">
                <step.icon className="w-7 h-7 text-orange-400" />
              </div>
              <span className="block text-sm font-mono text-gray-500 mb-2">{step.step}</span>
              <h3 className="text-xl font-semibold mb-3 font-serif">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-serif">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
