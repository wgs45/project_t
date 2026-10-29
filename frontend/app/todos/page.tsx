"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Todo } from "@/types";
import { stringify } from "querystring";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTodos = async () => {
    try {
      // const data = await apiRequest<Todo[]>("/todos");

      // Move state updates safely outside the immediate rendering cycle
      // setTimeout(() => {
      //   setTodos(data);
      // }, 0);
      // Mock hardcoded data

      const fakeData: Todo[] = [
        {
          id: 1,
          title: "Build Next.js Frontend",
          description: "Design the UI layout",
          is_completed: false,
          owner_id: 123,
        },
        {
          id: 2,
          title: "Create Python/Node Backend",
          description: "Connect the database later",
          is_completed: false,
          owner_id: 123,
        },
      ];

      // Fake timeout
      setTimeout(() => {
        setTodos(fakeData);
      }, 500); // Fakes half-second loading time
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
    const updatedStatus = !todo.is_completed;
    setTodos(
      todos.map((t) =>
        t.id === todo.id ? { ...t, is_completed: updatedStatus } : t,
      ),
    );

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
    setTodos(todos.filter((t) => t.id !== id));

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
    <div>
      <header>
        <h1>Dashboard</h1>
        <button>Logout</button>
      </header>

      <form>
        <h2>New Task</h2>
        <input
          type="text"
          placeholder="Task Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add Task</button>

        {loading ? (
          <p>Loading your tasks...</p>
        ) : (
          <div>
            {todos.length === 0 ? (
              <p>No tasks found, Time to create new task</p>
            ) : (
              todos.map((todo) => (
                <div key={todo.id}>
                  <div>
                    <input
                      type="checkbox"
                      checked={todo.is_completed}
                      onChange={() => handleToggle(todo)}
                    />
                    <div>
                      <h3>{todo.title}</h3>
                      {todo.description && <p>{todo.description}</p>}
                    </div>
                  </div>
                  <button>Delete</button>
                </div>
              ))
            )}
          </div>
        )}
      </form>
    </div>
  );
}
