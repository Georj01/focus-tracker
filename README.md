# Focus Tracker & Pomodoro Engine

A high-performance productivity timer and task management application built with React. Designed to maintain strict focus cycles with precise timing execution and session persistence.

## 🎯 Technical Objective

This project demonstrates state management, local data persistence, and performance optimization in React. It moves beyond standard `setInterval` implementations by utilizing native browser APIs to ensure timer accuracy even when the application is running in an inactive or throttled browser tab.

## 🛠️ Core Architecture & Features

- **Precise Timing Engine:** Implements `requestAnimationFrame` paired with delta timestamp comparison (`Date.now()`) to completely eliminate the timer drift commonly caused by browser background-tab throttling.
- **State Persistence:** Seamless integration with `localStorage` to automatically preserve active tasks, custom timer configurations, and aggregate session statistics across browser reloads.
- **Dynamic Task Management:** Real-time array state manipulation for adding, editing, completing, and removing tasks with unique identifier generation.
- **Customizable Intervals:** User-defined duration settings for Work, Short Break, and Long Break cycles, with automatic logical progression (4 work cycles trigger a long break).
- **UI/UX Enhancements:** Native browser notifications API integration, audio feedback on cycle completion, and an integrated dark mode toggle.

## ⚙️ Installation & Execution

The project is initialized via Create React App. No complex backend setup is required.

1. Clone the repository and navigate to the project folder.
2. Install dependencies:
   ```bash
   npm install