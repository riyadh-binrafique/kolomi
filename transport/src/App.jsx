import React, { useEffect, useMemo, useState } from 'react';
import ScoreBoard from './components/ScoreBoard';
import VehicleItem from './components/VehicleItem';
import EnvironmentZone from './components/EnvironmentZone';
import LevelCompleteModal from './components/LevelCompleteModal';
import RetryModal from './components/RetryModal';
import ExitModal from './components/ExitModal';
import { sounds } from './utils/sound';
import { Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';

const INITIAL_VEHICLES = [
  {
    id: 'helicopter',
    name: 'Helicopter',
    type: 'air',
    image: '/assets/clean/helicopter.png',
    unplacedStyle: { left: '4.5%', top: '44%', width: '10%' },
    placedPosStyle: {
      air: { left: '20%', top: '10%', width: '15.5%' },
      river: { left: '20%', top: '42%', width: '15.5%' },
      road: { left: '20%', top: '74%', width: '15.5%' },
      default: { left: '20%', top: '10%', width: '15.5%' },
    },
  },
  {
    id: 'car',
    name: 'Car',
    type: 'road',
    image: '/assets/clean/car.png',
    unplacedStyle: { left: '4.5%', top: '68%', width: '11.5%' },
    placedPosStyle: {
      road: { left: '33%', top: '76%', width: '18%' },
      air: { left: '33%', top: '10%', width: '18%' },
      river: { left: '33%', top: '42%', width: '18%' },
      default: { left: '33%', top: '76%', width: '18%' },
    },
  },
  {
    id: 'ship',
    name: 'Ship',
    type: 'river',
    image: '/assets/clean/ship.png',
    unplacedStyle: { right: '4.5%', top: '23%', width: '10%' },
    placedPosStyle: {
      river: { left: '23%', top: '42%', width: '15.5%' },
      air: { left: '23%', top: '10%', width: '15.5%' },
      road: { left: '23%', top: '74%', width: '15.5%' },
      default: { left: '23%', top: '42%', width: '15.5%' },
    },
  },
  {
    id: 'plane',
    name: 'Airplane',
    type: 'air',
    image: '/assets/clean/plane.png',
    unplacedStyle: { right: '4.5%', top: '43%', width: '10%' },
    placedPosStyle: {
      air: { left: '48%', top: '6%', width: '17.5%' },
      river: { left: '48%', top: '42%', width: '17.5%' },
      road: { left: '48%', top: '74%', width: '17.5%' },
      default: { left: '48%', top: '6%', width: '17.5%' },
    },
  },
  {
    id: 'bike',
    name: 'Motorcycle',
    type: 'road',
    image: '/assets/clean/bike.png',
    unplacedStyle: { right: '4.5%', top: '66%', width: '9.5%' },
    placedPosStyle: {
      road: { left: '10%', top: '73%', width: '14.5%' },
      air: { left: '10%', top: '10%', width: '14.5%' },
      river: { left: '10%', top: '42%', width: '14.5%' },
      default: { left: '10%', top: '73%', width: '14.5%' },
    },
  },
];

export default function App() {
  // itemLocations: { [id]: 'air' | 'river' | 'road' | null }
  const [itemLocations, setItemLocations] = useState(() => {
    const locs = {};
    INITIAL_VEHICLES.forEach((item) => {
      locs[item.id] = null;
    });
    return locs;
  });

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [touchHoverZone, setTouchHoverZone] = useState(null);

  const [gameState, setGameState] = useState('playing'); // 'playing' | 'complete' | 'retry'
  const [showExitModal, setShowExitModal] = useState(false);
  const [resultStars, setResultStars] = useState(3);
  const [resultCoins, setResultCoins] = useState(40);
  const [isMuted, setIsMuted] = useState(sounds.isMuted);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Placed items in respective zones
  const airItems = INITIAL_VEHICLES.filter((item) => itemLocations[item.id] === 'air');
  const riverItems = INITIAL_VEHICLES.filter((item) => itemLocations[item.id] === 'river');
  const roadItems = INITIAL_VEHICLES.filter((item) => itemLocations[item.id] === 'road');
  const totalPlaced = airItems.length + riverItems.length + roadItems.length;

  // Active item currently being interacted with (dragged or clicked/selected)
  const activeItem =
    draggedItem || INITIAL_VEHICLES.find((i) => i.id === selectedItemId) || null;

  // --- Real-time Dynamic Counting of Right, Wrong, and Score! ---
  const { rightCount, wrongCount, liveScore } = useMemo(() => {
    let right = 0;
    let wrong = 0;

    INITIAL_VEHICLES.forEach((item) => {
      const loc = itemLocations[item.id];
      if (loc) {
        if (loc === item.type) {
          right++;
        } else {
          wrong++;
        }
      }
    });

    const score = right * 10;
    return { rightCount: right, wrongCount: wrong, liveScore: score };
  }, [itemLocations]);

  // Handle dropping / placing an item into a zone
  const handleDropItem = (itemId, targetZone) => {
    const vehicle = INITIAL_VEHICLES.find((i) => i.id === itemId);

    // Audio clue: cheerful chime if correct, funny "oops" if wrong
    if (vehicle && vehicle.type === targetZone) {
      sounds.playDrop();
    } else {
      sounds.playOops();
    }

    setItemLocations((prev) => ({
      ...prev,
      [itemId]: targetZone,
    }));
    setSelectedItemId(null);
    setDraggedItem(null);
    setTouchHoverZone(null);
  };

  // Handle returning an item back to outer scattered area
  const handleRemoveItem = (itemId) => {
    sounds.playPick();
    setItemLocations((prev) => ({
      ...prev,
      [itemId]: null,
    }));
    setSelectedItemId(null);
    setDraggedItem(null);
  };

  // Toggle selection on item click
  const handleSelectItem = (itemId) => {
    setSelectedItemId((prev) => (prev === itemId ? null : itemId));
  };

  // --- Automatic Modal Trigger When All 5 Vehicles are Placed ---
  useEffect(() => {
    if (totalPlaced === INITIAL_VEHICLES.length && gameState === 'playing') {
      const timer = setTimeout(() => {
        if (rightCount === 5) {
          setResultStars(3);
          setResultCoins(40);
          setGameState('complete');
        } else if (rightCount >= 3) {
          setResultStars(2);
          setResultCoins(20);
          setGameState('complete');
        } else if (rightCount >= 1) {
          setResultStars(1);
          setResultCoins(10);
          setGameState('complete');
        } else {
          setResultStars(0);
          setResultCoins(0);
          setGameState('retry');
        }
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [totalPlaced, rightCount, gameState]);

  // Reset / restart game
  const handleResetGame = () => {
    const locs = {};
    INITIAL_VEHICLES.forEach((item) => {
      locs[item.id] = null;
    });
    setItemLocations(locs);
    setSelectedItemId(null);
    setDraggedItem(null);
    setTouchHoverZone(null);
    setGameState('playing');
    setShowExitModal(false);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-black">
      {/* Full-Screen Game Stage using PzlGameBg.jpg filling the whole screen with zero borders */}
      <div
        className="relative w-full h-full overflow-hidden select-none"
        style={{
          backgroundImage: "url('/assets/clean/pzlgamebg.jpg')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        {/* Top Control Buttons (Sound & Fullscreen Toggle) */}
        <div className="absolute top-[3%] left-[17%] z-40 flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 flex items-center justify-center border-2 border-white shadow transition transform active:scale-90 cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-950" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen' : 'Go Full Screen'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center border-2 border-white shadow transition transform active:scale-90 cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Maximize2 className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>

        {/* Top Center Title Banner: "Match My Ride" */}
        <div className="absolute top-[3.5%] left-1/2 -translate-x-1/2 z-30 text-center">
          <div
            className="px-8 sm:px-12 py-2 sm:py-2.5 rounded-2xl bg-[#070b28]/90 border border-indigo-700/60 text-white font-extrabold text-base sm:text-xl md:text-2xl tracking-wide shadow-[0_4px_16px_rgba(0,0,0,0.6)] select-none whitespace-nowrap"
            style={{ fontFamily: '"Fredoka", "Lilita One", cursive' }}
          >
            Match My Ride
          </div>
        </div>

        {/* Top Right Exit Button: Exit.png */}
        <div className="absolute top-[2.5%] right-[2.5%] z-40">
          <button
            onClick={() => {
              sounds.playClick();
              setShowExitModal(true);
            }}
            title="Exit / Restart Game"
            className="transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
          >
            <img
              src="/assets/clean/exit.png"
              alt="Exit"
              className="w-11 h-9 sm:w-14 sm:h-11 object-contain filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.3)]"
            />
          </button>
        </div>

        {/* Top Left ScoreBoard Card */}
        <div
          className="absolute z-30"
          style={{ left: '2.5%', top: '2.5%', width: '13%', minWidth: '130px' }}
        >
          <ScoreBoard
            rightCount={rightCount}
            wrongCount={wrongCount}
            score={liveScore}
          />
        </div>

        {/* --- The Holding Place (3 Parts for holding 3 types of vehicles) --- */}
        <div
          className="absolute z-20 pointer-events-auto rounded-3xl overflow-hidden"
          style={{
            left: '21.8%',
            top: '17.6%',
            width: '59.9%',
            height: '65.6%',
          }}
        >
          {/* Part 1 (Upper): Air Holding Place (holds plane & helicopter) */}
          <EnvironmentZone
            type="air"
            title="Air"
            items={airItems}
            onDropItem={handleDropItem}
            onRemoveItem={handleRemoveItem}
            activeItem={activeItem}
            isTouchHovered={touchHoverZone === 'air'}
            style={{ top: '0%', height: '37%', left: '0%', width: '100%' }}
            className="absolute z-10 rounded-t-3xl"
          />

          {/* Part 2 (Middle): River Holding Place (holds ship) */}
          <EnvironmentZone
            type="river"
            title="River"
            items={riverItems}
            onDropItem={handleDropItem}
            onRemoveItem={handleRemoveItem}
            activeItem={activeItem}
            isTouchHovered={touchHoverZone === 'river'}
            style={{ top: '37%', height: '28%', left: '0%', width: '100%' }}
            className="absolute z-10"
          />

          {/* Part 3 (Lower): Road Holding Place (holds bike & car) */}
          <EnvironmentZone
            type="road"
            title="Road"
            items={roadItems}
            onDropItem={handleDropItem}
            onRemoveItem={handleRemoveItem}
            activeItem={activeItem}
            isTouchHovered={touchHoverZone === 'road'}
            style={{ top: '65%', height: '35%', left: '0%', width: '100%' }}
            className="absolute z-10 rounded-b-3xl"
          />
        </div>

        {/* --- Floating Unplaced Vehicles (Outside on Left & Right) --- */}
        {INITIAL_VEHICLES.map((vehicle) => {
          const isPlaced = itemLocations[vehicle.id] !== null;
          if (isPlaced) return null;

          return (
            <div
              key={vehicle.id}
              className="absolute z-30"
              style={vehicle.unplacedStyle}
            >
              <VehicleItem
                item={vehicle}
                isPlaced={false}
                isSelected={selectedItemId === vehicle.id}
                onSelect={handleSelectItem}
                onDragStart={(item) => {
                  setDraggedItem(item);
                  setSelectedItemId(item.id);
                }}
                onDragEnd={() => {
                  setDraggedItem(null);
                }}
                onTouchHover={(zone) => {
                  setTouchHoverZone(zone);
                }}
                onDropOntoZone={(itemId, zone) => {
                  handleDropItem(itemId, zone);
                }}
              />
            </div>
          );
        })}

        {/* Footer instruction text */}
        <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-white/50 pointer-events-none select-none">
          Drag vehicles into Air, River, or Road • Tap to select & place
        </div>

        {/* --- Victory / Level Complete Modal --- */}
        {gameState === 'complete' && (
          <LevelCompleteModal
            stars={resultStars}
            coins={resultCoins}
            onNext={handleResetGame}
          />
        )}

        {/* --- Retry Modal --- */}
        {gameState === 'retry' && <RetryModal onRetry={handleResetGame} />}

        {/* --- Exit / Restart Modal --- */}
        {showExitModal && (
          <ExitModal
            onConfirmRestart={handleResetGame}
            onClose={() => setShowExitModal(false)}
          />
        )}
      </div>
    </div>
  );
}
