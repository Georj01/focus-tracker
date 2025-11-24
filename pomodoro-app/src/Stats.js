
import React from "react";

function Stats({ stats, onReset }) {
  const formatMinutes = (mins) => {
    const hours = Math.floor(mins / 60);
    const minutes = Math.floor(mins % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  };

  return (
    <div className="stats">
      <h4>📊 Estadísticas</h4>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">⏱️ Trabajo total:</span>
          <span className="stat-value">{formatMinutes(stats.totalWork)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">☕ Descanso total:</span>
          <span className="stat-value">{formatMinutes(stats.totalBreak)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">🔄 Ciclos completados:</span>
          <span className="stat-value">{stats.totalCycles}</span>
        </div>
      </div>
      {(stats.totalWork > 0 || stats.totalBreak > 0 || stats.totalCycles > 0) && (
        <button 
          className="reset-stats-btn"
          onClick={onReset}
          aria-label="Reiniciar estadísticas"
        >
          Reiniciar estadísticas
        </button>
      )}
    </div>
  );
}

export default Stats;
