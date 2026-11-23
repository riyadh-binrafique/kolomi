import React, { useEffect, useState } from 'react';
import { sounds } from '../utils/sound';

export default function RetryModal({ onRetry }) {
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    sounds.playFail();
  }, []);

  const handleRetryClick = () => {
    sounds.playClick();
    setIsSpinning(true);
    setTimeout(() => {
      onRetry();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop-in select-none">
      <div className="relative w-full max-w-[310px] sm:max-w-[350px] aspect-[415/495] drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)] flex flex-col items-center justify-between p-6">
        <img
          src="/assets/solidBg.png"
          alt="Retry Background Panel"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        />

        <div className="relative z-20 text-center text-white mt-12 sm:mt-14 space-y-1">
          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-wide"
            style={{
              textShadow: '0 3px 6px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.4)',
              fontFamily: '"Lilita One", "Fredoka", cursive',
            }}
          >
            You Failed :(
          </h2>
          <p
            className="text-lg sm:text-2xl font-bold text-white tracking-wide"
            style={{
              textShadow: '0 2px 5px rgba(0,0,0,0.6)',
              fontFamily: '"Lilita One", "Fredoka", cursive',
            }}
          >
            Please Retry!
          </p>
        </div>

        <div className="relative z-20 mb-8 sm:mb-10">
          <button
            onClick={handleRetryClick}
            title="Retry Level"
            className="w-18 h-18 sm:w-20 sm:h-20 transition-transform duration-200 hover:scale-108 active:scale-95 cursor-pointer focus:outline-none"
          >
            <img
              src="/assets/retry.png"
              alt="Retry Button"
              className={`w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] transition-transform duration-500 ${
                isSpinning ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
