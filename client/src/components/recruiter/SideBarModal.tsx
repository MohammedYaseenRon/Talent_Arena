"use client";

import { AttemptChallenge } from "@/types";
import {
  Info,
  FileText,
  Code,
  List,
  Lightbulb,
  Globe,
  Paintbrush,
  Upload,
  Wrench,
} from "lucide-react";

export function ChallengeSidebar({ challenge }: { challenge: AttemptChallenge }) {
  const difficultyColor: Record<string, string> = {
    easy: "bg-green-500/20 text-green-400 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    hard: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const { content } = challenge;

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 border-r border-gray-700 overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
        <FileText size={16} className="text-yellow-400" />
        <span className="text-sm font-medium text-gray-200">Challenge Details</span>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4 flex-1">


        <div>
          <h2 className="text-base font-bold text-white leading-tight">
            {challenge.title}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-xs px-2 py-0.5 rounded border ${
                difficultyColor[challenge.difficulty.toLowerCase()] ?? difficultyColor.medium
              }`}
            >
              {challenge.difficulty.toUpperCase()}
            </span>
            <span className="text-xs px-2 py-0.5 rounded border bg-blue-500/20 text-blue-400 border-blue-500/30">
              {challenge.challengeType}
            </span>
          </div>
        </div>

        {challenge.description && (
          <Section icon={<Info size={14} />} label="Description">
            <p className="text-sm text-gray-300 leading-relaxed">
              {challenge.description}
            </p>
          </Section>
        )}

        <Section icon={<FileText size={14} />} label="Task Description">
          <p className="text-sm text-gray-300 leading-relaxed">
            {content.taskDescription}
          </p>
        </Section>

        {content.features && (
          <Section icon={<List size={14} />} label="Features">
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {content.features}
            </p>
          </Section>
        )}

        {content.optionalRequirements && (
          <Section icon={<Lightbulb size={14} />} label="Optional Requirements">
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {content.optionalRequirements}
            </p>
          </Section>
        )}

        {content.apiDetails && (
          <Section icon={<Globe size={14} />} label="API Details">
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {content.apiDetails}
            </p>
          </Section>
        )}

        {/* Design Reference Images */}
        {content.designImages && content.designImages.length > 0 && (
          <Section icon={<Paintbrush size={14} />} label="Design Reference">
            <div className="flex flex-col gap-2">
              {content.designImages.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="relative overflow-hidden border border-gray-700 rounded">
                    <img
                      src={url}
                      alt={`Design reference ${i + 1}`}
                      className="w-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <span className="text-xs font-mono text-white bg-black/60 px-2 py-1 rounded">
                        Open full size ↗
                      </span>
                    </div>
                    <span className="absolute bottom-1 left-1 text-xs font-mono text-white/60 bg-black/50 px-1.5 py-0.5 rounded">
                      {i + 1} / {content.designImages?.length}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* Tech Constraints */}
        {content.techConstraints && (
          <Section icon={<Wrench size={14} />} label="Tech Constraints">
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {content.techConstraints}
            </p>
          </Section>
        )}

        {/* Allowed Languages */}
        {content.allowedLanguages && content.allowedLanguages.length > 0 && (
          <Section icon={<Code size={14} />} label="Allowed Languages">
            <div className="flex flex-wrap gap-2">
              {content.allowedLanguages.map((lang) => (
                <span
                  key={lang}
                  className="text-xs px-2 py-0.5 rounded border bg-purple-500/20 text-purple-400 border-purple-500/30"
                >
                  {lang}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Submission Instructions — always shown */}
        <Section icon={<Upload size={14} />} label="Submission Instructions">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {content.submissionInstructions}
          </p>
        </Section>

        {/* Starter Code */}
        {content.starterCode && (
          <Section icon={<Code size={14} />} label="Starter Code">
            <pre className="text-xs text-gray-300 bg-gray-950 rounded p-2 overflow-x-auto border border-gray-700">
              {content.starterCode}
            </pre>
          </Section>
        )}

      </div>
    </div>
  );
}

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
      <div className="flex items-center gap-2 mb-1.5 text-gray-400">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      {children}
    </div>
  );
}