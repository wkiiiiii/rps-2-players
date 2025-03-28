export type Player = {
  id: string;
  choice: 'rock' | 'paper' | 'scissors' | null;
};

export type GameState = {
  players: (Player | null)[];
  currentRound: number;
  roundResult: string | null;
};

export const initialGameState: GameState = {
  players: [null, null], // Two seats, initially empty
  currentRound: 0,
  roundResult: null,
}; 