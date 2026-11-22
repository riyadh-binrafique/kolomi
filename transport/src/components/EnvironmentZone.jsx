import React, { useState } from 'react';

export default function EnvironmentZone({
  type, // 'air' | 'river' | 'road'
  title,
  onDropItem,
  activeItem,
  isTouchHovered = false,
  style = {},
  className = '',
}) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      onDropItem(itemId, type);
    }
  };

  const handleZoneClick = () => {
    if (activeItem) {
      onDropItem(activeItem.id, type);
    }
  };

  const isHovered = isOver || isTouchHovered;
  let clueBorderClass = 'border-transparent';

  if (isHovered && activeItem) {
    if (activeItem.type === type) {
      clueBorderClass =
        'border-4 border-emerald-400 bg-emerald-400/20 shadow-[0_0_25px_rgba(52,211,153,0.8),inset_0_0_15px_rgba(52,211,153,0.4)]';
    } else {
      clueBorderClass =
        'border-4 border-rose-500 bg-rose-500/20 shadow-[0_0_25px_rgba(244,63,94,0.8),inset_0_0_15px_rgba(244,63,94,0.4)]';
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleZoneClick}
      title={`Drop ${title} vehicles here`}
      style={style}
      className={`relative transition-all duration-200 cursor-pointer ${clueBorderClass} ${className}`}
    />
  );
}
