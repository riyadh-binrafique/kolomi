import React, { useRef, useState } from 'react';
import FoodItem from './FoodItem';

export default function DropZone({
  type, // 'healthy' or 'unhealthy'
  badgeSrc,
  badgePosition = 'bottom-left', // 'bottom-left' or 'bottom-right'
  items = [],
  onDropItem,
  onRemoveItem,
  activeItem = null, // currently dragged item { id, name, type }
  isTouchHovered = false, // true if finger is currently over this box
  className = '',
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      onDropItem(itemId, type);
    }
  };

  const handleClick = () => {
    if (activeItem) {
      onDropItem(activeItem.id, type);
    }
  };

  // Clue stroke is ONLY shown when the item is being dragged OVER this specific box
  const isHovered = isDragOver || isTouchHovered;

  let clueBorder = '';
  if (isHovered && activeItem) {
    const isCorrect = activeItem.type === type;
    if (isCorrect) {
      // GREEN STROKE clue: right item dragged in the right box
      clueBorder = 'border-4 !border-green-500 shadow-[0_0_35px_rgba(34,197,94,1)] ring-4 ring-green-400/80 scale-[1.02] bg-emerald-950/50';
    } else {
      // RED STROKE clue: wrong item dragged in the wrong box
      clueBorder = 'border-4 !border-red-500 shadow-[0_0_35px_rgba(239,68,68,1)] ring-4 ring-red-400/80 scale-[1.02] bg-rose-950/50';
    }
  } else if (items.length > 0) {
    clueBorder = 'border-2 border-[#22c55e]/60';
  }

  return (
    <div
      data-dropzone={type}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative rounded-3xl p-3 sm:p-4 transition-all duration-200 board-panel w-full h-full flex flex-col justify-between cursor-pointer ${clueBorder} ${className}`}
    >
      {/* Floating clue text badge ONLY shown when dragging over this box */}
      {isHovered && activeItem && (
        <div
          className={`absolute -top-4 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-lg pointer-events-none z-30 animate-bounce ${
            activeItem.type === type
              ? 'bg-green-600 border-2 border-green-200 shadow-green-500/50'
              : 'bg-red-600 border-2 border-red-200 shadow-red-500/50'
          }`}
        >
          {activeItem.type === type ? '✓ Good Choice!' : '✕ Wrong Box!'}
        </div>
      )}

      {/* Main Dropping Items Display Area (Takes full spacious center stage) */}
      <div className="flex items-center justify-around z-10 w-full h-full px-2 sm:px-4 py-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 transition-transform hover:scale-110 flex items-center justify-center"
          >
            <FoodItem
              item={item}
              isInsideBox={true}
              onReturn={() => onRemoveItem(item.id)}
            />
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-amber-200/50 text-sm sm:text-base md:text-lg font-bold text-center select-none pointer-events-none px-2">
            {type === 'healthy' ? 'Drop Good Foods Here' : 'Drop Fast Foods Here'}
          </div>
        )}
      </div>

      {/* Minimal Corner Badge tucked neatly in the corner */}
      <div
        className={`absolute pointer-events-none transition-transform duration-300 z-0 ${
          badgePosition === 'bottom-left' ? 'bottom-2 left-2.5' : 'bottom-2 right-2.5'
        } ${isHovered ? 'scale-110' : ''}`}
      >
        <img
          src={badgeSrc}
          alt={`${type} category badge`}
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain opacity-80 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
        />
      </div>
    </div>
  );
}
