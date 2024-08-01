import React from 'react';
import { DifficultyLevel } from '../types';

interface DifficultySelectorProps {
  difficulty: DifficultyLevel;
  setDifficulty: (difficulty: DifficultyLevel) => void;
  disabled: boolean;
  darkMode: boolean;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  difficulty,
  setDifficulty,
  disabled,
  darkMode,
}) => {
  return (
    <select
      className={`p-2 rounded ${darkMode ? "bg-gray-700" : "bg-white"}`}
      value={difficulty}
      onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
      disabled={disabled}
    >
      <option value="EASY">Fácil</option>
      <option value="MEDIUM">Medio</option>
      <option value="HARD">Difícil</option>
    </select>
  );
};

export default DifficultySelector;