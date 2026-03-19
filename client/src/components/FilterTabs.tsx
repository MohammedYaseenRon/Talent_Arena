import { Submission, FilterType } from "../types/index.js";

const STATUS_LABELS: Record<Exclude<FilterType, "ALL">, string> = {
  EVALUATED: "Evaluated",
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  REGISTERED: "Registered",
};

interface FilterTabsProps {
  filter: FilterType;
  onChange: (f: FilterType) => void;
  submissions: Submission[];
  total: number;
}

export function FilterTabs({ filter, onChange, submissions, total }: FilterTabsProps) {
  const tabs: FilterType[] = ["ALL", "EVALUATED", "PENDING", "IN_PROGRESS", "REGISTERED"];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((f) => {
        const count =
          f === "ALL" ? total : submissions.filter((s) => s.status === f).length;
        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              filter === f
                ? "bg-white/[0.08] text-white border border-white/15"
                : "text-zinc-500 border border-transparent hover:text-zinc-300"
            }`}
          >
            {f === "ALL" ? "All" : STATUS_LABELS[f]}
            <span className="bg-white/5 text-zinc-500 text-[10px] px-1.5 py-0.5 rounded-full">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}