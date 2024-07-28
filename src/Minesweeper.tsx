import React, { useState, useEffect, useCallback } from "react";
import { Sun, Moon, Bomb, Flag, Heart } from "lucide-react";
import { GiMineExplosion } from "react-icons/gi";
import GameStatsComp from "./GameStatsComp";

interface CellProps {
  isMine: boolean;
  neighbor: number;
  revealed: boolean;
  flagged: boolean;
  exploded: boolean;
}

interface DifficultySettings {
  rows: number;
  cols: number;
  mines: number;
}

type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  correctFlags: number;
  bombsExploded: number;
}

const DIFFICULTY: Record<DifficultyLevel, DifficultySettings> = {
  EASY: { rows: 8, cols: 8, mines: 10 },
  MEDIUM: { rows: 16, cols: 16, mines: 40 },
  HARD: { rows: 16, cols: 30, mines: 99 },
};

const createBoard = (
  rows: number,
  cols: number,
  mines: number,
  firstClickRow: number | null = null,
  firstClickCol: number | null = null
): CellProps[][] => {
  let board: CellProps[][] = Array(rows)
    .fill(null)
    .map(() =>
      Array(cols)
        .fill(null)
        .map(() => ({
          isMine: false,
          neighbor: 0,
          revealed: false,
          flagged: false,
          exploded: false,
        }))
    );

  // Place mines
  let minesPlaced = 0;
  while (minesPlaced < mines) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    if (
      !board[row][col].isMine &&
      (firstClickRow === null ||
        firstClickCol === null ||
        row !== firstClickRow ||
        col !== firstClickCol)
    ) {
      board[row][col].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighbors
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (!board[i][j].isMine) {
        let count = 0;
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            if (i + di >= 0 && i + di < rows && j + dj >= 0 && j + dj < cols) {
              if (board[i + di][j + dj].isMine) count++;
            }
          }
        }
        board[i][j].neighbor = count;
      }
    }
  }

  return board;
};

