import { Button } from "@/components/ui/button";
import { GameType } from "@/types";
import { Puzzle, Grid, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameCardProps {
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  gameType: GameType;
  icon: "puzzle" | "grid" | "brain";
  onPlay: () => void;
}

export function GameCard({
  title,
  description,
  gradientFrom,
  gradientTo,
  gameType,
  icon,
  onPlay,
}: GameCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "puzzle":
        return <Puzzle className="h-12 w-12 text-white/80" />;
      case "grid":
        return (
          <div className="grid grid-cols-3 gap-2 w-24 h-24">
            <div className="bg-white/20 rounded"></div>
            <div className="bg-white/20 rounded flex items-center justify-center text-white text-xl">X</div>
            <div className="bg-white/20 rounded"></div>
            <div className="bg-white/20 rounded flex items-center justify-center text-white text-xl">O</div>
            <div className="bg-white/20 rounded flex items-center justify-center text-white text-xl">X</div>
            <div className="bg-white/20 rounded"></div>
            <div className="bg-white/20 rounded"></div>
            <div className="bg-white/20 rounded"></div>
            <div className="bg-white/20 rounded flex items-center justify-center text-white text-xl">O</div>
          </div>
        );
      case "brain":
        return (
          <div className="grid grid-cols-4 gap-2 w-24 h-24">
            <div className="bg-white/20 rounded"></div>
            <div className="bg-secondary rounded"></div>
            <div className="bg-white/20 rounded"></div>
            <div className="bg-white/20 rounded"></div>
            <div className="bg-white/20 rounded"></div>
            <div className="bg-white/20 rounded"></div>
            <div className="bg-secondary rounded"></div>
            <div className="bg-white/20 rounded"></div>
            <div className="bg-accent rounded"></div>
            <div className="bg-white/20 rounded"></div>
            <div className="bg-white/20 rounded"></div>
            <div className="bg-accent rounded"></div>
          </div>
        );
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onPlay}
    >
      <div className={cn(
        "h-40 bg-gradient-to-r flex items-center justify-center p-4",
        gradientFrom,
        gradientTo
      )}>
        {getIcon()}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {description}
        </p>
        <Button
          className="w-full"
          onClick={onPlay}
        >
          Play Now
        </Button>
      </div>
    </div>
  );
}
