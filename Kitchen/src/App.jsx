import React, { useState } from 'react';
import { Volume2, VolumeX, Maximize2, RotateCcw, Award, LogOut } from 'lucide-react';
import LevelCompleteModal from './components/LevelCompleteModal';
import RetryModal from './components/RetryModal';
import ExitModal from './components/ExitModal';
import { sounds } from './utils/sound';

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [level, setLevel] = useState(1);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.toggleSound(nextState);
    if (nextState) sounds.playClick();
  };

  const toggleFullscreen = () => {
    sounds.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleNextLevel = () => {
    setShowWinModal(false);
    setLevel((prev) => prev + 1);
  };

  const handleRetry = () => {
    setShowRetryModal(false);
  };

  const handleRestartFromExit = () => {
    setShowExitModal(false);
    setLevel(1);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-orange-100 to-amber-200 flex flex-col select-none">
      {/* Top Header / Control Bar */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/70 backdrop-blur-md border-b border-amber-200 shadow-sm">
        {/* Left: Exit button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              setShowExitModal(true);
            }}
            title="Exit / Restart"
            className="p-2 sm:p-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 active:scale-95 transition text-amber-800 shadow-sm border border-amber-300 flex items-center gap-1.5 font-bold text-sm"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Exit</span>
          </button>

          <div className="flex items-center gap-2">
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-amber-900 tracking-wide"
              style={{ fontFamily: '"Lilita One", "Fredoka", cursive' }}
            >
              Kitchen Game
            </h1>
            <span className="text-xs sm:text-sm font-bold bg-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-inner">
              Level {level}
            </span>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute' : 'Unmute'}
            className="p-2.5 rounded-2xl bg-white hover:bg-amber-50 active:scale-95 transition text-amber-700 shadow-sm border border-amber-200"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2.5 rounded-2xl bg-white hover:bg-amber-50 active:scale-95 transition text-amber-700 shadow-sm border border-amber-200"
          >
            <Maximize2 size={20} />
          </button>

          {/* Test Retry Modal Trigger */}
          <button
            onClick={() => {
              sounds.playOops();
              setShowRetryModal(true);
            }}
            title="Trigger Retry Modal"
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 transition text-white shadow-sm font-bold text-xs sm:text-sm flex items-center gap-1"
          >
            <RotateCcw size={16} />
            <span className="hidden md:inline">Retry Modal</span>
          </button>

          {/* Test Win Modal Trigger */}
          <button
            onClick={() => {
              sounds.playWin();
              setShowWinModal(true);
            }}
            title="Trigger Reward Modal"
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition text-white shadow-sm font-bold text-xs sm:text-sm flex items-center gap-1"
          >
            <Award size={16} />
            <span className="hidden md:inline">Win Modal</span>
          </button>
        </div>
      </header>

      {/* Main Game Stage Area */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-4">
        {/* Kitchen Game Container */}
        <div className="relative w-full max-w-4xl h-full max-h-[700px] bg-white/60 backdrop-blur-md rounded-3xl border-4 border-amber-300/80 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
          <div className="space-y-4 max-w-lg">
            <div className="inline-block p-4 rounded-full bg-amber-100 text-amber-700 border-2 border-amber-300 shadow-inner">
              <span className="text-5xl">🍳</span>
            </div>

            <h2
              className="text-3xl sm:text-4xl font-extrabold text-amber-950"
              style={{ fontFamily: '"Lilita One", "Fredoka", cursive' }}
            >
              Welcome to Kitchen!
            </h2>

            <p className="text-amber-800 font-medium text-base sm:text-lg">
              The Kitchen game environment is ready. You can test the modals, sound effects, and start building the kitchen gameplay logic here.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  sounds.playPick();
                }}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold shadow-md transition"
              >
                Play Pick Sound 🔔
              </button>
              <button
                onClick={() => {
                  sounds.playDrop();
                }}
                className="px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold shadow-md transition"
              >
                Play Drop Sound ✨
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showWinModal && (
        <LevelCompleteModal
          stars={3}
          coins={40}
          onNext={handleNextLevel}
        />
      )}

      {showRetryModal && (
        <RetryModal onRetry={handleRetry} />
      )}

      {showExitModal && (
        <ExitModal
          onClose={() => setShowExitModal(false)}
          onConfirmRestart={handleRestartFromExit}
        />
      )}
    </div>
  );
}
