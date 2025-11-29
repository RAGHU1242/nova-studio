import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Get or create Socket.IO connection
 * Uses the current token from localStorage for authentication
 */
export function getSocket(): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  const token = localStorage.getItem('authToken');
  
  socket = io(window.location.origin, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  });

  // Log connection events for debugging
  socket.on('connect', () => {
    console.log('✅ Socket.IO connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.IO disconnected:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket.IO error:', error);
  });

  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socket !== null && socket.connected;
}

/**
 * Emit event to server
 */
export function emitEvent<T>(
  event: string,
  data?: T,
  callback?: (response: any) => void
): void {
  const s = getSocket();
  if (callback) {
    s.emit(event, data, callback);
  } else {
    s.emit(event, data);
  }
}

/**
 * Listen to event from server
 */
export function onEvent(
  event: string,
  callback: (data: any) => void
): () => void {
  const s = getSocket();
  s.on(event, callback);
  
  // Return unsubscribe function
  return () => {
    s.off(event, callback);
  };
}
