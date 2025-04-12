import { Button } from "@/components/ui/button";
import { Moon, Sun, Gamepad } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export function Header() {
  const { darkMode, toggleDarkMode } = useAppContext();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md px-4 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <Gamepad className="text-primary text-2xl mr-2" />
        <h1 className="text-xl font-semibold">GameChat</h1>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {darkMode ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </header>
  );
}
