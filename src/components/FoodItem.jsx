import React, { useRef, useState } from 'react';
import { sounds } from '../utils/sound';

export default function FoodItem({
  item,
  isInsideBox = false,
  isSelected = false,
  onSelect,
  onReturn,
  onDropItem, // (itemId, 'healthy' | 'unhealthy')
  onItemDragStart, // (item) => void
  onItemDragEnd, // () => void
  onTouchHoverChange, // (boxType | null) => void
  className = '',
}) {
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchMovedRef = useRef(false);

  // Native HTML5 Drag for desktop mouse
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    sounds.playPick();
    if (onItemDragStart) {
      onItemDragStart(item);
    }
  };

  const handleDragEnd = () => {
    if (onItemDragEnd) {
      onItemDragEnd();
    }
  };

  // Touch handlers for mobile / tablet screens
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchMovedRef.current = false;
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (!touchMovedRef.current && Math.hypot(dx, dy) > 8) {
      touchMovedRef.current = true;
      setIsTouchDragging(true);
      sounds.playPick();
      if (onItemDragStart) {
        onItemDragStart(item);
      }
    }

    if (touchMovedRef.current) {
      if (e.cancelable) e.preventDefault();
      setTouchOffset({ x: dx, y: dy });

      // Detect box under finger in real time for touch
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropZone = el?.closest('[data-dropzone]');
      const targetType = dropZone ? dropZone.getAttribute('data-dropzone') : null;
      if (onTouchHoverChange) {
        onTouchHoverChange(targetType);
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (touchMovedRef.current) {
      setIsTouchDragging(false);
      setTouchOffset({ x: 0, y: 0 });

      const touch = e.changedTouches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropZone = el?.closest('[data-dropzone]');

      if (dropZone && onDropItem) {
        const targetType = dropZone.getAttribute('data-dropzone');
        onDropItem(item.id, targetType);
      } else if (isInsideBox && !dropZone && onReturn) {
        sounds.playReturn();
        onReturn(item.id);
      }
    } else {
      // Simple tap without dragging
      if (isInsideBox) {
        sounds.playReturn();
        if (onReturn) onReturn(item.id);
      } else {
        sounds.playPick();
        if (onSelect) onSelect(item.id);
      }
    }

    touchMovedRef.current = false;
    if (onItemDragEnd) {
      onItemDragEnd();
    }
    if (onTouchHoverChange) {
      onTouchHoverChange(null);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (isInsideBox) {
      sounds.playReturn();
      if (onReturn) onReturn(item.id);
    } else {
      sounds.playPick();
      if (onSelect) onSelect(item.id);
    }
  };

  return (
    <div
      draggable={!isInsideBox}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      title={isInsideBox ? `Click to return ${item.name}` : `Drag or click ${item.name}`}
      style={{
        transform: isTouchDragging
          ? `translate3d(${touchOffset.x}px, ${touchOffset.y}px, 0) scale(1.18)`
          : undefined,
        zIndex: isTouchDragging ? 9999 : undefined,
      }}
      className={`relative cursor-grab active:cursor-grabbing select-none transition-transform duration-150 ${
        isTouchDragging ? 'pointer-events-none drop-shadow-2xl opacity-90' : ''
      } ${
        isSelected
          ? 'scale-115 drop-shadow-[0_0_16px_rgba(250,204,21,1)] animate-cute-bounce ring-4 ring-yellow-400 rounded-2xl bg-amber-400/20'
          : 'hover:scale-105 active:scale-95'
      } ${className}`}
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.3)] transition-all"
      />

      {/* Selected Indicator */}
      {isSelected && (
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-amber-950 text-xs font-black rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
          ✓
        </span>
      )}

      {/* Inside box subtle remove hint badge on hover */}
      {isInsideBox && (
        <div className="absolute -top-1 -right-1 opacity-0 hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow pointer-events-none">
          ✕
        </div>
      )}
    </div>
  );
}
