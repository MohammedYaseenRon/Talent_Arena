import { Box } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden dark:bg-black flex items-center justify-center px-6">
      <div className="relative z-10 flex flex-col items-center text-center max-w-6xl gap-10">
        
        {/* Badge */}
        <div className="bg-white/10 backdrop-blur flex items-center gap-3 rounded-full px-5 py-2 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4" />
            <span>Talent</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-serif text-[56px] leading-[1.05] tracking-tight dark:text-white md:text-[88px] 2xl:text-[100px]">
          Future of Recruting Is <br /> Run by Talent_Arena
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-center text-lg md:text-xl dark:text-white/70 leading-relaxed">
          An interactive hiring playground where candidates compete in challenges and recruiters discover top talent using performance insights.
        </p>

        {/* CTA */}
        <button className="mt-6 rounded-full bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-medium dark:hover:bg-white/90 transition">
          Request
        </button>
      </div>
    </section>
  );
};

export default Hero;
