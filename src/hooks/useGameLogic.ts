import { useState, useCallback, useEffect } from "react";
import { CellProps, DifficultyLevel, GameStats } from "../types";
import { createBoard, DIFFICULTY } from "../utils/boardUtils";

export const useGameLogic = (difficulty: DifficultyLevel) => {
  const [board, setBoard] = useState<CellProps[][]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [win, setWin] = useState<boolean>(false);
  const [minesLeft, setMinesLeft] = useState<number>(
    DIFFICULTY[difficulty].mines
  );
  const [lives, setLives] = useState<number>(3);
  const [firstClick, setFirstClick] = useState<boolean>(true);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameInitialized, setGameInitialized] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
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

  return {
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
  };
};
