"use client";

import { useScroll, useTransform, motion } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type ParallaxScrollProps = {
  items: React.ReactNode[]; // ✅ accepts any JSX (cards, components, etc.)
  className?: string;
};

export const ParallaxScroll = ({ items, className }: ParallaxScrollProps) => {
  const gridRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    container: gridRef,
    offset: ["start start", "end start"],
  });

  // 🎯 Parallax movements
  const translateFirst = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const translateThird = useTransform(scrollYProgress, [0, 1], [0, -200]);

  // 📦 Split into 3 columns
  const third = Math.ceil(items.length / 3);
  const firstPart = items.slice(0, third);
  const secondPart = items.slice(third, 2 * third);
  const thirdPart = items.slice(2 * third);

  return (
    <div
      ref={gridRef}
      className={cn("h-[100rem] w-full overflow-y-auto", className)}
    >
      <div>
        
        {/* Column 1 */}
        <div className="grid gap-10">
          {firstPart.map((el, idx) => (
            <motion.div key={`col1-${idx}`} style={{ y: translateFirst }}>
              {el}
            </motion.div>
          ))}
        </div>

        {/* Column 2 */}
        <div className="grid gap-10">
          {secondPart.map((el, idx) => (
            <motion.div key={`col2-${idx}`} style={{ y: translateSecond }}>
              {el}
            </motion.div>
          ))}
        </div>

        {/* Column 3 */}
        <div className="grid gap-10">
          {thirdPart.map((el, idx) => (
            <motion.div key={`col3-${idx}`} style={{ y: translateThird }}>
              {el}
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};