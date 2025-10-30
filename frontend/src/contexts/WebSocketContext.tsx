import React, { createContext, useContext, useEffect, useState } from 'react';

interface WebSocketContextType {
  sendMessage: (message: string) => void;
  lastMessage: MessageEvent | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

interface WebSocketProviderProps {
  children: React.ReactNode;
  workspaceId: number;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, workspaceId }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${workspaceId}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      setLastMessage(event);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [workspaceId]);

  const sendMessage = (message: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};
