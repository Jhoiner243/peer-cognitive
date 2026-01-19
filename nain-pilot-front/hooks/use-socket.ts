import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Singleton socket instance shared across all components
let socketInstance: Socket | null = null;

const getSocketInstance = () => {
  if (!socketInstance) {
    console.log('[useSocket] Creating new socket instance');
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('[useSocket] Socket connected:', socketInstance?.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('[useSocket] Socket disconnected');
    });

    socketInstance.on('connect_error', (err) => {
      console.error('[useSocket] Socket connection error:', err);
    });
  } else {
    console.log('[useSocket] Reusing existing socket instance:', socketInstance.id);
  }
  
  return socketInstance;
};

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocketInstance();
    
    const handleConnect = () => {
      console.log('[useSocket] Connected with ID:', socket.id);
      setIsConnected(true);
    };
    
    const handleDisconnect = () => {
      console.log('[useSocket] Disconnected');
      setIsConnected(false);
    };

    // Set initial state
    setSocket(socket);
    setIsConnected(socket.connected);

    // Listen for connection changes
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      // Don't disconnect the socket, just remove listeners for this component
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  return { socket, isConnected };
};
