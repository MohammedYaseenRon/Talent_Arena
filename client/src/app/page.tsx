"use client";


import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { Editor } from "@monaco-editor/react";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState("");
  return (
    <div>
      <Navbar />
      <Hero />
      {/* <Editor
      height="90vh"
      language="javascript"
      value={code}
      onChange={setCode}
      /> */}
    </div>
  );
}
