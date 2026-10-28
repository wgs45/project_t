"use client";

import React, { useState } from "react";
// Official React hook used for programmatic navigation inside modern App Router
import { useRouter } from "next/navigation";
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
    <div className="flex items-center justify-center min-h-screen p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-xl border border-slate-700 space-y-6"
      >
        <h2 className="text-2xl font-bold text-indigo-400 text-center">
          Welcome Back!
        </h2>
        {error && (
          <p className="text-red-400 text-sm text-center bg-red-950/50 p-2 rounded">
            {error}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">
            Email
          </label>
          <input
            type="email"
            required
            className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">
            Password
          </label>
          <input
            type="password"
            required
            className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg transition"
        >
          Sign In
        </button>
        <p>
          Dont have an account?{" "}
          <Link href="/register" className="text-indigo-400 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
