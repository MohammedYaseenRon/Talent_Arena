"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff, Swords, Shield, Trophy, Zap, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authContext";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {user, login} = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(formData.email, formData.password);
      if(loggedInUser?.role === "RECRUITER") {
        router.push("/recruiter");
      }else{
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <Lock className="absolute top-20 right-[15%] w-8 h-8 text-blue-400/20 animate-bounce" style={{ animationDuration: "3s" }} />
        <Shield className="absolute top-40 left-[20%] w-10 h-10 text-purple-400/20 animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }} />
        <Trophy className="absolute bottom-32 right-[25%] w-9 h-9 text-yellow-400/20 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1s" }} />
        <Zap className="absolute bottom-20 left-[15%] w-8 h-8 text-cyan-400/20 animate-bounce" style={{ animationDuration: "3s", animationDelay: "1.5s" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl rounded-2xl"></div>
        
        <div className="relative bg-slate-950/60 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2" style={{ fontFamily: "'Press Start 2P', monospace, system-ui" }}>
              Evaluate Warrior
            </h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm font-mono flex items-center gap-2 animate-shake">
                <span className="text-red-500">!</span> {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-blue-300 uppercase tracking-wider font-mono">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="warrior@arena.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-slate-900/50 border-blue-500/30 focus:border-blue-500 text-white placeholder:text-slate-500 h-11 font-mono"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-blue-300 uppercase tracking-wider font-mono">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 font-mono underline underline-offset-2"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="bg-slate-900/50 border-blue-500/30 focus:border-blue-500 text-white placeholder:text-slate-500 h-11 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-mono"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Authenticating...
                </span>
              ) : (
                <>
                  <Swords className="w-5 h-5 mr-2" />
                  Enter Arena
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-950/60 px-2 text-slate-500 font-mono">OR</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm font-mono">
              Dont have an account?{" "}
              <Link
                href="/recruiter/register "
                className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-2 transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>

           <div className="mt-6 flex justify-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1 text-blue-400/60">
              <Shield className="w-3 h-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1 text-purple-400/60">
              <Zap className="w-3 h-3" />
              <span>Fast</span>
            </div>
            <div className="flex items-center gap-1 text-pink-400/60">
              <Trophy className="w-3 h-3" />
              <span>Epic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}