import React from 'react';
import Cell from './Cell';
import { CellProps, DifficultyLevel } from '../types';
import { DIFFICULTY } from '../utils/boardUtils';

interface BoardProps {
  board: CellProps[][];
  difficulty: DifficultyLevel;
  darkMode: boolean;
  revealCell: (row: number, col: number) => void;
  flagCell: (e: React.MouseEvent, row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, difficulty, darkMode, revealCell, flagCell }) => {
  return (
    <div
      className={`grid gap-1 ${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded-lg shadow-lg`}
      style={{
        gridTemplateColumns: `repeat(${DIFFICULTY[difficulty].cols}, minmax(0, 1fr))`,
      }}
    >
      {board.map((row, i) =>
        row.map((cell, j) => (
          <Cell
            key={`${i}-${j}`}
            {...cell}
            onClick={() => revealCell(i, j)}
            onContextMenu={(e) => flagCell(e, i, j)}
            darkMode={darkMode}
          />
        ))
      )}
    </div>
  );
};

export default Board;