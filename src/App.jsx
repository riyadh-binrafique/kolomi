import React, { useMemo, useState } from 'react';
import DropZone from './components/DropZone';
import ScoreBoard from './components/ScoreBoard';
import FoodItem from './components/FoodItem';
import LevelCompleteModal from './components/LevelCompleteModal';
import RetryModal from './components/RetryModal';
import ExitModal from './components/ExitModal';
import { sounds } from './utils/sound';
import { Volume2, VolumeX } from 'lucide-react';

const INITIAL_FOOD_ITEMS = [
  {
    id: 'mango',
    name: 'Mango',
    type: 'healthy',
    image: '/assets/clean/mango.png',
    posStyle: { left: '17%', top: '6%', width: '10%', height: '21%' },
  },
  {
    id: 'burger',
    name: 'Burger',
    type: 'unhealthy',
    image: '/assets/clean/burger.png',
    posStyle: { left: '66.5%', top: '5.5%', width: '10.5%', height: '22%' },
  },
  {
    id: 'apple',
    name: 'Apple',
    type: 'healthy',
    image: '/assets/clean/apple.png',
    posStyle: { left: '83.5%', top: '6%', width: '9.5%', height: '20%' },
  },
  {
    id: 'pizza',
    name: 'Pizza',
    type: 'unhealthy',
    image: '/assets/clean/pizza.png',
    posStyle: { left: '11%', top: '75%', width: '10%', height: '21%' },
  },
  {
    id: 'fries',
    name: 'French Fries',
    type: 'unhealthy',
    image: '/assets/clean/fries.png',
    posStyle: { left: '31%', top: '74%', width: '9.5%', height: '21%' },
  },
  {
    id: 'watermelon',
    name: 'Watermelon',
    type: 'healthy',
    image: '/assets/clean/watermelon.png',
    posStyle: { left: '63%', top: '75%', width: '10%', height: '21%' },
  },
];

