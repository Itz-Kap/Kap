import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import SimplePeer from 'simple-peer';
import { getInitials } from '@/lib/utils';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

export function VideoSection() {
  const {
    username,
    peers,
    localStream,
    getLocalStream,
    stopLocalStream,
    sendPeerMessage,
    activeSection
  } = useAppContext();

  const [isCallActive, setIsCallActive] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [activePeers, setActivePeers] = useState<Map<string, SimplePeer.Instance>>(new Map());
  const [peerStreams, setPeerStreams] = useState<Map<string, MediaStream>>(new Map());

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<string, SimplePeer.Instance>>(new Map());

  // Start or stop local stream based on call state
  useEffect(() => {
    if (isCallActive && !localStream) {
      startVideoCall();
    } else if (!isCallActive && localStream) {
      stopVideoCall();
    }
  }, [isCallActive, localStream]);

  // Set local video element's srcObject to the local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  // Start a video call
  const startVideoCall = async () => {
    const stream = await getLocalStream();
    if (stream) {
      setIsCallActive(true);
      console.log(`Starting video call with available peers: ${peers.join(', ') || 'none'}`);
      
      // Notify peers that we're ready to connect
      peers.forEach(peer => {
        console.log(`Initiating connection to peer: ${peer}`);
        initiatePeerConnection(peer, stream, true);
      });
    } else {
      console.error("Failed to get local stream. Camera or microphone may not be available.");
    }
  };

  // Stop the video call
  const stopVideoCall = () => {
    // Close all peer connections
    peerConnections.current.forEach((connection) => {
      if (connection) {
        connection.destroy();
      }
    });
    
    // Clear peer connections and streams
    peerConnections.current.clear();
    setActivePeers(new Map());
    setPeerStreams(new Map());
    
    // Stop local stream
    stopLocalStream();
    setIsCallActive(false);
  };

  // Initiate a peer connection
  const initiatePeerConnection = (peerId: string, stream: MediaStream, initiator: boolean) => {
    // Create a new peer connection if it doesn't exist
    if (!peerConnections.current.has(peerId)) {
      console.log(`Creating new peer connection to ${peerId} (initiator: ${initiator})`);
      
      const peerConnection = new SimplePeer({
        initiator,
        stream,
        trickle: false,
      });

      // Set up event handlers
      peerConnection.on('signal', (data) => {
        console.log(`Sending signal to ${peerId}`, data.type);
        sendPeerMessage({
          type: 'signal',
          from: username,
          to: peerId,
          data
        });
      });

      peerConnection.on('stream', (peerStream) => {
        console.log(`Received stream from ${peerId}`);
        setPeerStreams(prev => new Map(prev).set(peerId, peerStream));
      });

      peerConnection.on('connect', () => {
        console.log(`Connected to peer ${peerId}`);
      });

      peerConnection.on('close', () => {
        console.log(`Connection to ${peerId} closed`);
        peerConnections.current.delete(peerId);
        setActivePeers(prev => {
          const newMap = new Map(prev);
          newMap.delete(peerId);
          return newMap;
        });
        setPeerStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(peerId);
          return newMap;
        });
      });

      peerConnection.on('error', (err) => {
        console.error(`Peer connection error with ${peerId}:`, err);
        peerConnection.destroy();
      });

      // Store the connection
      peerConnections.current.set(peerId, peerConnection);
      setActivePeers(prev => new Map(prev).set(peerId, peerConnection));
    } else {
      console.log(`Reusing existing connection to ${peerId}`);
    }

    return peerConnections.current.get(peerId);
  };

  // Handle incoming signal data
  useEffect(() => {
    // Listen for WebSocket messages from the server
    function handleWsMessage(event: Event) {
      if (!(event instanceof MessageEvent)) return;
      
      try {
        const message = JSON.parse(event.data);
        
        // Only process signal messages
        if (message.type === 'signal' && message.to === username) {
          const { from, data } = message;
          
          console.log(`Received signal from ${from}`, data.type || 'unknown signal type');
          
          // If we're in a call and receive a signal
          if (isCallActive && localStream) {
            let peerConnection = peerConnections.current.get(from);
            
            // If the peer doesn't exist yet, create it
            if (!peerConnection) {
              console.log(`Creating new peer connection for incoming signal from ${from}`);
              peerConnection = initiatePeerConnection(from, localStream, false);
            }
            
            // Signal the peer with the received data
            if (peerConnection) {
              console.log(`Passing signal data to peer connection with ${from}`);
              peerConnection.signal(data);
            } else {
              console.error(`Failed to create peer connection for ${from}`);
            }
          } else {
            console.warn(`Received signal from ${from} but not in active call or missing stream`);
          }
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    }

    // Get the WebSocket from the ref we already have 
    // Using window._videoAppWebSocket for now as a reliable reference
    const socket = (window as any)._videoAppWebSocket;
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log(`Adding message listener to WebSocket (readyState: ${socket.readyState})`);
      socket.addEventListener('message', handleWsMessage);
      
      return () => {
        console.log('Removing WebSocket message listener');
        socket.removeEventListener('message', handleWsMessage);
      };
    } else {
      console.warn('No WebSocket available for signal handling (or not connected)');
    }
  }, [username, isCallActive, localStream]);

  // Hide section if not active
  if (activeSection !== 'video') {
    return null;
  }

  return (
    <div className="flex flex-col h-full p-4 bg-background">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Video Chat</h2>
        
        {isCallActive ? (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleAudio}
              className={!audioEnabled ? 'bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300' : ''}
            >
              {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleVideo}
              className={!videoEnabled ? 'bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300' : ''}
            >
              {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={stopVideoCall}
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button onClick={startVideoCall}>Start Video Call</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-y-auto">
        {/* Local video */}
        {isCallActive && (
          <div className="relative">
            <Card className="overflow-hidden h-full">
              <CardContent className="p-0 h-full">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${!videoEnabled ? 'hidden' : ''}`}
                />
                {!videoEnabled && (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-4xl">
                        {getInitials(username)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1">
                  {username} (You) {!audioEnabled && <MicOff className="h-3 w-3 inline ml-1" />}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Remote videos */}
        {Array.from(peerStreams).map(([peerId, stream]) => (
          <div key={peerId} className="relative">
            <Card className="overflow-hidden h-full">
              <CardContent className="p-0 h-full">
                <video
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  ref={(el) => {
                    if (el) el.srcObject = stream;
                  }}
                />
                <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1">
                  {peerId}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Placeholder cards when not in a call */}
        {!isCallActive && (
          <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-8 bg-muted/50 rounded-lg">
            <h3 className="text-xl font-medium mb-4">Start a video call to connect with others</h3>
            <p className="text-muted-foreground mb-4">When you start a call, other users online will be able to join</p>
            <Button onClick={startVideoCall} className="mb-2">Start Video Call</Button>
            
            <div className="w-full max-w-md mt-8">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="video-permission">Video permission</Label>
                <Switch id="video-permission" defaultChecked={true} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="audio-permission">Audio permission</Label>
                <Switch id="audio-permission" defaultChecked={true} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active peers list */}
      {isCallActive && peers.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Available Peers</h3>
          <div className="flex flex-wrap gap-2">
            {peers.map(peer => (
              <div 
                key={peer}
                className={`px-3 py-1 rounded-full text-sm ${
                  peerStreams.has(peer) 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}
              >
                {peer} {peerStreams.has(peer) ? '(Connected)' : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}