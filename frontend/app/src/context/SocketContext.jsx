import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  // Use state instead of ref so consumers re-render when socket is ready
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Don't connect if no token
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Don't create a second socket if one already exists for this token
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:4500"; // ← fixed port

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,       // stop after 5 failed attempts
      reconnectionDelay: 2000,        // wait 2s between retries
      reconnectionDelayMax: 10000,    // max 10s between retries
      timeout: 10000,                 // connection timeout
      autoConnect: true,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
      setConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket); // ← triggers re-render so consumers get the socket

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [token]); // reconnect only when token changes

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);