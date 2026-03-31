import { useState, useEffect } from "react";
import { apiRequest, apiPut } from "../../api";
import { useSocket } from "../../context/SocketContext";

export default function EmergencyAlerts() {
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [resolving, setResolving] = useState(null);

  const load = async () => {
    const data = await apiRequest("/emergency");
    if (data.success) setAlerts(data.alerts);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  console.log(alerts)

  useEffect(() => {
    if (!socket) return;
    socket.on("emergencyAlert", (data) => {
      setAlerts(prev => [{
        _id: data.alertId,
        bus: { busNumber: data.busId },
        triggeredBy: data.triggeredBy,
        message: data.message,
        isResolved: false,
        createdAt: data.timestamp,
        location: data.location,
      }, ...prev]);
    });
    return () => socket.off("emergencyAlert");
  }, [socket]);

  const handleResolve = async (id) => {
    setResolving(id);
    const data = await apiPut(`/emergency/${id}/resolve`);
    setResolving(null);
    if (data.success) {
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, isResolved: true, resolvedAt: new Date() } : a));
    }
  };

  const filtered = filter === "all" ? alerts : filter === "active" ? alerts.filter(a => !a.isResolved) : alerts.filter(a => a.isResolved);
  const activeCount = alerts.filter(a => !a.isResolved).length;

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1e293b", margin: 0 }}>Emergency Alerts</h1>
          {activeCount > 0 && (
            <span style={{ padding: "3px 12px", borderRadius: "20px", background: "#dc2626", color: "white", fontWeight: 700, fontSize: "13px", animation: "pulse 1.5s infinite" }}>
              {activeCount} Active
            </span>
          )}
        </div>
        <p style={{ color: "#64748b", margin: 0, fontSize: "15px" }}>{alerts.length} total alerts</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {[
          { id: "all", label: `All (${alerts.length})` },
          { id: "active", label: `Active (${activeCount})` },
          { id: "resolved", label: `Resolved (${alerts.length - activeCount})` },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: "8px 18px", borderRadius: "20px", border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: "13px",
            background: filter === f.id ? "#1e293b" : "#f1f5f9",
            color: filter === f.id ? "white" : "#64748b"
          }}>{f.label}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading alerts...</p>
      ) : filtered.length === 0 ? (
        <div style={{ background: "white", borderRadius: "16px", padding: "60px", textAlign: "center", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
          <p style={{ color: "#64748b", margin: 0 }}>No {filter !== "all" ? filter : ""} alerts</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map(alert => (
            <div key={alert._id} style={{
              background: "white", borderRadius: "16px", padding: "20px 24px",
              border: `1px solid ${alert.isResolved ? "#e2e8f0" : "#fecaca"}`,
              borderLeft: `4px solid ${alert.isResolved ? "#22c55e" : "#dc2626"}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                    background: alert.isResolved ? "#dcfce7" : "#fee2e2",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px"
                  }}>
                    {alert.isResolved ? "✅" : "🚨"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b", marginBottom: "4px" }}>{alert.message}</div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      Bus: <strong>{alert.bus?.busNumber || "—"}</strong>
                      {" · "}
                      By: {alert.triggeredBy?.name || "—"} ({alert.triggeredBy?.role || "—"})
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                      {new Date(alert.createdAt).toLocaleString("en-IN")}
                      {alert.location && ` · ${alert.location.latitude?.toFixed(4)}, ${alert.location.longitude?.toFixed(4)}`}
                    </div>
                    {alert.isResolved && alert.resolvedAt && (
                      <div style={{ fontSize: "12px", color: "#15803d", marginTop: "4px" }}>
                        ✓ Resolved at {new Date(alert.resolvedAt).toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                </div>
                {!alert.isResolved && (
                  <button onClick={() => handleResolve(alert._id)} disabled={resolving === alert._id}
                    style={{ padding: "9px 18px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #22c55e, #15803d)", color: "white", fontWeight: 600, fontSize: "13px", cursor: "pointer", flexShrink: 0 }}>
                    {resolving === alert._id ? "Resolving..." : "Mark Resolved"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
    </div>
  );
}