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
  let clueBorderClass = 'border-white/10 hover:border-white/30';

  if (isHovered && activeItem) {
    if (activeItem.type === type) {
      // Correct zone matching: bright emerald green outline
      clueBorderClass =
        '!border-4 !border-emerald-400 bg-emerald-400/20 shadow-[0_0_30px_rgba(52,211,153,0.9),inset_0_0_20px_rgba(52,211,153,0.4)]';
    } else {
      // Wrong zone: bright red outline
      clueBorderClass =
        '!border-4 !border-rose-500 bg-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.9),inset_0_0_20px_rgba(244,63,94,0.4)]';
    }
  }

  // Exact positions when held inside this part of the holding place
  const getItemStyleInZone = (item) => {
    // 1. Air Zone (Upper part: holds air vehicles)
    if (type === 'air') {
      if (item.id === 'helicopter') {
        return { left: '18%', top: '18%', width: '18%' };
      }
      if (item.id === 'plane') {
        return { left: '50%', top: '10%', width: '20%' };
      }
      if (item.id === 'ship') return { left: '25%', top: '18%', width: '18%' };
      if (item.id === 'bike') return { left: '10%', top: '18%', width: '16%' };
      return { left: '35%', top: '18%', width: '20%' };
    }

    // 2. River Zone (Middle part: holds river vehicles)
    if (type === 'river') {
      if (item.id === 'ship') {
        return { left: '24%', top: '12%', width: '18%' };
      }
      if (item.id === 'helicopter') return { left: '18%', top: '12%', width: '18%' };
      if (item.id === 'plane') return { left: '50%', top: '12%', width: '20%' };
      if (item.id === 'bike') return { left: '10%', top: '12%', width: '16%' };
      return { left: '35%', top: '12%', width: '20%' };
    }

    // 3. Road Zone (Lower part: holds road vehicles)
    if (type === 'road') {
      if (item.id === 'bike') {
        return { left: '10%', top: '20%', width: '16%' };
      }
      if (item.id === 'car') {
        return { left: '35%', top: '28%', width: '20%' };
      }
      if (item.id === 'helicopter') return { left: '18%', top: '20%', width: '18%' };
      if (item.id === 'plane') return { left: '50%', top: '20%', width: '20%' };
      return { left: '24%', top: '20%', width: '18%' };
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
      title={`${title} Holding Place - Holds ${
        type === 'road' ? 'Bike and Cars' : type === 'river' ? 'Ship' : 'Plane and Helicopter'
      }`}
      style={style}
      className={`relative transition-all duration-200 cursor-pointer border border-dashed ${clueBorderClass} ${className}`}
    >
      {/* Subtle Corner Badge for this part of the holding place */}
      <div className="absolute top-2 left-3 z-10 pointer-events-none select-none">
        <span
          className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-black/40 text-white/85 backdrop-blur-sm border border-white/20 shadow"
          style={{ fontFamily: '"Lilita One", "Fredoka", cursive' }}
        >
          {icon} {title}
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
