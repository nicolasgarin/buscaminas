import { CellProps, DifficultySettings, DifficultyLevel } from "../types";

export const createBoard = (
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

export const DIFFICULTY: Record<DifficultyLevel, DifficultySettings> = {
  EASY: { rows: 8, cols: 8, mines: 10 },
  MEDIUM: { rows: 16, cols: 16, mines: 40 },
  HARD: { rows: 16, cols: 30, mines: 99 },
};
