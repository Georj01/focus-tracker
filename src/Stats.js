import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

function Stats({ stats, onReset }) {
  const { totalWork, totalBreak, totalCycles } = stats;

  if (totalWork + totalBreak === 0) {
    return (
      <div className="stats" style={{ opacity: 0.6, textAlign: 'center', padding: '2rem 1rem' }}>
        No hay datos de sesión todavía
      </div>
    );
  }

  const data = [
    { name: "Trabajo", value: Math.round(totalWork) },
    { name: "Descanso", value: Math.round(totalBreak) }
  ];

  const COLORS = ['#4CAF50', '#2196F3'];

  return (
    <div className="stats">
      <h4>📊 Estadísticas</h4>
      
      <div style={{ textAlign: 'center', margin: '0.5rem 0', fontSize: '0.9rem', opacity: 0.8 }}>
        Ciclos completados: <strong>{totalCycles}</strong>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} min`, null]}
              contentStyle={{ borderRadius: '8px', border: 'none', color: '#000', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
              itemStyle={{ color: '#000' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {(totalWork > 0 || totalBreak > 0 || totalCycles > 0) && (
        <button 
          className="reset-stats-btn"
          onClick={onReset}
          aria-label="Reiniciar estadísticas"
          style={{ display: 'block', margin: '1rem auto 0' }}
        >
          Reiniciar estadísticas
        </button>
      )}
    </div>
  );
}

export default Stats;
