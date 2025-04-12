import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { X } from "lucide-react";
import { MemoryState } from "@/types";
import { cn } from "@/lib/utils";
import { shuffleArray } from "@/lib/utils";

import { 
  Coffee, Heart, Star, Bell, Zap, 
  Apple, Moon, Sun, 
  HelpCircle
} from "lucide-react";

export default function Memory() {
  const { setActiveGame } = useAppContext();
  const [gameState, setGameState] = useState<MemoryState>({
    cards: [],
    flippedCards: [],
    matchedPairs: new Set(),
    moves: 0,
    isChecking: false,
    gameComplete: false
  });

  const icons = [
    Coffee, Heart, Star, Bell, Zap, Apple, Moon, Sun
  ];

  // Initialize the game on mount
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    // Create array with pairs of icon indices
    const cardPairs = [...Array(8).keys(), ...Array(8).keys()];
    const shuffledCards = shuffleArray(cardPairs);
    
    setGameState({
      cards: shuffledCards.map(i => i.toString()),
      flippedCards: [],
      matchedPairs: new Set(),
      moves: 0,
      isChecking: false,
      gameComplete: false
    });
  };

  const handleCardClick = (index: number) => {
    // Prevent clicks during checking animation or if card is already flipped/matched
    if (
      gameState.isChecking || 
      gameState.flippedCards.includes(index) || 
      gameState.matchedPairs.has(index)
    ) {
      return;
    }

    // Limit to 2 cards flipped at a time
    if (gameState.flippedCards.length >= 2) return;

    // Flip the card
    const newFlippedCards = [...gameState.flippedCards, index];
    setGameState({ ...gameState, flippedCards: newFlippedCards });

    // If two cards are flipped, check for a match
    if (newFlippedCards.length === 2) {
      const [firstIndex, secondIndex] = newFlippedCards;
      const firstCardValue = gameState.cards[firstIndex];
      const secondCardValue = gameState.cards[secondIndex];

      // Increment moves
      const newMoves = gameState.moves + 1;

      setGameState({ 
        ...gameState, 
        flippedCards: newFlippedCards,
        moves: newMoves,
        isChecking: true
      });

      // Check for match after a short delay
      setTimeout(() => {
        let newMatchedPairs = new Set(gameState.matchedPairs);
        
        if (firstCardValue === secondCardValue) {
          // Match found
          newMatchedPairs.add(firstIndex);
          newMatchedPairs.add(secondIndex);
        }

        // Check if game is complete
        const isGameComplete = newMatchedPairs.size === 16;

        setGameState({
          ...gameState,
          flippedCards: [],
          matchedPairs: newMatchedPairs,
          moves: newMoves,
          isChecking: false,
          gameComplete: isGameComplete
        });

        // Show completion message
        if (isGameComplete) {
          setTimeout(() => {
            alert(`Congratulations! You completed the game in ${newMoves} moves.`);
          }, 500);
        }
      }, 1000);
    }
  };

  // Render the icon for a card
  const renderCardIcon = (cardIndex: number) => {
    if (
      gameState.matchedPairs.has(cardIndex) || 
      gameState.flippedCards.includes(cardIndex)
    ) {
      const iconIndex = parseInt(gameState.cards[cardIndex]);
      const IconComponent = icons[iconIndex];
      return <IconComponent className="h-6 w-6" />;
    }
    return <HelpCircle className="text-white/80 h-6 w-6" />;
  };

  // Determine if a card is flipped
  const isCardFlipped = (index: number) => {
    return gameState.flippedCards.includes(index) || gameState.matchedPairs.has(index);
  };

  return (
    <section className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Memory Game</h2>
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
        <div className="mb-6 text-center">
          <p className="text-lg font-medium">Moves: <span>{gameState.moves}</span></p>
          <p className="text-gray-600 dark:text-gray-400">
            Pairs found: <span>{gameState.matchedPairs.size / 2}</span> / 8
          </p>
        </div>
        
        <div className="grid grid-cols-4 gap-3 max-w-xs w-full mb-6">
          {gameState.cards.map((_, index) => (
            <div 
              key={index}
              onClick={() => handleCardClick(index)}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center cursor-pointer shadow-sm transform transition-all duration-300",
                gameState.matchedPairs.has(index) 
                  ? "bg-success hover:bg-success/90" 
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              <div 
                className={cn(
                  "w-full h-full relative transition-all duration-500",
                  isCardFlipped(index) ? "rotate-y-180" : ""
                )}
                style={{ 
                  transformStyle: "preserve-3d",
                }}
              >
                <div 
                  className={cn(
                    "absolute w-full h-full backface-hidden rounded-lg flex items-center justify-center",
                    isCardFlipped(index) ? "hidden" : ""
                  )}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <HelpCircle className="text-white/80 h-6 w-6" />
                </div>
                <div 
                  className={cn(
                    "absolute w-full h-full backface-hidden rounded-lg flex items-center justify-center bg-white dark:bg-gray-700 text-primary",
                    isCardFlipped(index) ? "" : "hidden"
                  )}
                  style={{ 
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)"
                  }}
                >
                  {renderCardIcon(index)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <Button onClick={resetGame}>
            New Game
          </Button>
        </div>
      </div>
    </section>
  );
}
