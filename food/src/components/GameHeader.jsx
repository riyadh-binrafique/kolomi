import React, { useState } from 'react';
import { sounds } from '../utils/sound';
import { Volume2, VolumeX } from 'lucide-react';

export default function GameHeader({ onExitClick }) {
  const [isMuted, setIsMuted] = useState(sounds.isMuted);

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="relative w-full flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 z-30">
      {/* Left spacer to keep title centered */}
      <div className="w-16 sm:w-28 flex items-center gap-2">
        {/* Sound toggle button */}
        <button
          onClick={handleToggleSound}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 flex items-center justify-center border-2 border-white shadow transition transform active:scale-90"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-950" />
          )}
        </button>
      </div>

      {/* Center Title Banner: "Healthy vs Unhealthy" */}
      <div className="glossy-blue-pill px-6 sm:px-12 py-2 sm:py-2.5 rounded-full text-white font-extrabold text-lg sm:text-2xl md:text-3xl tracking-wide uppercase shadow-lg select-none">
        Healthy vs Unhealthy
      </div>

      {/* Right Exit Button: Exit.png */}
      <div className="w-16 sm:w-28 flex justify-end">
        <button
          onClick={() => {
            sounds.playClick();
            onExitClick();
          }}
          title="Exit / Restart Game"
          className="transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none"
        >
          <img
            src="/assets/clean/exit.png"
            alt="Exit"
            className="w-10 h-8 sm:w-14 sm:h-11 object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]"
          />
        </button>
      </div>
    </header>
  );
}
