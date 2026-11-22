import React, { useState } from 'react';
import VehicleItem from './VehicleItem';

export default function EnvironmentZone({
  type, // 'air' | 'river' | 'road'
  title,
  icon = '',
  items = [], // Vehicles currently held in this zone
  onDropItem,
  onRemoveItem,
  activeItem,
  isTouchHovered = false,
  style = {},
  className = '',
  borderColor = '#e53e3e', // visible border color for each zone
  labelColor = '#ef4444', // red label color as marked by user
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

  // When dragging over: green glow for correct, red glow for wrong
  let hoverStyle = {};
  if (isHovered && activeItem) {
    if (activeItem.type === type) {
      hoverStyle = {
        boxShadow: '0 0 30px rgba(52,211,153,0.9), inset 0 0 20px rgba(52,211,153,0.4)',
        backgroundColor: 'rgba(52,211,153,0.15)',
      };
    } else {
      hoverStyle = {
        boxShadow: '0 0 30px rgba(244,63,94,0.9), inset 0 0 20px rgba(244,63,94,0.4)',
        backgroundColor: 'rgba(244,63,94,0.15)',
      };
    }
  }

  // Exact positions when held inside this part of the holding place
  const getItemStyleInZone = (item) => {
    // 1. Air/Sky Zone (Upper 47%: sky area — helicopter left, plane right)
    if (type === 'air') {
      if (item.id === 'helicopter') return { left: '16%', top: '22%', width: '19%' };
      if (item.id === 'plane')      return { left: '52%', top: '14%', width: '22%' };
      if (item.id === 'ship')       return { left: '25%', top: '20%', width: '18%' };
      if (item.id === 'bike')       return { left: '10%', top: '20%', width: '16%' };
      return                               { left: '38%', top: '20%', width: '20%' };
    }

    // 2. River/Water Zone (Middle 27%: water/ocean area — ship centered)
    if (type === 'river') {
      if (item.id === 'ship')       return { left: '26%', top: '14%', width: '20%' };
      if (item.id === 'helicopter') return { left: '15%', top: '14%', width: '18%' };
      if (item.id === 'plane')      return { left: '52%', top: '10%', width: '22%' };
      if (item.id === 'bike')       return { left: '8%',  top: '14%', width: '16%' };
      return                               { left: '38%', top: '14%', width: '20%' };
    }

    // 3. Road Zone (Lower 36%: road/bridge — bike left, car center-right)
    if (type === 'road') {
      if (item.id === 'bike')       return { left: '10%', top: '32%', width: '17%' };
      if (item.id === 'car')        return { left: '38%', top: '40%', width: '22%' };
      if (item.id === 'helicopter') return { left: '15%', top: '30%', width: '18%' };
      if (item.id === 'plane')      return { left: '52%', top: '30%', width: '22%' };
      return                               { left: '26%', top: '30%', width: '18%' };
    }

    return { left: '20%', top: '20%', width: '18%' };
  };

  return (
    <div
      data-zone={type}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleZoneClick}
      title={`${title} — Drop ${
        type === 'road' ? 'Bike & Car' : type === 'river' ? 'Ship' : 'Plane & Helicopter'
      } here`}
      style={{
        ...style,
        border: `3px solid ${borderColor}`,
        ...hoverStyle,
      }}
      className={`relative transition-all duration-200 cursor-pointer ${className}`}
    >
      {/* Centered Zone Label — big text in the middle of the zone */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-5">
        <span
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-widest"
          style={{
            fontFamily: '"Lilita One", "Fredoka", cursive',
            color: labelColor,
            opacity: 0.85,
            textShadow: '0 2px 6px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </span>
      </div>

      {/* Interactive Helper Hint when dragging */}
      {isHovered && activeItem && (
        <div className="absolute top-2 right-3 z-30 pointer-events-none select-none animate-bounce">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase text-white shadow-lg border-2 ${
              activeItem.type === type
                ? 'bg-emerald-600 border-emerald-200'
                : 'bg-rose-600 border-rose-200'
            }`}
            style={{ fontFamily: '"Lilita One", "Fredoka", cursive' }}
          >
            {activeItem.type === type ? `✓ Match ${title}!` : `✗ Not ${title}`}
          </span>
        </div>
      )}

      {/* Placed Vehicles Held in this Zone */}
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute transition-all duration-300 transform hover:scale-105 z-20 pointer-events-auto"
          style={getItemStyleInZone(item)}
        >
          <VehicleItem
            item={item}
            isPlaced={true}
            onRemove={onRemoveItem}
            className="w-full h-full"
          />
        </div>
      ))}
    </div>
  );
}
