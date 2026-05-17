import React from 'react';
import ClipItem from './ClipItem';

const ClipList = ({ clips, selectedIndex, onCopy }) => {
  if (clips.length === 0) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No clips found.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {clips.map((clip, index) => (
        <ClipItem
          key={clip.id}
          clip={clip}
          isSelected={index === selectedIndex}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
};

export default ClipList;
