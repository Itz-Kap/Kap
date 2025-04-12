import { useAppContext } from "@/context/AppContext";
import { MessageSquare, Gamepad, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const { activeSection, setActiveSection, activeGame } = useAppContext();
  
  // Don't show mobile nav when a game is active
  if (activeGame) return null;

  return (
    <>
      {/* Mobile Tabs */}
      <div className="md:hidden flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveSection('chat')}
          className={cn(
            "flex-1 py-3 font-medium border-b-2 flex justify-center items-center",
            activeSection === 'chat'
              ? "text-primary border-primary"
              : "text-gray-500 dark:text-gray-400 border-transparent"
          )}
        >
          <MessageSquare className="w-4 h-4 mr-2" /> Chat
        </button>
        <button
          onClick={() => setActiveSection('games')}
          className={cn(
            "flex-1 py-3 font-medium border-b-2 flex justify-center items-center",
            activeSection === 'games'
              ? "text-primary border-primary"
              : "text-gray-500 dark:text-gray-400 border-transparent"
          )}
        >
          <Gamepad className="w-4 h-4 mr-2" /> Games
        </button>
        <button
          onClick={() => setActiveSection('video')}
          className={cn(
            "flex-1 py-3 font-medium border-b-2 flex justify-center items-center",
            activeSection === 'video'
              ? "text-primary border-primary"
              : "text-gray-500 dark:text-gray-400 border-transparent"
          )}
        >
          <Video className="w-4 h-4 mr-2" /> Video
        </button>
      </div>

      {/* Bottom Mobile Navigation */}
      <nav className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveSection('chat')}
            className={cn(
              "flex flex-col items-center px-3 py-1",
              activeSection === 'chat' ? "text-primary" : "text-gray-500 dark:text-gray-400"
            )}
          >
            <MessageSquare className="text-lg" />
            <span className="text-xs mt-1">Chat</span>
          </button>
          <button
            onClick={() => setActiveSection('games')}
            className={cn(
              "flex flex-col items-center px-3 py-1",
              activeSection === 'games' ? "text-primary" : "text-gray-500 dark:text-gray-400"
            )}
          >
            <Gamepad className="text-lg" />
            <span className="text-xs mt-1">Games</span>
          </button>
          <button
            onClick={() => setActiveSection('video')}
            className={cn(
              "flex flex-col items-center px-3 py-1",
              activeSection === 'video' ? "text-primary" : "text-gray-500 dark:text-gray-400"
            )}
          >
            <Video className="text-lg" />
            <span className="text-xs mt-1">Video</span>
          </button>
        </div>
      </nav>
    </>
  );
}
