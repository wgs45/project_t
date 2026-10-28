import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight text-indigo-400 mb-4">
        Todo list app
      </h1>
      <p className="text-slate-400 max-w-xl text-lg mb-8">
        Built with Next.js App Router, FastAPI, PostgreSQL, and Redis caching.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold transition"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold transition"
        >
          Register
        </Link>
      </div>
    </main>
  );
}
