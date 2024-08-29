import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
const BASE_URL = import.meta.env.VITE_BASE_URL;

// Create the context
const SocketContext = createContext(null);

// Hook to use the socket context
export const useSocket = () => useContext(SocketContext);

// Provider component to manage the socket connection
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to the socket server
    const socketConnection = io(BASE_URL); // Replace YOUR_PORT with your backend port
    setSocket(socketConnection);

    // Clean up when the component is unmounted
    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
