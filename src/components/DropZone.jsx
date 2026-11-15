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
      className={`relative rounded-2xl md:rounded-3xl p-2 sm:p-3 transition-all duration-200 board-panel w-full h-full flex flex-col justify-between cursor-pointer ${clueBorder} ${className}`}
    >
      {/* Floating clue text badge ONLY shown when dragging over this box */}
      {isHovered && activeItem && (
        <div
          className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-lg pointer-events-none z-30 animate-bounce ${
            activeItem.type === type
              ? 'bg-green-600 border-2 border-green-200 shadow-green-500/50'
              : 'bg-red-600 border-2 border-red-200 shadow-red-500/50'
          }`}
        >
          {activeItem.type === type ? '✓ Good Choice!' : '✕ Wrong Box!'}
        </div>
      )}

      {/* Placed Items Display Area */}
      <div className="flex items-center justify-around z-10 w-full h-[65%] px-1 sm:px-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 lg:w-24 lg:h-24 transition-transform hover:scale-110"
          >
            <FoodItem
              item={item}
              isInsideBox={true}
              onReturn={() => onRemoveItem(item.id)}
            />
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-amber-200/50 text-xs sm:text-sm md:text-base font-bold text-center select-none pointer-events-none px-2">
            {type === 'healthy' ? 'Drop Good Foods' : 'Drop Fast Foods'}
          </div>
        )}
      </div>

      {/* Decorative Corner Badge from materials */}
      <div
        className={`absolute bottom-1 sm:bottom-2 pointer-events-none transition-transform duration-300 ${
          badgePosition === 'bottom-left' ? 'left-1 sm:left-2' : 'right-1 sm:right-2'
        } ${isHovered ? 'scale-110' : ''}`}
      >
        <img
          src={badgeSrc}
          alt={`${type} badge`}
          className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 object-contain opacity-95 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
        />
      </div>
    </div>
  );
}
