import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useState, useEffect } from "react";

const NAV_LINKS = {
  passenger: [
    { to: "/passenger", label: "Dashboard", icon: "⊞", end: true },
    { to: "/passenger/search", label: "Search Bus", icon: "⊕" },
    { to: "/passenger/bookings", label: "My Bookings", icon: "◈" },
  ],
  driver: [
    { to: "/driver", label: "Dashboard", icon: "⊞", end: true },
  ],
  conductor: [
    { to: "/conductor", label: "Dashboard", icon: "⊞", end: true },
    { to: "/conductor/checkin", label: "Check-In", icon: "◈" },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: "⊞", end: true },
    { to: "/admin/buses", label: "Buses", icon: "⊕" },
    { to: "/admin/stops", label: "Stops", icon: "◉" },
    { to: "/admin/users", label: "Users", icon: "◈" },
    { to: "/admin/emergency", label: "Alerts", icon: "⚠" },
  ],
};

const ROLE_COLORS = {
  passenger: { accent: "#3b82f6", bg: "#eff6ff", dark: "#1d4ed8" },
  driver:    { accent: "#f59e0b", bg: "#fffbeb", dark: "#b45309" },
  conductor: { accent: "#10b981", bg: "#ecfdf5", dark: "#047857" },
  admin:     { accent: "#ef4444", bg: "#fef2f2", dark: "#b91c1c" },
};

export default function Layout() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const [emergency, setEmergency] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { socket } = useSocket();

  const colors = ROLE_COLORS[user?.role] || ROLE_COLORS.passenger;
  const links = NAV_LINKS[user?.role] || [];

  useEffect(() => {
    if (!socket) return;
    socket.on("emergencyAlert", (data) => {
      setEmergency(data);
      setTimeout(() => setEmergency(null), 8000);
    });
    return () => socket.off("emergencyAlert");
  }, [socket]);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Emergency Banner */}
      {emergency && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-700 text-white p-3 md:p-4 flex items-center gap-3 shadow-lg animate-slideDown">
          <span className="text-2xl">🚨</span>
          <div>
            <strong>EMERGENCY ALERT</strong>
            <p className="m-0 text-sm opacity-90">{emergency.message} — Bus {emergency.busId}</p>
          </div>
          <button 
            onClick={() => setEmergency(null)} 
            className="ml-auto bg-white/20 border-none text-white rounded px-2 py-1 cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`
        bg-white border-r border-gray-200 sticky top-0 h-screen overflow-hidden flex-shrink-0 transition-all duration-300
        ${sidebarOpen ? 'w-64' : 'w-20'}
      `}>
        {/* Logo */}
        <div className="p-4 md:p-5 border-b border-gray-200 flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xl"
            style={{ backgroundColor: colors.accent }}
          >
            🚌
          </div>
          {sidebarOpen && (
            <div>
              <div className="font-bold text-sm text-gray-800">RippleBus</div>
              <div 
                className="text-xs font-semibold uppercase tracking-wide mt-0.5"
                style={{ color: colors.accent }}
              >
                {user?.role}
              </div>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(p => !p)} 
            className="ml-auto bg-none border-none cursor-pointer text-gray-400 text-lg flex-shrink-0 hover:text-gray-600"
          >
            {sidebarOpen ? "‹" : "›"}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {links.map(link => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              end={link.end} 
              className={({ isActive }) => `
                flex items-center gap-3 p-2.5 rounded-lg mb-1 transition-all duration-150 text-sm
                ${isActive ? 'font-semibold' : 'font-normal'}
              `}
              style={({ isActive }) => ({
                color: isActive ? colors.dark : "#64748b",
                backgroundColor: isActive ? colors.bg : "transparent"
              })}
            >
              <span className="text-lg flex-shrink-0 w-6 text-center">{link.icon}</span>
              {sidebarOpen && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200">
          {sidebarOpen && (
            <div className="px-3 py-2 mb-2">
              <div className="text-sm font-semibold text-gray-800">{user?.name}</div>
              <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${connected ? 'bg-green-600' : 'bg-red-600'}`} />
                {connected ? "Live" : "Offline"}
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout} 
            className="w-full py-2.5 px-3 border-none rounded-lg bg-red-50 text-red-700 cursor-pointer font-semibold text-sm flex items-center gap-2.5 hover:bg-red-100 transition-colors"
          >
            <span>⏻</span>{sidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`
        flex-1 overflow-y-auto p-4 md:p-6 lg:p-8
        ${emergency ? 'mt-12 md:mt-14' : ''}
      `}>
        <Outlet />
      </main>

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
        .animate-slideDown {
          animation: slideDown 0.3s ease;
        }
        * {
          box-sizing: border-box;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .loading-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}