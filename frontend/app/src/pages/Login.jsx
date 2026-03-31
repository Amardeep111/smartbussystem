import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const data = await apiPost("/auth/login", form);
    setLoading(false);
    if (!data.success) return setError(data.message || "Login failed");
    login(data.user, data.token);
    const routes = { passenger: "/passenger", driver: "/driver", conductor: "/conductor", admin: "/admin" };
    navigate(routes[data.user.role] || "/");
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif"
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px", color: "white", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: "absolute", borderRadius: "50%",
              border: "1px solid white",
              width: `${(i+1)*120}px`, height: `${(i+1)*120}px`,
              top: "50%", left: "30%",
              transform: "translate(-50%,-50%)"
            }} />
          ))}
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚌</div>
          <h1 style={{ fontSize: "42px", fontWeight: 800, lineHeight: 1.1, margin: "0 0 16px" }}>
            SmartBus<br />Management
          </h1>
          <p style={{ fontSize: "17px", opacity: 0.7, maxWidth: "340px", lineHeight: 1.7 }}>
            Real-time tracking, smart booking, and child safety — all in one platform.
          </p>
          <div style={{ marginTop: "40px", display: "flex", gap: "24px" }}>
            {["Real-time GPS", "RFID Safety", "Live Alerts"].map(f => (
              <div key={f} style={{ fontSize: "13px", opacity: 0.6, display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#3b82f6" }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{
        width: "460px", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(255,255,255,0.08)"
      }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <h2 style={{ color: "white", fontSize: "28px", fontWeight: 700, margin: "0 0 8px" }}>Welcome back</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", margin: "0 0 32px", fontSize: "15px" }}>Sign in to your account</p>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px", padding: "12px 16px", color: "#fca5a5",
              marginBottom: "20px", fontSize: "14px"
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
              { key: "password", label: "Password", type: "password", placeholder: "••••••••" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.6px" }}>{f.label}</label>
                <input
                  type={f.type} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  required
                  style={{
                    width: "100%", padding: "13px 16px", borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.07)", color: "white",
                    fontSize: "15px", outline: "none", transition: "border 0.2s"
                  }}
                />
              </div>
            ))}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px", borderRadius: "10px", border: "none",
              background: loading ? "#334155" : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              color: "white", fontWeight: 700, fontSize: "16px", cursor: loading ? "not-allowed" : "pointer",
              marginTop: "8px", transition: "all 0.2s",
              boxShadow: loading ? "none" : "0 4px 20px rgba(59,130,246,0.4)"
            }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: "24px", fontSize: "14px" }}>
            No account?{" "}
            <Link to="/signup" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}