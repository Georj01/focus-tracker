// Task & To-Do Management System
// Persistent local-first task tracking with active HUD focus & Pomodoro estimation

import { sound } from './audio.js';
import { i18n } from './i18n.js';

class TaskManager {
    constructor() {
        this.tasks        = [];
        this.activeTaskId = null;
        this.load();
    }

    load() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('pomodoroTasks');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed.tasks)) {
                        this.tasks = parsed.tasks
                            .filter(t => t && typeof t.text === 'string')
                            .map(t => ({
                                ...t,
                                pomodorosCompleted: typeof t.pomodorosCompleted === 'number' ? t.pomodorosCompleted : 0,
                                pomodorosTarget:    typeof t.pomodorosTarget === 'number' ? t.pomodorosTarget : 1
                            }));
                    }
                    if (typeof parsed.activeTaskId === 'string') {
                        this.activeTaskId = parsed.activeTaskId;
                    }
                }
            }
        } catch (_) {}

        // If no tasks exist, provide a helpful default focus task
        if (this.tasks.length === 0) {
            const defaultTask = {
                id:                 'task_' + Date.now(),
                text:               i18n.t('defaultTask'),
                completed:          false,
                pomodorosCompleted: 0,
                pomodorosTarget:    2,
                createdAt:          Date.now()
            };
            this.tasks.push(defaultTask);
            this.activeTaskId = defaultTask.id;
            this.save();
        }
    }

    save() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('pomodoroTasks', JSON.stringify({
                    tasks:        this.tasks,
                    activeTaskId: this.activeTaskId
                }));
            }
        } catch (_) {}
    }

    getTasks() {
        return this.tasks;
    }

    getActiveTask() {
        if (!this.activeTaskId) {
            const firstUnfinished = this.tasks.find(t => !t.completed);
            return firstUnfinished || null;
        }
        return this.tasks.find(t => t.id === this.activeTaskId) || null;
    }

    setActiveTask(id) {
        this.activeTaskId = id;
        this.save();
    }

    addTask(text, target = 1) {
        const trimmed = (text || '').trim();
        if (!trimmed) return null;

        const est = Math.max(1, Math.min(8, parseInt(target, 10) || 1));
        const newTask = {
            id:                 'task_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            text:               trimmed.substring(0, 60),
            completed:          false,
            pomodorosCompleted: 0,
            pomodorosTarget:    est,
            createdAt:          Date.now()
        };

        this.tasks.unshift(newTask);
        if (!this.activeTaskId || this.getActiveTask()?.completed) {
            this.activeTaskId = newTask.id;
        }

        this.save();
        sound.play('click');
        return newTask;
    }

    cycleTaskTarget(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;
        task.pomodorosTarget = (task.pomodorosTarget % 8) + 1;
        this.save();
        sound.play('click');
    }

    incrementActiveTaskPomodoro() {
        const active = this.getActiveTask();
        if (!active) return;
        active.pomodorosCompleted = (active.pomodorosCompleted || 0) + 1;
        this.save();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        task.completed = !task.completed;
        if (task.completed) {
            sound.play('task_complete');
            // If completed active task, auto-advance to next unfinished task
            if (this.activeTaskId === id) {
                const next = this.tasks.find(t => !t.completed && t.id !== id);
                this.activeTaskId = next ? next.id : null;
            }
        } else {
            sound.play('click');
            if (!this.activeTaskId) {
                this.activeTaskId = id;
            }
        }

        this.save();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        if (this.activeTaskId === id) {
            const next = this.tasks.find(t => !t.completed);
            this.activeTaskId = next ? next.id : null;
        }
        this.save();
        sound.play('click');
    }
}

export const taskManager = new TaskManager();

