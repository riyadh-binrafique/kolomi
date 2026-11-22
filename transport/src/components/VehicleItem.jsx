import React from 'react';
import { sounds } from '../utils/sound';

export default function VehicleItem({
  item,
  isPlaced = false,
  isSelected = false,
  onSelect,
  onRemove,
  onDragStart,
  onDragEnd,
  className = '',
  style = {},
}) {
  const handleClick = (e) => {
    e.stopPropagation();
    sounds.playPick();
    if (isPlaced) {
      // If clicking a placed item, return it back to outer scattered area
      onRemove?.(item.id);
    } else {
      // Toggle select for tap-to-move
      onSelect?.(item.id);
    }
  };

  const handleDragStart = (e) => {
    sounds.playPick();
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(item);
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      title={`${item.name} (${isPlaced ? 'Click to remove' : 'Drag or click to place'})`}
      style={style}
      className={`group cursor-grab active:cursor-grabbing select-none transition-transform duration-200 transform hover:scale-108 ${
        isSelected
          ? 'scale-110 drop-shadow-[0_0_18px_rgba(250,204,21,0.9)] ring-4 ring-yellow-400 rounded-2xl animate-pulse'
          : 'drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)]'
      } ${className}`}
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-200"
      />
      {/* Tap indicator tooltip for kids */}
      {isSelected && (
        <span className="absolute -top-3 -right-3 bg-yellow-400 text-slate-950 text-xs font-black rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
          ✓
        </span>
      )}
    </div>
  );
}
