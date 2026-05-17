import React, { useEffect, useRef } from 'react';

const ClipItem = ({ clip, isSelected, onCopy }) => {
  const itemRef = useRef(null);

  useEffect(() => {
    if (isSelected && itemRef.current) {
      itemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isSelected]);

  const getIcon = () => {
    if (clip.type === 'link') return '🔗';
    if (clip.type === 'image') return '🖼️';
    return '🔤';
  };

  const formatRelativeTime = (isoString) => {
    const diffMs = new Date() - new Date(isoString);
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs}s`;
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  return (
    <div
      ref={itemRef}
      onClick={() => onCopy(clip.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: isSelected ? 'var(--hover-bg)' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.1s ease',
      }}
      className="no-drag"
    >
      <div style={{ fontSize: '18px', marginRight: '15px' }}>{getIcon()}</div>
      
      <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {clip.type === 'image' ? (
          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Image Data</span>
        ) : (
          clip.content
        )}
      </div>

      <div style={{ marginLeft: '15px', color: 'var(--text-muted)', fontSize: '12px' }}>
        {formatRelativeTime(clip.timestamp)}
      </div>
    </div>
  );
};

export default ClipItem;
