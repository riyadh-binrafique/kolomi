import React from 'react';

export default function ScoreBoard({ rightCount = 0, wrongCount = 0, score = 0 }) {
  return (
    <div className="relative w-full rounded-2xl bg-[#070b28]/85 backdrop-blur-md border border-indigo-900/60 p-3 sm:p-4 shadow-[0_8px_25px_rgba(0,0,0,0.55)] flex flex-col justify-between text-white select-none">
      {/* Right / Wrong section */}
      <div>
        <div
          className="text-white/85 font-bold text-xs sm:text-sm tracking-wide"
          style={{ fontFamily: '"Fredoka", sans-serif' }}
        >
          Right/wrong
        </div>
        <div
          className="text-lg sm:text-2xl font-black mt-1 flex items-center gap-1.5"
          style={{ fontFamily: '"Lilita One", "Fredoka", cursive' }}
        >
          <span className="text-emerald-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {rightCount}
          </span>
          <span className="text-white/40 font-normal">/</span>
          <span className="text-rose-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {wrongCount}
          </span>
        </div>
      </div>

      {/* Score section */}
      <div className="mt-3 sm:mt-4">
        <div
          className="text-white/85 font-bold text-xs sm:text-sm tracking-wide"
          style={{ fontFamily: '"Fredoka", sans-serif' }}
        >
          score
        </div>
        <div
          className="text-xl sm:text-3xl font-black text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-1"
          style={{ fontFamily: '"Lilita One", "Fredoka", cursive' }}
        >
          {score}
        </div>
      </div>
    </div>
  );
}

