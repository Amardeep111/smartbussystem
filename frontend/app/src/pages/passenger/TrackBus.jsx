import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useTracking } from "../../context/Trackingcontext";
import { useAuth } from "../../context/AuthContext";
import { apiRequest, apiPost } from "../../api";

// ── Safety Score Widget ───────────────────────────────────────────────
function SafetyScoreWidget({ safety }) {
  if (!safety) {
    return (
      <div className="bg-white rounded-xl p-6 md:p-7 border border-gray-200 text-center">
        <div className="text-3xl md:text-4xl mb-2">📡</div>
        <p className="text-gray-400 m-0 text-sm md:text-base">Waiting for live data...</p>
      </div>
    );
  }
  const { score, band, label, color, flags, cabin } = safety;
  const bandBg     = { green: "#f0fdf4", yellow: "#fffbeb", red: "#fef2f2" }[band] || "#f8fafc";
  const bandBorder = { green: "#bbf7d0", yellow: "#fde68a", red: "#fecaca" }[band] || "#e2e8f0";
  const circumference = Math.PI * 52;
  const filled = (score / 10) * circumference;

  return (
    <div 
      className="rounded-xl p-5 md:p-6"
      style={{ backgroundColor: bandBg, border: `1px solid ${bandBorder}` }}
    >
      <div className="font-bold text-xs md:text-sm text-gray-700 mb-3 md:mb-3.5 uppercase tracking-wide">
        Safety & Comfort Score
      </div>
      
      <div className={`flex items-center gap-4 md:gap-5 ${cabin ? 'mb-4' : ''}`}>
        <div className="relative flex-shrink-0">
          <svg width="120" height="72" viewBox="0 0 120 72">
            <path 
              d="M 8 68 A 52 52 0 0 1 112 68" 
              fill="none" 
              stroke="#e2e8f0" 
              strokeWidth="10" 
              strokeLinecap="round" 
            />
            <path 
              d="M 8 68 A 52 52 0 0 1 112 68" 
              fill="none" 
              stroke={color} 
              strokeWidth="10" 
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circumference - filled}`} 
              style={{ transition: "stroke-dasharray 0.8s ease" }} 
            />
          </svg>
          <div className="absolute bottom-0.5 left-0 right-0 text-center">
            <span className="text-2xl md:text-3xl font-black" style={{ color }}>{score}</span>
            <span className="text-[10px] md:text-xs text-gray-400 font-semibold">/10</span>
          </div>
        </div>
        
        <div className="flex-1">
          <div 
            className="inline-flex items-center gap-2 rounded-full px-3 md:px-3.5 py-1 md:py-1.5 mb-2"
            style={{ backgroundColor: color + "20" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-bold text-xs md:text-sm" style={{ color }}>{label}</span>
          </div>
          
          {flags?.length > 0 ? (
            <div className="flex flex-col gap-1">
              {flags.map((f, i) => (
                <div key={i} className="text-[11px] md:text-xs text-gray-500 flex gap-1.5 items-center">
                  <span className="text-[8px] md:text-[9px]" style={{ color }}>●</span>
                  {f}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs md:text-sm text-gray-500">All conditions normal ✓</div>
          )}
        </div>
      </div>
      
      <div className={cabin ? 'mb-4' : ''}>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-800"
            style={{ 
              width: `${(score / 10) * 100}%`,
              background: "linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #22c55e 100%)"
            }}
          />
        </div>
      </div>
      
      {cabin && (
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { 
              icon: "🌡️", 
              label: "CABIN TEMP", 
              value: cabin.tempStatus, 
              color: cabin.tempStatus === "Hot" ? "#ef4444" : cabin.tempStatus === "Cold" ? "#3b82f6" : "#22c55e" 
            },
            { 
              icon: "💧", 
              label: "HUMIDITY", 
              value: cabin.humStatus, 
              color: cabin.humStatus === "Humid" ? "#f59e0b" : cabin.humStatus === "Dry" ? "#f59e0b" : "#22c55e" 
            },
          ].map(item => (
            <div key={item.label} className="bg-white/70 rounded-lg p-2.5 md:p-3 flex gap-2.5 items-center">
              <span className="text-lg md:text-xl">{item.icon}</span>
              <div>
                <div className="text-[10px] md:text-xs text-gray-400 font-semibold">{item.label}</div>
                <div className="text-xs md:text-sm font-bold" style={{ color: item.color }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Leave Confirmation Modal ──────────────────────────────────────────
function LeaveModal({ busInfo, onKeepTracking, onStopTracking }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-5 md:p-6">
      <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 w-full max-w-md text-center">
        <div className="text-4xl md:text-5xl mb-4">📍</div>
        <h2 className="m-0 mb-2 text-lg md:text-xl font-bold text-gray-800">Keep Tracking?</h2>
        <p className="text-gray-500 m-0 mb-6 md:mb-7 text-sm md:text-base leading-relaxed">
          You're leaving the tracking page for <strong>Bus {busInfo?.busNumber}</strong>.<br />
          Would you like to continue tracking in the background?
        </p>
        <div className="flex flex-col gap-2.5">
          <button 
            onClick={onKeepTracking} 
            className="py-3.5 rounded-xl border-none bg-blue-600 text-white font-bold text-sm cursor-pointer hover:bg-blue-700 transition-colors"
          >
            📍 Yes, Keep Tracking
          </button>
          <button 
            onClick={onStopTracking} 
            className="py-3.5 rounded-xl border border-gray-200 bg-white text-gray-500 font-semibold text-sm cursor-pointer hover:bg-gray-50 transition-colors"
          >
            ✕ Stop Tracking & Leave
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SOS Notification Banner ───────────────────────────────────────────
function SOSBanner({ sos, onDismiss }) {
  if (!sos) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-700 text-white p-4 flex items-center gap-3 md:gap-3.5 shadow-lg animate-slideDown">
      <div className="text-2xl md:text-3xl">🆘</div>
      <div className="flex-1">
        <div className="font-extrabold text-sm md:text-base">PASSENGER SOS</div>
        <div className="text-xs md:text-sm opacity-90 mt-0.5">
          <strong>{sos.passenger?.name}</strong> needs help on this bus!
          {sos.message && sos.message !== "Passenger needs immediate assistance!" && (
            <span> — "{sos.message}"</span>
          )}
        </div>
        {sos.passenger?.phone && sos.passenger.phone !== "N/A" && (
          <div className="text-[11px] md:text-xs opacity-80 mt-0.5">
            📞 {sos.passenger.phone}
          </div>
        )}
      </div>
      <button 
        onClick={onDismiss} 
        className="bg-white/20 border-none text-white rounded-lg px-3 md:px-3.5 py-1.5 cursor-pointer font-semibold text-xs md:text-sm hover:bg-white/30"
      >
        Dismiss
      </button>
    </div>
  );
}

// ── Main TrackBus Page ────────────────────────────────────────────────
export default function TrackBus() {
  const { busId } = useParams();
  const { socket } = useSocket();
  const { user } = useAuth();
  const { startTracking, stopTracking, isTracking, tracked } = useTracking();
  const navigate = useNavigate();

  const [bus, setBus] = useState(null);
  const [location, setLocation] = useState(null);
  const [safety, setSafety] = useState(null);
  const [liveConnected, setLiveConnected] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(null);
  const lastUpdateRef = useRef(null);

  // Leave confirmation modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const pendingNavRef = useRef(null);

  // SOS state
  const [sosBanner, setSosBanner] = useState(null);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosMessage, setSosMessage] = useState("");
  const [apiError, setApiError] = useState("");

  // Load bus info
  useEffect(() => {
    apiRequest(`/buses/${busId}`).then(d => { if (d.success) setBus(d.bus); });
    apiRequest(`/buses/${busId}/live-location`).then(d => {
      if (d.success && d.location) {
        setLocation(d.location);
        if (d.location.safety) setSafety(d.location.safety);
        lastUpdateRef.current = new Date();
      }
    });
  }, [busId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    socket.emit("joinBusRoom", { busId });

    socket.on("busLocationUpdate", (data) => {
      if (data.busId !== busId) return;
      console.log("Received location update:", data);
      setLocation(data);
      if (data.safety) setSafety(data.safety);
      setLiveConnected(true);
      lastUpdateRef.current = new Date();
    });

    // Listen for SOS from other passengers
    socket.on("passengerSOS", (data) => {
      if (data.busId !== busId) return;
      setSosBanner(data);
      setTimeout(() => setSosBanner(null), 15000);
    });

    socket.on("sosConfirmed", () => {
      setSosLoading(false);
      setSosSent(true);
      setSosModalOpen(false);
      setTimeout(() => setSosSent(false), 5000);
    });

    return () => {
      // Don't leave room here — handled by leave modal
      socket.off("busLocationUpdate");
      socket.off("passengerSOS");
      socket.off("sosConfirmed");
    };
  }, [socket, busId]);

  // Live seconds-ago counter
  useEffect(() => {
    const t = setInterval(() => {
      if (lastUpdateRef.current) {
        setSecondsAgo(Math.floor((new Date() - lastUpdateRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Intercept back navigation
  const handleBack = () => {
    pendingNavRef.current = -1;
    setShowLeaveModal(true);
  };

  const handleKeepTracking = () => {
    setShowLeaveModal(false);
    startTracking({
      busId,
      busNumber: bus?.busNumber,
      boardingStop: bus?.route?.[0]?.name,
      route: bus?.route,
    });
    navigate(pendingNavRef.current || -1);
  };

  const handleStopTracking = () => {
    setShowLeaveModal(false);
    if (socket) socket.emit("leaveBusRoom", { busId });
    stopTracking();
    navigate(pendingNavRef.current || -1);
  };

  // Send SOS with API call
  const sendSOS = async () => {
    if (!socket) {
      setApiError("Connection error. Please try again.");
      return;
    }
    
    setSosLoading(true);
    setApiError("");
    
    const alertMessage = sosMessage.trim() || "Passenger needs immediate assistance!";
    
    try {
      // Call the createAlert API
      const response = await apiPost("/emergency", {
        busId,
        message: alertMessage,
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude
        } : null
      });
      
      if (response.success) {
        // Emit socket event for real-time notification
        socket.emit("passengerSOS", {
          busId,
          message: alertMessage,
          passenger: {
            name: user?.name,
            phone: user?.phone || "N/A"
          }
        });
        
        setSosLoading(false);
        setSosSent(true);
        setSosModalOpen(false);
        setSosMessage("");
        setTimeout(() => setSosSent(false), 5000);
      } else {
        throw new Error(response.message || "Failed to send SOS alert");
      }
    } catch (error) {
      console.error("SOS send error:", error);
      setApiError(error.message || "Failed to send SOS. Please try again.");
      setSosLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* SOS Banner — received from another passenger */}
      <SOSBanner sos={sosBanner} onDismiss={() => setSosBanner(null)} />

      {/* Leave confirmation modal */}
      {showLeaveModal && (
        <LeaveModal
          busInfo={bus}
          onKeepTracking={handleKeepTracking}
          onStopTracking={handleStopTracking}
        />
      )}

      {/* SOS send modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-5 md:p-6">
          <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 w-full max-w-md">
            <div className="text-center mb-4 md:mb-5">
              <div className="text-4xl md:text-5xl">🆘</div>
              <h2 className="mt-2 mb-1 text-lg md:text-xl font-bold text-red-700">Send SOS Alert</h2>
              <p className="text-gray-500 text-xs md:text-sm m-0">
                All passengers in <strong>Bus {bus?.busNumber}</strong> and admin will be alerted immediately.
              </p>
            </div>
            
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-4 text-red-700 text-xs md:text-sm">
                ⚠️ {apiError}
              </div>
            )}
            
            <textarea
              value={sosMessage}
              onChange={e => setSosMessage(e.target.value)}
              placeholder="Describe your emergency (optional)..."
              rows={3}
              className="w-full p-3 rounded-lg border border-red-200 text-sm outline-none resize-none mb-4 text-gray-800 box-border focus:border-red-500"
            />
            <div className="flex gap-2.5">
              <button 
                onClick={sendSOS} 
                disabled={sosLoading} 
                className="flex-1 py-3.5 rounded-xl border-none bg-red-600 text-white font-bold text-sm cursor-pointer disabled:opacity-50 hover:bg-red-700 transition-colors"
              >
                {sosLoading ? "Sending..." : "🆘 Send SOS"}
              </button>
              <button 
                onClick={() => {
                  setSosModalOpen(false);
                  setApiError("");
                  setSosMessage("");
                }} 
                className="flex-1 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-500 font-semibold text-sm cursor-pointer hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOS sent confirmation */}
      {sosSent && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 md:p-4 mb-4 md:mb-5 flex gap-2.5 items-center">
          <span className="text-lg md:text-xl">✅</span>
          <div>
            <strong className="text-green-700">SOS Sent Successfully!</strong>
            <p className="m-0 text-green-800 text-xs md:text-sm">Your emergency alert has been sent to admin and all passengers.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-5 md:mb-6">
        <div>
          <button 
            onClick={handleBack} 
            className="bg-none border-none text-gray-500 cursor-pointer text-sm mb-2 p-0 hover:text-gray-700"
          >
            ← Back
          </button>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 m-0 mb-1">
            Bus {bus?.busNumber || "..."} — Live Tracking
          </h1>
          <div className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full inline-block animate-pulse"
              style={{ background: liveConnected ? "#22c55e" : "#f59e0b" }}
            />
            <span className={`text-xs md:text-sm font-semibold ${liveConnected ? 'text-green-800' : 'text-yellow-800'}`}>
              {liveConnected ? "Live" : "Waiting for signal..."}
            </span>
            {secondsAgo !== null && (
              <span className={`text-[11px] md:text-xs ${secondsAgo > 10 ? 'text-red-600' : 'text-gray-400'}`}>
                · {secondsAgo}s ago
              </span>
            )}
          </div>
        </div>

        {/* SOS Button */}
        <button 
          onClick={() => setSosModalOpen(true)} 
          className="px-4 md:px-5 py-2.5 md:py-3 rounded-xl border-none bg-red-600 text-white font-extrabold text-xs md:text-sm cursor-pointer flex items-center gap-2 shadow-lg animate-sosPulse hover:bg-red-700 transition-colors"
        >
          🆘 SOS
        </button>
      </div>

      {/* Safety Score */}
      <div className="mb-4">
        <SafetyScoreWidget safety={safety} />
      </div>

      {/* Location */}
      {location && location.latitude !== 0 && (
        <div className="bg-white rounded-xl p-4 md:p-5 lg:p-6 border border-gray-200 mb-4">
          <div className="font-bold text-sm text-gray-700 mb-3 md:mb-3.5">📍 Current Location</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 md:mb-3.5">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] md:text-xs text-gray-400 font-semibold mb-1">COORDINATES</div>
              <div className="font-bold font-mono text-xs md:text-sm text-gray-800">
                {location.latitude?.toFixed(5)}, {location.longitude?.toFixed(5)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-[10px] md:text-xs text-gray-400 font-semibold mb-1">HEADING</div>
              <div className="font-bold text-sm md:text-base text-gray-800">{location.heading?.toFixed(0) || 0}°</div>
            </div>
          </div>
          <a 
            href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-4 md:px-5 py-2 rounded-lg bg-blue-600 text-white no-underline font-semibold text-xs md:text-sm hover:bg-blue-700 transition-colors"
          >
            Open in Google Maps ↗
          </a>
        </div>
      )}

      {/* Route stops */}
      {bus?.route?.length > 0 && (
        <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200">
          <h3 className="m-0 mb-4 text-base md:text-lg font-bold text-gray-800">Route Stops</h3>
          {bus.route.map((stop, i) => (
            <div key={stop._id} className="flex gap-3 md:gap-4 items-start">
              <div className="flex flex-col items-center">
                <div 
                  className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full mt-1 flex-shrink-0"
                  style={{ 
                    background: i === 0 ? "#22c55e" : i === bus.route.length - 1 ? "#ef4444" : "#3b82f6"
                  }}
                />
                {i < bus.route.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 min-h-[28px]" />}
              </div>
              <div className="pb-4">
                <div className="font-semibold text-sm md:text-base text-gray-800">{stop.name}</div>
                <div className="text-[11px] md:text-xs text-gray-400">{stop.latitude?.toFixed(4)}, {stop.longitude?.toFixed(4)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes sosPulse {
          0%, 100% {
            box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
          }
          50% {
            box-shadow: 0 4px 24px rgba(239, 68, 68, 0.8);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease;
        }
        .animate-sosPulse {
          animation: sosPulse 2s infinite;
        }
      `}</style>
    </div>
  );
}