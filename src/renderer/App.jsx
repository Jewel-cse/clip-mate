import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import ClipList from './components/ClipList';
import SettingsPanel from './components/SettingsPanel';
import Toast from './components/Toast';
import './styles/global.css';

const App = () => {
  const [view, setView] = useState('history'); // 'history' | 'settings'
  const [clips, setClips] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  // Phase 6.5: Function to apply theme at runtime
  const applyTheme = useCallback((theme) => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, []);

  // Fetch initial theme on startup
  useEffect(() => {
    window.clipmate.getSettings().then((settings) => {
      if (settings && settings.theme) {
        applyTheme(settings.theme);
      }
    });
  }, [applyTheme]);

  // Fetch and filter clips
  useEffect(() => {
    if (view !== 'history') return;

    const fetchClips = async () => {
      if (query.trim() === '') {
        window.clipmate.getAllClips().then(setClips);
      } else {
        window.clipmate.searchClips(query).then(setClips);
      }
      setSelectedIndex(0); // Reset selection on new search
    };

    const debounceTimeout = setTimeout(fetchClips, 150);
    return () => clearTimeout(debounceTimeout);
  }, [query, view]);

  // Listen for new clips
  useEffect(() => {
    if (view !== 'history' || query.trim() !== '') return;

    const unsubscribe = window.clipmate.onNewClip((newClip) => {
      setClips((prev) => {
        if (prev.length > 0 && prev[0].id === newClip.id) return prev;
        return [newClip, ...prev];
      });
      setSelectedIndex(0);
    });

    return unsubscribe;
  }, [query, view]);

  const handleCopy = useCallback(async (id) => {
    try {
      const res = await window.clipmate.copyClip(id);
      if (res.success) {
        setToastMessage('Copied!');
        setTimeout(() => window.clipmate.hideWindow(), 800);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      setToastMessage('Copy failed');
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (view !== 'history') return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < clips.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (clips.length > 0 && clips[selectedIndex]) {
          handleCopy(clips[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        window.clipmate.hideWindow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clips, selectedIndex, handleCopy, view]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Draggable Titlebar (Phase 4.8 / 5.6) */}
      <div className="titlebar-drag" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '5px 15px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        height: '35px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: 'var(--text-muted)',
      }}>
        <span>ClipMate</span>
        {view === 'history' && (
          <button
            onClick={() => setView('settings')}
            className="no-drag"
            aria-label="Open settings panel"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              outline: 'none',
            }}
            title="Settings"
          >
            ⚙️
          </button>
        )}
      </div>

      {/* Main View Container */}
      <div style={{ flex: 1, marginTop: '35px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {view === 'history' ? (
          <>
            <SearchBar query={query} onChange={setQuery} />
            <ClipList clips={clips} selectedIndex={selectedIndex} onCopy={handleCopy} />
          </>
        ) : (
          <SettingsPanel onBack={() => setView('history')} onSaveTheme={applyTheme} />
        )}
      </div>
      
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default App;
