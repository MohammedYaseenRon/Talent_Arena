"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff, Swords, Shield, Trophy, Zap, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context'/authContext";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {login} = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      router.push("/challenges");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating icons */}
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
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2" style={{ fontFamily: "'Press Start 2P', monospace, system-ui" }}>
              WARRIOR LOGIN
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

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-950/60 px-2 text-slate-500 font-mono">OR</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 text-slate-300 font-mono"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm font-mono">
              New warrior?{" "}
              <Link
                href="/auth/signup"
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