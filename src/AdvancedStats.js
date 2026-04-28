import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

function AdvancedStats({ stats, dailyStats }) {
  const { t } = useTranslation();

  const formatMinutes = (mins) => {
    const hours = Math.floor(mins / 60);
    const minutes = Math.floor(mins % 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  };

  return (
    <div className="advanced-stats">
      <h4>{t('labels.statistics')}</h4>
      
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">{t('labels.workTime')}</span>
          <span className="stat-value">{formatMinutes(stats.totalWork)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{t('labels.breakTime')}</span>
          <span className="stat-value">{formatMinutes(stats.totalBreak)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{t('labels.completedCycles')}</span>
          <span className="stat-value">{stats.totalCycles}</span>
        </div>
      </div>

      {dailyStats && dailyStats.length > 0 && (
        <div className="charts-container">
          <h5>{t('labels.weeklyStats')}</h5>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip contentStyle={{ background: 'rgba(35, 39, 47, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Bar dataKey="cycles" fill="#61dafb" name="Cycles" />
              <Bar dataKey="workMin" fill="#4caf50" name="Work Min." />
            </BarChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300} style={{ marginTop: '20px' }}>
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip contentStyle={{ background: 'rgba(35, 39, 47, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="cycles" stroke="#61dafb" name="Accumulated cycles" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default AdvancedStats;
