import React from 'react';
import { sounds } from '../utils/sound';

export default function ScoreBoard({
  rightCount = 0,
  wrongCount = 0,
  score = 0,
  onSubmit,
  className = '',
}) {
  const handleClickSubmit = (e) => {
    e.stopPropagation();
    sounds.playClick();
    onSubmit();
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 select-none ${className}`}>
      {/* Brown Scoreboard Panel matching Image 1 & 2 */}
      <div className="board-panel rounded-2xl w-full p-2 sm:p-3 text-center text-amber-100 flex flex-col justify-center items-center shadow-lg">
        {/* Right / Wrong section - Live Real-Time Count */}
        <div className="border-b border-amber-900/50 pb-1 mb-1 w-full">
          <p className="text-[10px] sm:text-xs md:text-sm font-bold tracking-wide text-amber-200 uppercase">
            Right/wrong
          </p>
          <div className="text-sm sm:text-base md:text-xl font-black text-white mt-0.5 flex items-center justify-center gap-1.5">
            <span className="text-emerald-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
              {rightCount}
            </span>
            <span className="text-white/60">/</span>
            <span className="text-rose-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
              {wrongCount}
            </span>
          </div>
        </div>

        {/* Score section - Live Real-Time Score */}
        <div className="w-full">
          <p className="text-[10px] sm:text-xs md:text-sm font-bold tracking-wide text-amber-200 uppercase">
            score
          </p>
          <p className="text-base sm:text-xl md:text-2xl font-black text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] mt-0.5">
            {score}
          </p>
        </div>
      </div>

      {/* Glossy Blue Submit Button */}
      <button
        onClick={handleClickSubmit}
        className="glossy-blue-pill py-1.5 sm:py-2 px-5 sm:px-7 rounded-full text-white font-extrabold text-xs sm:text-base md:text-lg tracking-wider transition-all duration-150 transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
        style={{
          fontFamily: '"Lilita One", "Fredoka", cursive',
        }}
      >
        Submit
      </button>
    </div>
  );
}
