import { Box } from "lucide-react";
import { ContainerScroll } from "./ui/container-scroll-animation";
import Image from "next/image";
import { GradientButton } from "./ui/GradientButton";

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden dark:bg-black flex flex-col items-center justify-start pt-30 lg:pt-10 px-6">
      <ContainerScroll
        titleComponent={
          <div className="relative z-20 flex flex-col items-center text-center w-full max-w-5xl mx-auto gap-6 pb-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2 rounded-full px-5 py-2 text-sm text-white/70">
              <Box className="w-4 h-4 text-orange-400" />
              <span className="tracking-wide uppercase text-xs font-medium">Talent Arena</span>
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
    </section>
  );
};

export default Hero;