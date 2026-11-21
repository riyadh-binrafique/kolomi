import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-[1280px] aspect-[1280/832] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 rounded-2xl flex flex-col items-center justify-center text-center p-8 border border-white/10 shadow-2xl">
        <div className="inline-block px-6 py-2 rounded-full bg-indigo-500/30 text-indigo-300 font-bold text-sm tracking-wide uppercase mb-6 border border-indigo-400/30">
          Kolomi Games
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white font-lilita drop-shadow-lg mb-4">
          Game 2 Workspace
        </h1>
        <p className="text-base md:text-xl text-white/80 max-w-lg mb-8">
          This standalone folder is ready for your next educational game. Add your assets into <code className="bg-black/40 px-2 py-1 rounded text-amber-300">materials/</code> and start building in <code className="bg-black/40 px-2 py-1 rounded text-amber-300">src/</code>!
        </p>
      </div>
    </div>
  );
}
