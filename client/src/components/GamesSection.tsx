import { useAppContext } from "@/context/AppContext";
import { GameCard } from "./GameCard";
import TicTacToe from "./games/TicTacToe";
import Hangman from "./games/Hangman";
import Memory from "./games/Memory";

export function GamesSection() {
  const { activeSection, activeGame, setActiveGame } = useAppContext();

  // If a game is active, render that game
  if (activeGame === 'tic-tac-toe') {
    return <TicTacToe />;
  }
  
  if (activeGame === 'hangman') {
    return <Hangman />;
  }
  
  if (activeGame === 'memory') {
    return <Memory />;
  }

  // Don't display if section is not active
  if (activeSection !== 'games') return null;

  return (
    <section className="h-full overflow-y-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">Games</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Select a game to play while chatting!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GameCard
          title="Tic-Tac-Toe"
          description="Classic X and O game"
          gradientFrom="from-blue-400"
          gradientTo="to-indigo-500"
          icon="grid"
          gameType="tic-tac-toe"
          onPlay={() => setActiveGame('tic-tac-toe')}
        />
        
        <GameCard
          title="Hangman"
          description="Guess the word before time runs out"
          gradientFrom="from-green-400"
          gradientTo="to-teal-500"
          icon="puzzle"
          gameType="hangman"
          onPlay={() => setActiveGame('hangman')}
        />
        
        <GameCard
          title="Memory Game"
          description="Find matching pairs"
          gradientFrom="from-purple-400"
          gradientTo="to-pink-500"
          icon="brain"
          gameType="memory"
          onPlay={() => setActiveGame('memory')}
        />
      </div>
    </section>
  );
}
