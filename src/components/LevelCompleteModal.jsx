import React, { useEffect } from 'react';
import { fireVictoryConfetti } from '../utils/confetti';
import { sounds } from '../utils/sound';

export default function LevelCompleteModal({ stars = 3, coins = 40, onNext }) {
  useEffect(() => {
    sounds.playWin();
    fireVictoryConfetti();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop-in select-none">
      {/* Modal Dialog using reference asset: sg_panel.png */}
      <div className="relative w-full max-w-[340px] sm:max-w-[390px] aspect-[786/950] drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]">
        {/* Panel Artwork from materials/sg.png */}
        <img
          src="/assets/clean/sg_panel.png"
          alt="Level Complete Panel"
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* --- Gold Stars placed over the 3 star silhouettes --- */}
        {/* Left Star */}
        {stars >= 2 && (
          <div
            className="absolute z-20 pointer-events-none animate-star-pop"
            style={{
              top: '8.5%',
              left: '9%',
              width: '28%',
              animationDelay: '0.15s',
            }}
          >
            <img
              src="/assets/clean/star.png"
              alt="Star 1"
              className="w-full h-auto object-contain -rotate-[16deg] drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
            />
          </div>
        )}

        {/* Center Star (Main / Highest) */}
        {stars >= 1 && (
          <div
            className="absolute z-30 pointer-events-none animate-star-pop"
            style={{
              top: '0.5%',
              left: '32%',
              width: '36%',
              animationDelay: '0.3s',
            }}
          >
            <img
              src="/assets/clean/star.png"
              alt="Star 2"
              className="w-full h-auto object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)]"
            />
          </div>
        )}

        {/* Right Star */}
        {stars >= 3 && (
          <div
            className="absolute z-20 pointer-events-none animate-star-pop"
            style={{
              top: '8.5%',
              right: '9%',
              width: '28%',
              animationDelay: '0.45s',
            }}
          >
            <img
              src="/assets/clean/star.png"
              alt="Star 3"
              className="w-full h-auto object-contain rotate-[16deg] drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
            />
          </div>
        )}

        {/* --- Coin Score Text inside the coin capsule --- */}
        <div
          className="absolute z-20 flex items-center justify-center font-black text-white text-2xl sm:text-3xl md:text-4xl tracking-wider select-none pointer-events-none"
          style={{
            top: '52%',
            left: '46%',
            width: '28%',
            height: '11%',
            textShadow: '0 3px 6px rgba(0,0,0,0.7), 0 0 10px rgba(0,0,0,0.5)',
            fontFamily: '"Lilita One", "Fredoka", cursive',
          }}
        >
          {coins}
        </div>

        {/* --- Interactive NEXT Button over the yellow button area --- */}
        <button
          onClick={() => {
            sounds.playClick();
            onNext();
          }}
          title="Next Level"
          className="absolute z-30 rounded-2xl sm:rounded-3xl cursor-pointer transition-transform duration-150 transform hover:scale-105 active:scale-95 focus:outline-none"
          style={{
            bottom: '2.5%',
            left: '23%',
            width: '54%',
            height: '15%',
          }}
        >
          {/* Subtle glossy pulse highlight overlay */}
          <span className="sr-only">NEXT</span>
        </button>
      </div>
    </div>
  );
}
