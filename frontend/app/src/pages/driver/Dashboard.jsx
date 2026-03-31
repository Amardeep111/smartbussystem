import { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { apiRequest, apiPost } from "../../api";
// import { set } from "mongoose";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [broadcasting, setBroadcasting] = useState(false);
  const [bus, setBus] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [passengers, setPassengers] = useState([]);
  const [updateCount, setUpdateCount] = useState(0);
  const [emergencyMsg, setEmergencyMsg] = useState("");
  const [alertSent, setAlertSent] = useState(false);
  const intervalRef = useRef(null);
  const watchRef = useRef(null);

  useEffect(() => {
    // Find bus assigned to this driver
    console.log("user:", user)
    apiRequest("/buses").then(d => {
      console.log("d:", d)
      if (d.success) {
        const myBus = d.buses.find(b => {console.log("b:", b) 
          return b.driver?._id === user.id || b.driver === user.id});
        console.log('mybus:',myBus)
        if (myBus) {
          setBus(myBus);
          apiRequest(`/checkin/bus/${myBus._id}/passengers`).then(pd => {
            if (pd.success) setPassengers(pd.passengers);
          });
        }
      }
    });
  }, [user._id]);

  const startBroadcast = () => {
    if (!bus || !socket) return;
    setLocationError("");
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, speed: pos.coords.speed || 0, heading: pos.coords.heading || 0 };
        setLocation(loc);
      },
      (err) => setLocationError("GPS unavailable: " + err.message),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    intervalRef.current = setInterval(() => {
      if (location) {
        socket.emit("driverLocation", { busId: bus._id, ...location });
        setUpdateCount(c => c + 1);
      }
    }, 2000);
    setBroadcasting(true);
  };

  const stopBroadcast = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setBroadcasting(false);
  };

  useEffect(() => () => { stopBroadcast(); }, []);

  

  useEffect(() => {
    if (broadcasting && location && socket && bus) {
      console.log('emitting location:', location);
      socket.emit("driverLocation", { busId: bus._id, ...location });
    }
  }, [location, intervalRef.current, socket, bus]);

  const sendEmergency = () => {
    if (!socket || !bus || !emergencyMsg.trim()) return;
    socket.emit("emergencyAlert", { busId: bus._id, message: emergencyMsg });
    setAlertSent(true);
    setEmergencyMsg("");
    setTimeout(() => setAlertSent(false), 4000);
  };

  return (
    <div>
      <div className="mb-6 md:mb-7">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 m-0 mb-1">Driver Panel</h1>
        <p className="text-gray-500 m-0 text-sm md:text-base">Welcome, {user.name}</p>
      </div>

      {!bus ? (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 md:p-8 text-center">
          <div className="text-4xl md:text-5xl mb-3">🚌</div>
          <p className="text-amber-800 m-0 font-semibold text-sm md:text-base">No bus assigned to you yet. Contact admin.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 md:gap-5">
          {/* Bus info */}
          <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h3 className="m-0 text-base md:text-lg font-bold text-gray-800">Assigned Bus</h3>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                {connected ? "● Socket Live" : "○ Disconnected"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {[
                { label: "Bus Number", value: bus.busNumber },
                { label: "Capacity", value: bus.capacity },
                { label: "Status", value: bus.status },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3 md:p-3.5">
                  <div className="text-[10px] md:text-xs text-gray-400 font-semibold uppercase mb-1">{item.label}</div>
                  <div className="font-bold text-sm md:text-base text-gray-800">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* GPS Broadcast */}
          <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200">
            <h3 className="m-0 mb-4 md:mb-5 text-base md:text-lg font-bold text-gray-800">GPS Broadcasting</h3>

            {locationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs md:text-sm mb-4">
                {locationError}
              </div>
            )}

            {location && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-[10px] md:text-xs text-gray-400 mb-1">LATITUDE</div>
                  <div className="font-bold font-mono text-xs md:text-sm text-green-800">{location.latitude.toFixed(6)}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-[10px] md:text-xs text-gray-400 mb-1">LONGITUDE</div>
                  <div className="font-bold font-mono text-xs md:text-sm text-green-800">{location.longitude.toFixed(6)}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-[10px] md:text-xs text-gray-400 mb-1">UPDATES SENT</div>
                  <div className="font-bold text-lg md:text-xl text-green-800">{updateCount}</div>
                </div>
              </div>
            )}

            <button 
              onClick={broadcasting ? stopBroadcast : startBroadcast}
              className={`
                w-full py-3.5 rounded-xl border-none cursor-pointer font-bold text-base transition-colors
                ${broadcasting 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
                }
              `}
            >
              {broadcasting ? "⏹ Stop Broadcasting" : "▶ Start GPS Broadcast"}
            </button>
            {broadcasting && (
              <p className="text-center text-xs md:text-sm text-gray-500 mt-2 m-0">
                Broadcasting location every 2 seconds
              </p>
            )}
          </div>

          {/* Emergency */}
          <div className="bg-white rounded-xl p-5 md:p-6 border-2 border-red-200">
            <h3 className="m-0 mb-4 text-base md:text-lg font-bold text-red-700">🚨 Emergency Alert</h3>
            {alertSent && (
              <div className="bg-red-50 rounded-lg p-3 text-red-700 font-semibold mb-3 text-xs md:text-sm">
                ✓ Emergency alert sent to admin and passengers
              </div>
            )}
            <input 
              value={emergencyMsg} 
              onChange={e => setEmergencyMsg(e.target.value)}
              placeholder="Describe the emergency..."
              className="w-full p-3 rounded-lg border border-red-200 text-sm md:text-base outline-none text-gray-800 mb-3 focus:border-red-500"
            />
            <button 
              onClick={sendEmergency} 
              disabled={!emergencyMsg.trim()}
              className={`
                w-full py-3 rounded-lg border-none font-bold text-sm md:text-base
                ${!emergencyMsg.trim() 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 text-white cursor-pointer hover:bg-red-700 transition-colors'
                }
              `}
            >
              Send Emergency Alert
            </button>
          </div>

          {/* Passengers */}
          <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h3 className="m-0 text-base md:text-lg font-bold text-gray-800">Passengers</h3>
              <span className="text-xs md:text-sm text-gray-500">
                {passengers.filter(p => p.checkedIn).length} / {passengers.length} checked in
              </span>
            </div>
            {passengers.length === 0 ? (
              <p className="text-gray-400 text-sm md:text-base m-0">No passengers booked yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {passengers.map((p, i) => (
                  <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2.5 md:p-3.5 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-semibold text-sm md:text-base text-gray-800">{p.name}</span>
                      <span className="text-xs text-gray-400 ml-2">Seat {p.seatNumber} · {p.type}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 md:px-2.5 py-1 rounded-full ${p.checkedIn ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'}`}>
                      {p.checkedIn ? "✓ In" : "Waiting"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}