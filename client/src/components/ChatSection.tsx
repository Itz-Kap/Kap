import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizontal } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { formatTime } from "@/lib/utils";
import { useChat } from "@/hooks/useChat";

export function ChatSection() {
  const { activeSection, activeGame, username } = useAppContext();
  const { messages, sendMessage, connected } = useChat(username);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Display a user-friendly message about the connection status
  const connectionStatus = connected ? 
    "Connected - Messages are sent immediately" : 
    "Offline - Messages will send when reconnected";
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    sendMessage(messageInput);
    setMessageInput("");
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Don't display if section is not active and no game is active
  if (activeSection !== 'chat' && !activeGame) return null;

  return (
    <section className="h-full flex flex-col">
      {/* Chat Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex flex-col items-start mb-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">System</div>
            <div className="message-bubble bg-gray-200 dark:bg-gray-700 rounded-lg py-2 px-3">
              <p>Welcome to GameChat! Set your username and start chatting. You can also play games by clicking on the Games tab.</p>
            </div>
          </div>
        )}
        
        {messages.map((message: { sender: string; content: string; timestamp: string; }, index: number) => {
          const isCurrentUser = message.sender !== 'System' && message.sender === username;
          const messageDate = new Date(message.timestamp);
          
          return (
            <div 
              key={index} 
              className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} mb-4`}
            >
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {message.sender}
              </div>
              <div 
                className={`message-bubble ${
                  message.sender === 'System'
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : isCurrentUser
                      ? 'bg-primary/10 dark:bg-primary/20'
                      : 'bg-gray-200 dark:bg-gray-700'
                } rounded-lg py-2 px-3`}
              >
                <p>{message.content}</p>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatTime(messageDate)}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Connection Status */}
      <div className={`px-4 py-1 text-xs ${connected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'}`}>
        {connectionStatus}
      </div>
      
      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form className="flex" onSubmit={handleSendMessage}>
          <Input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-r-none"
          />
          <Button type="submit" className="rounded-l-none">
            <SendHorizontal className="mr-1 h-4 w-4" />
            Send
          </Button>
        </form>
      </div>
    </section>
  );
}
