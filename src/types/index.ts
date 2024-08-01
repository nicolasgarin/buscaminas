export interface CellProps {
  isMine: boolean;
  neighbor: number;
  revealed: boolean;
  flagged: boolean;
  exploded: boolean;
}

export interface DifficultySettings {
  rows: number;
  cols: number;
  mines: number;
}

export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  correctFlags: number;
  bombsExploded: number;
}
