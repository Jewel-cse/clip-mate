import React, { useRef, useEffect } from 'react';

const SearchBar = ({ query, onChange }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-focus on mount
    inputRef.current?.focus();

    // Listen for Ctrl/Cmd+F to focus search
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)' }} className="no-drag">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search clips... (Ctrl+F)"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 15px',
          fontSize: '16px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          outline: 'none',
        }}
      />
    </div>
  );
};

export default SearchBar;
