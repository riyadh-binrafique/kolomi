import React, { useState } from 'react';
import VehicleItem from './VehicleItem';

export default function EnvironmentZone({
  type, // 'air' | 'river' | 'road'
  title,
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
      // Correct zone matching: bright emerald green outline
      clueBorderClass =
        'border-4 border-emerald-400 bg-emerald-400/20 shadow-[0_0_30px_rgba(52,211,153,0.9),inset_0_0_20px_rgba(52,211,153,0.4)]';
    } else {
      // Wrong zone: bright red outline
      clueBorderClass =
        'border-4 border-rose-500 bg-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.9),inset_0_0_20px_rgba(244,63,94,0.4)]';
    }
  }

  // Exact item positioning when held inside this part of the holding place
  const getItemStyleInZone = (item) => {
    // 1. Air Zone (Upper part: holding air vehicles)
    if (type === 'air') {
      if (item.id === 'helicopter') {
        return { left: '19%', top: '22%', width: '15.5%' };
      }
      if (item.id === 'plane') {
        return { left: '50%', top: '14%', width: '17.5%' };
      }
      if (item.id === 'ship') return { left: '25%', top: '22%', width: '15.5%' };
      if (item.id === 'bike') return { left: '10%', top: '22%', width: '14.5%' };
      return { left: '35%', top: '22%', width: '18%' };
    }

    // 2. River Zone (Middle part: holding river vehicles)
    if (type === 'river') {
      if (item.id === 'ship') {
        return { left: '24%', top: '16%', width: '15.5%' };
      }
      if (item.id === 'helicopter') return { left: '19%', top: '16%', width: '15.5%' };
      if (item.id === 'plane') return { left: '50%', top: '16%', width: '17.5%' };
      if (item.id === 'bike') return { left: '10%', top: '16%', width: '14.5%' };
      return { left: '35%', top: '16%', width: '18%' };
    }

    // 3. Road Zone (Lower part: holding road vehicles)
    if (type === 'road') {
      if (item.id === 'bike') {
        return { left: '10%', top: '24%', width: '14.5%' };
      }
      if (item.id === 'car') {
        return { left: '35%', top: '32%', width: '18%' };
      }
      if (item.id === 'helicopter') return { left: '19%', top: '24%', width: '15.5%' };
      if (item.id === 'plane') return { left: '50%', top: '24%', width: '17.5%' };
      return { left: '24%', top: '24%', width: '15.5%' };
    }

    return { left: '20%', top: '20%', width: '15%' };
  };

  return (
    <div
      data-zone={type}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleZoneClick}
      title={`${title} Holding Place - Drop ${
        type === 'road' ? 'Bike and Cars' : type === 'river' ? 'Ship' : 'Plane and Helicopter'
      } here`}
      style={style}
      className={`relative transition-all duration-200 cursor-pointer ${clueBorderClass} ${className}`}
    >
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
