// Productivity Analytics & Streak Tracker
// Tracks completed focus sessions, focus minutes, and daily streaks

class StatsTracker {
    constructor() {
        this.totalFocusMinutes = 0;
        this.completedSessions = 0;
        this.currentStreak     = 0;
        this.lastActiveDate    = '';
        this.todayFocusMinutes = 0;

        this.load();
    }

    getTodayString() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    load() {
        try {
            const saved = localStorage.getItem('pomodoroStats');
            if (saved) {
                const s = JSON.parse(saved);
                if (typeof s.totalFocusMinutes === 'number') this.totalFocusMinutes = s.totalFocusMinutes;
                if (typeof s.completedSessions === 'number') this.completedSessions = s.completedSessions;
                if (typeof s.currentStreak === 'number')     this.currentStreak     = s.currentStreak;
                if (typeof s.lastActiveDate === 'string')    this.lastActiveDate    = s.lastActiveDate;
                if (typeof s.todayFocusMinutes === 'number') this.todayFocusMinutes = s.todayFocusMinutes;

                // Reset today's minutes if it's a new day
                const today = this.getTodayString();
                if (this.lastActiveDate && this.lastActiveDate !== today) {
                    this.todayFocusMinutes = 0;
                }
            }
        } catch (_) {}
    }

    save() {
        try {
            localStorage.setItem('pomodoroStats', JSON.stringify({
                totalFocusMinutes: this.totalFocusMinutes,
                completedSessions: this.completedSessions,
                currentStreak:     this.currentStreak,
                lastActiveDate:    this.lastActiveDate,
                todayFocusMinutes: this.todayFocusMinutes
            }));
        } catch (_) {}
    }

    recordCompletedSession(focusMinutes) {
        this.completedSessions++;
        this.totalFocusMinutes += focusMinutes;
        this.todayFocusMinutes += focusMinutes;

        const today     = this.getTodayString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yestStr   = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

        if (!this.lastActiveDate) {
            this.currentStreak = 1;
        } else if (this.lastActiveDate === yestStr) {
            this.currentStreak++;
        } else if (this.lastActiveDate !== today) {
            this.currentStreak = 1;
        }

        this.lastActiveDate = today;
        this.save();
    }

    getStats() {
        return {
            totalFocusMinutes: this.totalFocusMinutes,
            todayFocusMinutes: this.todayFocusMinutes,
            completedSessions: this.completedSessions,
            currentStreak:     this.currentStreak
        };
    }
}

export const statsTracker = new StatsTracker();