const Minesweeper: React.FC = () => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("EASY");
  const [board, setBoard] = useState<CellProps[][]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [win, setWin] = useState<boolean>(false);
  const [minesLeft, setMinesLeft] = useState<number>(
    DIFFICULTY[difficulty].mines
  );
  const [lives, setLives] = useState<number>(3);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [firstClick, setFirstClick] = useState<boolean>(true);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameInitialized, setGameInitialized] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [isChangingName, setIsChangingName] = useState<boolean>(false);
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    correctFlags: 0,
    bombsExploded: 0,
  });

  useEffect(() => {
    const savedStats = localStorage.getItem("minesweeperStats");
    const savedName = localStorage.getItem("minesweeperPlayerName");
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    if (savedName) {
      setPlayerName(savedName);
      setGameInitialized(true);
    }
  }, []);

  // Guardar estadísticas en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem("minesweeperStats", JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem("minesweeperPlayerName", playerName);
  }, [playerName]);

  const updateStats = useCallback((newStats: Partial<GameStats>) => {
    setStats((prevStats) => ({
      ...prevStats,
      ...newStats,
    }));
  }, []);

  const resetGame = useCallback(() => {
    const { rows, cols, mines } = DIFFICULTY[difficulty];
    setBoard(createBoard(rows, cols, mines));
    setGameOver(false);
    setWin(false);
    setMinesLeft(mines);
    setLives(3);
    setFirstClick(true);
    setGameStarted(false);
  }, [difficulty]);

  const startNewGame = useCallback(() => {
    if (gameOver || win) {
      updateStats({ gamesPlayed: stats.gamesPlayed + 1 });
    }
    resetGame();
    setGameStarted(true);
  }, [gameOver, win, stats.gamesPlayed, updateStats, resetGame]);

  useEffect(() => {
    if (gameInitialized) {
      resetGame();
    }
  }, [difficulty, gameInitialized, resetGame]);

  const revealAllCells = useCallback(() => {
    setBoard((prevBoard) => {
      const newBoard = JSON.parse(JSON.stringify(prevBoard));
      let correctFlags = 0;
      for (let i = 0; i < newBoard.length; i++) {
        for (let j = 0; j < newBoard[i].length; j++) {
          newBoard[i][j].revealed = true;
          if (newBoard[i][j].flagged && newBoard[i][j].isMine) {
            correctFlags++;
          }
        }
      }
      updateStats({ correctFlags: stats.correctFlags + correctFlags });
      return newBoard;
    });
  }, [stats.correctFlags, updateStats]);

  const revealCell = useCallback(
    (row: number, col: number) => {
      if (
        gameOver ||
        win ||
        board[row][col].revealed ||
        board[row][col].flagged
      )
        return;

      if (!gameStarted) {
        setGameStarted(true);
      }

      if (firstClick) {
        const { rows, cols, mines } = DIFFICULTY[difficulty];
        const newBoard = createBoard(rows, cols, mines, row, col);
        setBoard(newBoard);
        setFirstClick(false);
      }

      setBoard((prevBoard) => {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        if (newBoard[row][col].isMine) {
          newBoard[row][col].revealed = true;
          newBoard[row][col].exploded = true;
          updateStats({ bombsExploded: stats.bombsExploded + 1 });
          setLives((prevLives) => {
            const newLives = Math.max(prevLives - 1, 0);
            if (newLives === 0) {
              setGameOver(true);
              revealAllCells();
            }
            return newLives;
          });
        } else {
          const revealAdjacentCells = (
            board: CellProps[][],
            r: number,
            c: number
          ) => {
            const { rows, cols } = DIFFICULTY[difficulty];
            if (
              r < 0 ||
              r >= rows ||
              c < 0 ||
              c >= cols ||
              board[r][c].revealed ||
              board[r][c].flagged
            )
              return;

            board[r][c].revealed = true;

            if (board[r][c].neighbor === 0) {
              for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                  revealAdjacentCells(board, r + i, c + j);
                }
              }
            }
          };

          revealAdjacentCells(newBoard, row, col);
        }

        // Check win condition
        const allNonMinesRevealed = newBoard.every((row: CellProps[]) =>
          row.every((cell: CellProps) => cell.isMine || cell.revealed)
        );
        if (allNonMinesRevealed) {
          setWin(true);
          updateStats({ gamesWon: stats.gamesWon + 1 });
          revealAllCells();
        }

        return newBoard;
      });
    },
    [
      board,
      difficulty,
      gameOver,
      win,
      revealAllCells,
      firstClick,
      stats,
      updateStats,
      gameStarted,
    ]
  );

  const flagCell = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      if (gameOver || win || board[row][col].revealed) return;
      setBoard((prevBoard) => {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        if (!newBoard[row][col].flagged && minesLeft > 0) {
          newBoard[row][col].flagged = true;
          setMinesLeft((prevMinesLeft) => Math.max(prevMinesLeft - 1, 0));
        } else if (newBoard[row][col].flagged) {
          newBoard[row][col].flagged = false;
          setMinesLeft((prevMinesLeft) =>
            Math.min(prevMinesLeft + 1, DIFFICULTY[difficulty].mines)
          );
        }
        return newBoard;
      });
    },
    [board, gameOver, win, minesLeft, difficulty]
  );

  const getCellColor = useCallback(
    (cell: CellProps): string => {
      if (cell.revealed && cell.isMine) {
        return cell.exploded ? "bg-red-500" : "bg-blue-600";
      }
      if (cell.revealed) return darkMode ? "bg-gray-700" : "bg-blue-100";
      return darkMode
        ? "bg-gray-600 hover:bg-gray-500"
        : "bg-blue-200 hover:bg-blue-300";
    },
    [darkMode]
  );

  const getTextColor = useCallback((count: number): string => {
    const colors = [
      "text-blue-500",
      "text-green-500",
      "text-yellow-500",
      "text-orange-500",
      "text-red-500",
      "text-purple-500",
      "text-pink-500",
      "text-indigo-500",
    ];
    return colors[count - 1] || "text-gray-700";
  }, []);

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
    setStats(newStats);
    localStorage.setItem("minesweeperStats", JSON.stringify(newStats));
  };

  if (!gameInitialized || isChangingName) {
    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900 text-white" : "bg-blue-50 text-gray-900"
        } flex flex-col items-center justify-center p-4`}
      >
        <form
          onSubmit={handleNameSubmit}
          className="flex flex-col items-center"
        >
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Ingresa tu nombre"
            className={`p-2 rounded mb-4 ${
              darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
            }`}
            required
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white transition-colors duration-200`}
          >
            {isChangingName ? "Guardar nombre" : "Iniciar juego"}
          </button>
        </form>
        {!isChangingName && (
          <button
            onClick={resetStats}
            className={`mt-4 px-4 py-2 rounded ${
              darkMode
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-500 hover:bg-red-600"
            } text-white transition-colors duration-200`}
          >
            Reiniciar estadísticas
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-blue-50 text-gray-900"
      } flex flex-col items-center justify-center p-4`}
    >
      <div className="mt-6">
        <GameStatsComp
          stats={stats}
          darkMode={darkMode}
          playerName={playerName}
        />
      </div>
      <div className="mb-4 flex justify-between items-center w-full max-w-md">
        <select
          className={`p-2 rounded ${darkMode ? "bg-gray-700" : "bg-white"}`}
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
          disabled={gameStarted && !gameOver && !win}
        >
          <option value="EASY">Fácil</option>
          <option value="MEDIUM">Medio</option>
          <option value="HARD">Difícil</option>
        </select>
        <div className="flex items-center space-x-2">
          <Flag size={20} />
          <span>{minesLeft}</span>
          <Heart size={20} />
          <span>{lives}</span>
        </div>
        <button
          className={`p-2 rounded ${
            darkMode ? "bg-yellow-500" : "bg-blue-500"
          } text-white`}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      {gameStarted ? (
        <div
          className={`grid gap-1 ${
            darkMode ? "bg-gray-800" : "bg-white"
          } p-4 rounded-lg shadow-lg`}
          style={{
            gridTemplateColumns: `repeat(${DIFFICULTY[difficulty].cols}, minmax(0, 1fr))`,
          }}
        >
          {board.map((row, i) =>
            row.map((cell, j) => (
              <button
                key={`${i}-${j}`}
                className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded ${getCellColor(
                  cell
                )} transition-colors duration-200`}
                onClick={() => revealCell(i, j)}
                onContextMenu={(e) => flagCell(e, i, j)}
              >
                {/* ... (el contenido de las celdas permanece igual) */}
              </button>
            ))
          )}
        </div>
      ) : (
        <div
          className={`text-xl font-bold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Presiona "Iniciar nuevo juego" para comenzar
        </div>
      )}
      {(gameOver || win) && (
        <div
          className={`mt-4 text-xl font-bold ${
            win ? "text-green-500" : "text-red-500"
          }`}
        >
          {win ? "¡Has ganado!" : "Game Over"}
        </div>
      )}
      <div className="mt-4 flex space-x-4">
        <button
          className={`px-4 py-2 rounded ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white transition-colors duration-200 ${
            !gameOver && !win && gameStarted
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={startNewGame}
          disabled={!gameOver && !win && gameStarted}
        >
          {gameStarted ? "Reiniciar juego" : "Iniciar nuevo juego"}
        </button>
        <button
          className={`px-4 py-2 rounded ${
            darkMode
              ? "bg-green-600 hover:bg-green-700"
              : "bg-green-500 hover:bg-green-600"
          } text-white transition-colors duration-200`}
          onClick={() => setIsChangingName(true)}
        >
          Cambiar nombre
        </button>
      </div>
    </div>
  );
};

export default Minesweeper;
