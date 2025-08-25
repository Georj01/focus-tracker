import React from "react";

function Stats({ stats }) {
  return (
    <div className="stats">
      <p>Trabajo total: {Math.floor(stats.totalWork / 60)} min</p>
      <p>Descanso total: {Math.floor(stats.totalBreak / 60)} min</p>
      <p>Ciclos completados: {stats.totalCycles}</p>
    </div>
  );
}

export default Stats;
