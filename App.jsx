import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0f0e17",
  surface: "#1a1825",
  card: "#221f33",
  accent: "#ff6b35",
  accentSoft: "#ff6b3522",
  green: "#2ecc71",
  greenSoft: "#2ecc7122",
  text: "#fffffe",
  muted: "#a7a9be",
  border: "#2e2b40",
};

const FOCUS_DURATION = 25 * 60;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function FocusTracker() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Deep work session", done: false, priority: "high" },
    { id: 2, text: "Check emails (batch)", done: false, priority: "low" },
    { id: 3, text: "Team standup", done: true, priority: "medium" },
  ]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [focusTask, setFocusTask] = useState(null);
  const [timer, setTimer] = useState(FOCUS_DURATION);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setSessions((s) => s + 1);
            return FOCUS_DURATION;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input.trim(), done: false, priority }]);
    setInput("");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
    if (focusTask === id) { setFocusTask(null); setRunning(false); setTimer(FOCUS_DURATION); }
  };

  const startFocus = (id) => {
    setFocusTask(id);
    setTimer(FOCUS_DURATION);
    setRunning(true);
  };

  const stopFocus = () => {
    setFocusTask(null);
    setRunning(false);
    setTimer(FOCUS_DURATION);
  };

  const priorityColor = (p) => p === "high" ? "#ff6b35" : p === "medium" ? "#f7c59f" : "#a7a9be";
  const priorityLabel = (p) => p === "high" ? "!" : p === "medium" ? "•" : "–";

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const progress = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;

  const activeTask = tasks.find((t) => t.id === focusTask);
  const timerPct = ((FOCUS_DURATION - timer) / FOCUS_DURATION) * 100;
  const r = 54, circ = 2 * Math.PI * r;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Georgia', serif", padding: "32px 16px", color: COLORS.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #555; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .task-row:hover .del-btn { opacity: 1 !important; }
        .focus-btn:hover { background: ${COLORS.accent} !important; color: #fff !important; }
        .add-btn:hover { background: ${COLORS.accent} !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>

      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px" }}>
            Focus<span style={{ color: COLORS.accent }}>.</span>
          </div>
          <div style={{ color: COLORS.muted, fontSize: 13, fontFamily: "'DM Mono', monospace", marginTop: 4 }}>
            {sessions} sessions completed today
          </div>
        </div>

        {/* Focus Timer */}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "24px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          {running && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 0%, ${COLORS.accent}11, transparent 70%)`, pointerEvents: "none" }} />}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* Ring */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <svg width={128} height={128}>
                <circle cx={64} cy={64} r={r} fill="none" stroke={COLORS.border} strokeWidth={6} />
                <circle cx={64} cy={64} r={r} fill="none" stroke={COLORS.accent} strokeWidth={6}
                  strokeDasharray={circ} strokeDashoffset={circ - (timerPct / 100) * circ}
                  strokeLinecap="round" transform="rotate(-90 64 64)"
                  style={{ transition: "stroke-dashoffset 1s linear" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 500 }}>{formatTime(timer)}</div>
                {running && <div style={{ fontSize: 10, color: COLORS.accent, marginTop: 2, animation: "pulse 2s infinite" }}>FOCUSING</div>}
              </div>
            </div>
            {/* Controls */}
            <div style={{ flex: 1 }}>
              {activeTask ? (
                <>
                  <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>NOW FOCUSING ON</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, lineHeight: 1.3 }}>{activeTask.text}</div>
                </>
              ) : (
                <div style={{ fontSize: 14, color: COLORS.muted, marginBottom: 16 }}>Pick a task below to start a 25-min focus session.</div>
              )}
              {focusTask ? (
                <button onClick={stopFocus} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.muted, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
                  Stop
                </button>
              ) : (
                <button onClick={() => pending[0] && startFocus(pending[0].id)} disabled={!pending.length}
                  style={{ background: COLORS.accent, border: "none", color: "#fff", borderRadius: 8, padding: "8px 18px", cursor: pending.length ? "pointer" : "not-allowed", fontSize: 13, fontFamily: "'DM Mono', monospace", opacity: pending.length ? 1 : 0.4 }}>
                  Start Top Task →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Add Task */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a task..." style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "0 10px", color: priorityColor(priority), fontSize: 13, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
            <option value="high">! High</option>
            <option value="medium">• Med</option>
            <option value="low">– Low</option>
          </select>
          <button onClick={addTask} className="add-btn" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "0 16px", color: COLORS.text, fontSize: 20, cursor: "pointer", transition: "background 0.2s" }}>+</button>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.muted, fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>
            <span>{pending.length} remaining</span><span>{progress}% done</span>
          </div>
          <div style={{ height: 4, background: COLORS.border, borderRadius: 4 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: COLORS.green, borderRadius: 4, transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* Task List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...pending, ...done].map((task) => (
            <div key={task.id} className="task-row" style={{ display: "flex", alignItems: "center", gap: 10, background: task.done ? "transparent" : COLORS.card, border: `1px solid ${focusTask === task.id ? COLORS.accent : task.done ? COLORS.border + "66" : COLORS.border}`, borderRadius: 10, padding: "12px 14px", transition: "all 0.2s", opacity: task.done ? 0.5 : 1 }}>
              <button onClick={() => toggleTask(task.id)} style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${task.done ? COLORS.green : COLORS.border}`, background: task.done ? COLORS.green : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                {task.done && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
              </button>
              <span style={{ color: priorityColor(task.priority), fontFamily: "'DM Mono', monospace", fontSize: 14, flexShrink: 0, width: 12, textAlign: "center" }}>{priorityLabel(task.priority)}</span>
              <span style={{ flex: 1, fontSize: 14, textDecoration: task.done ? "line-through" : "none", color: task.done ? COLORS.muted : COLORS.text }}>{task.text}</span>
              {!task.done && (
                <button onClick={() => focusTask === task.id ? stopFocus() : startFocus(task.id)} className="focus-btn"
                  style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", background: focusTask === task.id ? COLORS.accent : "transparent", border: `1px solid ${focusTask === task.id ? COLORS.accent : COLORS.border}`, color: focusTask === task.id ? "#fff" : COLORS.muted, borderRadius: 6, padding: "4px 10px", cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}>
                  {focusTask === task.id ? "stop" : "focus"}
                </button>
              )}
              <button className="del-btn" onClick={() => deleteTask(task.id)} style={{ opacity: 0, background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 16, padding: "0 2px", transition: "opacity 0.2s", lineHeight: 1 }}>×</button>
            </div>
          ))}
          {tasks.length === 0 && <div style={{ textAlign: "center", color: COLORS.muted, fontSize: 14, padding: 32 }}>No tasks yet. Add one above ↑</div>}
        </div>
      </div>
    </div>
  );
}
