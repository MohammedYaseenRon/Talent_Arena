"use client";


import AISection from "@/components/Ai";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Working from "@/components/Working";
import { Scroll } from "lucide-react";
import { useState } from "react";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Working />
      <Features />
      <AISection />
      <Footer />
    </div>
  );
}
