"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Users,
  Trophy,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Swords,
  Code,
  Target,
  Zap,
} from "lucide-react";

const Instruction = () => {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  // Mock challenge data - in real app, fetch this based on challenge ID from URL
  const challenge = {
    title: "JavaScript Fundamentals Challenge",
    company: "Google",
    difficulty: "Beginner",
    duration: "10 Days",
    participants: 1450,
    rewards: 200,
    startTime: "2026-02-20 10:00 AM",
    endTime: "2026-03-01 11:59 PM",
  };

  const handleStartChallenge = () => {
    if (agreed) {
      router.push("/challenges/battle");
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 dark:bg-black p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              {challenge.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400 font-mono ml-11">
            <span className="text-slate-500">Hosted by</span>
            <span className="text-purple-400 font-bold">{challenge.company}</span>
            <span className="text-slate-600">•</span>
            <span className="px-2 py-1 bg-green-400/10 text-green-400 rounded border border-green-400/30">
              {challenge.difficulty}
            </span>
          </div>
        </div>

        {/* Challenge Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="dark:bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <Clock className="w-5 h-5 text-blue-400 mb-2" />
            <div className="text-xs dark:text-slate-500 font-mono mb-1">Duration</div>
            <div className="text-lg font-bold dark:text-white">{challenge.duration}</div>
          </div>
          <div className="dark:bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <Users className="w-5 h-5 text-purple-400 mb-2" />
            <div className="text-xs dark:text-slate-500 font-mono mb-1">Participants</div>
            <div className="text-lg font-bold dark:text-white">{challenge.participants}</div>
          </div>
          <div className="dark:bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <Trophy className="w-5 h-5 text-yellow-400 mb-2" />
            <div className="text-xs dark:text-slate-500 font-mono mb-1">Rewards</div>
            <div className="text-lg font-bold dark:text-white">{challenge.rewards} pts</div>
          </div>
          <div className="dark:bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <Shield className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-xs dark:text-slate-500 font-mono mb-1">Status</div>
            <div className="text-lg font-bold text-green-400">ACTIVE</div>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="dark:bg-slate-900/50 border border-slate-900  rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-400" />
            Challenge Instructions
          </h2>
          
          <div className="space-y-4 dark:text-slate-300">
            <div>
              <h3 className="font-bold dark:text-white mb-2">📋 Overview</h3>
              <p className="text-sm leading-relaxed">
                Test your JavaScript fundamentals through a series of coding challenges. 
                You'll work on real-world problems covering variables, functions, arrays, 
                objects, and more. Complete as many problems as possible within the time limit.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-2">⏰ Timeline</h3>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span>
                  <span><strong>Starts:</strong> {challenge.startTime}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  <span><strong>Ends:</strong> {challenge.endTime}</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-2">🎯 Scoring System</h3>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Each correct solution: <strong className="text-white">+10 points</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span>Bonus for early completion: <strong className="text-white">+5 points</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Speed bonus (top 100): <strong className="text-white">+20 points</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Rules Section */}
        <div className="dark:bg-slate-900/50 border border-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Rules & Guidelines
          </h2>
          
          <div className="space-y-3 dark:text-slate-300 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
              <p>You may use any online resources and documentation</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
              <p>All code must be your own work - no copying from others</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
              <p>You can submit multiple times - only your best score counts</p>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <p>No collaboration or sharing solutions during the contest</p>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <p>Using AI tools to generate solutions is prohibited</p>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
              <p>Violations may result in disqualification and account suspension</p>
            </div>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="dark:bg-slate-900/50 border border-slate-800 rounded-lg p-6 mb-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm dark:text-slate-300 group-dark:hover:text-white transition-colors">
              I have read and agree to abide by the challenge rules and code of conduct. 
              I understand that violations will result in disqualification.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 text-slate-300"
          >
            ← Back to Challenges
          </Button>
          
          <Button
            onClick={handleStartChallenge}
            disabled={!agreed}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Swords className="w-5 h-5 mr-2" />
            Start Challenge
          </Button>
        </div>

        {/* Helper Text */}
        {!agreed && (
          <p className="text-center text-sm text-slate-500 mt-4 font-mono">
            Please accept the terms to begin
          </p>
        )}
      </div>
    </div>
  );
};

export default Instruction;