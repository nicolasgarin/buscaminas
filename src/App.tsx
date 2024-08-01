import React, { useState, useEffect } from 'react';
import { DifficultyLevel, GameStats } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import Board from './components/Board';
import GameStatsComp from './components/GameStats';
import DifficultySelector from './components/DifficultySelector';
import GameControls from './components/GameControls';

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("EASY");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [isChangingName, setIsChangingName] = useState<boolean>(false);
  const [gameInitialized, setGameInitialized] = useState<boolean>(false);

  const {
    board,
    gameOver,
    win,
    minesLeft,
    lives,
    gameStarted,
    stats,
    resetGame,
    startNewGame,
    revealCell,
    flagCell,
    updateStats,
  } = useGameLogic(difficulty);

  useEffect(() => {
    const savedName = localStorage.getItem("minesweeperPlayerName");
    const savedStats = localStorage.getItem("minesweeperStats");
    if (savedName) {
      setPlayerName(savedName);
      setGameInitialized(true);
    }
    if (savedStats) {
      updateStats(JSON.parse(savedStats));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("minesweeperPlayerName", playerName);
  }, [playerName]);

  useEffect(() => {
    localStorage.setItem("minesweeperStats", JSON.stringify(stats));
  }, [stats]);

  const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGameInitialized(true);
    setIsChangingName(false);
  };

  const resetStats = () => {
    const newStats: GameStats = {
      gamesPlayed: 0,
      gamesWon: 0,
      correctFlags: 0,
      bombsExploded: 0,
    };
    updateStats(newStats);
  };

  if (!gameInitialized || isChangingName) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-blue-50 text-gray-900"} flex flex-col items-center justify-center p-4`}>
        <form onSubmit={handleNameSubmit} className="flex flex-col items-center">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Ingresa tu nombre"
            className={`p-2 rounded mb-4 ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
            required
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white transition-colors duration-200`}
          >
            {isChangingName ? "Guardar nombre" : "Iniciar juego"}
          </button>
        </form>
        {!isChangingName && (
          <button
            onClick={resetStats}
            className={`mt-4 px-4 py-2 rounded ${darkMode ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"} text-white transition-colors duration-200`}
          >
            Reiniciar estadísticas
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-blue-50 text-gray-900"} flex flex-col items-center justify-center p-4`}>
      <GameStatsComp stats={stats} darkMode={darkMode} playerName={playerName} />
      <div className="mb-4 flex justify-between items-center w-full max-w-md">
        <DifficultySelector
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          disabled={gameStarted && !gameOver && !win}
          darkMode={darkMode}
        />
        <GameControls
          minesLeft={minesLeft}
          lives={lives}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          startNewGame={startNewGame}
          gameStarted={gameStarted}
          gameOver={gameOver}
          win={win}
          setIsChangingName={setIsChangingName}
        />
      </div>
      {gameStarted ? (
        <Board
          board={board}
          difficulty={difficulty}
          darkMode={darkMode}
          revealCell={revealCell}
          flagCell={flagCell}
        />
      ) : (
        <div className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Presiona "Iniciar nuevo juego" para comenzar
        </div>
      )}
      {(gameOver || win) && (
        <div className={`mt-4 text-xl font-bold ${win ? "text-green-500" : "text-red-500"}`}>
          {win ? "¡Has ganado!" : "Game Over"}
        </div>
      )}
    </div>
  );
};

export default App;