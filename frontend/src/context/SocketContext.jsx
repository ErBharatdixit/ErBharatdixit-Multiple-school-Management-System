import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
      const { user } = useAuth();
      const [socket, setSocket] = useState(null);
      const [onlineUsers, setOnlineUsers] = useState(new Set());
      const socketRef = useRef();

      useEffect(() => {
            if (user) {
                  socketRef.current = io('http://localhost:8000');

                  socketRef.current.on('connect', () => {

                        socketRef.current.emit('register_user', user._id);
                  });

                  // Handle basic online status updates (optional, for future)
                  socketRef.current.on('user_status_change', ({ userId, status }) => {
                        setOnlineUsers(prev => {
                              const newSet = new Set(prev);
                              if (status === 'online') newSet.add(userId);
                              else newSet.delete(userId);
                              return newSet;
                        });
                  });

                  setSocket(socketRef.current);

                  return () => {
                        socketRef.current.disconnect();
                        setSocket(null);
                  };
            }
      }, [user]);

      return (
            <SocketContext.Provider value={{ socket, onlineUsers }}>
                  {children}
            </SocketContext.Provider>
      );
};
