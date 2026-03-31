import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useTracking } from "../../context/Trackingcontext";

const STATUS_COLORS = {
  booked:       { bg: "#dbeafe", text: "#1d4ed8" },
  "in-progress":{ bg: "#fef9c3", text: "#854d0e" },
  completed:    { bg: "#dcfce7", text: "#15803d" },
  cancelled:    { bg: "#fee2e2", text: "#b91c1c" },
};

// ── Mini Live Tracker Card ────────────────────────────────────────────
function MiniTracker({ tracked, liveData, onStop, onOpen }) {
  if (!tracked) return null;

  const safety  = liveData?.safety;
  const color   = safety
    ? { green: "#22c55e", yellow: "#f59e0b", red: "#ef4444" }[safety.band] || "#94a3b8"
    : "#94a3b8";
  const bandBg  = safety
    ? { green: "#f0fdf4", yellow: "#fffbeb", red: "#fef2f2" }[safety.band] || "#f8fafc"
    : "#f8fafc";

  return (
    <div style={{ background: "white", borderRadius: "16px", border: `2px solid ${color}40`, overflow: "hidden", marginBottom: "24px" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${color}20, ${color}10)`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${color}30` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: liveData ? "#22c55e" : "#f59e0b", display: "inline-block", animation: "pulse 1.5s infinite" }} />
          <span style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>
            Tracking Bus {tracked.busNumber}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={onOpen} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: color, color: "white", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
            Open →
          </button>
          <button onClick={onStop} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
            Stop
          </button>
        </div>
      </div>

      {/* Live data */}
      <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
        {/* Safety score */}
        <div style={{ background: bandBg, borderRadius: "10px", padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px" }}>Safety Score</div>
          {safety ? (
            <>
              <div style={{ fontSize: "24px", fontWeight: 900, color, lineHeight: 1 }}>{safety.score}</div>
              <div style={{ fontSize: "10px", color, fontWeight: 600, marginTop: "4px" }}>{safety.label}</div>
            </>
          ) : (
            <div style={{ fontSize: "20px", color: "#94a3b8" }}>—</div>
          )}
        </div>

        {/* Location */}
        <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px" }}>Location</div>
          {liveData?.latitude ? (
            <>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e293b", fontFamily: "monospace" }}>
                {liveData.latitude.toFixed(4)}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e293b", fontFamily: "monospace" }}>
                {liveData.longitude.toFixed(4)}
              </div>
            </>
          ) : (
            <div style={{ fontSize: "20px", color: "#94a3b8" }}>📡</div>
          )}
        </div>

        {/* Cabin */}
        <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px" }}>Cabin</div>
          {safety?.cabin ? (
            <>
              <div style={{ fontSize: "12px", fontWeight: 700, color: safety.cabin.tempStatus === "Hot" ? "#ef4444" : safety.cabin.tempStatus === "Cold" ? "#3b82f6" : "#22c55e" }}>
                🌡️ {safety.cabin.tempStatus}
              </div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginTop: "4px" }}>
                💧 {safety.cabin.humStatus}
              </div>
            </>
          ) : (
            <div style={{ fontSize: "20px", color: "#94a3b8" }}>—</div>
          )}
        </div>
      </div>

      {/* Flags */}
      {safety?.flags?.length > 0 && (
        <div style={{ padding: "0 20px 14px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {safety.flags.map((f, i) => (
            <span key={i} style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: color + "20", color, fontWeight: 600 }}>
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────
export default function PassengerDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { tracked, liveData, stopTracking } = useTracking();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ bookings: 0, active: 0, buses: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [sosAlert, setSosAlert] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [bData, busData] = await Promise.all([
        apiRequest("/bookings/my"),
        apiRequest("/buses/active"),
      ]);
      if (bData.success) {
        setRecentBookings(bData.bookings.slice(0, 3));
        setStats(s => ({
          ...s,
          bookings: bData.bookings.length,
          active: bData.bookings.filter(b => ["in-progress","booked"].includes(b.status)).length
        }));
      }
      if (busData.success) setStats(s => ({ ...s, buses: busData.count }));
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("emergencyAlert", d => {
      setEmergencyAlert(d);
      setTimeout(() => setEmergencyAlert(null), 10000);
    });

    socket.on("passengerSOS", d => {
      setSosAlert(d);
      setTimeout(() => setSosAlert(null), 15000);
    });

    return () => {
      socket.off("emergencyAlert");
      socket.off("passengerSOS");
    };
  }, [socket]);

  return (
    <div>
      {/* Emergency banner */}
      {emergencyAlert && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "22px" }}>🚨</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: "#dc2626" }}>Emergency Alert</strong>
            <p style={{ margin: 0, color: "#991b1b", fontSize: "13px" }}>{emergencyAlert.message}</p>
          </div>
          <button onClick={() => setEmergencyAlert(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "18px" }}>✕</button>
        </div>
      )}

      {/* SOS banner */}
      {sosAlert && (
        <div style={{ background: "linear-gradient(135deg, #fef2f2, #fee2e2)", border: "2px solid #fecaca", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "22px" }}>🆘</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: "#dc2626" }}>Passenger SOS — {sosAlert.passenger?.name}</strong>
            <p style={{ margin: 0, color: "#991b1b", fontSize: "13px" }}>
              {sosAlert.message}
              {sosAlert.passenger?.phone && sosAlert.passenger.phone !== "N/A" && (
                <span> · 📞 {sosAlert.passenger.phone}</span>
              )}
            </p>
          </div>
          <button onClick={() => setSosAlert(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "18px" }}>✕</button>
        </div>
      )}

      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1e293b", margin: "0 0 4px" }}>
          Good day, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: "15px" }}>Here's your travel overview</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Bookings", value: stats.bookings, icon: "🎫", color: "#3b82f6", to: "/passenger/bookings" },
          { label: "Active Trips",   value: stats.active,   icon: "🚌", color: "#f59e0b", to: "/passenger/bookings" },
          { label: "Active Buses",   value: stats.buses,    icon: "📍", color: "#22c55e", to: "/passenger/search" },
        ].map(c => (
          <Link key={c.label} to={c.to} style={{ textDecoration: "none" }}>
            <div style={{ background: "white", borderRadius: "14px", padding: "20px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{c.label}</div>
                  <div style={{ fontSize: "30px", fontWeight: 800, color: "#1e293b", marginTop: "6px" }}>{loading ? "—" : c.value}</div>
                </div>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: c.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{c.icon}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Persistent tracker — shows when tracking in background */}
      {tracked && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>🔴 Live Tracking</h3>
            <span style={{ fontSize: "11px", background: "#dcfce7", color: "#15803d", padding: "2px 10px", borderRadius: "20px", fontWeight: 600 }}>Active</span>
          </div>
          <MiniTracker
            tracked={tracked}
            liveData={liveData}
            onStop={stopTracking}
            onOpen={() => navigate(`/passenger/track/${tracked.busId}`)}
          />
        </div>
      )}

      {/* Bottom cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Recent bookings */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Recent Bookings</h3>
            <Link to="/passenger/bookings" style={{ color: "#3b82f6", fontSize: "13px", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          {recentBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎫</div>
              <p style={{ margin: 0, fontSize: "13px" }}>No bookings yet</p>
            </div>
          ) : recentBookings.map(b => {
            const sc = STATUS_COLORS[b.status] || { bg: "#f1f5f9", text: "#64748b" };
            return (
              <div key={b._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}>Bus {b.bus?.busNumber || "—"}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{b.totalSeats} seat{b.totalSeats > 1 ? "s" : ""}</div>
                </div>
                <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: sc.bg, color: sc.text }}>
                  {b.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* Search CTA */}
        <div style={{ background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)", borderRadius: "16px", padding: "28px", color: "white", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🗺️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 700 }}>Plan a Journey</h3>
            <p style={{ margin: 0, opacity: 0.75, fontSize: "13px", lineHeight: 1.6 }}>
              Search buses, track live location, and book tickets.
            </p>
          </div>
          <Link to="/passenger/search" style={{ marginTop: "20px", display: "inline-block", padding: "11px 20px", background: "rgba(255,255,255,0.2)", borderRadius: "10px", color: "white", textDecoration: "none", fontWeight: 600, fontSize: "14px", border: "1px solid rgba(255,255,255,0.3)" }}>
            Search Buses →
          </Link>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}