
import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/types';

export function useChat(username: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const socket = useRef<WebSocket | null>(null);
  const localMessageIds = useRef(new Set<number>());

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    socket.current = ws;

    ws.onopen = () => {
      setConnected(true);
      if (username) {
        ws.send(JSON.stringify({ type: 'connect', username }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'history') {
          setMessages(data.messages);
          // Clear local message IDs when receiving history
          localMessageIds.current.clear();
        } else if (data.type === 'chat') {
          // Only add the message if it's not a local message we already added
          if (!localMessageIds.current.has(data.id)) {
            setMessages(prev => [...prev, {
              id: data.id,
              sender: data.sender,
              content: data.content,
              timestamp: data.timestamp || new Date().toISOString()
            }]);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      socket.current = null;
    };

    return () => {
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.close();
      }
    };
  }, [username]);

  function sendMessage(content: string, sender = username) {
    if (!content.trim()) return;

    // Add message locally first with a temporary ID
    const tempId = Date.now();
    const localMessage = {
      id: tempId,
      sender,
      content,
      timestamp: new Date().toISOString()
    };
    
    // Track this message as local
    localMessageIds.current.add(tempId);
    setMessages(prev => [...prev, localMessage]);

    // Send to server
    if (socket.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'chat',
        sender,
        content,
      };
      socket.current.send(JSON.stringify(message));
    }
  }

  return { messages, sendMessage, connected };
}
