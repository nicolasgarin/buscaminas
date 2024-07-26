import React, { useState, useEffect, useCallback } from "react";
import { Sun, Moon, Bomb, Flag, Heart } from "lucide-react";
import { GiMineExplosion } from "react-icons/gi";

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

const DIFFICULTY: Record<DifficultyLevel, DifficultySettings> = {
  EASY: { rows: 8, cols: 8, mines: 10 },
  MEDIUM: { rows: 16, cols: 16, mines: 40 },
  HARD: { rows: 16, cols: 30, mines: 99 },
};

const createBoard = (
  rows: number,
  cols: number,
  mines: number
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
    if (!board[row][col].isMine) {
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

  const resetGame = useCallback(() => {
    const { rows, cols, mines } = DIFFICULTY[difficulty];
    setBoard(createBoard(rows, cols, mines));
    setGameOver(false);
    setWin(false);
    setMinesLeft(mines);
    setLives(3);
  }, [difficulty]);

  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);

  const revealAllCells = useCallback(() => {
    setBoard((prevBoard) => {
      const newBoard = JSON.parse(JSON.stringify(prevBoard));
      for (let i = 0; i < newBoard.length; i++) {
        for (let j = 0; j < newBoard[i].length; j++) {
          newBoard[i][j].revealed = true;
        }
      }
      return newBoard;
    });
  }, []);

  const revealCell = useCallback(
    (row: number, col: number) => {
      if (
        gameOver ||
        win ||
        board[row][col].revealed ||
        board[row][col].flagged
      )
        return;

      setBoard((prevBoard) => {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        if (newBoard[row][col].isMine) {
          newBoard[row][col].revealed = true;
          newBoard[row][col].exploded = true;
          setLives((prevLives) => {
            const newLives = Math.max(prevLives - 0.5, 0);
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
        }

        return newBoard;
      });
    },
    [board, difficulty, gameOver, win, revealAllCells]
  );

  const flagCell = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      if (gameOver || win || board[row][col].revealed) return;
      setBoard((prevBoard) => {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        if (!newBoard[row][col].flagged && minesLeft > 0) {
          newBoard[row][col].flagged = true;
          setMinesLeft((prevMinesLeft) => Math.max(prevMinesLeft - 0.5, 0));
        } else if (newBoard[row][col].flagged) {
          newBoard[row][col].flagged = false;
          setMinesLeft((prevMinesLeft) => Math.min(prevMinesLeft + 0.5, DIFFICULTY[difficulty].mines));
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

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-blue-50 text-gray-900"
      } flex flex-col items-center justify-center p-4`}
    >
      <div className="mb-4 flex justify-between items-center w-full max-w-md">
        <select
          className={`p-2 rounded ${darkMode ? "bg-gray-700" : "bg-white"}`}
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
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
              {cell.revealed && !cell.isMine && cell.neighbor > 0 && (
                <span className={getTextColor(cell.neighbor)}>
                  {cell.neighbor}
                </span>
              )}
              {cell.revealed && cell.isMine && cell.exploded && (
                <span><GiMineExplosion size={16} className="w-4 h-4 fill-white" /></span>
              )}
              {cell.revealed && cell.isMine && !cell.exploded && (
                <span><Bomb size={16} className="w-4 h-4 fill-white" /></span>
              )}
              {!cell.revealed && cell.flagged && (
                <span><Flag size={16} className="w-4 h-4" /></span>
              )}
            </button>
          ))
        )}
      </div>
      {(gameOver || win) && (
        <div
          className={`mt-4 text-xl font-bold ${
            win ? "text-green-500" : "text-red-500"
          }`}
        >
          {win ? "¡Has ganado!" : "Game Over"}
        </div>
      )}
      <button
        className={`mt-4 px-4 py-2 rounded ${
          darkMode
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-blue-500 hover:bg-blue-600"
        } text-white transition-colors duration-200`}
        onClick={resetGame}
      >
        Reiniciar juego
      </button>
    </div>
  );
};

export default Minesweeper;