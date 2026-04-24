import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import TaskList from "./TaskList";
import Stats from "./Stats";

const defaultTimes = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

// Utility function for unique IDs (CRITICAL FIX)
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

function Pomodoro() {
  // --- PERSISTENT STATE (LocalStorage) ---
  const [mode, setMode] = useState("work");
  
  // Load saved data or initialize with default values
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("pomodoro_tasks");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("pomodoro_stats");
    return saved ? JSON.parse(saved) : { totalWork: 0, totalBreak: 0, totalCycles: 0 };
  });

  const [customTimes, setCustomTimes] = useState(() => {
    const saved = localStorage.getItem("pomodoro_times");
    return saved ? JSON.parse(saved) : defaultTimes;
  });

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("pomodoro_dark") === "true");

  // Timer state management
  const [timeLeft, setTimeLeft] = useState(defaultTimes.work);
  const [isRunning, setIsRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  
  // Refs for precise execution logic
  const endTimeRef = useRef(null);
  const audioRef = useRef(null);

  // --- AUTO-SAVE EFFECTS ---
  useEffect(() => localStorage.setItem("pomodoro_tasks", JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem("pomodoro_stats", JSON.stringify(stats)), [stats]);
  useEffect(() => localStorage.setItem("pomodoro_times", JSON.stringify(customTimes)), [customTimes]);
  useEffect(() => localStorage.setItem("pomodoro_dark", darkMode), [darkMode]);

  // --- PRECISE TIMER LOGIC (Prevents background throttling drift) ---
  useEffect(() => {
    let animationFrameId;

    const tick = () => {
      if (!isRunning) return;

      const now = Date.now();
      // Calculate real remaining time by comparing with the target end time
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
      
      setTimeLeft(remaining);

      if (remaining <= 0) {
        setIsRunning(false);
        handleCycleEnd();
      } else {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    if (isRunning) {
      // If starting or resuming, calculate the exact timestamp it should end
      if (!endTimeRef.current || endTimeRef.current < Date.now()) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }
      animationFrameId = requestAnimationFrame(tick);
    } else {
      endTimeRef.current = null;
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning]); // Dependency on timeLeft removed to prevent unnecessary re-renders

  // Reset time when manually switching modes
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(customTimes[mode]);
    }
  }, [mode, customTimes, isRunning]);

  const handleCycleEnd = () => {
    if (audioRef.current) audioRef.current.play().catch(e => console.log("Audio playback error", e));
    
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(mode === "work" ? "¡A descansar!" : "¡A trabajar!");
    }

    setStats(prev => ({
      ...prev,
      totalWork: mode === "work" ? prev.totalWork + customTimes.work / 60 : prev.totalWork,
      totalBreak: mode !== "work" ? prev.totalBreak + customTimes[mode] / 60 : prev.totalBreak,
      totalCycles: mode === "work" ? prev.totalCycles + 1 : prev.totalCycles,
    }));

    if (mode === "work") {
      const newCycles = cycles + 1;
      setCycles(newCycles);
      const nextMode = newCycles % 4 === 0 ? "longBreak" : "shortBreak";
      setMode(nextMode);
      setTimeLeft(customTimes[nextMode]);
    } else {
      setMode("work");
      setTimeLeft(customTimes.work);
    }
  };

  const handleStart = () => {
    if (timeLeft > 0) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    endTimeRef.current = null;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(customTimes[mode]);
    endTimeRef.current = null;
  };

  const [taskInput, setTaskInput] = useState("");

  const handleAddTask = () => {
    if (taskInput.trim()) {
      const newTask = { 
        id: generateId(), // UNIQUE ID
        text: taskInput.trim(), 
        completed: false 
      };
      setTasks([...tasks, newTask]);
      setTaskInput("");
    }
  };

  const handleRemoveTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleEditTask = (id, newText) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, text: newText } : t));
  };

  const handleToggleComplete = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setCustomTimes({
      ...customTimes,
      [name]: Math.max(1, Number(value)) * 60,
    });
  };

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className={`pomodoro-container${darkMode ? " dark" : ""}`}>
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" preload="auto" />
      
      <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "🌙" : "☀️"}
      </button>

      <h2>
        {mode === "work" ? "Trabajo" : mode === "shortBreak" ? "Descanso corto" : "Descanso largo"}
      </h2>

      <div className="timer-display">
        {formatTime(timeLeft)}
      </div>

      <div className="controls">
        {!isRunning ? (
          <button className="control-btn" onClick={handleStart}>Iniciar</button>
        ) : (
          <button className="control-btn" onClick={handlePause}>Pausar</button>
        )}
        <button className="control-btn" onClick={handleReset}>Reiniciar</button>
      </div>

      <Stats stats={stats} />

      <div className="settings">
        <h4>Tiempos (minutos):</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <label>
            Trabajo:
            <input type="number" name="work" min="1" value={Math.floor(customTimes.work / 60)} onChange={handleTimeChange} />
          </label>
          <label>
            Corto:
            <input type="number" name="shortBreak" min="1" value={Math.floor(customTimes.shortBreak / 60)} onChange={handleTimeChange} />
          </label>
          <label>
            Largo:
            <input type="number" name="longBreak" min="1" value={Math.floor(customTimes.longBreak / 60)} onChange={handleTimeChange} />
          </label>
        </div>
      </div>

      <div className="task-list">
        <h4>Tareas</h4>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Añadir tarea..."
            style={{ flex: 1, padding: '8px' }}
          />
          <button className="control-btn" onClick={handleAddTask}>+</button>
        </div>
        <TaskList
          tasks={tasks}
          onRemove={handleRemoveTask}
          onEdit={handleEditTask}
          onToggleComplete={handleToggleComplete}
        />
      </div>
    </div>
  );
}

export default Pomodoro;