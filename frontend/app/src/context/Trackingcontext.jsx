import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSocket } from "./SocketContext";

const TrackingContext = createContext(null);

export const TrackingProvider = ({ children }) => {
  const { socket } = useSocket();
  const [tracked, setTracked]     = useState(null);  // { busId, busNumber, route }
  const [liveData, setLiveData]   = useState(null);  // latest location + safety
  const [isTracking, setIsTracking] = useState(false);
  const trackedRef = useRef(null); // always-fresh ref for socket handler

  const startTracking = (busInfo) => {
    setTracked(busInfo);
    trackedRef.current = busInfo;
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (socket && trackedRef.current) {
      socket.emit("leaveBusRoom", { busId: trackedRef.current.busId });
    }
    setTracked(null);
    trackedRef.current = null;
    setLiveData(null);
    setIsTracking(false);
  };

  // Join bus room and listen for updates whenever tracking is active
  useEffect(() => {
    if (!socket || !tracked || !isTracking) return;

    // Join the bus room so server sends live updates
    socket.emit("joinBusRoom", { busId: tracked.busId });
    console.log("TrackingContext: joined bus_" + tracked.busId);

    const handleUpdate = (data) => {
      if (data.busId === trackedRef.current?.busId) {
        setLiveData(data);
      }
    };

    socket.on("busLocationUpdate", handleUpdate);

    return () => {
      socket.off("busLocationUpdate", handleUpdate);
      // Don't leave room on cleanup — user is still tracking
    };
  }, [socket, tracked?.busId, isTracking]);

  // If socket reconnects while tracking, rejoin the room
  useEffect(() => {
    if (!socket) return;
    socket.on("connect", () => {
      if (trackedRef.current && isTracking) {
        socket.emit("joinBusRoom", { busId: trackedRef.current.busId });
        console.log("TrackingContext: rejoined after reconnect");
      }
    });
    return () => socket.off("connect");
  }, [socket, isTracking]);

  return (
    <TrackingContext.Provider value={{
      tracked,
      liveData,
      isTracking,
      startTracking,
      stopTracking,
    }}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => useContext(TrackingContext);