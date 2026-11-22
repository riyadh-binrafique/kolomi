import React, { useState } from 'react';

export default function EnvironmentZone({
  type, // 'air' | 'river' | 'road'
  title,
  icon = '',
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
        'border-4 border-emerald-400 bg-emerald-400/25 shadow-[0_0_30px_rgba(52,211,153,0.9),inset_0_0_20px_rgba(52,211,153,0.4)]';
    } else {
      clueBorderClass =
        'border-4 border-rose-500 bg-rose-500/25 shadow-[0_0_30px_rgba(244,63,94,0.9),inset_0_0_20px_rgba(244,63,94,0.4)]';
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleZoneClick}
      title={`${title} Zone - Drop ${title} vehicles here`}
      style={style}
      className={`relative transition-all duration-200 cursor-pointer flex items-center justify-center ${clueBorderClass} ${className}`}
    >
      {/* Visual Guide Badge when an item is selected or dragged */}
      {activeItem && (
        <div
          className={`pointer-events-none transition-all duration-200 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold tracking-wide uppercase shadow-lg border ${
            isHovered
              ? activeItem.type === type
                ? 'bg-emerald-500 text-white border-white scale-110 animate-bounce'
                : 'bg-rose-500 text-white border-white scale-110'
              : 'bg-black/45 backdrop-blur-sm text-white/90 border-white/30'
          }`}
          style={{ fontFamily: '"Lilita One", "Fredoka", cursive' }}
        >
          {isHovered ? (
            activeItem.type === type ? (
              <span>✓ Match {title}!</span>
            ) : (
              <span>✗ Not {title}</span>
            )
          ) : (
            <span>{icon} {title}</span>
          )}
        </div>
      )}
    </div>
  );
}
