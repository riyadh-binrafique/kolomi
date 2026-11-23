import React, { useState, useEffect, useRef, useCallback } from 'react';
import LevelCompleteModal from './components/LevelCompleteModal';
import RetryModal from './components/RetryModal';
import ExitModal from './components/ExitModal';
import { sounds } from './utils/sound';
import { Volume2, VolumeX, Maximize2, Minimize2, RotateCcw, Trophy, RefreshCw, CheckCircle2 } from 'lucide-react';

// Left Side Animals (matches design layout: Lion, Tiger, Monkey, Elephant)
const ANIMALS = [
  {
    id: 'lion',
    name: 'Lion',
    image: '/assets/clean/lion.png',
    shadowId: 'lion_sh',
  },
  {
    id: 'tiger',
    name: 'Tiger',
    image: '/assets/clean/tiger.png',
    shadowId: 'tiger_sh',
  },
  {
    id: 'monkey',
    name: 'Monkey',
    image: '/assets/clean/monkey.png',
    shadowId: 'monkey_sh',
  },
  {
    id: 'elephant',
    name: 'Elephant',
    image: '/assets/clean/elephant.png',
    shadowId: 'elephant_sh',
  },
];

// Right Side Shadows (exact design order: Monkey, Lion, Elephant, Tiger)
const DEFAULT_SHADOWS = [
  {
    id: 'monkey_sh',
    name: 'Monkey Shadow',
    image: '/assets/clean/monkey_sh.png',
    targetAnimalId: 'monkey',
  },
  {
    id: 'lion_sh',
    name: 'Lion Shadow',
    image: '/assets/clean/lion_sh.png',
    targetAnimalId: 'lion',
  },
  {
    id: 'elephant_sh',
    name: 'Elephant Shadow',
    image: '/assets/clean/elephant_sh.png',
    targetAnimalId: 'elephant',
  },
  {
    id: 'tiger_sh',
    name: 'Tiger Shadow',
    image: '/assets/clean/tiger_sh.png',
    targetAnimalId: 'tiger',
  },
];

