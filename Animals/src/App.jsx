import React from 'react';

export default function App() {
  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-white select-none">
      <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-black text-amber-400 mb-4 drop-shadow">
          🐾 Animals Game
        </h1>
        <p className="text-lg text-emerald-100 max-w-md">
          Ready for animal classification and fun puzzle matching!
        </p>
      </div>
    </div>
  );
}
