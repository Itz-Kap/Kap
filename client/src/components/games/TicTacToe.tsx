import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { X } from "lucide-react";
import { TicTacToeState } from "@/types";

export default function TicTacToe() {
  const { setActiveGame } = useAppContext();
  const [gameState, setGameState] = useState<TicTacToeState>({
    board: Array(9).fill(''),
    currentPlayer: 'X',
    gameOver: false,
    winner: null
  });

  // Check for win after each move
  useEffect(() => {
    checkWin();
  }, [gameState.board]);

  const handleCellClick = (index: number) => {
    // Ignore if cell is filled or game is over
    if (gameState.board[index] !== '' || gameState.gameOver) return;

    const newBoard = [...gameState.board];
    newBoard[index] = gameState.currentPlayer;

    setGameState({
      ...gameState,
      board: newBoard,
      currentPlayer: gameState.currentPlayer === 'X' ? 'O' : 'X'
    });
  };

  const checkWin = () => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        gameState.board[a] &&
        gameState.board[a] === gameState.board[b] &&
        gameState.board[a] === gameState.board[c]
      ) {
        setGameState({
          ...gameState,
          gameOver: true,
          winner: gameState.board[a]
        });
        return;
      }
    }

    // Check for draw
    if (!gameState.board.includes('') && !gameState.gameOver) {
      setGameState({
        ...gameState,
        gameOver: true,
        winner: 'draw'
      });
    }
  };

  const resetGame = () => {
    setGameState({
      board: Array(9).fill(''),
      currentPlayer: 'X',
      gameOver: false,
      winner: null
    });
  };

  const getGameStatus = () => {
    if (gameState.winner && gameState.winner !== 'draw') {
      return `Player ${gameState.winner} wins!`;
    } else if (gameState.winner === 'draw') {
      return "Game ended in a draw!";
    } else {
      return "Make your move";
    }
  };

  return (
    <section className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tic-Tac-Toe</h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setActiveGame(null)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-4">
          <p className="text-center mb-2">
            <span className="font-medium">Current Player: </span>
            <span className="text-primary font-semibold">{gameState.currentPlayer}</span>
          </p>
          <p className={`text-center ${
            gameState.winner === 'draw' 
              ? 'text-gray-600 dark:text-gray-400'
              : gameState.winner 
                ? 'text-primary font-medium' 
                : 'text-gray-600 dark:text-gray-400'
          }`}>
            {getGameStatus()}
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 max-w-xs w-full">
          {gameState.board.map((cell, index) => (
            <button
              key={index}
              className={`aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg text-3xl font-bold flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm ${
                cell === 'X' ? 'text-primary' : cell === 'O' ? 'text-secondary' : ''
              } ${
                gameState.gameOver && gameState.winner && gameState.winner !== 'draw' && gameState.board[index] === gameState.winner
                  ? 'bg-primary/20 dark:bg-primary/30'
                  : ''
              }`}
              onClick={() => handleCellClick(index)}
            >
              {cell}
            </button>
          ))}
        </div>
        
        <div className="mt-6">
          <Button onClick={resetGame}>
            Reset Game
          </Button>
        </div>
      </div>
    </section>
  );
}
