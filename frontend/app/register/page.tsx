"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occured");
      }
    }
  };

  return (
    <main className="relative flex items-center justify-center min-h-screen bg-trueblack overflow-hidden px-4">
      <div className="absolute w-125 h-125 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute w-100 h-100 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -bottom-20 -right-20"></div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-glass-dark backdrop-blur-xl border border-glass-border p-8 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.9)] space-y-6"
      >
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Create Account
          </h2>
          <p className="text-sm text-slate-400">Sign up for new user</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-sm rounded-xl text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sx font-medium uppercas tracking-wider text-slate-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/10 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-sm"
          >
            Sign In
          </motion.button>
        </form>

        <p>
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition"
          >
            Register
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
