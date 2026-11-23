import React, { useState, useEffect, useRef, useCallback } from 'react';
import LevelCompleteModal from './components/LevelCompleteModal';
import RetryModal from './components/RetryModal';
import ExitModal from './components/ExitModal';
import { sounds } from './utils/sound';
import { Volume2, VolumeX, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

// Left Side Animals (Reference layout from design)
const ANIMALS = [
  {
    id: 'lion',
    name: 'Lion',
    image: '/assets/an2.png',
    shadowId: 'lion_sh',
  },
  {
    id: 'tiger',
    name: 'Tiger',
    image: '/assets/an3.png',
    shadowId: 'tiger_sh',
  },
  {
    id: 'monkey',
    name: 'Monkey',
    image: '/assets/an1.png',
    shadowId: 'monkey_sh',
  },
  {
    id: 'elephant',
    name: 'Elephant',
    image: '/assets/an4.png',
    shadowId: 'elephant_sh',
  },
];

// Right Side Shadows (Default order matching image: Monkey, Lion, Elephant, Tiger)
const DEFAULT_SHADOWS = [
  {
    id: 'monkey_sh',
    name: 'Monkey Shadow',
    image: '/assets/an1sh.png',
    targetAnimalId: 'monkey',
  },
  {
    id: 'lion_sh',
    name: 'Lion Shadow',
    image: '/assets/an2sh.png',
    targetAnimalId: 'lion',
  },
  {
    id: 'elephant_sh',
    name: 'Elephant Shadow',
    image: '/assets/an4sh.png',
    targetAnimalId: 'elephant',
  },
  {
    id: 'tiger_sh',
    name: 'Tiger Shadow',
    image: '/assets/an3sh.png',
    targetAnimalId: 'tiger',
  },
];

export default function App() {
  const [shadows, setShadows] = useState(DEFAULT_SHADOWS);
  
  // connections: { [animalId]: shadowId }
  const [connections, setConnections] = useState({});

  // Active interaction: dragging or tap-selected
  const [selectedLeftId, setSelectedLeftId] = useState(null);
  const [selectedRightId, setSelectedRightId] = useState(null);
  const [dragLine, setDragLine] = useState(null); // { from: 'left'|'right', id, startX, startY, currentX, currentY }

  // Game state
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'complete' | 'retry'
  const [showExitModal, setShowExitModal] = useState(false);
  const [resultStars, setResultStars] = useState(3);
  const [resultCoins, setResultCoins] = useState(40);
  const [isMuted, setIsMuted] = useState(sounds.isMuted);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // References to measure paw coordinates
  const containerRef = useRef(null);
  const leftPawRefs = useRef({});
  const rightPawRefs = useRef({});
  const [pawCoords, setPawCoords] = useState({ left: {}, right: {} });

  // Update paw coordinates relative to the container
  const updateCoordinates = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const newLeft = {};
    ANIMALS.forEach((a) => {
      const el = leftPawRefs.current[a.id];
      if (el) {
        const r = el.getBoundingClientRect();
        newLeft[a.id] = {
          x: r.left + r.width / 2 - containerRect.left,
          y: r.top + r.height / 2 - containerRect.top,
        };
      }
    });

    const newRight = {};
    shadows.forEach((s) => {
      const el = rightPawRefs.current[s.id];
      if (el) {
        const r = el.getBoundingClientRect();
        newRight[s.id] = {
          x: r.left + r.width / 2 - containerRect.left,
          y: r.top + r.height / 2 - containerRect.top,
        };
      }
    });

    setPawCoords({ left: newLeft, right: newRight });
  }, [shadows]);

  // Recalculate on mount, resize, or shadows change
  useEffect(() => {
    updateCoordinates();
    window.addEventListener('resize', updateCoordinates);
    const timer = setTimeout(updateCoordinates, 150);
    return () => {
      window.removeEventListener('resize', updateCoordinates);
      clearTimeout(timer);
    };
  }, [updateCoordinates]);

  // Sound toggle
  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Fullscreen toggle
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
      updateCoordinates();
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [updateCoordinates]);

  // Connect animal to shadow
  const makeConnection = (animalId, shadowId) => {
    const animal = ANIMALS.find((a) => a.id === animalId);
    const isCorrect = animal && animal.shadowId === shadowId;

    if (isCorrect) {
      sounds.playDrop();
    } else {
      sounds.playOops();
    }

    setConnections((prev) => {
      const next = { ...prev };
      // Remove any existing connection that already targets this shadow
      Object.keys(next).forEach((key) => {
        if (next[key] === shadowId) {
          delete next[key];
        }
      });
      next[animalId] = shadowId;
      return next;
    });

    setSelectedLeftId(null);
    setSelectedRightId(null);
    setDragLine(null);
  };

  // Remove connection
  const removeConnection = (animalId) => {
    sounds.playClick();
    setConnections((prev) => {
      const next = { ...prev };
      delete next[animalId];
      return next;
    });
  };

  // Check end game conditions when all 4 are connected
  useEffect(() => {
    const connectedCount = Object.keys(connections).length;
    if (connectedCount === ANIMALS.length && gameState === 'playing') {
      let correct = 0;
      ANIMALS.forEach((a) => {
        if (connections[a.id] === a.shadowId) {
          correct++;
        }
      });

      const timer = setTimeout(() => {
        if (correct === 4) {
          setResultStars(3);
          setResultCoins(40);
          setGameState('complete');
        } else if (correct >= 2) {
          setResultStars(2);
          setResultCoins(20);
          setGameState('complete');
        } else if (correct >= 1) {
          setResultStars(1);
          setResultCoins(10);
          setGameState('complete');
        } else {
          setResultStars(0);
          setResultCoins(0);
          setGameState('retry');
        }
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [connections, gameState]);

  // Reset / Next game round
  const handleReset = (shuffle = false) => {
    sounds.playClick();
    setConnections({});
    setSelectedLeftId(null);
    setSelectedRightId(null);
    setDragLine(null);
    setGameState('playing');
    setShowExitModal(false);

    if (shuffle) {
      // Shuffle shadows for the next level
      setShadows((prev) => {
        const arr = [...prev];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      });
    }
  };

  // --- Tap-to-Connect Logic ---
  const handleLeftPawClick = (animalId) => {
    sounds.playPick();
    if (selectedRightId) {
      makeConnection(animalId, selectedRightId);
    } else {
      setSelectedLeftId((prev) => (prev === animalId ? null : animalId));
    }
  };

  const handleRightPawClick = (shadowId) => {
    sounds.playPick();
    if (selectedLeftId) {
      makeConnection(selectedLeftId, shadowId);
    } else {
      setSelectedRightId((prev) => (prev === shadowId ? null : shadowId));
    }
  };

  // --- Drag to Connect Logic (Mouse & Touch) ---
  const handleTouchStart = (e, side, id) => {
    sounds.playPick();
    const touch = e.touches ? e.touches[0] : e;
    const containerRect = containerRef.current.getBoundingClientRect();
    const currentX = touch.clientX - containerRect.left;
    const currentY = touch.clientY - containerRect.top;

    const startPos = side === 'left' ? pawCoords.left[id] : pawCoords.right[id];
    setDragLine({
      from: side,
      id,
      startX: startPos ? startPos.x : currentX,
      startY: startPos ? startPos.y : currentY,
      currentX,
      currentY,
    });
  };

  const handleTouchMove = (e) => {
    if (!dragLine || !containerRef.current) return;
    const touch = e.touches ? e.touches[0] : e;
    const containerRect = containerRef.current.getBoundingClientRect();
    setDragLine((prev) =>
      prev
        ? {
            ...prev,
            currentX: touch.clientX - containerRect.left,
            currentY: touch.clientY - containerRect.top,
          }
        : null
    );
  };

  const handleTouchEnd = (e) => {
    if (!dragLine) return;

    // Check which paw is near the release position
    const { currentX, currentY, from, id } = dragLine;
    const targetThreshold = 65; // px distance threshold

    if (from === 'left') {
      let matchedShadowId = null;
      Object.entries(pawCoords.right).forEach(([shId, coord]) => {
        if (!coord) return;
        const dist = Math.hypot(coord.x - currentX, coord.y - currentY);
        if (dist < targetThreshold) {
          matchedShadowId = shId;
        }
      });

      if (matchedShadowId) {
        makeConnection(id, matchedShadowId);
      }
    } else if (from === 'right') {
      let matchedAnimalId = null;
      Object.entries(pawCoords.left).forEach(([anId, coord]) => {
        if (!coord) return;
        const dist = Math.hypot(coord.x - currentX, coord.y - currentY);
        if (dist < targetThreshold) {
          matchedAnimalId = anId;
        }
      });

      if (matchedAnimalId) {
        makeConnection(matchedAnimalId, id);
      }
    }

    setDragLine(null);
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-black flex items-center justify-center"
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full-Screen Jungle Game Stage */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden select-none"
        style={{
          backgroundImage: "url('/assets/gkanimalbg.png')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        {/* Top Control Buttons (Sound, Fullscreen, Reset) */}
        <div className="absolute top-[3%] left-[4%] z-40 flex items-center gap-2">
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
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow transition transform active:scale-90 cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Maximize2 className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>

          {/* Quick Restart Button */}
          <button
            onClick={() => handleReset(false)}
            title="Restart Level"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center border-2 border-white shadow transition transform active:scale-90 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Top Center Title Banner */}
        <div className="absolute top-[2.5%] left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none select-none">
          <h1
            className="text-white text-xl sm:text-2xl md:text-3xl font-black tracking-wide"
            style={{
              fontFamily: '"Lilita One", "Fredoka", cursive',
              textShadow: '0 3px 8px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.6)',
            }}
          >
            Match The Paws
          </h1>
          <h2
            className="text-white text-lg sm:text-xl md:text-2xl font-black tracking-wide mt-[-2px]"
            style={{
              fontFamily: '"Lilita One", "Fredoka", cursive',
              textShadow: '0 3px 8px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.6)',
            }}
          >
            Match The Shadows
          </h2>
        </div>

        {/* Top Right Exit Button */}
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
              src="/assets/Exit.png"
              alt="Exit"
              className="w-11 h-9 sm:w-14 sm:h-11 object-contain filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.3)]"
            />
          </button>
        </div>

        {/* --- SVG CANVAS FOR CONNECTING LINES --- */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <defs>
            {/* Green glowing drop shadow for correct matches */}
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#22c55e" floodOpacity="0.8" />
            </filter>
            {/* Red glowing drop shadow for wrong matches */}
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.8" />
            </filter>
            {/* Cyan glowing drop shadow for active dragging line */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Render Completed Connections */}
          {Object.entries(connections).map(([animalId, shadowId]) => {
            const start = pawCoords.left[animalId];
            const end = pawCoords.right[shadowId];
            if (!start || !end) return null;

            const animal = ANIMALS.find((a) => a.id === animalId);
            const isCorrect = animal && animal.shadowId === shadowId;
            const lineColor = isCorrect ? '#22c55e' : '#ef4444';
            const filterId = isCorrect ? 'url(#glow-green)' : 'url(#glow-red)';

            return (
              <g key={`${animalId}-${shadowId}`} className="transition-all duration-300">
                {/* Connecting Line */}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={lineColor}
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  filter={filterId}
                />
                {/* Small Interactive Delete Dot in the Middle */}
                <circle
                  cx={(start.x + end.x) / 2}
                  cy={(start.y + end.y) / 2}
                  r="13"
                  fill={lineColor}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="cursor-pointer pointer-events-auto transition-transform hover:scale-125"
                  onClick={() => removeConnection(animalId)}
                  title="Click to remove connection"
                />
                <text
                  x={(start.x + end.x) / 2}
                  y={(start.y + end.y) / 2 + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                >
                  ✕
                </text>
              </g>
            );
          })}

          {/* Render Active Dragging Preview Line */}
          {dragLine && (
            <line
              x1={dragLine.startX}
              y1={dragLine.startY}
              x2={dragLine.currentX}
              y2={dragLine.currentY}
              stroke="#38bdf8"
              strokeWidth="5"
              strokeDasharray="6 4"
              strokeLinecap="round"
              filter="url(#glow-cyan)"
            />
          )}
        </svg>

        {/* --- MAIN GAMEPLAY BOARD: LEFT ANIMALS & RIGHT SHADOWS --- */}
        <div className="absolute inset-x-0 bottom-[3%] top-[12%] flex justify-between px-[3%] md:px-[4%] z-30 pointer-events-none">
          {/* --- LEFT COLUMN: 4 ANIMALS + PAW ANCHORS --- */}
          <div
            className="w-[28%] max-w-[280px] h-full bg-black/25 backdrop-blur-[2px] rounded-3xl border border-white/10 p-2 sm:p-3 flex flex-col justify-around pointer-events-auto shadow-2xl"
          >
            {ANIMALS.map((animal) => {
              const isSelected = selectedLeftId === animal.id;
              const isConnected = Boolean(connections[animal.id]);
              const connectedShadowId = connections[animal.id];
              const isCorrect = isConnected && animal.shadowId === connectedShadowId;

              return (
                <div
                  key={animal.id}
                  className="flex items-center justify-between gap-1 sm:gap-2 px-1 py-1 rounded-2xl transition-all"
                >
                  {/* Animal Artwork */}
                  <div className="flex-1 h-14 sm:h-20 md:h-24 flex items-center justify-center p-1">
                    <img
                      src={animal.image}
                      alt={animal.name}
                      draggable={false}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Pink Paw Anchor */}
                  <div
                    ref={(el) => {
                      leftPawRefs.current[animal.id] = el;
                    }}
                    onMouseDown={(e) => handleTouchStart(e, 'left', animal.id)}
                    onTouchStart={(e) => handleTouchStart(e, 'left', animal.id)}
                    onClick={() => handleLeftPawClick(animal.id)}
                    title={`Connect ${animal.name}`}
                    className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-110 active:scale-95 ${
                      isSelected
                        ? 'ring-4 ring-cyan-400 bg-cyan-400/30 scale-110 animate-pulse'
                        : isConnected
                        ? isCorrect
                          ? 'ring-4 ring-emerald-400 bg-emerald-400/20'
                          : 'ring-4 ring-rose-500 bg-rose-500/20'
                        : 'hover:ring-2 hover:ring-white/60'
                    }`}
                  >
                    <img
                      src="/assets/dot.png"
                      alt="Paw"
                      draggable={false}
                      className="w-full h-full object-contain drop-shadow"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- RIGHT COLUMN: PAW ANCHORS + 4 ANIMAL SHADOWS --- */}
          <div
            className="w-[28%] max-w-[280px] h-full bg-black/25 backdrop-blur-[2px] rounded-3xl border border-white/10 p-2 sm:p-3 flex flex-col justify-around pointer-events-auto shadow-2xl"
          >
            {shadows.map((shadow) => {
              const isSelected = selectedRightId === shadow.id;
              // Check if any left animal connects to this shadow
              const connectedAnimalId = Object.keys(connections).find(
                (anId) => connections[anId] === shadow.id
              );
              const isConnected = Boolean(connectedAnimalId);
              const isCorrect = isConnected && shadow.targetAnimalId === connectedAnimalId;

              return (
                <div
                  key={shadow.id}
                  className="flex items-center justify-between gap-1 sm:gap-2 px-1 py-1 rounded-2xl transition-all"
                >
                  {/* Pink Paw Anchor */}
                  <div
                    ref={(el) => {
                      rightPawRefs.current[shadow.id] = el;
                    }}
                    onMouseDown={(e) => handleTouchStart(e, 'right', shadow.id)}
                    onTouchStart={(e) => handleTouchStart(e, 'right', shadow.id)}
                    onClick={() => handleRightPawClick(shadow.id)}
                    title={`Connect to ${shadow.name}`}
                    className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-110 active:scale-95 ${
                      isSelected
                        ? 'ring-4 ring-cyan-400 bg-cyan-400/30 scale-110 animate-pulse'
                        : isConnected
                        ? isCorrect
                          ? 'ring-4 ring-emerald-400 bg-emerald-400/20'
                          : 'ring-4 ring-rose-500 bg-rose-500/20'
                        : 'hover:ring-2 hover:ring-white/60'
                    }`}
                  >
                    <img
                      src="/assets/dot.png"
                      alt="Paw"
                      draggable={false}
                      className="w-full h-full object-contain drop-shadow"
                    />
                  </div>

                  {/* Animal Shadow (Green Silhouette) */}
                  <div className="flex-1 h-14 sm:h-20 md:h-24 flex items-center justify-center p-1">
                    <div
                      className="w-full h-full transform hover:scale-105 transition-transform"
                      style={{
                        maskImage: `url('${shadow.image}')`,
                        WebkitMaskImage: `url('${shadow.image}')`,
                        maskSize: 'contain',
                        WebkitMaskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                        backgroundColor: '#86efac', // Soft green silhouette matching design
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer instruction text */}
        <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-white/70 pointer-events-none select-none drop-shadow">
          Drag between paws or tap two paws to match • Green = Right, Red = Wrong
        </div>

        {/* --- Victory / Level Complete Modal --- */}
        {gameState === 'complete' && (
          <LevelCompleteModal
            stars={resultStars}
            coins={resultCoins}
            onNext={() => handleReset(true)}
          />
        )}

        {/* --- Retry Modal --- */}
        {gameState === 'retry' && <RetryModal onRetry={() => handleReset(false)} />}

        {/* --- Exit / Restart Modal --- */}
        {showExitModal && (
          <ExitModal
            onConfirmRestart={() => handleReset(false)}
            onClose={() => setShowExitModal(false)}
          />
        )}
      </div>
    </div>
  );
}
