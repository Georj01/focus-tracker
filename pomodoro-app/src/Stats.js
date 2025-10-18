import React from "react";

/*
 Componente Stats
 - Muestra estadísticas simples calculadas por `Pomodoro`:
    - Tiempo total de trabajo (minutos)
    - Tiempo total de descanso (minutos)
    - Ciclos completados
 - Es un componente de presentación que recibe `stats` por props.
*/

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
