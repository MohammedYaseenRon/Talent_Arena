import { Box } from "lucide-react";
import { ContainerScroll } from "./ui/container-scroll-animation";
import Image from "next/image";
import { GradientButton } from "./ui/GradientButton";
import { Brain, Code2, BarChart3, Zap } from "lucide-react";
import { motion } from "framer-motion";

const featureCards = [
  {
    icon: Brain,
    title: "AI evaluates instantly",
    description:
      "No waiting hours — get scores, feedback, and rankings the moment time ends.",
  },
  {
    icon: Code2,
    title: "Real code, not MCQs",
    description:
      "Candidates write actual working code in a browser-based IDE environment.",
  },
  {
    icon: BarChart3,
    title: "Structured insights",
    description:
      "Get detailed feedback, scores, and multi-dimensional analysis on every submission.",
  },
  {
    icon: Zap,
    title: "Live leaderboards",
    description:
      "Watch rankings update in real-time as candidates submit their solutions.",
  },
];

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden dark:bg-black flex flex-col items-center justify-start pt-30 lg:pt-10 px-6">
      <ContainerScroll
        titleComponent={
          <div className="relative z-20 flex flex-col items-center text-center w-full max-w-5xl mx-auto gap-6 pb-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2 rounded-full px-5 py-2 text-sm text-white/70">
              <Box className="w-4 h-4 text-orange-400" />
              <span className="tracking-wide uppercase text-xs font-medium">
                Talent Arena
              </span>
            </div>

            <h1 className="font-serif font-medium text-[56px] sm:text-[68px] md:text-[90px] leading-[1.05] tracking-tight dark:text-white text-gray-900">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
                Recruiting
              </span>{" "}
              Is Here
            </h1>

            <p className="max-w-2xl text-center text-lg md:text-xl dark:text-white/60 text-gray-500 leading-relaxed mt-2">
              An interactive hiring playground where candidates compete in
              challenges and recruiters discover top talent using performance
              insights.
            </p>

            <div className="mt-2">
              <GradientButton variant="orange" size="lg" text="Get Started" />
            </div>
          </div>
        }
      >
        <Image
          src={`/review.png`}
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
        />
      </ContainerScroll>
      <div className="py-16">
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">
              Hiring Should Be{" "}
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-300 bg-clip-text text-transparent">
                Fast, Fair & Data-Driven
              </span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((features, i) => (
              <motion.div
                key={features.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="rounded-2xl border border-border bg-card/50 backdrop-blur-md p-6 transition-all hover:shadow-[0_0_60px_-12px_rgba(168,85,247,0.4)]"                
                >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary border border-border mb-6">
                  <features.icon className="w-7 h-7 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-serif">
                  {features.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-serif">
                  {features.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
