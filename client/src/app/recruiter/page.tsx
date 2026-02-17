"use client";

import React from 'react'
import { Code2, Users, Trophy, FileText, TrendingUp, Activity } from "lucide-react";
import StatsCard from '@/components/recruiter/StatsCard';


const stats = [
  { title: "Total Problems", value: "1,247", change: "+23 this week", icon: Code2 },
  { title: "Active Users", value: "45.2K", change: "+12.5% from last month", icon: Users },
  { title: "Submissions Today", value: "8,432", change: "+5.2% from yesterday", icon: FileText },
  { title: "Active Contests", value: "3", change: "2 upcoming", icon: Trophy },
];

const Recruiter = () => {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-2'>
      {stats.map((stat, i) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}

export default Recruiter