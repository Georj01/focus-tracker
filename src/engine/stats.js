// Productivity Analytics & Streak Tracker
// Tracks completed focus sessions, focus minutes, daily streaks, and 7-day history

class StatsTracker {
    constructor() {
        this.totalFocusMinutes = 0;
        this.completedSessions = 0;
        this.currentStreak     = 0;
        this.lastActiveDate    = '';
        this.todayFocusMinutes = 0;
        this.dailyHistory      = {};

        this.load();
    }

    formatDateString(d) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    getTodayString() {
        return this.formatDateString(new Date());
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
                if (s.dailyHistory && typeof s.dailyHistory === 'object') {
                    this.dailyHistory = s.dailyHistory;
                }

                const today = this.getTodayString();
                if (this.lastActiveDate && this.lastActiveDate !== today) {
                    this.todayFocusMinutes = 0;
                }
                if (this.todayFocusMinutes > 0 && !this.dailyHistory[today]) {
                    this.dailyHistory[today] = this.todayFocusMinutes;
                }
            }
        } catch (_) {}
    }

    save() {
        try {
            // Prune history older than 14 days to keep storage minimal
            const keys = Object.keys(this.dailyHistory).sort();
            while (keys.length > 14) {
                const oldest = keys.shift();
                delete this.dailyHistory[oldest];
            }

            localStorage.setItem('pomodoroStats', JSON.stringify({
                totalFocusMinutes: this.totalFocusMinutes,
                completedSessions: this.completedSessions,
                currentStreak:     this.currentStreak,
                lastActiveDate:    this.lastActiveDate,
                todayFocusMinutes: this.todayFocusMinutes,
                dailyHistory:      this.dailyHistory
            }));
        } catch (_) {}
    }

    recordCompletedSession(focusMinutes) {
        const mins = Math.max(1, Number(focusMinutes) || 25);
        this.completedSessions++;
        this.totalFocusMinutes += mins;
        this.todayFocusMinutes += mins;

        const today     = this.getTodayString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yestStr   = this.formatDateString(yesterday);

        if (!this.lastActiveDate) {
            this.currentStreak = 1;
        } else if (this.lastActiveDate === yestStr) {
            this.currentStreak++;
        } else if (this.lastActiveDate !== today) {
            this.currentStreak = 1;
        }

        this.lastActiveDate      = today;
        this.dailyHistory[today] = (this.dailyHistory[today] || 0) + mins;
        this.save();
    }

    getWeeklyHistory() {
        const result   = [];
        const todayStr = this.getTodayString();
        for (let i = 6; i >= 0; i--) {
            const d       = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = this.formatDateString(d);
            const dayLbl  = `${d.getMonth() + 1}/${d.getDate()}`;
            const minutes = dateStr === todayStr ? this.todayFocusMinutes : (this.dailyHistory[dateStr] || 0);
            result.push({
                date:    dateStr,
                label:   dayLbl,
                minutes: minutes,
                isToday: dateStr === todayStr
            });
        }
        return result;
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

