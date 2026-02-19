"use client";


import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
    </div>
  );
}
