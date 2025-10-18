/*
 Componente Pomodoro
 - Contiene la lógica principal del temporizador Pomodoro.
 - Hooks usados:
    - mode: modo actual ('work', 'shortBreak', 'longBreak')
    - seconds: segundos restantes del temporizador
    - isRunning: si el temporizador está en marcha
    - cycles: contador de ciclos de trabajo completados
    - darkMode: bandera para tema oscuro
    - customTimes: tiempos configurables para cada modo (en segundos)
    - tasks: lista de tareas (objetos con {text, completed})
    - stats: estadísticas acumuladas (trabajo, descanso, ciclos)
    - audioRef: referencia para reproducir sonido al terminar un ciclo
 - Efectos principales:
    - useEffect para decrementar `seconds` cada segundo cuando `isRunning` es true.
    - useEffect para pedir permiso de notificaciones al cargar.
 - Funciones importantes:
    - handleCycleEnd: se ejecuta cuando el temporizador llega a 0 (reproduce sonido, notifica, actualiza estadísticas y cambia modo).
    - handleStart / handlePause / handleReset: controles del temporizador.
    - handleAddTask / handleEditTask / handleToggleComplete / handleRemoveTask: CRUD básico de tareas.
    - handleTimeChange: actualizar tiempos personalizados (en minutos en la UI, internamente en segundos).
 - Renderiza: audio, toggle de modo oscuro, display del temporizador, controles, ajustes, listas de tareas y estadísticas.
*/

import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import TaskList from "./TaskList";
import Stats from "./Stats";

const defaultTimes = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

function Pomodoro() {
  const [mode, setMode] = useState("work");
  const [seconds, setSeconds] = useState(defaultTimes.work);
  const [isRunning, setIsRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [customTimes, setCustomTimes] = useState(defaultTimes);
  const [tasks, setTasks] = useState([]); // [{text: string, completed: bool}]
  const [taskInput, setTaskInput] = useState("");
  const [stats, setStats] = useState({
    totalWork: 0,
    totalBreak: 0,
    totalCycles: 0,
  });
  const audioRef = useRef(null);

  // Animación para el temporizador
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    let timer;
    if (isRunning && seconds > 0) {
      timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      setAnimate(true);
    } else if (isRunning && seconds === 0) {
      handleCycleEnd();
    }
    return () => {
      clearTimeout(timer);
      setAnimate(false);
    };
  }, [isRunning, seconds]);

  // Solicitar permiso de notificaciones al cargar
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const handleCycleEnd = () => {
    // Sonido
    if (audioRef.current) {
      audioRef.current.play();
    }
    // Notificación
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(
        mode === "work"
          ? "¡Ciclo de trabajo terminado!"
          : "¡Descanso terminado!",
        {
          body:
            mode === "work"
              ? "Hora de descansar."
              : "Hora de volver al trabajo.",
        }
      );
    }
    // Estadísticas
    setStats((prev) => ({
      totalWork:
        mode === "work"
          ? prev.totalWork + customTimes.work / 60
          : prev.totalWork,
      totalBreak:
        mode !== "work"
          ? prev.totalBreak + customTimes[mode] / 60
          : prev.totalBreak,
      totalCycles: mode === "work" ? prev.totalCycles + 1 : prev.totalCycles,
    }));

    if (mode === "work") {
      setCycles(cycles + 1);
      setMode(cycles % 4 === 3 ? "longBreak" : "shortBreak");
      setSeconds(cycles % 4 === 3 ? customTimes.longBreak : customTimes.shortBreak);
    } else {
      setMode("work");
      setSeconds(customTimes.work);
    }
    setIsRunning(false);
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSeconds(customTimes[mode]);
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    const newTimes = {
      ...customTimes,
      [name]: Math.max(1, Number(value)) * 60,
    };
    setCustomTimes(newTimes);
    if (mode === name) setSeconds(newTimes[name]);
  };

  const handleAddTask = () => {
    if (taskInput.trim()) {
      setTasks([...tasks, { text: taskInput.trim(), completed: false }]);
      setTaskInput("");
    }
  };

  const handleRemoveTask = (idx) => {
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  const handleEditTask = (idx, newText) => {
    setTasks(tasks.map((task, i) => i === idx ? { ...task, text: newText } : task));
  };

  const handleToggleComplete = (idx) => {
    setTasks(tasks.map((task, i) => i === idx ? { ...task, completed: !task.completed } : task));
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
        {mode === "work"
          ? "Trabajo"
          : mode === "shortBreak"
          ? "Descanso corto"
          : "Descanso largo"}
      </h2>
      <div
        className={`timer-display${animate ? " animate-timer" : ""}`}
        onAnimationEnd={() => setAnimate(false)}
      >
        {formatTime(seconds)}
      </div>
      <div className="controls">
        <button className="control-btn" onClick={handleStart} disabled={isRunning}>
          Iniciar
        </button>
        <button className="control-btn" onClick={handlePause} disabled={!isRunning}>
          Pausar
        </button>
        <button className="control-btn" onClick={handleReset}>
          Reiniciar
        </button>
      </div>
      <Stats stats={{
        totalWork: stats.totalWork,
        totalBreak: stats.totalBreak,
        totalCycles: stats.totalCycles
      }} />
      <div className="settings">
        <h4>Personalizar tiempos (minutos):</h4>
        <label>
          Trabajo:
          <input
            type="number"
            name="work"
            min="1"
            value={customTimes.work / 60}
            onChange={handleTimeChange}
          />
        </label>
        <label>
          Descanso corto:
          <input
            type="number"
            name="shortBreak"
            min="1"
            value={customTimes.shortBreak / 60}
            onChange={handleTimeChange}
          />
        </label>
        <label>
          Descanso largo:
          <input
            type="number"
            name="longBreak"
            min="1"
            value={customTimes.longBreak / 60}
            onChange={handleTimeChange}
          />
        </label>
      </div>
      <div className="task-list">
        <h4>Tareas</h4>
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Añadir tarea"
        />
        <button className="control-btn" onClick={handleAddTask}>
          Añadir
        </button>
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