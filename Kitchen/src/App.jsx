import React, { useState } from 'react';
import { Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { KITCHEN_QUESTIONS } from './data/questions';
import LevelCompleteModal from './components/LevelCompleteModal';
import RetryModal from './components/RetryModal';
import ExitModal from './components/ExitModal';
import { sounds } from './utils/sound';

export default function App() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [attempts, setAttempts] = useState(1); // 1 = first try, 2 = second try, 3 = third try
  const [wrongChoices, setWrongChoices] = useState([]);
  const [correctChoice, setCorrectChoice] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'CORRECT' | 'WRONG' | null
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Modals state
  const [showWinModal, setShowWinModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Score & settings
  const [starsEarned, setStarsEarned] = useState(3);
  const [coins, setCoins] = useState(40);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentQuestion = KITCHEN_QUESTIONS[levelIndex];

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

  // Handle user picking an answer
  const handleOptionClick = (option) => {
    if (isTransitioning || wrongChoices.includes(option.id) || correctChoice) {
      return;
    }

    if (option.isCorrect) {
      // Correct answer!
      // Star calculation based on user attempt:
      // 1st attempt correct = 3 stars
      // 2nd attempt correct = 2 stars
      // 3rd attempt correct = 1 star
      let calculatedStars = 3;
      if (attempts === 1) calculatedStars = 3;
      else if (attempts === 2) calculatedStars = 2;
      else calculatedStars = 1;

      setCorrectChoice(option.id);
      setFeedback('CORRECT');
      setIsTransitioning(true);
      setStarsEarned(calculatedStars);
      sounds.playWin();

      // Show win modal after brief pause to enjoy feedback
      setTimeout(() => {
        setFeedback(null);
        setShowWinModal(true);
        setIsTransitioning(false);
      }, 750);
    } else {
      // Wrong answer!
      sounds.playOops();
      setFeedback('WRONG');
      const updatedWrong = [...wrongChoices, option.id];
      setWrongChoices(updatedWrong);

      if (attempts < 3) {
        // Child has more attempts left (up to 3 tries)
        setAttempts((prev) => prev + 1);

        // Clear the WRONG banner after 800ms so child can try again
        setTimeout(() => {
          setFeedback(null);
        }, 800);
      } else {
        // 3rd attempt failed -> triggers retry modal
        setIsTransitioning(true);
        setTimeout(() => {
          setFeedback(null);
          setShowRetryModal(true);
          setIsTransitioning(false);
        }, 800);
      }
    }
  };

  // Next level handler
  const handleNextLevel = () => {
    setShowWinModal(false);
    setAttempts(1);
    setWrongChoices([]);
    setCorrectChoice(null);
    setFeedback(null);
    setLevelIndex((prev) => (prev + 1) % KITCHEN_QUESTIONS.length);
  };

  // Retry level handler
  const handleRetry = () => {
    setShowRetryModal(false);
    setAttempts(1);
    setWrongChoices([]);
    setCorrectChoice(null);
    setFeedback(null);
  };

  // Restart entire game from Level 1
  const handleRestartGame = () => {
    setShowExitModal(false);
    setLevelIndex(0);
    setAttempts(1);
    setWrongChoices([]);
    setCorrectChoice(null);
    setFeedback(null);
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col justify-between items-center p-3 sm:p-6 select-none bg-cover bg-center"
      style={{ backgroundImage: `url('/assets/kitchenbg.png')` }}
    >
      {/* Background Overlay for depth */}
      <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />

      {/* --- TOP BAR HEADER --- */}
      <header className="relative z-20 w-full flex items-center justify-between">
        {/* Left: Sound and Fullscreen buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 sm:p-2.5 rounded-2xl bg-[#1e293b]/70 hover:bg-[#1e293b]/90 border border-white/20 text-white backdrop-blur-md transition active:scale-95 shadow-md cursor-pointer"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 sm:p-2.5 rounded-2xl bg-[#1e293b]/70 hover:bg-[#1e293b]/90 border border-white/20 text-white backdrop-blur-md transition active:scale-95 shadow-md cursor-pointer"
            title="Fullscreen"
          >
            <Maximize2 size={20} />
          </button>
        </div>

        {/* Center: "TOOL TIME KITCHEN" Banner matching Screenshot 1 */}
        <div className="bg-[#1e293b]/75 backdrop-blur-md px-8 sm:px-14 py-2 sm:py-3 rounded-2xl border border-white/20 shadow-xl">
          <h1
            className="text-white text-lg sm:text-2xl md:text-3xl font-extrabold tracking-widest text-center"
            style={{
              fontFamily: '"Lilita One", "Fredoka", cursive',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            TOOL TIME KITCHEN
          </h1>
        </div>

        {/* Right: Exit Button matching Screenshot 1 */}
        <button
          onClick={() => {
            sounds.playClick();
            setShowExitModal(true);
          }}
          title="Exit / Restart Game"
          className="w-11 h-11 sm:w-14 sm:h-14 transition-transform duration-150 hover:scale-110 active:scale-95 cursor-pointer focus:outline-none drop-shadow-lg"
        >
          <img
            src="/assets/Exit.png"
            alt="Exit Button"
            className="w-full h-full object-contain pointer-events-none"
          />
        </button>
      </header>

      {/* --- CENTRAL QUESTION & HINT CARD matching Screenshot 1 --- */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center max-w-4xl px-2 sm:px-4 my-auto">
        <div className="w-full bg-[#1e293b]/75 backdrop-blur-md rounded-3xl sm:rounded-4xl border border-white/20 shadow-2xl p-5 sm:p-8 flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px] md:min-h-[280px]">
          {/* Question Text */}
          <h2
            className="text-white text-base sm:text-xl md:text-2xl font-black tracking-wider text-center uppercase mb-3 sm:mb-4 px-4"
            style={{
              fontFamily: '"Lilita One", "Fredoka", cursive',
              textShadow: '0 2px 4px rgba(0,0,0,0.6)',
            }}
          >
            {currentQuestion.question}
          </h2>

          {/* Picture Hint in center of card */}
          <div className="relative flex items-center justify-center w-full max-h-24 sm:max-h-36 md:max-h-40 my-1">
            <img
              key={currentQuestion.id}
              src={currentQuestion.hintImg}
              alt={currentQuestion.hintAlt}
              className="max-h-24 sm:max-h-36 md:max-h-40 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] animate-pop-in"
            />
          </div>
        </div>

        {/* --- FEEDBACK BADGE ("CORRECT" / "WRONG") matching Screenshots 2 & 3 --- */}
        <div className="h-12 sm:h-14 flex items-center justify-center my-1 sm:my-2">
          {feedback === 'CORRECT' && (
            <div className="bg-[#1e2456]/90 border border-blue-400/40 px-10 sm:px-14 py-1.5 sm:py-2 rounded-2xl shadow-2xl animate-pop-in">
              <span
                className="text-[#22c55e] text-2xl sm:text-3xl font-extrabold tracking-wider"
                style={{
                  fontFamily: '"Lilita One", "Fredoka", cursive',
                  textShadow: '0 0 14px rgba(34,197,94,0.6)',
                }}
              >
                CORRECT
              </span>
            </div>
          )}

          {feedback === 'WRONG' && (
            <div className="bg-[#1e2456]/90 border border-blue-400/40 px-10 sm:px-14 py-1.5 sm:py-2 rounded-2xl shadow-2xl animate-pop-in">
              <span
                className="text-[#ef4444] text-2xl sm:text-3xl font-extrabold tracking-wider"
                style={{
                  fontFamily: '"Lilita One", "Fredoka", cursive',
                  textShadow: '0 0 14px rgba(239,68,68,0.6)',
                }}
              >
                WRONG
              </span>
            </div>
          )}
        </div>
      </main>

      {/* --- BOTTOM OPTIONS ROW (5 CHOICES) matching Screenshot 1 --- */}
      <footer className="relative z-10 w-full max-w-4xl px-2 sm:px-4 mb-2 sm:mb-4">
        <div className="grid grid-cols-5 gap-2.5 sm:gap-4 md:gap-6 w-full">
          {currentQuestion.options.map((opt) => {
            const isWrong = wrongChoices.includes(opt.id);
            const isCorrect = correctChoice === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => handleOptionClick(opt)}
                disabled={isWrong || isTransitioning || Boolean(correctChoice)}
                title={opt.name}
                className={`group relative bg-[#1e293b]/75 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/20 aspect-square flex items-center justify-center p-3 sm:p-5 shadow-xl transition-all duration-200 transform focus:outline-none ${
                  isWrong
                    ? 'opacity-40 grayscale scale-95 border-red-500/60 bg-red-950/40 cursor-not-allowed'
                    : isCorrect
                    ? 'ring-4 ring-green-400 bg-emerald-950/50 scale-105 border-green-400'
                    : 'hover:scale-105 hover:bg-[#1e293b]/90 hover:border-white/40 active:scale-95 cursor-pointer'
                }`}
              >
                <img
                  src={opt.img}
                  alt={opt.name}
                  className="w-full h-full object-contain filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)] transition-transform duration-200 group-hover:scale-110 pointer-events-none"
                />
              </button>
            );
          })}
        </div>
      </footer>

      {/* --- REWARD MODAL (Level Complete with calculated stars) --- */}
      {showWinModal && (
        <LevelCompleteModal
          stars={starsEarned}
          coins={coins}
          onNext={handleNextLevel}
        />
      )}

      {/* --- RETRY MODAL (After 3 wrong choices) --- */}
      {showRetryModal && (
        <RetryModal onRetry={handleRetry} />
      )}

      {/* --- EXIT / RESTART MODAL --- */}
      {showExitModal && (
        <ExitModal
          onClose={() => setShowExitModal(false)}
          onConfirmRestart={handleRestartGame}
        />
      )}
    </div>
  );
}
