import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // WebSocket connections
  type ClientInfo = { username: string, ws: WebSocket };
  const clients: ClientInfo[] = [];

  // Log WebSocket server status
  console.log(`WebSocket server initialized at ${new Date().toISOString()}, path: /ws`);

  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`WebSocket client connected from ${clientIp} at ${new Date().toISOString()}`);
    
    let currentUsername = '';

    // Message received
    ws.on('message', async (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        
        if (parsedMessage.type === 'chat') {
          const validatedMessage = insertMessageSchema.parse({
            sender: parsedMessage.sender,
            content: parsedMessage.content
          });
          
          // Save message to storage
          const savedMessage = await storage.addMessage(validatedMessage);
          
          // Broadcast to all clients
          const broadcastMessage = {
            type: 'chat',
            id: savedMessage.id,
            sender: savedMessage.sender,
            content: savedMessage.content,
            timestamp: savedMessage.timestamp.toISOString()
          };
          
          const messageString = JSON.stringify(broadcastMessage);
          console.log(`Broadcasting chat message from ${savedMessage.sender} to all ${clients.length} clients`);
          
          let broadcastCount = 0;
          for (const client of clients) {
            if (client.ws.readyState === WebSocket.OPEN) {
              try {
                client.ws.send(messageString);
                broadcastCount++;
              } catch (e) {
                console.error(`Failed to send message to ${client.username}:`, e);
              }
            }
          }
          console.log(`Successfully broadcasted message to ${broadcastCount} clients`);
          
        }
        else if (parsedMessage.type === 'connect') {
          // Store the client with their username
          currentUsername = parsedMessage.username;
          
          // Check for duplicate usernames
          const existingClientIndex = clients.findIndex(c => c.username === currentUsername);
          if (existingClientIndex !== -1) {
            console.log(`Duplicate username connection: ${currentUsername}. Replacing existing connection.`);
            clients.splice(existingClientIndex, 1);
          }
          
          clients.push({ username: currentUsername, ws });
          console.log(`User connected: ${currentUsername}. Total clients: ${clients.length}`);
          
          // Send the current peer list to the new client
          const otherPeers = clients
            .filter(c => c.username !== currentUsername)
            .map(c => c.username);
            
          const peerList = {
            type: 'peerList',
            peers: otherPeers
          };
          
          if (ws.readyState === WebSocket.OPEN) {
            console.log(`Sending peer list to ${currentUsername}: ${JSON.stringify(otherPeers)}`);
            ws.send(JSON.stringify(peerList));
          }
          
          // Notify all clients about the new peer
          const connectMessage = {
            type: 'connect',
            username: currentUsername
          };
          
          for (const client of clients) {
            if (client.username !== currentUsername && client.ws.readyState === WebSocket.OPEN) {
              console.log(`Notifying ${client.username} about new peer: ${currentUsername}`);
              client.ws.send(JSON.stringify(connectMessage));
            }
          }
        }
        else if (parsedMessage.type === 'signal') {
          // Forward the signal to the intended recipient
          const targetClient = clients.find(c => c.username === parsedMessage.to);
          
          console.log(`Signal from ${parsedMessage.from} to ${parsedMessage.to} (signal type: ${parsedMessage.data?.type || 'unknown'})`);
          
          if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
            console.log(`Forwarding signal to ${parsedMessage.to}`);
            targetClient.ws.send(JSON.stringify(parsedMessage));
          } else {
            console.warn(`Cannot forward signal: target client ${parsedMessage.to} not found or not connected`);
            if (targetClient) {
              console.log(`Target client WebSocket readyState: ${targetClient.ws.readyState}`);
            }
          }
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    // Client disconnected
    ws.on('close', () => {
      console.log(`WebSocket client disconnected: ${currentUsername || 'anonymous'}`);
      
      if (currentUsername) {
        // Find and remove client
        const index = clients.findIndex(c => c.username === currentUsername);
        if (index !== -1) {
          clients.splice(index, 1);
          console.log(`Removed client ${currentUsername} from active clients list. Remaining clients: ${clients.length}`);
        }
        
        // Notify all clients about the disconnected peer
        const disconnectMessage = {
          type: 'disconnect',
          username: currentUsername
        };
        
        for (const client of clients) {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(disconnectMessage));
          }
        }
      }
    });

    // Send all existing messages to new client
    storage.getMessages().then(messages => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'history',
          messages: messages.map(m => ({
            id: m.id,
            sender: m.sender,
            content: m.content,
            timestamp: m.timestamp.toISOString()
          }))
        }));
      }
    }).catch(err => {
      console.error('Error sending message history:', err);
    });
  });

  // API routes
  app.get('/api/messages', async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages.map(m => ({
        id: m.id,
        sender: m.sender,
        content: m.content,
        timestamp: m.timestamp.toISOString()
      })));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      const message = insertMessageSchema.parse(req.body);
      const savedMessage = await storage.addMessage(message);
      res.status(201).json({
        id: savedMessage.id,
        sender: savedMessage.sender,
        content: savedMessage.content,
        timestamp: savedMessage.timestamp.toISOString()
      });
    } catch (error) {
      res.status(400).json({ error: 'Invalid message data' });
    }
  });

  return httpServer;
}
