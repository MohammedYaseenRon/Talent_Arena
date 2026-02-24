"use client";

import { Calendar, Users, Tag, Info, FileText } from "lucide-react";

interface Challenge {
  title: string;
  difficulty: string;
  challengeType: string;
  description: string;
  createdAt: string;
  tags: string[];
  candidates: number;
}

export function ChallengeSidebar({ challenge }: { challenge: Challenge }) {
  const difficultyColor: Record<string, string> = {
    easy: "bg-green-500/20 text-green-400 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    hard: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 border-r border-gray-700 overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
        <FileText size={16} className="text-yellow-400" />
        <span className="text-sm font-medium text-gray-200">
          Challenge Details
        </span>
      </div>

      <div className="px-4 py-4 flex flex-col gap-5 flex-1">
        <div>
          <h2 className="text-base font-bold text-white leading-tight">
            {challenge.title}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-xs px-2 py-0.5 rounded border ${difficultyColor[challenge.difficulty.toLowerCase()] || difficultyColor.medium}`}
            >
              {challenge.difficulty.toUpperCase()}
            </span>
            <span className="text-xs px-2 py-0.5 rounded border bg-blue-500/20 text-blue-400 border-blue-500/30">
              {challenge.challengeType}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-1.5">
            <Info size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Description
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {challenge.description}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Created
            </span>
          </div>
          <p className="text-sm text-gray-200">
            {formatDate(challenge.createdAt)}
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Candidates
            </span>
          </div>
          <p className="text-sm text-gray-200">
            {challenge.candidates} assigned
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Tags
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {challenge.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 border border-gray-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}