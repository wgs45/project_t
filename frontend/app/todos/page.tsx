"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Todo } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTodos = async () => {
    try {
      const data = await apiRequest<Todo[]>("/todos");

      // Move state updates safely outside the immediate rendering cycle
      setTimeout(() => {
        setTodos(data);
      }, 0);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleCreate = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newTodo = await apiRequest<Todo>("/todos", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });
      setTodos([newTodo, ...todos]);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (todo: Todo) => {
    // Pre-calculating next state
    const updatedStatus = !todo.is_completed;

    // Pessimistic update
    setTodos(
      todos.map((t) =>
        t.id === todo.id ? { ...t, is_completed: updatedStatus } : t,
      ),
    );

    // Sync data with DB (PATCH request)
    try {
      await apiRequest<Todo>(`/todos/${todo.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_completed: updatedStatus }),
      });
    } catch (err) {
      console.log(err);
      fetchTodos();
    }
  };

  const handleDelete = async (id: number) => {
    // Optimistic filter
    setTodos(todos.filter((t) => t.id !== id));

    // Sync data with DB (DELETE request)
    try {
      await apiRequest(`/todos/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
      fetchTodos();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-trueblack text-slate-100 px-4 py-10 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center bg-glassDark backdrop-blur-xl border border-glassBorder p-6 rounded-3xl shadow-2xl"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Task Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Asynchronous PostgreSQL & Redis Backed
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-xs font-medium rounded-xl transition"
          >
            Logout
          </motion.button>
        </motion.header>

        {/* Create Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleCreate}
          className="bg-glassDark backdrop-blur-xl border border-glassBorder p-6 rounded-3xl shadow-2xl space-y-4"
        >
          <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-400">
            Create New Task
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="What needs to be done?"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Optional description..."
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition text-sm"
          >
            Add Task
          </motion.button>
        </motion.form>

        {/* Task List */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-slate-500 py-12 text-sm">
              Loading tasks...
            </p>
          ) : todos.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-slate-600 py-12 text-sm"
            >
              No tasks found. Your workspace is completely clean. 🌟
            </motion.p>
          ) : (
            <AnimatePresence>
              {todos.map((todo) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-4 bg-glassDark backdrop-blur-xl border border-glassBorder rounded-2xl shadow-xl hover:border-white/15 transition group"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={todo.is_completed}
                      onChange={() => handleToggle(todo)}
                      className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                    />
                    <div>
                      <h3
                        className={`font-medium text-sm transition ${todo.is_completed ? "line-through text-slate-600" : "text-slate-200"}`}
                      >
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p
                          className={`text-xs mt-0.5 transition ${todo.is_completed ? "line-through text-slate-700" : "text-slate-400"}`}
                        >
                          {todo.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(todo.id)}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium transition"
                  >
                    Delete
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
