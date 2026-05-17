import React, { useState, useEffect } from 'react';

const SettingsPanel = ({ onBack, onSaveTheme, onClearAll }) => {
  const [settings, setSettings] = useState({
    hotkey: 'CommandOrControl+Shift+V',
    retentionLimit: 500,
    theme: 'system',
    monitoringEnabled: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load current settings from store
    window.clipmate.getSettings().then(setSettings);
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await window.clipmate.updateSettings(settings);
      
      // Phase 6.5: Apply theme change immediately
      if (onSaveTheme) {
        onSaveTheme(settings.theme);
      }

      onBack();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = async () => {
    const confirmed = window.confirm("Are you sure you want to clear ALL clipboard history? This will also delete all cached images on your hard drive. This action cannot be undone.");
    if (!confirmed) return;
    
    try {
      const res = await window.clipmate.clearAllClips();
      if (res.success) {
        if (onClearAll) {
          onClearAll();
        }
        alert("All clips cleared successfully!");
      }
    } catch (err) {
      console.error("Failed to clear clips:", err);
      alert("Failed to clear clips");
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: '20px',
    }} className="no-drag">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px' }}>Settings</h2>
        <button
          onClick={onBack}
          aria-label="Back to clipboard history"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="hotkey-input" style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
            Global Hotkey
          </label>
          <input
            id="hotkey-input"
            type="text"
            value={settings.hotkey}
            onChange={(e) => handleChange('hotkey', e.target.value)}
            aria-label="Global hotkey shortcut"
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
            placeholder="e.g. CommandOrControl+Shift+V"
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="limit-input" style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
            Retention Limit (Max Clips)
          </label>
          <input
            id="limit-input"
            type="number"
            value={settings.retentionLimit}
            onChange={(e) => handleChange('retentionLimit', parseInt(e.target.value, 10))}
            aria-label="Maximum clips to retain"
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
            min="10"
            max="2000"
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="theme-select" style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
            Theme
          </label>
          <select
            id="theme-select"
            value={settings.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            aria-label="Application theme selection"
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="system">Follow System</option>
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="monitoringEnabled"
            checked={settings.monitoringEnabled}
            onChange={(e) => handleChange('monitoringEnabled', e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            aria-label="Enable or disable clipboard monitoring"
          />
          <label htmlFor="monitoringEnabled" style={{ fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
            Enable Clipboard Monitoring
          </label>
        </div>

        {/* Danger Zone: Clear all clips */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <h4 style={{ fontSize: '12px', color: '#ef4444', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Danger Zone
          </h4>
          <button
            type="button"
            onClick={handleClearAll}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ef4444',
              backgroundColor: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Clear All Clipboard History
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          aria-label="Save settings modifications"
          style={{
            marginTop: 'auto',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: 'var(--accent)',
            color: 'white',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default SettingsPanel;
