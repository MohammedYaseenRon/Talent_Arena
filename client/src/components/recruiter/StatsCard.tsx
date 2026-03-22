"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  icon: LucideIcon;
  value: string;
  change?: string;
}

const StatsCard = ({ title, icon: Icon, value, change }: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white dark:bg-slate-900/50 rounded-xl p-5 border border-gray-300 dark:border-gray-900 hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p>{title}</p>

          <p className="text-2xl font-bold text-foreground mt-1 font-mono">
            {value}
          </p>

          {change && <p>{change}</p>}
        </div>

        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>

      </div>
    </motion.div>
  );
};

export default StatsCard;