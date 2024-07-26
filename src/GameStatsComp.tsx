import React from 'react';
import { Trophy, Flag, Bomb, GamepadIcon } from 'lucide-react';

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  correctFlags: number;
  bombsExploded: number;
}

interface GameStatsProps {
  stats: GameStats;
  darkMode?: boolean;
}

const GameStatsComp: React.FC<GameStatsProps> = ({ stats, darkMode = false }) => {
  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg`}>
      <h3 className="text-lg font-bold mb-3 flex items-center">
        <Trophy className="mr-2" size={20} />
        Estadísticas de Juego
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <GamepadIcon className="mr-2" size={16} />
          <span>Partidas jugadas: {stats.gamesPlayed}</span>
        </div>
        <div className="flex items-center">
          <Trophy className="mr-2" size={16} />
          <span>Partidas ganadas: {stats.gamesWon}</span>
        </div>
        <div className="flex items-center">
          <Flag className="mr-2" size={16} />
          <span>Bombas marcadas correctamente: {stats.correctFlags}</span>
        </div>
        <div className="flex items-center">
          <Bomb className="mr-2" size={16} />
          <span>Bombas explotadas: {stats.bombsExploded}</span>
        </div>
      </div>
      {stats.gamesPlayed > 0 && (
        <div className="mt-3 text-sm">
          Porcentaje de victorias: {((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(2)}%
        </div>
      )}
    </div>
  );
};

export default GameStatsComp;