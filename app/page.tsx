"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import confetti from "canvas-confetti";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type Filter = "all" | "active" | "done";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const COMPLETE_MESSAGES = [
  "Crushed it. 🔥",
  "That's what I'm talking about!",
  "One less thing to worry about.",
  "Look at you go!",
  "Boom. Done.",
  "You're built different.",
  "Absolutely cooked. ✅",
  "Shipped. 🚀",
  "W move.",
  "Zero bugs, just vibes.",
];

const EMPTY_MESSAGES: Record<Filter, { title: string; sub: string }> = {
  all:    { title: "Nothing here yet.",       sub: "Add a task and get things moving." },
  active: { title: "All caught up! 🎉",       sub: "No pending tasks. Go touch grass." },
  done:   { title: "Nothing completed yet.",  sub: "Finish something — you got this." },
};

// ─── CONFETTI ────────────────────────────────────────────────────────────────

function fireConfetti() {
  const colors = ["#a855f7", "#fb923c", "#f472b6", "#22d3ee", "#ffffff"];
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors,
    ticks: 200,
  });
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
    });
  }, 150);
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-semibold text-white"
      style={{
        background: "linear-gradient(135deg, #a855f7 0%, #fb923c 100%)",
        boxShadow: "0 4px 30px rgba(168,85,247,0.4)",
      }}
    >
      {message}
    </motion.div>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const checkControls = useAnimation();

  const handleToggle = async () => {
    if (!todo.completed) {
      await checkControls.start({ scale: [1, 1.3, 0.9, 1.1, 1], transition: { duration: 0.35 } });
    }
    onToggle();
  };

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(onDelete, 200);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: deleting ? 0 : 1, x: deleting ? 20 : 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="group flex items-center gap-3 px-4 py-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-bright)] transition-colors duration-200"
    >
      {/* Checkbox */}
      <motion.button
        animate={checkControls}
        onClick={handleToggle}
        className="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200"
        style={{
          borderColor: todo.completed ? "#a855f7" : "#4a2570",
          background: todo.completed ? "#a855f7" : "transparent",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence>
          {todo.completed && (
            <motion.svg
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              viewBox="0 0 12 12"
              fill="none"
              className="w-3 h-3"
            >
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Text */}
      <span
        className="flex-1 text-sm transition-all duration-300 break-words"
        style={{
          color: todo.completed ? "var(--text-muted)" : "var(--text)",
          textDecoration: todo.completed ? "line-through" : "none",
          opacity: todo.completed ? 0.6 : 1,
        }}
      >
        {todo.text}
      </span>

      {/* Delete */}
      <motion.button
        onClick={handleDelete}
        initial={{ opacity: 0 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        className="shrink-0 text-[var(--text-muted)] hover:text-[#f472b6] transition-colors duration-200 opacity-0 group-hover:opacity-100 p-0.5"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>
    </motion.li>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("todos");
      if (saved) setTodos(JSON.parse(saved));
    } catch {}
    setMounted(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (mounted) localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos, mounted]);

  // Mouse glow
  useEffect(() => {
    const move = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() },
      ...prev,
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (!t.completed) {
          fireConfetti();
          const msg = COMPLETE_MESSAGES[Math.floor(Math.random() * COMPLETE_MESSAGES.length)];
          setToast(msg);
        }
        return { ...t, completed: !t.completed };
      })
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done")   return t.completed;
    return true;
  });

  const activeCount    = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) =>  t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  const emptyMsg = EMPTY_MESSAGES[filter];

  return (
    <>
      <div className="mouse-glow" />

      <div className="relative z-10 min-h-screen px-6 py-16 flex flex-col items-center">

        <div className="w-full max-w-lg">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl font-bold mb-1">
              <span className="gradient-text">to-done.</span>
            </h1>
            <p className="text-[var(--text-muted)] text-xs">
              {activeCount === 0 && todos.length > 0
                ? "All done. You're a machine. 🤖"
                : activeCount === 1
                ? "1 task left. Almost there."
                : activeCount > 0
                ? `${activeCount} tasks remaining.`
                : "Add something to get started."}
            </p>
          </motion.div>

          {/* Progress bar */}
          {todos.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-5"
            >
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1.5">
                <span>{completedCount} / {todos.length} completed</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1 rounded-full bg-[var(--border)] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #a855f7, #fb923c)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
            </motion.div>
          )}

          {/* Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-4"
          >
            <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] focus-within:border-[var(--purple)] transition-colors duration-200">
              <span className="text-[var(--text-muted)] text-sm select-none">$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
                placeholder="What needs to be done?"
                className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none"
              />
            </div>
            <motion.button
              onClick={addTodo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!input.trim()}
              className="px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: input.trim()
                  ? "linear-gradient(135deg, #a855f7, #fb923c)"
                  : "var(--bg-card)",
                color: input.trim() ? "white" : "var(--text-muted)",
                border: `1px solid ${input.trim() ? "transparent" : "var(--border)"}`,
              }}
            >
              Add
            </motion.button>
          </motion.div>

          {/* Filter tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex gap-1 mb-4 p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]"
          >
            {(["all", "active", "done"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="relative flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 capitalize"
                style={{ color: filter === f ? "white" : "var(--text-muted)" }}
              >
                {filter === f && (
                  <motion.div
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{f}</span>
              </button>
            ))}
          </motion.div>

          {/* Todo list */}
          <motion.ul layout className="flex flex-col gap-2 min-h-[120px]">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.li
                  key="empty"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="text-3xl mb-3">
                    {filter === "active" ? "🌴" : filter === "done" ? "📭" : "✨"}
                  </div>
                  <p className="text-[var(--text)] text-sm font-semibold mb-1">{emptyMsg.title}</p>
                  <p className="text-[var(--text-muted)] text-xs">{emptyMsg.sub}</p>
                </motion.li>
              ) : (
                filtered.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={() => toggleTodo(todo.id)}
                    onDelete={() => deleteTodo(todo.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </motion.ul>

          {/* Footer */}
          {completedCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex justify-end"
            >
              <button
                onClick={clearCompleted}
                className="text-[10px] text-[var(--text-muted)] hover:text-[#f472b6] transition-colors"
              >
                clear completed ({completedCount})
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast key={toast + Date.now()} message={toast} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
