import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function Settings({ customTimes, onTimeChange, notifications, onNotificationChange, focusMode, onFocusModeChange, language, onLanguageChange, selectedSound, onSoundChange, customMessage, onCustomMessageChange }) {
  const { t } = useTranslation();
  const [previewingSound, setPreviewingSound] = useState(null);

  const soundOptions = [
    { id: 'default', name: t('sounds.default'), url: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg' },
    { id: 'chime', name: t('sounds.chime'), url: 'https://actions.google.com/sounds/v1/alarms/chime.ogg' },
    { id: 'alert', name: t('sounds.alert'), url: 'https://actions.google.com/sounds/v1/alarms/alert.ogg' },
    { id: 'beep', name: t('sounds.beep'), url: 'https://actions.google.com/sounds/v1/alarms/beep.ogg' },
  ];

  const playSound = (url) => {
    const audio = new Audio(url);
    audio.play().catch(err => console.error('Error playing sound:', err));
  };

  return (
    <div className="settings-container">
      <div className="settings-section">
        <h4>{t('labels.customTimes')}</h4>
        <div className="settings-grid">
          <label htmlFor="work-time">
            {t('labels.work')}
            <input
              id="work-time"
              type="number"
              min="1"
              max="60"
              value={customTimes.work / 60}
              onChange={(e) => onTimeChange('work', e.target.value)}
            />
          </label>
          <label htmlFor="short-break-time">
            {t('labels.shortBreak')}
            <input
              id="short-break-time"
              type="number"
              min="1"
              max="30"
              value={customTimes.shortBreak / 60}
              onChange={(e) => onTimeChange('shortBreak', e.target.value)}
            />
          </label>
          <label htmlFor="long-break-time">
            {t('labels.longBreak')}
            <input
              id="long-break-time"
              type="number"
              min="1"
              max="60"
              value={customTimes.longBreak / 60}
              onChange={(e) => onTimeChange('longBreak', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h4>{t('labels.notifications')}</h4>
        <label htmlFor="enable-notif">
          <input
            id="enable-notif"
            type="checkbox"
            checked={notifications.enabled}
            onChange={(e) => onNotificationChange('enabled', e.target.checked)}
          />
          {t('labels.enableNotifications')}
        </label>
        {notifications.enabled && (
          <div className="notification-settings">
            <label htmlFor="custom-msg">
              {t('labels.customMessage')}:
              <input
                id="custom-msg"
                type="text"
                value={notifications.customMessage}
                onChange={(e) => onCustomMessageChange(e.target.value)}
                placeholder={t('labels.customMessage')}
                maxLength="50"
              />
            </label>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h4>{t('labels.sounds')}</h4>
        <label htmlFor="sound-select">
          {t('labels.selectSound')}:
          <select
            id="sound-select"
            value={selectedSound}
            onChange={(e) => onSoundChange(e.target.value)}
          >
            {soundOptions.map(sound => (
              <option key={sound.id} value={sound.id}>{sound.name}</option>
            ))}
          </select>
        </label>
        <button
          className="preview-btn"
          onClick={() => {
            const sound = soundOptions.find(s => s.id === selectedSound);
            setPreviewingSound(selectedSound);
            playSound(sound.url);
            setTimeout(() => setPreviewingSound(null), 1000);
          }}
        >
          {previewingSound === selectedSound ? '⏸️ Playing...' : '🔊 ' + t('labels.previewSound')}
        </button>
      </div>

      <div className="settings-section">
        <h4>{t('labels.focusMode')}</h4>
        <label htmlFor="focus-mode">
          <input
            id="focus-mode"
            type="checkbox"
            checked={focusMode}
            onChange={(e) => onFocusModeChange(e.target.checked)}
          />
          {t('labels.enableFocusMode')}
        </label>
        {focusMode && <p className="focus-hint">Tasks and settings hidden. Stay focused! 🎯</p>}
      </div>

      <div className="settings-section">
        <h4>🌐 Language</h4>
        <label htmlFor="language-select">
          <select
            id="language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </label>
      </div>
    </div>
  );
}

export default Settings;
