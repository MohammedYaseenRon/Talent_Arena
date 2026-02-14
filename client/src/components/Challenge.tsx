"use client";

import React, { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Trophy, Clock, Users, Zap, Target, Shield } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type ChallengeStatus = "ACTIVE" | "UPCOMING" | "COMPLETED";

export interface Challenge {
  id: string;
  title: string;
  company: string;
  description: string;
  difficulty: Difficulty;
  duration: string;
  participants: number;
  rewards: number;
  status: ChallengeStatus;
}

export const challengeList: Challenge[] = [
  {
    id: "ch_001",
    title: "JavaScript Fundamentals Challenge",
    company: "Google",
    description: "Test your JavaScript basics with real-world coding tasks.",
    difficulty: "Beginner",
    duration: "10 Days",
    participants: 1450,
    rewards: 200,
    status: "ACTIVE",
  },
  {
    id: "ch_002",
    title: "React UI Engineering Challenge",
    company: "Meta",
    description: "Build clean, reusable UI components using React.",
    difficulty: "Intermediate",
    duration: "7 Days",
    participants: 980,
    rewards: 350,
    status: "ACTIVE",
  },
  {
    id: "ch_003",
    title: "Frontend Styling Challenge",
    company: "Netflix",
    description: "Create responsive and visually polished UI layouts.",
    difficulty: "Beginner",
    duration: "5 Days",
    participants: 720,
    rewards: 180,
    status: "ACTIVE",
  },
  {
    id: "ch_004",
    title: "API Integration Sprint",
    company: "Amazon",
    description: "Consume and manage APIs efficiently in frontend apps.",
    difficulty: "Intermediate",
    duration: "6 Days",
    participants: 640,
    rewards: 320,
    status: "ACTIVE",
  },
  {
    id: "ch_005",
    title: "Data Structures Speed Run",
    company: "Microsoft",
    description: "Solve core DSA problems under time pressure.",
    difficulty: "Advanced",
    duration: "5 Days",
    participants: 510,
    rewards: 500,
    status: "ACTIVE",
  },
  {
    id: "ch_006",
    title: "TypeScript Reliability Challenge",
    company: "Stripe",
    description: "Write type-safe, scalable TypeScript code.",
    difficulty: "Intermediate",
    duration: "8 Days",
    participants: 430,
    rewards: 400,
    status: "UPCOMING",
  },
  {
    id: "ch_007",
    title: "Authentication & Security Basics",
    company: "Auth0",
    description: "Implement secure authentication flows correctly.",
    difficulty: "Advanced",
    duration: "7 Days",
    participants: 390,
    rewards: 600,
    status: "UPCOMING",
  },
  {
    id: "ch_008",
    title: "Next.js Routing Challenge",
    company: "Vercel",
    description: "Master routing, layouts, and data fetching in Next.js.",
    difficulty: "Intermediate",
    duration: "6 Days",
    participants: 560,
    rewards: 420,
    status: "ACTIVE",
  },
  {
    id: "ch_009",
    title: "Git & Collaboration Workflow",
    company: "GitHub",
    description: "Practice real-world Git and GitHub collaboration.",
    difficulty: "Beginner",
    duration: "4 Days",
    participants: 1200,
    rewards: 150,
    status: "ACTIVE",
  },
  {
    id: "ch_010",
    title: "Full-Stack Mini Project",
    company: "Startup Studio",
    description: "Build and deploy a complete mini product end-to-end.",
    difficulty: "Advanced",
    duration: "14 Days",
    participants: 310,
    rewards: 800,
    status: "UPCOMING",
  },
];

const getDifficultyColor = (difficulty: Difficulty) => {
  switch (difficulty) {
    case "Beginner":
      return "text-green-400 bg-green-400/10 border-green-400/30";
    case "Intermediate":
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    case "Advanced":
      return "text-red-400 bg-red-400/10 border-red-400/30";
  }
};

const getStatusColor = (status: ChallengeStatus) => {
  switch (status) {
    case "ACTIVE":
      return "text-green-400 bg-green-400/20";
    case "UPCOMING":
      return "text-blue-400 bg-blue-400/20";
    case "COMPLETED":
      return "text-gray-400 bg-gray-400/20";
  }
};

const Challenge = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | "All"
  >("All");
  const [selectedStatus, setSelectedStatus] = useState<ChallengeStatus | "All">(
    "All",
  );

  const filteredChallenges = challengeList.filter((challenge) => {
    const matchesDifficulty =
      selectedDifficulty === "All" ||
      challenge.difficulty === selectedDifficulty;
    const matchesStatus =
      selectedStatus === "All" || challenge.status === selectedStatus;
    return matchesDifficulty && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-black p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-8 h-8 text-purple-400" />
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            ACTIVE CHALLENGES
          </h1>
        </div>
        <p className="text-slate-400 text-sm font-mono ml-11">
          Choose your battle and prove your skills
        </p>
      </div>
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <Select
          value={selectedDifficulty}
          onValueChange={(e) => setSelectedDifficulty(e as Difficulty | "All")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={selectedStatus}
          onValueChange={(e) => setSelectedStatus(e as ChallengeStatus | "All")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="UPCOMING">Completed</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      '{/* Challenge Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-1 gap-4">
        {filteredChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className="group relative backdrop-blur border border-gray-900 rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:secondary/100 cursor-pointer"
          >
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-xs font-bold px-2 py-1 rounded font-mono ${getStatusColor(
                  challenge.status,
                )}`}
              >
                {challenge.status}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded border font-mono ${getDifficultyColor(
                    challenge.difficulty,
                  )}`}
                >
                  {challenge.difficulty}
                </span>
                <span className="shrink-0 text-muted-foreground transition-transform duration-300">
                  →
                </span>
              </div>
            </div>

            {/* Title & Company */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors line-clamp-2">
                  {challenge.title}
                  <span className="text-sm pl-3 text-slate-500 font-mono mb-3">
                    by {challenge.company}
                  </span>
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                  {challenge.description}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-slate-300 font-mono">
                    {challenge.duration}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-slate-300 font-mono">
                    {challenge.participants}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-slate-300 font-mono">
                    {challenge.rewards}
                  </span>
                </div>
              </div>
            </div>
            {/* Hover Effect Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/5 group-hover:to-blue-600/5 rounded-lg transition-all duration-300 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Challenge;
