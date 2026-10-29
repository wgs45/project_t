"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

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
    <div className="flex items-center justify-center min-h-screen p-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-xl border border-slate-700 space-y-6"
      >
        <h2 className="text-2xl font-bold text-indigo-400 text-center">
          Create Account
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
            className="w-full p-3 eounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-full p-3 eounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg transition"
        >
          Register
        </button>
        <p>
          Already registered?{" "}
          <Link href="/login" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
