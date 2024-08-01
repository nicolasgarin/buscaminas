import React from 'react';
import { Flag, Bomb } from 'lucide-react';
import { GiMineExplosion } from 'react-icons/gi';

interface CellProps {
  isMine: boolean;
  neighbor: number;
  revealed: boolean;
  flagged: boolean;
  exploded: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  darkMode: boolean;
}

const Cell: React.FC<CellProps> = ({ 
  isMine, 
  neighbor, 
  revealed, 
  flagged, 
  exploded, 
  onClick, 
  onContextMenu, 
  darkMode 
}) => {
  const getCellColor = (): string => {
    if (revealed && isMine) {
      return exploded ? "bg-red-500" : "bg-blue-600";
    }
    if (revealed) return darkMode ? "bg-gray-700" : "bg-blue-100";
    return darkMode
      ? "bg-gray-600 hover:bg-gray-500"
      : "bg-blue-200 hover:bg-blue-300";
  };

  const getTextColor = (count: number): string => {
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
  };

  return (
    <button
      className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded ${getCellColor()} transition-colors duration-200`}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {revealed && !isMine && neighbor > 0 && (
        <span className={getTextColor(neighbor)}>
          {neighbor}
        </span>
      )}
      {revealed && isMine && exploded && (
        <span>
          <GiMineExplosion size={16} className="w-4 h-4 fill-white" />
        </span>
      )}
      {revealed && isMine && !exploded && (
        <span>
          <Bomb size={16} className="w-4 h-4 fill-white" />
        </span>
      )}
      {!revealed && flagged && (
        <span>
          <Flag size={16} className="w-4 h-4" />
        </span>
      )}
    </button>
  );
};

export default Cell;