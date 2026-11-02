"use client";

import React, { useState } from "react";
// Official React hook used for programmatic navigation inside modern App Router
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { TokenResponse } from "@/types";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.SubmitEvent) => {
    // async is required because validating credentials involves talking to an external DB or API server, which takes time (Network latency)
    // e: React.FormEvent tells Typescript what kind og event "e" is, to prevent accidental pass a button click or mouse hover as a value to the function

    e.preventDefault();
    setError("");

    // URLSearchParams(): instantiates a built-in browser object designed to compile data into an encoding standard called application/x-www-form-urlencoded.
    // OAuth2 standards and security frameworks specifically require data to be sent as form-url-encoded
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to login");
      }

      const data: TokenResponse = await res.json();
      localStorage.setItem("token", data.access_token);
      router.push("/todos");
    } catch (err: unknown) {
      // Safe type-guarding
      if (err instanceof Error) {
        // TypeScript now safely knows 'err' has a '.message' property
        setError(err.message);
      } else {
        // Fallback for unexpected error formats
        setError("An uexpected error occured");
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
            Welcome Back
          </h2>
          <p className="text-sm text-slate-400">
            Enter your credentials to access your workspace
          </p>
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

        <form onSubmit={handleLogin} className="space-y-4">
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
          Dont have an account?{" "}
          <Link
            href="/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition"
          >
            Register
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
