"use client";

import React, { useEffect, useState } from "react";
import { Clock, Target } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import axios from "axios";

type Difficulty = "EASY" | "MEDIUM" | "HARD" | "All";
type ChallengeType = "FRONTEND" | "BACKEND" | "DSA" | "SYSTEM_DESIGN" | "All";
type Status = "LIVE" | "SCHEDULED" | "ENDED" | "All";

export interface Challenge {
  sessionId: string;
  challengeId: string;
  title: string;
  description: string;
  difficulty: string;
  challengeType: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "LIVE" | "ENDED";
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "EASY":
      return "text-green-400 bg-green-400/10 border-green-400/30";
    case "MEDIUM":
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    case "HARD":
      return "text-red-400 bg-red-400/10 border-red-400/30";
    default:
      return "text-gray-400 bg-gray-400/10 border-gray-400/30";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "LIVE":
      return "text-green-400 bg-green-400/20 animate-pulse";
    case "SCHEDULED":
      return "text-blue-400 bg-blue-400/20";
    case "ENDED":
      return "text-gray-400 bg-gray-400/20";
    default:
      return "text-gray-400 bg-gray-400/20";
  }
};

const ChallengesPage = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("All");
  const [selectedType, setSelectedType] = useState<ChallengeType>("All");
  const [selectedStatus, setSelectedStatus] = useState<Status>("All");
  
  // Separate state for each status
  const [liveChallenges, setLiveChallenges] = useState<Challenge[]>([]);
  const [upcomingChallenges, setUpcomingChallenges] = useState<Challenge[]>([]);
  const [endedChallenges, setEndedChallenges] = useState<Challenge[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveChallenges = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/challenge/live`,
        { withCredentials: true }
      );
      setLiveChallenges(response.data.challenges || []);
    } catch (error) {
      console.error("Error fetching live challenges:", error);
    }
  };

  // Fetch UPCOMING challenges (refresh every 30 seconds)
  const fetchUpcomingChallenges = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/challenge/upcoming`,
        { withCredentials: true }
      );
      setUpcomingChallenges(response.data.challenges || []);
    } catch (error) {
      console.error("Error fetching upcoming challenges:", error);
    }
  };

  // Fetch ENDED challenges (fetch once on load)
  const fetchEndedChallenges = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/challenge/ended`,
        { withCredentials: true }
      );
      setEndedChallenges(response.data.challenges || []);
    } catch (error) {
      console.error("Error fetching ended challenges:", error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchLiveChallenges(),
          fetchUpcomingChallenges(),
          fetchEndedChallenges(),
        ]);
      } catch (err) {
        setError("Failed to load challenges");
      } finally {
        setLoading(false);
      }
    };

    loadAll();

    const liveInterval = setInterval(fetchLiveChallenges, 10000);

    // Auto-refresh UPCOMING challenges every 30 seconds
    const upcomingInterval = setInterval(fetchUpcomingChallenges, 30000);

    return () => {
      clearInterval(liveInterval);
      clearInterval(upcomingInterval);
    };
  }, []);

  // Combine all challenges
  const allChallenges = [...liveChallenges, ...upcomingChallenges, ...endedChallenges];

  // Filter function
  const filteredChallenges = allChallenges.filter((challenge) => {
    const matchesDifficulty =
      selectedDifficulty === "All" || challenge.difficulty === selectedDifficulty;
    const matchesType =
      selectedType === "All" || challenge.challengeType === selectedType;
    const matchesStatus =
      selectedStatus === "All" || challenge.status === selectedStatus;
    
    return matchesDifficulty && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading challenges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => (
    <Link href={`/challenges/${challenge.challengeId}`} key={challenge.sessionId}>
      <div className="group relative backdrop-blur border border-gray-900 rounded-lg p-5 transition-all duration-300 hover:shadow-lg cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-xs font-bold px-2 py-1 rounded font-mono ${getStatusColor(
              challenge.status
            )}`}
          >
            {challenge.status === "LIVE" && "🔴 "}
            {challenge.status}
          </span>
          <span
            className={`text-xs font-bold px-2 py-1 rounded border font-mono ${getDifficultyColor(
              challenge.difficulty
            )}`}
          >
            {challenge.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors">
          {challenge.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
          {challenge.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-300 font-mono">
              {new Date(challenge.startTime).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-300 font-mono">
              {challenge.challengeType}
            </span>
          </div>
        </div>

        {/* Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/5 group-hover:to-blue-600/5 rounded-lg transition-all duration-300 pointer-events-none" />
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-8 h-8 text-purple-400" />
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            CHALLENGES
          </h1>
        </div>
        <p className="text-slate-400 text-sm font-mono ml-11">
          Choose your battle and prove your skills
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto flex items-center gap-4 mb-6">
        {/* Status Filter */}
        <Select
          value={selectedStatus}
          onValueChange={(e) => setSelectedStatus(e as Status)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="LIVE">🔴 Live</SelectItem>
              <SelectItem value="SCHEDULED">📅 Upcoming</SelectItem>
              <SelectItem value="ENDED">🏁 Ended</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Difficulty Filter */}
        <Select
          value={selectedDifficulty}
          onValueChange={(e) => setSelectedDifficulty(e as Difficulty)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="All">All Difficulties</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select
          value={selectedType}
          onValueChange={(e) => setSelectedType(e as ChallengeType)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="FRONTEND">Frontend</SelectItem>
              <SelectItem value="BACKEND">Backend</SelectItem>
              <SelectItem value="DSA">DSA</SelectItem>
              <SelectItem value="SYSTEM_DESIGN">System Design</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Results Count */}
        <div className="ml-auto text-sm text-slate-400 font-mono">
          Showing <span className="text-purple-400 font-bold">{filteredChallenges.length}</span> of {allChallenges.length} challenges
        </div>
      </div>

      {/* Challenge Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-4">
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No challenges found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          filteredChallenges.map((challenge) => (
            <ChallengeCard key={challenge.sessionId} challenge={challenge} />
          ))
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;