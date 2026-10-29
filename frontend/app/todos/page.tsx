"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Todo } from "@/types";

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
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold text-indigo-400">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
        >
          Logout
        </button>
      </header>

      <form
        onSubmit={handleCreate}
        className="bg-slate-800 p-6 rounded-xl mb-8 space-y-4 border border-slate-700"
      >
        <h2 className="text-xl font-semibold">New Task</h2>
        <input
          type="text"
          placeholder="Task Title"
          required
          className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description (Optional)"
          className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg transition"
        >
          Add Task
        </button>

        {loading ? (
          <p className="text-center text-slate-400">Loading your tasks...</p>
        ) : (
          <div className="space-y-3">
            {todos.length === 0 ? (
              <p className="text-center text-slate-500">
                No tasks found, Time to create new task
              </p>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700/60 hover:border-slate-600 transition"
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
                        className={`font-semibold ${todo.is_completed ? "line-through text-slate-500" : "text-slate-100"}`}
                      >
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p
                          className={`text-sm ${todo.is_completed ? "line-through text-slate-600" : "text-slate-400"}`}
                        >
                          {todo.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="px-3 py-1 bg-red-900/40 hover:bg-red-800/60 text-red-300 rounded text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </form>
    </div>
  );
}
