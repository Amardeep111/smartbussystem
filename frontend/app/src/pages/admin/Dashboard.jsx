import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api";
import { useSocket } from "../../context/SocketContext";

export default function AdminDashboard() {
  const { socket, connected } = useSocket();
  const [stats, setStats] = useState({ buses: 0, stops: 0, bookings: 0, active: 0, alerts: 0 });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveAlert, setLiveAlert] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [buses, stops, bookings, active, alerts] = await Promise.all([
        apiRequest("/buses"),
        apiRequest("/stops"),
        apiRequest("/bookings/all"),
        apiRequest("/buses/active"),
        apiRequest("/emergency"),
      ]);
      setStats({
        buses: buses.success ? buses.count : 0,
        stops: stops.success ? stops.count : 0,
        bookings: bookings.success ? bookings.count : 0,
        active: active.success ? active.count : 0,
        alerts: alerts.success ? alerts.count : 0,
      });
      if (alerts.success) setRecentAlerts(alerts.alerts.slice(0, 5));
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("emergencyAlert", (d) => { setLiveAlert(d); setTimeout(() => setLiveAlert(null), 8000); });
    return () => socket.off("emergencyAlert");
  }, [socket]);

  const cards = [
    { label: "Total Buses", value: stats.buses, icon: "🚌", color: "#3b82f6", to: "/admin/buses" },
    { label: "Active Now", value: stats.active, icon: "📍", color: "#22c55e", to: "/admin/buses" },
    { label: "Stops", value: stats.stops, icon: "◉", color: "#8b5cf6", to: "/admin/stops" },
    { label: "Bookings", value: stats.bookings, icon: "🎫", color: "#f59e0b", to: "/admin/buses" },
    { label: "Alerts", value: stats.alerts, icon: "🚨", color: "#ef4444", to: "/admin/emergency" },
  ];

  return (
    <div>
      {liveAlert && (
        <div className="bg-red-700 rounded-xl p-4 mb-6 text-white flex gap-3 items-center">
          <span className="text-2xl">🚨</span>
          <div>
            <strong>LIVE EMERGENCY ALERT</strong>
            <p className="m-0 opacity-90 text-sm">{liveAlert.message} · Bus: {liveAlert.busId}</p>
          </div>
          <button 
            onClick={() => setLiveAlert(null)} 
            className="ml-auto bg-white/20 border-none text-white rounded-lg px-3 py-1 cursor-pointer font-semibold text-sm hover:bg-white/30"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex justify-between items-start mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 m-0 mb-1">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full inline-block ${connected ? 'bg-green-600' : 'bg-gray-400'}`} />
            <span className="text-xs md:text-sm text-gray-500">{connected ? "Socket connected" : "Socket offline"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-3.5 mb-6 md:mb-8">
        {cards.map(c => (
          <Link key={c.label} to={c.to} className="no-underline">
            <div 
              className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 transition-shadow hover:shadow-md"
              style={{ borderTop: `3px solid ${c.color}` }}
            >
              <div className="text-xl md:text-2xl mb-2">{c.icon}</div>
              <div className="text-2xl md:text-3xl font-extrabold text-gray-800">{loading ? "—" : c.value}</div>
              <div className="text-[11px] md:text-xs text-gray-500 mt-1 font-semibold">{c.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
        {/* Quick actions */}
        <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200">
          <h3 className="m-0 mb-4 text-base md:text-lg font-bold text-gray-800">Quick Actions</h3>
          <div className="flex flex-col gap-2.5">
            {[
              { to: "/admin/buses", label: "Add New Bus", icon: "🚌", color: "#3b82f6" },
              { to: "/admin/stops", label: "Add New Stop", icon: "📍", color: "#8b5cf6" },
              { to: "/admin/users", label: "Manage Users", icon: "👥", color: "#f59e0b" },
              { to: "/admin/emergency", label: "View Alerts", icon: "🚨", color: "#ef4444" },
            ].map(a => (
              <Link key={a.to} to={a.to} className="no-underline">
                <div className="flex gap-3 items-center p-3 rounded-lg border border-gray-100 transition-colors hover:bg-gray-50">
                  <span 
                    className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-base md:text-lg"
                    style={{ backgroundColor: a.color + "20" }}
                  >
                    {a.icon}
                  </span>
                  <span className="font-semibold text-xs md:text-sm text-gray-700">{a.label}</span>
                  <span className="ml-auto text-gray-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent alerts */}
        <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="m-0 text-base md:text-lg font-bold text-gray-800">Recent Alerts</h3>
            <Link to="/admin/emergency" className="text-blue-600 text-xs md:text-sm no-underline font-semibold hover:text-blue-700">
              View all
            </Link>
          </div>
          {recentAlerts.length === 0 ? (
            <div className="text-center py-6 md:py-8 text-gray-400">
              <div className="text-2xl md:text-3xl mb-2">✅</div>
              <p className="m-0 text-sm">No alerts</p>
            </div>
          ) : (
            recentAlerts.map(a => (
              <div key={a._id} className="py-3 border-b border-gray-100 last:border-b-0 flex gap-2.5 items-start">
                <span className="text-base md:text-lg">{a.isResolved ? "✅" : "🚨"}</span>
                <div>
                  <div className="font-semibold text-xs md:text-sm text-gray-800">{a.message}</div>
                  <div className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                    Bus {a.bus?.busNumber || "—"} · {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}