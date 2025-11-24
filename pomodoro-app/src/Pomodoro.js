import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import "./App.css";
import TaskList from "./TaskList";
import Stats from "./Stats";
import AdvancedStats from "./AdvancedStats";
import Settings from "./Settings";

const defaultTimes = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

function Pomodoro() {
  const { t, i18n } = useTranslation();

  // Cargar datos desde localStorage
  const loadFromStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return defaultValue;
    }
  };

  // Estados principales
  const [mode, setMode] = useState(() => loadFromStorage('pomodoroMode', 'work'));
  const [seconds, setSeconds] = useState(() => loadFromStorage('pomodoroSeconds', defaultTimes.work));
  const [isRunning, setIsRunning] = useState(false);
  const [cycles, setCycles] = useState(() => loadFromStorage('pomodoroCycles', 0));
  const [darkMode, setDarkMode] = useState(() => loadFromStorage('pomodoroDarkMode', false));
  const [customTimes, setCustomTimes] = useState(() => loadFromStorage('pomodoroCustomTimes', defaultTimes));
  const [tasks, setTasks] = useState(() => loadFromStorage('pomodoroTasks', []));
  const [taskInput, setTaskInput] = useState("");
  const [stats, setStats] = useState(() => loadFromStorage('pomodoroStats', {
    totalWork: 0,
    totalBreak: 0,
    totalCycles: 0,
  }));
  const [focusMode, setFocusMode] = useState(() => loadFromStorage('pomodoroFocusMode', false));
  const [showSettings, setShowSettings] = useState(false);
  
  // Notificaciones y sonidos
  const [notifications, setNotifications] = useState(() => 
    loadFromStorage('pomodoroNotifications', {
      enabled: true,
      customMessage: '',
    })
  );
  const [selectedSound, setSelectedSound] = useState(() => 
    loadFromStorage('pomodoroSound', 'default')
  );
  
  // Historial y estadísticas semanales
  const [dailyStats, setDailyStats] = useState(() => 
    loadFromStorage('pomodoroDailyStats', [])
  );
  const [language, setLanguage] = useState(() => 
    loadFromStorage('pomodoroLanguage', 'es')
  );

  const audioRef = useRef(null);
  const [animate, setAnimate] = useState(false);

  // Persistencia en localStorage
  useEffect(() => {
    localStorage.setItem('pomodoroMode', JSON.stringify(mode));
    localStorage.setItem('pomodoroSeconds', JSON.stringify(seconds));
    localStorage.setItem('pomodoroCycles', JSON.stringify(cycles));
    localStorage.setItem('pomodoroDarkMode', JSON.stringify(darkMode));
    localStorage.setItem('pomodoroCustomTimes', JSON.stringify(customTimes));
    localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
    localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    localStorage.setItem('pomodoroFocusMode', JSON.stringify(focusMode));
    localStorage.setItem('pomodoroNotifications', JSON.stringify(notifications));
    localStorage.setItem('pomodoroSound', JSON.stringify(selectedSound));
    localStorage.setItem('pomodoroDailyStats', JSON.stringify(dailyStats));
    localStorage.setItem('pomodoroLanguage', JSON.stringify(language));
  }, [mode, seconds, cycles, darkMode, customTimes, tasks, stats, focusMode, notifications, selectedSound, dailyStats, language]);

  // Cambiar idioma
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Solicitar permiso de notificaciones al cargar
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Actualizar estadísticas diarias
  const updateDailyStats = useCallback(() => {
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'short' });
    const todayIndex = dailyStats.findIndex(d => d.day === today);
    
    if (todayIndex >= 0) {
      const updated = [...dailyStats];
      updated[todayIndex] = {
        ...updated[todayIndex],
        cycles: updated[todayIndex].cycles + 1,
        workMin: updated[todayIndex].workMin + (customTimes.work / 60),
      };
      setDailyStats(updated);
    } else {
      const newDay = {
        day: today,
        cycles: 1,
        workMin: customTimes.work / 60,
      };
      setDailyStats([...dailyStats.slice(-6), newDay]);
    }
  }, [customTimes, dailyStats]);

  const handleCycleEnd = useCallback(() => {
    // Reproducir sonido seleccionado
    if (audioRef.current) {
      const soundUrls = {
        default: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
        chime: 'https://actions.google.com/sounds/v1/alarms/chime.ogg',
        alert: 'https://actions.google.com/sounds/v1/alarms/alert.ogg',
        beep: 'https://actions.google.com/sounds/v1/alarms/beep.ogg',
      };
      audioRef.current.src = soundUrls[selectedSound] || soundUrls.default;
      audioRef.current.play().catch(err => console.error('Error reproduciendo audio:', err));
    }

    // Enviar notificación personalizada
    if (notifications.enabled && "Notification" in window && Notification.permission === "granted") {
      const isWorkFinished = mode === "work";
      const title = isWorkFinished ? t('notifications.workFinished') : t('notifications.breakFinished');
      const body = notifications.customMessage || (isWorkFinished ? t('notifications.workFinishedBody') : t('notifications.breakFinishedBody'));
      
      new Notification(title, {
        body: body,
        icon: "/logo192.png",
      });
    }

    // Actualizar estadísticas
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

    // Cambiar modo y actualizar estadísticas diarias
    if (mode === "work") {
      const newCycles = cycles + 1;
      setCycles(newCycles);
      updateDailyStats();
      const nextMode = newCycles % 4 === 0 ? "longBreak" : "shortBreak";
      setMode(nextMode);
      setSeconds(customTimes[nextMode]);
    } else {
      setMode("work");
      setSeconds(customTimes.work);
    }
    setIsRunning(false);
  }, [mode, cycles, customTimes, notifications, selectedSound, t, updateDailyStats]);

  // Temporizador
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
  }, [isRunning, seconds, handleCycleEnd]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSeconds(customTimes[mode]);
  };

  const handleTimeChange = (field, value) => {
    const newTimes = {
      ...customTimes,
      [field]: Math.max(1, Number(value)) * 60,
    };
    setCustomTimes(newTimes);
    if (field === mode && !isRunning) {
      setSeconds(newTimes[field]);
    }
  };

  const handleAddTask = () => {
    if (taskInput.trim()) {
      setTasks([...tasks, { text: taskInput.trim(), completed: false, id: Date.now() }]);
      setTaskInput("");
    }
  };

  const handleRemoveTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleEditTask = (id, newText) => {
    setTasks(tasks.map((task) => task.id === id ? { ...task, text: newText } : task));
  };

  const handleToggleComplete = (id) => {
    setTasks(tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const handleResetStats = () => {
    if (window.confirm(t('notifications.confirmReset'))) {
      setStats({
        totalWork: 0,
        totalBreak: 0,
        totalCycles: 0,
      });
      setCycles(0);
      setDailyStats([]);
    }
  };

  const getModeTitle = () => {
    switch(mode) {
      case "work": return t('modes.work');
      case "shortBreak": return t('modes.shortBreak');
      case "longBreak": return t('modes.longBreak');
      default: return "Pomodoro";
    }
  };

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className={`pomodoro-container${darkMode ? " dark" : ""}`}>
      <audio 
        ref={audioRef} 
        preload="auto"
        aria-hidden="true"
      />

      <button 
        className="dark-mode-toggle" 
        onClick={() => setDarkMode(!darkMode)}
        aria-label={darkMode ? t('buttons.lightMode') : t('buttons.darkMode')}
      >
        {darkMode ? "🌙" : "☀️"}
      </button>

      <button 
        className="settings-toggle" 
        onClick={() => setShowSettings(!showSettings)}
        aria-label="Toggle settings"
      >
        ⚙️
      </button>

      {showSettings && !focusMode && (
        <Settings
          customTimes={customTimes}
          onTimeChange={handleTimeChange}
          notifications={notifications}
          onNotificationChange={(key, value) => setNotifications({...notifications, [key]: value})}
          focusMode={focusMode}
          onFocusModeChange={setFocusMode}
          language={language}
          onLanguageChange={setLanguage}
          selectedSound={selectedSound}
          onSoundChange={setSelectedSound}
          customMessage={notifications.customMessage}
          onCustomMessageChange={(msg) => setNotifications({...notifications, customMessage: msg})}
        />
      )}

      {!focusMode && <h2>{getModeTitle()}</h2>}
      
      <div
        className={`timer-display${animate ? " animate-timer" : ""}`}
        onAnimationEnd={() => setAnimate(false)}
        role="timer"
        aria-live="polite"
      >
        {formatTime(seconds)}
      </div>
      
      <div className="controls">
        <button 
          className="control-btn" 
          onClick={handleStart} 
          disabled={isRunning}
          aria-label={t('buttons.start')}
        >
          {t('buttons.start')}
        </button>
        <button 
          className="control-btn" 
          onClick={handlePause} 
          disabled={!isRunning}
          aria-label={t('buttons.pause')}
        >
          {t('buttons.pause')}
        </button>
        <button 
          className="control-btn" 
          onClick={handleReset}
          aria-label={t('buttons.reset')}
        >
          {t('buttons.reset')}
        </button>
      </div>

      {!focusMode && (
        <>
          <AdvancedStats 
            stats={stats}
            dailyStats={dailyStats}
          />
          
          <Stats 
            stats={stats}
            onReset={handleResetStats}
          />

          <div className="task-list">
            <h4>{t('labels.tasks')}</h4>
            <div className="task-input-group">
              <label htmlFor="task-input" className="sr-only">{t('labels.newTask')}</label>
              <input
                id="task-input"
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder={t('labels.addTask')}
                maxLength="100"
              />
              <button 
                className="control-btn" 
                onClick={handleAddTask}
                aria-label={t('buttons.add')}
              >
                {t('buttons.add')}
              </button>
            </div>
            <TaskList
              tasks={tasks}
              onRemove={handleRemoveTask}
              onEdit={handleEditTask}
              onToggleComplete={handleToggleComplete}
            />
          </div>
        </>
      )}

      {focusMode && (
        <div className="focus-mode-message">
          <p>🎯 {t('labels.enableFocusMode')}</p>
          <p>Stay focused on your work!</p>
        </div>
      )}
    </div>
  );
}

export default Pomodoro;