export default function App() {
  // Item locations: { [id]: 'healthy' | 'unhealthy' | null }
  const [itemLocations, setItemLocations] = useState(() => {
    const locs = {};
    INITIAL_FOOD_ITEMS.forEach((item) => {
      locs[item.id] = null;
    });
    return locs;
  });

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [touchHoverBox, setTouchHoverBox] = useState(null); // 'healthy' | 'unhealthy' | null

  const [gameState, setGameState] = useState('playing'); // 'playing' | 'complete' | 'retry'
  const [showExitModal, setShowExitModal] = useState(false);
  const [resultStars, setResultStars] = useState(3);
  const [resultCoins, setResultCoins] = useState(40);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [isMuted, setIsMuted] = useState(sounds.isMuted);

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Placed items in respective drop boxes
  const healthyItems = INITIAL_FOOD_ITEMS.filter((item) => itemLocations[item.id] === 'healthy');
  const unhealthyItems = INITIAL_FOOD_ITEMS.filter((item) => itemLocations[item.id] === 'unhealthy');
  const totalPlaced = healthyItems.length + unhealthyItems.length;

  // Active item currently being interacted with (dragged or clicked/selected)
  const activeItem =
    draggedItem || INITIAL_FOOD_ITEMS.find((i) => i.id === selectedItemId) || null;

  // --- Real-time Dynamic Counting of Right, Wrong, and Score! ---
  const { rightCount, wrongCount, liveScore } = useMemo(() => {
    let right = 0;
    let wrong = 0;

    INITIAL_FOOD_ITEMS.forEach((item) => {
      const loc = itemLocations[item.id];
      if (loc) {
        if (loc === item.type) {
          right++;
        } else {
          wrong++;
        }
      }
    });

    // Score dynamically updates: 10 points per right food placed
    const score = right * 10;

    return { rightCount: right, wrongCount: wrong, liveScore: score };
  }, [itemLocations]);

  // Handle dropping / placing an item into a box
  const handleDropItem = (itemId, targetBox) => {
    const food = INITIAL_FOOD_ITEMS.find((i) => i.id === itemId);

    // Audio clue: cheerful chime if correct, funny "oops" if wrong
    if (food && food.type === targetBox) {
      sounds.playDrop();
    } else {
      sounds.playOops();
    }

    setItemLocations((prev) => ({
      ...prev,
      [itemId]: targetBox,
    }));
    setSelectedItemId(null);
    setDraggedItem(null);
    setTouchHoverBox(null);
    setNoticeMessage('');
  };

  // Handle returning an item back to outer scattered area
  const handleRemoveItem = (itemId) => {
    setItemLocations((prev) => ({
      ...prev,
      [itemId]: null,
    }));
    setSelectedItemId(null);
    setDraggedItem(null);
    setNoticeMessage('');
  };

  // Toggle selection on item click
  const handleSelectItem = (itemId) => {
    setSelectedItemId((prev) => (prev === itemId ? null : itemId));
  };

  // Handle Submit button click
  const handleSubmit = () => {
    if (totalPlaced < INITIAL_FOOD_ITEMS.length) {
      setNoticeMessage(`Drag all ${INITIAL_FOOD_ITEMS.length} foods into the boxes first!`);
      sounds.playPick();
      return;
    }

    // Scoring rules on completion:
    // 6 correct = 3 Stars, 40 Coins
    // 4-5 correct = 2 Stars, 20 Coins
    // 1-3 correct = 1 Star, 10 Coins
    // 0 correct = Retry modal
    if (rightCount === 6) {
      setResultStars(3);
      setResultCoins(40);
      setGameState('complete');
    } else if (rightCount >= 4) {
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
  };

  // Reset / restart game
  const handleResetGame = () => {
    const locs = {};
    INITIAL_FOOD_ITEMS.forEach((item) => {
      locs[item.id] = null;
    });
    setItemLocations(locs);
    setSelectedItemId(null);
    setDraggedItem(null);
    setTouchHoverBox(null);
    setGameState('playing');
    setShowExitModal(false);
    setNoticeMessage('');
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-2 sm:p-4 select-none overflow-x-auto">
      {/* Game Stage (matches the 1024x489 landscape frame from user screenshots) */}
      <div
        className="relative w-full max-w-[1024px] min-w-[720px] aspect-[1024/489] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-4 md:border-8 border-amber-950 flex flex-col justify-between"
        style={{
          backgroundImage: "url('/assets/clean/bg.png')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        {/* Halftone comic texture overlay */}
        <div className="absolute inset-0 halftone-overlay opacity-25 pointer-events-none"></div>

        {/* Top Sound Toggle */}
        <div className="absolute top-[3%] left-[2%] z-40">
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 flex items-center justify-center border-2 border-white shadow transition transform active:scale-90"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950" />
            )}
          </button>
        </div>

        {/* Top Center Title Banner: "Healthy vs Unhealthy" */}
        <div className="absolute top-[3%] left-1/2 -translate-x-1/2 z-30 max-w-[280px] sm:max-w-[320px] text-center">
          <div className="glossy-blue-pill px-4 sm:px-7 py-1.5 sm:py-2 rounded-full text-white font-extrabold text-xs sm:text-base md:text-lg tracking-wide uppercase shadow-lg select-none whitespace-nowrap">
            Healthy vs Unhealthy
          </div>
        </div>

        {/* Top Right Exit Button: Exit.png */}
        <div className="absolute top-[2.5%] right-[2%] z-40">
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
              className="w-10 h-8 sm:w-13 sm:h-10 object-contain filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.3)]"
            />
          </button>
        </div>

        {/* Left Drop Zone: Healthy Foods (Good Food) */}
        <div
          className="absolute z-20"
          style={{ left: '6%', top: '34%', width: '33%', height: '38%' }}
        >
          <DropZone
            type="healthy"
            badgeSrc="/assets/clean/healthy_badge.png"
            badgePosition="bottom-left"
            items={healthyItems}
            onDropItem={handleDropItem}
            onRemoveItem={handleRemoveItem}
            activeItem={activeItem}
            isTouchHovered={touchHoverBox === 'healthy'}
          />
        </div>

        {/* Center Scoreboard & Submit Section */}
        <div
          className="absolute z-20 flex flex-col items-center justify-center"
          style={{ left: '42.5%', top: '38%', width: '15%', height: 'auto' }}
        >
          <ScoreBoard
            rightCount={rightCount}
            wrongCount={wrongCount}
            score={liveScore}
            onSubmit={handleSubmit}
          />

          {/* Helper Toast message if submit clicked too early */}
          {noticeMessage && (
            <div className="absolute -bottom-8 text-[10px] sm:text-xs font-bold bg-yellow-300 text-amber-950 px-2.5 py-0.5 rounded-full shadow-lg border border-amber-900 animate-bounce whitespace-nowrap z-50">
              {noticeMessage}
            </div>
          )}
        </div>

        {/* Right Drop Zone: Unhealthy Foods (Fast Food) */}
        <div
          className="absolute z-20"
          style={{ left: '61%', top: '34%', width: '33%', height: '38%' }}
        >
          <DropZone
            type="unhealthy"
            badgeSrc="/assets/clean/unhealthy_badge.png"
            badgePosition="bottom-right"
            items={unhealthyItems}
            onDropItem={handleDropItem}
            onRemoveItem={handleRemoveItem}
            activeItem={activeItem}
            isTouchHovered={touchHoverBox === 'unhealthy'}
          />
        </div>

        {/* Floating Unplaced Food Items (Positioned as in Image 1) */}
        {INITIAL_FOOD_ITEMS.map((item) => {
          const isPlaced = itemLocations[item.id] !== null;
          if (isPlaced) return null;

          return (
            <div
              key={item.id}
              className="absolute z-30"
              style={item.posStyle}
            >
              <FoodItem
                item={item}
                isInsideBox={false}
                isSelected={selectedItemId === item.id}
                onSelect={handleSelectItem}
                onDropItem={handleDropItem}
                onItemDragStart={(food) => setDraggedItem(food)}
                onItemDragEnd={() => setDraggedItem(null)}
                onTouchHoverChange={(box) => setTouchHoverBox(box)}
              />
            </div>
          );
        })}

        {/* Bottom Helper Bar for Child */}
        <div className="absolute bottom-1 left-0 right-0 z-10 text-center text-[10px] sm:text-xs font-black text-amber-950/70 select-none pointer-events-none">
          Drag food into the box or tap to select & place!
        </div>
      </div>

      {/* Level Complete Modal using reference asset sg.png & star.png */}
      {gameState === 'complete' && (
        <LevelCompleteModal
          stars={resultStars}
          coins={resultCoins}
          onNext={handleResetGame}
        />
      )}

      {/* Retry Modal using reference asset solidBg.png & retry.png */}
      {gameState === 'retry' && (
        <RetryModal onRetry={handleResetGame} />
      )}

      {/* Exit / Quit Confirmation Modal */}
      {showExitModal && (
        <ExitModal
          onConfirmRestart={handleResetGame}
          onClose={() => setShowExitModal(false)}
        />
      )}
    </div>
  );
}
