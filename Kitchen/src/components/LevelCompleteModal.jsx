import React, { useEffect } from 'react';
import { fireVictoryConfetti } from '../utils/confetti';
import { sounds } from '../utils/sound';

export default function LevelCompleteModal({ stars = 3, coins = 40, onNext }) {
  useEffect(() => {
    sounds.playWin();
    try {
      fireVictoryConfetti();
    } catch (e) {
      console.warn('Confetti error', e);
    }
  }, []);

  // Star display logic:
  // 1 star: Center star (main star)
  // 2 stars: Center + Left stars
  // 3 stars: Center + Left + Right stars
  const showCenter = stars >= 1;
  const showLeft = stars >= 2;
  const showRight = stars >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop-in select-none">
      {/* Modal Dialog using reference asset: sg_panel.png (786 x 952) matching Screenshot 4 */}
      <div className="relative w-full max-w-[320px] sm:max-w-[380px] aspect-[786/952] drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]">
        {/* Panel Artwork from materials/sg.png */}
        <img
          src="/assets/sg_panel.png"
          onError={(e) => {
            e.currentTarget.src = '/assets/clean/sg_panel.png';
          }}
          alt="Level Complete Panel"
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* --- Gold Stars placed precisely over the dedicated silhouette spaces in sg.png --- */}

        {/* Star 1 (Left Dedicated Space) */}
        {showLeft && (
          <div
            className="absolute z-20 pointer-events-none animate-star-pop"
            style={{
              top: '8.1%',
              left: '7.6%',
              width: '31.9%',
              animationDelay: '0.15s',
            }}
          >
            <img
              src="/assets/star.png"
              onError={(e) => {
                e.currentTarget.src = '/assets/clean/star.png';
              }}
              alt="Star 1"
              className="w-full h-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
            />
          </div>
        )}

        {/* Star 2 (Center Dedicated Space - Main / Highest) */}
        {showCenter && (
          <div
            className="absolute z-30 pointer-events-none animate-star-pop"
            style={{
              top: '0%',
              left: '32.1%',
              width: '41.0%',
              animationDelay: '0.35s',
            }}
          >
            <img
              src="/assets/star.png"
              onError={(e) => {
                e.currentTarget.src = '/assets/clean/star.png';
              }}
              alt="Star 2"
              className="w-full h-auto object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)]"
            />
          </div>
        )}

        {/* Star 3 (Right Dedicated Space) */}
        {showRight && (
          <div
            className="absolute z-20 pointer-events-none animate-star-pop"
            style={{
              top: '9.0%',
              left: '66.7%',
              width: '31.9%',
              animationDelay: '0.55s',
            }}
          >
            <img
              src="/assets/star.png"
              onError={(e) => {
                e.currentTarget.src = '/assets/clean/star.png';
              }}
              alt="Star 3"
              className="w-full h-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
            />
          </div>
        )}

        {/* --- Coin Score Text inside coin capsule --- */}
        <div
          className="absolute z-20 flex items-center justify-center font-black text-white text-2xl sm:text-3xl md:text-4xl tracking-wider select-none pointer-events-none"
          style={{
            top: '52.5%',
            left: '45%',
            width: '28%',
            height: '11%',
            textShadow: '0 3px 6px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)',
            fontFamily: '"Lilita One", "Fredoka", cursive',
          }}
        >
          {coins}
        </div>

        {/* --- Interactive NEXT Button over yellow button area --- */}
        <button
          onClick={() => {
            sounds.playClick();
            onNext();
          }}
          title="Next Level"
          className="absolute z-30 rounded-2xl sm:rounded-3xl cursor-pointer transition-transform duration-150 transform hover:scale-105 active:scale-95 focus:outline-none"
          style={{
            top: '76.2%',
            left: '25.5%',
            width: '49.6%',
            height: '23.8%',
          }}
        >
          <span className="sr-only">NEXT</span>
        </button>
      </div>
    </div>
  );
}