export default function App() {
  const [shadows, setShadows] = useState(DEFAULT_SHADOWS);

  // Active connections: { [animalId]: shadowId }
  const [connections, setConnections] = useState({});

  // Active selection for tap-to-connect fallback
  const [selectedLeftId, setSelectedLeftId] = useState(null);
  const [selectedRightId, setSelectedRightId] = useState(null);

  // Active drag line preview: { from: 'left'|'right', id, startX, startY, currentX, currentY }
  const [dragLine, setDragLine] = useState(null);
  const [hoveredTarget, setHoveredTarget] = useState(null); // { side: 'left'|'right', id }

  // Drag tracking ref for window pointer events
  const activeDragRef = useRef(null);

  // Game modals & state
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'complete' | 'retry'
  const [showExitModal, setShowExitModal] = useState(false);
  const [resultStars, setResultStars] = useState(3);
  const [resultCoins, setResultCoins] = useState(40);
  const [isMuted, setIsMuted] = useState(sounds.isMuted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // References to measure paw coordinates and hit boxes
  const containerRef = useRef(null);
  const leftPawRefs = useRef({});
  const rightPawRefs = useRef({});
  const leftRowRefs = useRef({});
  const rightRowRefs = useRef({});
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

  // Dynamic getter for live paw position
  const getPawCoord = useCallback(
    (side, id) => {
      if (!containerRef.current) return null;
      const el = side === 'left' ? leftPawRefs.current[id] : rightPawRefs.current[id];
      if (!el) return pawCoords[side]?.[id] || null;
      const cRect = containerRef.current.getBoundingClientRect();
      const pRect = el.getBoundingClientRect();
      return {
        x: pRect.left + pRect.width / 2 - cRect.left,
        y: pRect.top + pRect.height / 2 - cRect.top,
      };
    },
    [pawCoords]
  );

  // Recalculate on mount, resize, or shadows change
  useEffect(() => {
    updateCoordinates();
    window.addEventListener('resize', updateCoordinates);
    const timer1 = setTimeout(updateCoordinates, 80);
    const timer2 = setTimeout(updateCoordinates, 300);
    return () => {
      window.removeEventListener('resize', updateCoordinates);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [updateCoordinates]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      setTimeout(updateCoordinates, 150);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [updateCoordinates]);

  // Connect animal to shadow
  const makeConnection = useCallback((animalId, shadowId) => {
    const animal = ANIMALS.find((a) => a.id === animalId);
    const isCorrect = animal && animal.shadowId === shadowId;

    if (isCorrect) {
      sounds.playDrop();
    } else {
      sounds.playOops();
    }

    setConnections((prev) => ({
      ...prev,
      [animalId]: shadowId,
    }));

    setSelectedLeftId(null);
    setSelectedRightId(null);
  }, []);

  // Remove connection on line click
  const removeConnection = (animalId) => {
    sounds.playClick();
    setConnections((prev) => {
      const next = { ...prev };
      delete next[animalId];
      return next;
    });
  };

  // Find target item on opposite side with center-distance tolerance
  const findTargetAt = useCallback(
    (currentX, currentY, targetSide) => {
      if (!containerRef.current) return null;
      const containerRect = containerRef.current.getBoundingClientRect();

      const targets = targetSide === 'left' ? ANIMALS : shadows;
      const rowRefs = targetSide === 'left' ? leftRowRefs.current : rightRowRefs.current;
      const pawRefs = targetSide === 'left' ? leftPawRefs.current : rightPawRefs.current;

      let bestId = null;
      let bestDist = Infinity;

      for (const item of targets) {
        const rowEl = rowRefs[item.id];
        const pawEl = pawRefs[item.id];

        if (rowEl) {
          const r = rowEl.getBoundingClientRect();
          const rLeft = r.left - containerRect.left;
          const rRight = r.right - containerRect.left;
          const rTop = r.top - containerRect.top;
          const rBottom = r.bottom - containerRect.top;

          // Directly inside row bounds with horizontal margin
          if (
            currentX >= rLeft - 50 &&
            currentX <= rRight + 50 &&
            currentY >= rTop &&
            currentY <= rBottom
          ) {
            return item.id;
          }

          const centerY = (rTop + rBottom) / 2;
          const centerX = (rLeft + rRight) / 2;
          const dist = Math.hypot(centerX - currentX, centerY - currentY);
          if (dist < bestDist && dist < 170) {
            bestDist = dist;
            bestId = item.id;
          }
        }

        if (pawEl) {
          const pr = pawEl.getBoundingClientRect();
          const px = pr.left + pr.width / 2 - containerRect.left;
          const py = pr.top + pr.height / 2 - containerRect.top;
          const dist = Math.hypot(px - currentX, py - currentY);
          if (dist < 90 && dist < bestDist) {
            bestDist = dist;
            bestId = item.id;
          }
        }
      }

      return bestId;
    },
    [shadows]
  );

  // Handle tap item (tap-to-connect)
  const handleTapItem = useCallback(
    (side, id) => {
      sounds.playPick();

      if (side === 'left') {
        if (selectedRightId) {
          makeConnection(id, selectedRightId);
        } else {
          setSelectedLeftId((prev) => (prev === id ? null : id));
          setSelectedRightId(null);
        }
      } else {
        if (selectedLeftId) {
          makeConnection(selectedLeftId, id);
        } else {
          setSelectedRightId((prev) => (prev === id ? null : id));
          setSelectedLeftId(null);
        }
      }
    },
    [selectedLeftId, selectedRightId, makeConnection]
  );

  // Start Drag on PointerDown
  const handlePointerDown = (e, side, id) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();

    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const startPos = getPawCoord(side, id) || {
      x: clientX - containerRect.left,
      y: clientY - containerRect.top,
    };

    activeDragRef.current = {
      side,
      id,
      startX: startPos.x,
      startY: startPos.y,
      pointerStartX: clientX,
      pointerStartY: clientY,
      hasMoved: false,
    };

    setDragLine({
      from: side,
      id,
      startX: startPos.x,
      startY: startPos.y,
      currentX: clientX - containerRect.left,
      currentY: clientY - containerRect.top,
    });
  };

  // Window-level Pointer Tracking
  useEffect(() => {
    const handleWindowPointerMove = (e) => {
      const active = activeDragRef.current;
      if (!active || !containerRef.current) return;

      const clientX = e.clientX;
      const clientY = e.clientY;

      const dist = Math.hypot(
        clientX - active.pointerStartX,
        clientY - active.pointerStartY
      );
      if (dist > 8) {
        active.hasMoved = true;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const currentX = clientX - containerRect.left;
      const currentY = clientY - containerRect.top;

      setDragLine((prev) => (prev ? { ...prev, currentX, currentY } : null));

      const targetSide = active.side === 'left' ? 'right' : 'left';
      const targetId = findTargetAt(currentX, currentY, targetSide);
      setHoveredTarget(targetId ? { side: targetSide, id: targetId } : null);
    };

    const handleWindowPointerUp = (e) => {
      const active = activeDragRef.current;
      if (!active || !containerRef.current) return;

      const clientX = e.clientX;
      const clientY = e.clientY;
      const containerRect = containerRef.current.getBoundingClientRect();
      const currentX = clientX - containerRect.left;
      const currentY = clientY - containerRect.top;

      const { side, id, hasMoved } = active;
      activeDragRef.current = null;
      setDragLine(null);
      setHoveredTarget(null);

      if (hasMoved) {
        const targetSide = side === 'left' ? 'right' : 'left';
        const targetId = findTargetAt(currentX, currentY, targetSide);
        if (targetId) {
          if (side === 'left') {
            makeConnection(id, targetId);
          } else {
            makeConnection(targetId, id);
          }
        }
      } else {
        handleTapItem(side, id);
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [findTargetAt, handleTapItem, makeConnection]);

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
        // Reward tiers matching the "Food" game:
        // All correct = 3 Stars, 40 Coins
        // 3 correct = 2 Stars, 20 Coins
        // 1-2 correct = 1 Star, 10 Coins
        // 0 correct = Retry Modal
        if (correct === 4) {
          setResultStars(3);
          setResultCoins(40);
          setGameState('complete');
        } else if (correct === 3) {
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
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [connections, gameState]);

  // Check Answers manually (matching Food game submission)
  const handleCheckAnswers = () => {
    sounds.playClick();
    const connectedCount = Object.keys(connections).length;
    if (connectedCount === 0) {
      setToastMessage('Connect the animals first!');
      setTimeout(() => setToastMessage(''), 2500);
      return;
    }

    let correct = 0;
    ANIMALS.forEach((a) => {
      if (connections[a.id] === a.shadowId) {
        correct++;
      }
    });

    if (correct === 4) {
      setResultStars(3);
      setResultCoins(40);
      setGameState('complete');
    } else if (correct === 3 && connectedCount === 4) {
      setResultStars(2);
      setResultCoins(20);
      setGameState('complete');
    } else if (correct >= 1 && connectedCount === 4) {
      setResultStars(1);
      setResultCoins(10);
      setGameState('complete');
    } else {
      // 0 correct or wrong connections -> Trigger Retry modal
      setResultStars(0);
      setResultCoins(0);
      setGameState('retry');
    }
  };

  // Reset / Next game round
  const handleReset = (shuffle = false) => {
    sounds.playClick();
    setConnections({});
    setSelectedLeftId(null);
    setSelectedRightId(null);
    setDragLine(null);
    setHoveredTarget(null);
    setGameState('playing');
    setShowExitModal(false);
    setToastMessage('');

    if (shuffle) {
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

  // Direct modal preview handlers (for instant inspection & verification)
  const handlePreviewReward = () => {
    sounds.playClick();
    setResultStars(3);
    setResultCoins(40);
    setGameState('complete');
  };

  const handlePreviewRetry = () => {
    sounds.playClick();
    setResultStars(0);
    setResultCoins(0);
    setGameState('retry');
  };

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
      }).catch(() => { });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => { });
      }
    }
  };

  const isModalActive = gameState !== 'playing';

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-[#0a1208] flex items-center justify-center touch-none">
      {/* Aspect-Locked Jungle Game Stage (Matches 1024x656 Reference Mockup Exactly) */}
      <div
        ref={containerRef}
        className="relative aspect-[1024/656] w-full max-w-[100vw] max-h-[100vh] overflow-hidden select-none shadow-2xl"
        style={{
          backgroundImage: "url('/assets/gkanimalbg.png')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        {/* Top Left Toolbar (Sound, Fullscreen, Reset, and Quick Modal Preview Buttons) */}
        <div className="absolute top-[2.5%] left-[2.5%] z-40 flex items-center gap-1.5">
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center border border-white/20 shadow transition transform active:scale-90 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen' : 'Go Full Screen'}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center border border-white/20 shadow transition transform active:scale-90 cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleReset(false)}
            title="Restart Level"
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center border border-white/20 shadow transition transform active:scale-90 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Quick Preview Test Buttons */}
          <button
            onClick={handlePreviewReward}
            title="Preview Reward Panel (Win)"
            className="px-2 py-1 rounded-full bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 border border-emerald-300/40 shadow transition transform active:scale-90 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-300" />
            <span>Reward</span>
          </button>
          <button
            onClick={handlePreviewRetry}
            title="Preview Retry Panel (Fail)"
            className="px-2 py-1 rounded-full bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 border border-rose-300/40 shadow transition transform active:scale-90 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-rose-200" />
            <span>Retry</span>
          </button>
        </div>

        {/* Top Center Title Banner (Hidden when Modal is active, matching Screenshot 2 & 3) */}
        {!isModalActive && (
          <div className="absolute top-[4.5%] left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none select-none">
            <h1
              className="text-white text-xl sm:text-2xl md:text-3xl font-black tracking-wide leading-tight"
              style={{
                fontFamily: '"Fredoka", "Sniglet", "Lilita One", cursive',
                WebkitTextStroke: '1.5px black',
                textShadow:
                  '0 2px 0 #000, 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 4px 6px rgba(0,0,0,0.8)',
              }}
            >
              Match The Paws
            </h1>
            <h2
              className="text-white text-lg sm:text-xl md:text-2xl font-black tracking-wide leading-tight mt-0.5"
              style={{
                fontFamily: '"Fredoka", "Sniglet", "Lilita One", cursive',
                WebkitTextStroke: '1.5px black',
                textShadow:
                  '0 2px 0 #000, 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 4px 6px rgba(0,0,0,0.8)',
              }}
            >
              Match The Shadows
            </h2>
          </div>
        )}

        {/* Top Right Exit Button (Matching Screenshot Position & Asset) */}
        <div className="absolute top-[2.5%] right-[2.5%] z-40">
          <button
            onClick={() => {
              sounds.playClick();
              setShowExitModal(true);
            }}
            title="Exit Game"
            className="transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
          >
            <img
              src="/assets/Exit.png"
              alt="Exit"
              draggable={false}
              className="w-11 h-9 sm:w-13 sm:h-11 md:w-15 md:h-12 object-contain filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.3)]"
            />
          </button>
        </div>

        {/* --- SVG CANVAS FOR CONNECTING LINES --- */}
        {!isModalActive && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
            <defs>
              {/* Green glowing drop shadow for correct matches */}
              <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor="#22c55e" floodOpacity="0.85" />
              </filter>
              {/* Red glowing drop shadow for wrong matches */}
              <filter id="glow-red" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor="#ef4444" floodOpacity="0.85" />
              </filter>
              {/* Cyan glowing drop shadow for active dragging preview line */}
              <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#38bdf8" floodOpacity="0.9" />
              </filter>
            </defs>

            {/* Render Completed Connections (Clean lines matching Screenshots 4 & 5) */}
            {Object.entries(connections).map(([animalId, shadowId]) => {
              const start = getPawCoord('left', animalId) || pawCoords.left[animalId];
              const end = getPawCoord('right', shadowId) || pawCoords.right[shadowId];
              if (!start || !end) return null;

              const animal = ANIMALS.find((a) => a.id === animalId);
              const isCorrect = animal && animal.shadowId === shadowId;
              const lineColor = isCorrect ? '#22c55e' : '#ef4444';
              const filterId = isCorrect ? 'url(#glow-green)' : 'url(#glow-red)';

              return (
                <g key={`${animalId}-${shadowId}`} className="transition-all duration-300">
                  {/* Invisible wider hit line to easily click/tap to remove or correct */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="transparent"
                    strokeWidth="36"
                    strokeLinecap="round"
                    className="cursor-pointer pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeConnection(animalId);
                    }}
                    title="Click line to remove and correct"
                  />
                  {/* Visible clean colored connection line: Same 8px thickness and exact same uniform red (#ef4444) for all wrong choices */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={lineColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    filter={filterId}
                    className="pointer-events-none"
                  />
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
                strokeWidth="6"
                strokeDasharray="7 5"
                strokeLinecap="round"
                filter="url(#glow-cyan)"
              />
            )}
          </svg>
        )}

        {/* --- LEFT CARD: 4 ANIMALS + PINK PAWS --- */}
        {!isModalActive && (
          <div
            className="absolute rounded-[28px] border border-white/10 bg-black/30 backdrop-blur-[2px] flex flex-col justify-between py-2 sm:py-3 px-2 sm:px-3 pointer-events-auto shadow-2xl z-30"
            style={{
              left: '3.1%',
              top: '7.2%',
              width: '27.0%',
              height: '86.0%',
            }}
          >
            {ANIMALS.map((animal) => {
              const isSelected = selectedLeftId === animal.id;
              const isConnected = Boolean(connections[animal.id]);
              const connectedShadowId = connections[animal.id];
              const isCorrect = isConnected && animal.shadowId === connectedShadowId;
              const isHovered = hoveredTarget?.side === 'left' && hoveredTarget?.id === animal.id;

              return (
                <div
                  key={animal.id}
                  ref={(el) => {
                    leftRowRefs.current[animal.id] = el;
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'left', animal.id)}
                  className={`flex-1 flex items-center justify-between gap-1 px-1.5 py-1 rounded-2xl transition-all duration-200 cursor-pointer ${
                    isHovered
                      ? 'bg-cyan-400/30 ring-4 ring-cyan-300 scale-105 shadow-[0_0_20px_rgba(56,189,248,0.7)]'
                      : isSelected
                      ? 'bg-cyan-500/25 ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                      : isConnected
                      ? isCorrect
                        ? 'bg-emerald-500/15'
                        : 'bg-rose-500/15'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {/* Animal Artwork (Upright High-Res) */}
                  <div className="flex-1 h-full flex items-center justify-center p-1 pointer-events-none">
                    <img
                      src={animal.image}
                      alt={animal.name}
                      draggable={false}
                      onLoad={updateCoordinates}
                      className="max-h-[105px] max-w-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Pink Paw Anchor */}
                  <div
                    ref={(el) => {
                      leftPawRefs.current[animal.id] = el;
                    }}
                    title={`Connect ${animal.name}`}
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 transform hover:scale-110 active:scale-95 pointer-events-none ${
                      isSelected
                        ? 'ring-4 ring-cyan-400 bg-cyan-400/30 scale-110 animate-pulse'
                        : isHovered
                        ? 'ring-4 ring-cyan-300 bg-cyan-300/40 scale-110'
                        : isConnected
                        ? isCorrect
                          ? 'ring-4 ring-emerald-400 bg-emerald-400/20'
                          : 'ring-4 ring-rose-500 bg-rose-500/20'
                        : 'hover:ring-2 hover:ring-white/60'
                    }`}
                  >
                    <img
                      src="/assets/clean/paw.png"
                      alt="Paw"
                      draggable={false}
                      className="w-full h-full object-contain drop-shadow"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- RIGHT CARD: PINK PAWS + 4 ANIMAL SHADOWS --- */}
        {!isModalActive && (
          <div
            className="absolute rounded-[28px] border border-white/10 bg-black/30 backdrop-blur-[2px] flex flex-col justify-between py-2 sm:py-3 px-2 sm:px-3 pointer-events-auto shadow-2xl z-30"
            style={{
              right: '3.1%',
              top: '7.2%',
              width: '27.0%',
              height: '86.0%',
            }}
          >
            {shadows.map((shadow) => {
              const isSelected = selectedRightId === shadow.id;
              const connectedAnimalId = Object.keys(connections).find(
                (anId) => connections[anId] === shadow.id
              );
              const isConnected = Boolean(connectedAnimalId);
              const isCorrect = isConnected && shadow.targetAnimalId === connectedAnimalId;
              const isHovered = hoveredTarget?.side === 'right' && hoveredTarget?.id === shadow.id;

              return (
                <div
                  key={shadow.id}
                  ref={(el) => {
                    rightRowRefs.current[shadow.id] = el;
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'right', shadow.id)}
                  className={`flex-1 flex items-center justify-between gap-1 px-1.5 py-1 rounded-2xl transition-all duration-200 cursor-pointer ${
                    isHovered
                      ? 'bg-cyan-400/30 ring-4 ring-cyan-300 scale-105 shadow-[0_0_20px_rgba(56,189,248,0.7)]'
                      : isSelected
                      ? 'bg-cyan-500/25 ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                      : isConnected
                      ? isCorrect
                        ? 'bg-emerald-500/15'
                        : 'bg-rose-500/15'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {/* Pink Paw Anchor */}
                  <div
                    ref={(el) => {
                      rightPawRefs.current[shadow.id] = el;
                    }}
                    title={`Connect to ${shadow.name}`}
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 transform hover:scale-110 active:scale-95 pointer-events-none ${
                      isSelected
                        ? 'ring-4 ring-cyan-400 bg-cyan-400/30 scale-110 animate-pulse'
                        : isHovered
                        ? 'ring-4 ring-cyan-300 bg-cyan-300/40 scale-110'
                        : isConnected
                        ? isCorrect
                          ? 'ring-4 ring-emerald-400 bg-emerald-400/20'
                          : 'ring-4 ring-rose-500 bg-rose-500/20'
                        : 'hover:ring-2 hover:ring-white/60'
                    }`}
                  >
                    <img
                      src="/assets/clean/paw.png"
                      alt="Paw"
                      draggable={false}
                      className="w-full h-full object-contain drop-shadow"
                    />
                  </div>

                  {/* Animal Shadow (Mint Green Silhouette, Upright) */}
                  <div className="flex-1 h-full flex items-center justify-center p-1 pointer-events-none">
                    <img
                      src={shadow.image}
                      alt={shadow.name}
                      draggable={false}
                      onLoad={updateCoordinates}
                      className="max-h-[105px] max-w-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Center "Check Answers" Button */}
        {!isModalActive && Object.keys(connections).length > 0 && (
          <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 animate-bounce">
            <button
              onClick={handleCheckAnswers}
              className="px-5 py-2 rounded-full font-black text-amber-950 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 border-2 border-yellow-100 shadow-[0_6px_20px_rgba(251,191,36,0.6)] hover:scale-105 active:scale-95 transition-transform cursor-pointer flex items-center gap-2 text-sm sm:text-base tracking-wide"
              style={{
                fontFamily: '"Lilita One", "Fredoka", cursive',
              }}
            >
              <CheckCircle2 className="w-5 h-5 text-amber-900" />
              <span>Check Answers</span>
            </button>
          </div>
        )}

        {/* Toast Helper Message */}
        {toastMessage && (
          <div className="absolute top-[18%] left-1/2 -translate-x-1/2 z-40 bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full font-bold shadow-xl border border-yellow-100 text-xs sm:text-sm animate-pop-in">
            {toastMessage}
          </div>
        )}
      </div>

      {/* --- Victory / Level Complete Reward Modal (Rendered at Root for 100% Guaranteed Visibility) --- */}
      {gameState === 'complete' && (
        <LevelCompleteModal
          stars={resultStars}
          coins={resultCoins}
          onNext={() => handleReset(true)}
        />
      )}

      {/* --- Retry Modal (Rendered at Root for 100% Guaranteed Visibility) --- */}
      {gameState === 'retry' && <RetryModal onRetry={() => handleReset(false)} />}

      {/* --- Exit / Restart Modal --- */}
      {showExitModal && (
        <ExitModal
          onConfirmRestart={() => handleReset(false)}
          onClose={() => setShowExitModal(false)}
        />
      )}
    </div>
  );
}
