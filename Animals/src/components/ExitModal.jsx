import React from 'react';
import { sounds } from '../utils/sound';

export default function ExitModal({ onConfirmRestart, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop-in select-none">
      <div className="relative w-full max-w-[310px] sm:max-w-[350px] aspect-[416/497] drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)] flex flex-col items-center justify-between p-6">
        <img
          src="/assets/solidBg.png"
          alt="Exit Modal Panel"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        />

        <div className="relative z-20 text-center text-white mt-12 sm:mt-14 space-y-2">
          <h3
            className="text-2xl sm:text-3xl font-extrabold tracking-wide"
            style={{
              textShadow: '0 3px 6px rgba(0,0,0,0.6)',
              fontFamily: '"Lilita One", "Fredoka", cursive',
            }}
          >
            Exit Game?
          </h3>
          <p className="text-yellow-100 text-sm sm:text-base font-semibold px-4">
            Do you want to restart the level from the beginning?
          </p>
        </div>

        <div className="relative z-20 mb-8 sm:mb-10 flex gap-3 w-4/5 justify-center">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="flex-1 py-2 px-3 rounded-xl font-bold bg-white/20 hover:bg-white/30 text-white border border-white/50 transition active:scale-95 cursor-pointer text-sm sm:text-base"
          >
            Resume
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onConfirmRestart();
            }}
            className="flex-1 py-2 px-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-amber-950 border-2 border-yellow-200 shadow-md transition active:scale-95 cursor-pointer text-sm sm:text-base"
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}
