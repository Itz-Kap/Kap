import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { ChatMessage, GameType, Section, PeerMessage } from '@/types';
import { useChat } from '@/hooks/useChat';

interface AppContextType {
  username: string;
  setUsername: (name: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  activeGame: GameType;
  setActiveGame: (game: GameType) => void;
  peers: string[];
  localStream: MediaStream | null;
  getLocalStream: () => Promise<MediaStream | null>;
  stopLocalStream: () => void;
  sendPeerMessage: (message: PeerMessage) => void;
  websocket: WebSocket | null; // Expose the WebSocket instance
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string>('Guest');
  const [darkMode, setDarkMode] = useState<boolean>(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [activeSection, setActiveSection] = useState<Section>('chat');
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [peers, setPeers] = useState<string[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const { messages, sendMessage } = useChat(username);

  // WebSocket connection for peer signaling
  const socketRef = useRef<WebSocket | null>(null);

  // Set up WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      if (username) {
        socket.send(JSON.stringify({ type: 'connect', username }));
      }
    };
    
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'peerList') {
          setPeers(message.peers);
        } else if (message.type === 'connect') {
          setPeers(prevPeers => [...prevPeers, message.username]);
        } else if (message.type === 'disconnect') {
          setPeers(prevPeers => prevPeers.filter(peer => peer !== message.username));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    socketRef.current = socket;
    
    // Store the WebSocket reference globally so the VideoSection can access it
    // This is needed because the WebSocket event doesn't bubble up through normal DOM events
    (window as any)._videoAppWebSocket = socket;
    
    return () => {
      socket.close();
    };
  }, []);

  // Send username when it changes
  useEffect(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && username) {
      socketRef.current.send(JSON.stringify({ type: 'connect', username }));
    }
  }, [username]);

  // Apply dark mode class to document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Set username and add system message
  const handleSetUsername = (name: string) => {
    if (!name.trim()) return;

    // Only add the system message if username is changing
    if (name !== username) {
      sendMessage(`${name} has joined the chat.`, 'System');
      setUsername(name);
    }
  };

  // Get local video and audio stream
  const getLocalStream = async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  };

  // Stop local stream
  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  // Send message to peers
  const sendPeerMessage = (message: PeerMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log(`Sending peer message: ${message.type}`, message);
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error('Cannot send peer message: WebSocket not connected', socketRef.current?.readyState);
    }
  };

  const value = {
    username,
    setUsername: handleSetUsername,
    darkMode,
    toggleDarkMode,
    messages,
    sendMessage: (content: string) => sendMessage(content, username),
    activeSection,
    setActiveSection,
    activeGame,
    setActiveGame,
    peers,
    localStream,
    getLocalStream,
    stopLocalStream,
    sendPeerMessage,
    websocket: socketRef.current,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
