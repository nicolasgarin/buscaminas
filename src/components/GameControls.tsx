import React from 'react';
import { Flag, Heart, Sun, Moon } from 'lucide-react';

interface GameControlsProps {
  minesLeft: number;
  lives: number;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  startNewGame: () => void;
  gameStarted: boolean;
  gameOver: boolean;
  win: boolean;
  setIsChangingName: (isChanging: boolean) => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  minesLeft,
  lives,
  darkMode,
  setDarkMode,
  startNewGame,
  gameStarted,
  gameOver,
  win,
  setIsChangingName,
}) => {
  return (
    <>
      <div className="flex items-center space-x-2">
        <Flag size={20} />
        <span>{minesLeft}</span>
        <Heart size={20} />
        <span>{lives}</span>
      </div>
      <button
        className={`p-2 rounded ${darkMode ? "bg-yellow-500" : "bg-blue-500"} text-white`}
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <div className="mt-4 flex space-x-4">
        <button
          className={`px-4 py-2 rounded ${
            darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
          } text-white transition-colors duration-200 ${
            (!gameOver && !win && gameStarted) ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={startNewGame}
          disabled={!gameOver && !win && gameStarted}
        >
          {gameStarted ? "Reiniciar juego" : "Iniciar nuevo juego"}
        </button>
        <button
          className={`px-4 py-2 rounded ${
            darkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"
          } text-white transition-colors duration-200`}
          onClick={() => setIsChangingName(true)}
        >
          Cambiar nombre
        </button>
      </div>
    </>
  );
};

export default GameControls;