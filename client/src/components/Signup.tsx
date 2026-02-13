"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff, Swords, Shield, Trophy, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      router.push("/challenges");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <Swords className="absolute top-20 left-[15%] w-8 h-8 text-purple-400/20 animate-bounce" style={{ animationDuration: "3s" }} />
        <Shield className="absolute top-40 right-[20%] w-10 h-10 text-blue-400/20 animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }} />
        <Trophy className="absolute bottom-32 left-[25%] w-9 h-9 text-yellow-400/20 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1s" }} />
        <Zap className="absolute bottom-20 right-[15%] w-8 h-8 text-cyan-400/20 animate-bounce" style={{ animationDuration: "3s", animationDelay: "1.5s" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-xl rounded-2xl"></div>
        
        <div className="relative bg-slate-950/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl mb-4 animate-pulse">
              <Swords className="w-8 h-8 text-white" />
            </div> */}
            {/* <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2" style={{ fontFamily: "'Press Start 2P', monospace, system-ui" }}>
              JOIN THE ARENA
            </h1> */}
            <p className="text-slate-400 text-sm font-mono">
              Create your warrior profile and start conquering challenges
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm font-mono flex items-center gap-2">
                <span className="text-red-500">!</span> {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-purple-300 uppercase tracking-wider font-mono">
                Warrior Name
              </label>
              <Input
                type="text"
                placeholder="Enter your battle name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-slate-900/50 border-purple-500/30 focus:border-purple-500 text-white placeholder:text-slate-500 h-11 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-purple-300 uppercase tracking-wider font-mono">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="warrior@arena.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-slate-900/50 border-purple-500/30 focus:border-purple-500 text-white placeholder:text-slate-500 h-11 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-purple-300 uppercase tracking-wider font-mono">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="bg-slate-900/50 border-purple-500/30 focus:border-purple-500 text-white placeholder:text-slate-500 h-11 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-purple-300 uppercase tracking-wider font-mono">
                Confirm Password
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="bg-slate-900/50 border-purple-500/30 focus:border-purple-500 text-white placeholder:text-slate-500 h-11 font-mono"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-mono"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creating Warrior...
                </span>
              ) : (
                <>
                  <Swords className="w-5 h-5 mr-2" />
                  Enter the Arena
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm font-mono">
              Already a warrior?{" "}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-bold underline underline-offset-2 transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>

          {/* Stats decoration */}
          <div className="mt-6 flex justify-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1 text-purple-400/60">
              <Shield className="w-3 h-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1 text-blue-400/60">
              <Zap className="w-3 h-3" />
              <span>Fast</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-400/60">
              <Trophy className="w-3 h-3" />
              <span>Epic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}