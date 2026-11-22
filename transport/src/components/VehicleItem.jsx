import React, { useRef } from 'react';
import { sounds } from '../utils/sound';

export default function VehicleItem({
  item,
  isPlaced = false,
  isSelected = false,
  onSelect,
  onRemove,
  onDragStart,
  onDragEnd,
  onTouchHover,
  onDropOntoZone,
  className = '',
  style = {},
}) {
  const touchStartPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const handleClick = (e) => {
    e.stopPropagation();
    sounds.playPick();
    if (isPlaced) {
      onRemove?.(item.id);
    } else {
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

  // Touch Support (for iPad / Tablet / Mobile)
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    hasMoved.current = false;
    onDragStart?.(item);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);
    if (dx > 8 || dy > 8) {
      hasMoved.current = true;
    }
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const zoneElem = elem?.closest('[data-zone]');
    const zone = zoneElem?.getAttribute('data-zone') || null;
    onTouchHover?.(zone);
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const zoneElem = elem?.closest('[data-zone]');
    const zone = zoneElem?.getAttribute('data-zone') || null;

    if (hasMoved.current && zone) {
      onDropOntoZone?.(item.id, zone);
    } else if (!hasMoved.current) {
      handleClick(e);
    }
    onTouchHover?.(null);
    onDragEnd?.();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      title={`${item.name} (${isPlaced ? 'Click to remove' : 'Drag or click to place'})`}
      style={style}
      className={`group cursor-grab active:cursor-grabbing select-none transition-transform duration-200 transform hover:scale-108 touch-none ${
        isSelected
          ? 'scale-110 drop-shadow-[0_0_18px_rgba(250,204,21,0.95)] ring-4 ring-yellow-400 rounded-2xl animate-pulse'
          : 'drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)]'
      } ${className}`}
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-200"
      />
      {isSelected && (
        <span className="absolute -top-3 -right-3 bg-yellow-400 text-slate-950 text-xs font-black rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
          ✓
        </span>
      )}
    </div>
  );
}
