import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";

export function UserForm() {
  const { username, setUsername } = useAppContext();
  const [inputUsername, setInputUsername] = useState(username);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsername(inputUsername);
  };

  return (
    <div className="mb-2">
      <form onSubmit={handleSubmit}>
        <Label htmlFor="username" className="block text-sm font-medium mb-1">
          Your Name
        </Label>
        <div className="flex">
          <Input
            type="text"
            id="username"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            className="flex-1 rounded-r-none"
            placeholder="Enter username"
          />
          <Button 
            type="submit" 
            className="rounded-l-none"
          >
            Set
          </Button>
        </div>
      </form>
    </div>
  );
}
