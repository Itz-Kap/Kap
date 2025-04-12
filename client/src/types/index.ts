export interface ChatMessage {
  id?: number;
  sender: string;
  content: string;
  timestamp: string;
}

export interface TicTacToeState {
  board: Array<string>;
  currentPlayer: 'X' | 'O';
  gameOver: boolean;
  winner: string | null;
}

export interface HangmanState {
  words: string[];
  currentWord: string;
  guessedLetters: string[];
  incorrectGuesses: number;
  maxGuesses: number;
  gameStatus: 'playing' | 'won' | 'lost';
}

export interface MemoryState {
  cards: string[];
  flippedCards: number[];
  matchedPairs: Set<number>;
  moves: number;
  isChecking: boolean;
  gameComplete: boolean;
}

export type GameType = 'tic-tac-toe' | 'hangman' | 'memory' | null;

export type Section = 'chat' | 'games' | 'video';

export interface PeerSignal {
  type: 'signal';
  from: string;
  to: string;
  data: any;
}

export interface PeerConnect {
  type: 'connect';
  username: string;
}

export interface PeerDisconnect {
  type: 'disconnect';
  username: string;
}

export interface PeerList {
  type: 'peerList';
  peers: string[];
}

export type PeerMessage = PeerSignal | PeerConnect | PeerDisconnect | PeerList;
