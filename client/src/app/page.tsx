"use client";


import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { Scroll } from "lucide-react";
import { useState } from "react";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
    </div>
  );
}
