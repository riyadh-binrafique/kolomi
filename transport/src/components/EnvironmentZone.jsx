import React, { useState } from 'react';
import VehicleItem from './VehicleItem';

export default function EnvironmentZone({
  type, // 'air' | 'river' | 'road'
  title, // 'Air' | 'River' | 'Road'
  icon = '',
  items = [], // Vehicles currently held in this zone
  onDropItem,
  onRemoveItem,
  activeItem,
  isTouchHovered = false,
  style = {},
  className = '',
}) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    if (!isOver) setIsOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const dataId = e.dataTransfer ? e.dataTransfer.getData('text/plain') : '';
    const itemId = dataId || activeItem?.id;
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

  // Visual feedback when hovering/dragging over a zone
  let hoverStyle = {};
  if (isHovered && activeItem) {
    if (activeItem.type === type) {
      hoverStyle = {
        boxShadow: 'inset 0 0 35px rgba(34,197,94,0.6), 0 0 25px rgba(34,197,94,0.8)',
        backgroundColor: 'rgba(34,197,94,0.18)',
        borderColor: '#22c55e',
      };
    } else {
      hoverStyle = {
        boxShadow: 'inset 0 0 35px rgba(239,68,68,0.6), 0 0 25px rgba(239,68,68,0.8)',
        backgroundColor: 'rgba(239,68,68,0.18)',
        borderColor: '#ef4444',
      };
    }
  }

  // Exact positions of placed vehicles inside each zone
  const getItemStyleInZone = (item) => {
    // 1. Upper Part: Air (Sky area — Helicopter left, Airplane right)
    if (type === 'air') {
      if (item.id === 'helicopter') return { left: '12%', top: '12%', width: '22%', height: '70%' };
      if (item.id === 'plane')      return { left: '54%', top: '10%', width: '26%', height: '70%' };
      if (item.id === 'ship')       return { left: '26%', top: '14%', width: '18%', height: '70%' };
      if (item.id === 'bike')       return { left: '10%', top: '14%', width: '18%', height: '70%' };
      return                               { left: '38%', top: '12%', width: '20%', height: '70%' };
    }

    // 2. Middle Part: River (Water/River area — Ship centered in water)
    if (type === 'river') {
      if (item.id === 'ship')       return { left: '32%', top: '8%',  width: '18%', height: '80%' };
      if (item.id === 'helicopter') return { left: '15%', top: '8%',  width: '20%', height: '75%' };
      if (item.id === 'plane')      return { left: '55%', top: '6%',  width: '24%', height: '75%' };
      if (item.id === 'bike')       return { left: '10%', top: '8%',  width: '16%', height: '75%' };
      return                               { left: '38%', top: '8%',  width: '20%', height: '75%' };
    }

    // 3. Lower Part: Road (Road/Pavement area — Bike on left, Car on right)
    if (type === 'road') {
      if (item.id === 'bike')       return { left: '14%', top: '22%', width: '20%', height: '68%' };
      if (item.id === 'car')        return { left: '48%', top: '22%', width: '26%', height: '68%' };
      if (item.id === 'helicopter') return { left: '15%', top: '16%', width: '20%', height: '68%' };
      if (item.id === 'plane')      return { left: '52%', top: '16%', width: '24%', height: '68%' };
      return                               { left: '26%', top: '18%', width: '20%', height: '68%' };
    }

    return { left: '20%', top: '15%', width: '20%', height: '70%' };
  };

  return (
    <div
      data-zone={type}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleZoneClick}
      title={`${title} Zone — ${
        type === 'road'
          ? 'Place Bike & Car here'
          : type === 'river'
          ? 'Place Ship here'
          : 'Place Airplane & Helicopter here'
      }`}
      style={{
        ...style,
        ...hoverStyle,
      }}
      className={`relative w-full transition-all duration-200 cursor-pointer ${className}`}
    >
      {/* Zone Label Badge (Top Corner) */}
      <div className="absolute top-2 left-3 z-10 pointer-events-none select-none">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold tracking-wider uppercase text-white bg-black/55 backdrop-blur-md border border-white/25 shadow-lg"
          style={{ fontFamily: '"Lilita One", "Fredoka", cursive' }}
        >
          <span>{icon}</span>
          <span>{title}</span>
        </span>
      </div>

      {/* Interactive Dragging Helper Tooltip */}
      {isHovered && activeItem && (
        <div className="absolute top-2 right-3 z-30 pointer-events-none select-none animate-bounce">
          <span
            className={`px-3 py-1 rounded-full text-xs sm:text-sm font-black tracking-wider uppercase text-white shadow-xl border-2 ${
              activeItem.type === type
                ? 'bg-emerald-600 border-emerald-300'
                : 'bg-rose-600 border-rose-300'
            }`}
            style={{ fontFamily: '"Lilita One", "Fredoka", cursive' }}
          >
            {activeItem.type === type ? `✓ Drop in ${title}!` : `✗ Not ${title}!`}
          </span>
        </div>
      )}

      {/* Placed Vehicles Held in this Zone */}
      {items.map((item) => {
        const isCorrectZone = item.type === type;
        return (
          <div
            key={item.id}
            className="absolute transition-all duration-300 transform hover:scale-108 z-20 pointer-events-auto"
            style={getItemStyleInZone(item)}
          >
            <VehicleItem
              item={item}
              isPlaced={true}
              isCorrect={isCorrectZone}
              onRemove={onRemoveItem}
              className="w-full h-full"
            />
          </div>
        );
      })}
    </div>
  );
}
