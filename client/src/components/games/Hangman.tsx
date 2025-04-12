import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { X } from "lucide-react";
import { HangmanState } from "@/types";
import { cn } from "@/lib/utils";

export default function Hangman() {
  const { setActiveGame } = useAppContext();
  const [gameState, setGameState] = useState<HangmanState>({
    words: [
      'JAVASCRIPT', 'HANGMAN', 'DEVELOPER', 'PROGRAMMING', 
      'COMPUTER', 'ALGORITHM', 'CHATBOX', 'KEYBOARD', 
      'INTERFACE', 'GAMING'
    ],
    currentWord: '',
    guessedLetters: [],
    incorrectGuesses: 0,
    maxGuesses: 6,
    gameStatus: 'playing'
  });

  // Initialize game on component mount
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const randomIndex = Math.floor(Math.random() * gameState.words.length);
    setGameState({
      ...gameState,
      currentWord: gameState.words[randomIndex],
      guessedLetters: [],
      incorrectGuesses: 0,
      gameStatus: 'playing'
    });
  };

  const handleGuess = (letter: string) => {
    if (
      gameState.guessedLetters.includes(letter) || 
      gameState.gameStatus !== 'playing'
    ) {
      return;
    }

    const newGuessedLetters = [...gameState.guessedLetters, letter];
    
    // Check if the letter is in the word
    const isCorrect = gameState.currentWord.includes(letter);
    const newIncorrectGuesses = isCorrect 
      ? gameState.incorrectGuesses 
      : gameState.incorrectGuesses + 1;

    // Check if all letters have been guessed (win)
    const isComplete = [...gameState.currentWord].every(
      char => newGuessedLetters.includes(char)
    );

    // Check if max incorrect guesses reached (loss)
    const isGameOver = newIncorrectGuesses >= gameState.maxGuesses;

    let newGameStatus = gameState.gameStatus;
    if (isComplete) {
      newGameStatus = 'won';
    } else if (isGameOver) {
      newGameStatus = 'lost';
    }

    setGameState({
      ...gameState,
      guessedLetters: newGuessedLetters,
      incorrectGuesses: newIncorrectGuesses,
      gameStatus: newGameStatus as 'playing' | 'won' | 'lost'
    });
  };

  // Display the word with guessed letters shown and unguessed letters as underscores
  const getDisplayWord = () => {
    return [...gameState.currentWord]
      .map(letter => gameState.guessedLetters.includes(letter) ? letter : '_')
      .join(' ');
  };

  // Get status message based on game state
  const getStatusMessage = () => {
    if (gameState.gameStatus === 'won') {
      return "You win! 🎉";
    } else if (gameState.gameStatus === 'lost') {
      return "Game over! 😢";
    } else {
      return `Guesses remaining: ${gameState.maxGuesses - gameState.incorrectGuesses}`;
    }
  };

  // Get the class for the status message
  const getStatusClass = () => {
    if (gameState.gameStatus === 'won') {
      return "text-success font-medium";
    } else if (gameState.gameStatus === 'lost') {
      return "text-error font-medium";
    } else {
      return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <section className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Hangman</h2>
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
        <div className="mb-6 relative w-40 h-40 md:w-48 md:h-48">
          <div className="absolute bottom-0 w-full h-2 bg-gray-400 dark:bg-gray-500"></div>
          <div className="absolute bottom-0 left-1/4 w-2 h-40 md:h-48 bg-gray-400 dark:bg-gray-500"></div>
          <div className="absolute top-0 left-1/4 w-28 md:w-36 h-2 bg-gray-400 dark:bg-gray-500"></div>
          <div className="absolute top-0 right-1/4 w-2 h-8 bg-gray-400 dark:bg-gray-500"></div>
          
          {/* Hangman parts */}
          <div 
            className={cn(
              "absolute top-8 right-1/4 transform translate-x-1/2 w-8 h-8 rounded-full border-2 border-gray-400 dark:border-gray-500",
              gameState.incorrectGuesses >= 1 ? "" : "hidden"
            )}
          ></div>
          <div 
            className={cn(
              "absolute top-16 right-1/4 transform translate-x-1/2 w-2 h-12 bg-gray-400 dark:bg-gray-500",
              gameState.incorrectGuesses >= 2 ? "" : "hidden"
            )}
          ></div>
          <div 
            className={cn(
              "absolute top-16 right-1/4 transform translate-x-1/2 w-8 h-2 bg-gray-400 dark:bg-gray-500 rotate-45 origin-left",
              gameState.incorrectGuesses >= 3 ? "" : "hidden"
            )}
          ></div>
          <div 
            className={cn(
              "absolute top-16 right-1/4 transform translate-x-1/2 w-8 h-2 bg-gray-400 dark:bg-gray-500 -rotate-45 origin-left",
              gameState.incorrectGuesses >= 4 ? "" : "hidden"
            )}
          ></div>
          <div 
            className={cn(
              "absolute top-28 right-1/4 transform translate-x-1/2 w-8 h-2 bg-gray-400 dark:bg-gray-500 rotate-45 origin-left",
              gameState.incorrectGuesses >= 5 ? "" : "hidden"
            )}
          ></div>
          <div 
            className={cn(
              "absolute top-28 right-1/4 transform translate-x-1/2 w-8 h-2 bg-gray-400 dark:bg-gray-500 -rotate-45 origin-left",
              gameState.incorrectGuesses >= 6 ? "" : "hidden"
            )}
          ></div>
        </div>
        
        <div className="mb-6">
          <div className="text-2xl tracking-widest text-center font-mono">
            {gameState.gameStatus === 'lost' ? gameState.currentWord : getDisplayWord()}
          </div>
          <p id="hangman-status" className={cn("mt-2 text-center", getStatusClass())}>
            {getStatusMessage()}
          </p>
        </div>
        
        <div className="grid grid-cols-7 md:grid-cols-9 gap-2 max-w-sm mb-6">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map(letter => (
            <Button
              key={letter}
              variant="outline"
              size="sm"
              className={cn(
                "w-9 h-9 p-0 font-medium",
                gameState.guessedLetters.includes(letter) && gameState.currentWord.includes(letter)
                  ? "bg-success text-white border-success hover:bg-success/90 hover:text-white"
                  : gameState.guessedLetters.includes(letter)
                    ? "bg-error text-white border-error hover:bg-error/90 hover:text-white"
                    : ""
              )}
              disabled={gameState.guessedLetters.includes(letter) || gameState.gameStatus !== 'playing'}
              onClick={() => handleGuess(letter)}
            >
              {letter}
            </Button>
          ))}
        </div>
        
        <div>
          <Button onClick={resetGame}>
            New Word
          </Button>
        </div>
      </div>
    </section>
  );
}
