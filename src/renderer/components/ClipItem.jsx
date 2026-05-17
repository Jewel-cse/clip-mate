import React, { useEffect, useRef } from 'react';

const ClipItem = ({ clip, isSelected, onCopy, onDelete }) => {
  const itemRef = useRef(null);

  useEffect(() => {
    if (isSelected && itemRef.current) {
      itemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isSelected]);

  const getIcon = () => {
    if (clip.type === 'link') return '🔗';
    if (clip.type === 'image') {
      if (clip.thumbnail) {
        return (
          <img
            src={clip.thumbnail}
            alt=""
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '4px',
              objectFit: 'cover',
              border: '1px solid var(--border)',
              display: 'block',
            }}
          />
        );
      }
      return '🖼️';
    }
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

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(clip.id);
    }
  };

  return (
    <div
      ref={itemRef}
      onClick={() => onCopy(clip.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 16px',
        margin: '8px 12px',
        borderRadius: '6px',
        border: '0.5px solid var(--border)',
        boxShadow: isSelected 
          ? '0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)' 
          : '0 2px 6px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
        backgroundColor: isSelected ? 'var(--hover-bg)' : 'var(--bg-primary)',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      className="no-drag clip-item-row"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', marginRight: '15px' }}>
        {getIcon()}
      </div>
      
      <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {clip.content}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '15px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          {formatRelativeTime(clip.timestamp)}
        </div>
        <button
          onClick={handleDelete}
          aria-label="Delete clip"
          className="delete-btn"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: '4px',
            lineHeight: 1,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ClipItem;
