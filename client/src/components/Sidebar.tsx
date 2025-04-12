import { useAppContext } from "@/context/AppContext";
import { Gamepad, MessageSquare, Video } from "lucide-react";
import { UserForm } from "./UserForm";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  const { username, activeSection, setActiveSection } = useAppContext();

  return (
    <nav className="hidden md:flex md:w-64 bg-white dark:bg-gray-800 shadow-md flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {/* User Profile */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-semibold">
            <span>{getInitials(username)}</span>
          </div>
          <div>
            <div id="usernameDisplay" className="font-medium">
              {username}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Online</div>
          </div>
        </div>
        
        {/* Username Form */}
        <UserForm />
      </div>
      
      {/* Navigation Links */}
      <div className="p-4 flex-1">
        <h2 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-3">
          Navigation
        </h2>
        <button
          onClick={() => setActiveSection('chat')}
          className={cn(
            "flex items-center w-full px-3 py-2 rounded-md mb-1 transition-colors",
            activeSection === 'chat' 
              ? "bg-gray-100 dark:bg-gray-700 text-primary" 
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <MessageSquare className="mr-3 h-4 w-4" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => setActiveSection('games')}
          className={cn(
            "flex items-center w-full px-3 py-2 rounded-md mb-1 transition-colors",
            activeSection === 'games'
              ? "bg-gray-100 dark:bg-gray-700 text-primary"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <Gamepad className="mr-3 h-4 w-4" />
          <span>Games</span>
        </button>
        <button
          onClick={() => setActiveSection('video')}
          className={cn(
            "flex items-center w-full px-3 py-2 rounded-md mb-1 transition-colors",
            activeSection === 'video'
              ? "bg-gray-100 dark:bg-gray-700 text-primary"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <Video className="mr-3 h-4 w-4" />
          <span>Video Chat</span>
        </button>
      </div>
      
      {/* App Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <p>GameChat v1.0</p>
        <p>Chat & play mini-games</p>
      </div>
    </nav>
  );
}
