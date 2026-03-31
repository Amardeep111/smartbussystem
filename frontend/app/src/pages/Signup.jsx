import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "passenger", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const data = await apiPost("/auth/signup", form);
    setLoading(false);
    if (!data.success) return setError(data.message || "Signup failed");
    login(data.user, data.token);
    const routes = { passenger: "/passenger", driver: "/driver", conductor: "/conductor" };
    navigate(routes[data.user.role] || "/");
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
      fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: "24px"
    }}>
      <div style={{
        width: "100%", maxWidth: "460px", background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px",
        padding: "48px 40px", backdropFilter: "blur(20px)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>🚌</div>
          <h2 style={{ color: "white", fontSize: "26px", fontWeight: 700, margin: "0 0 8px" }}>Create Account</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", margin: 0 }}>Join the SmartBus platform</p>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px 16px", color: "#fca5a5", marginBottom: "20px", fontSize: "14px" }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { key: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
            { key: "email", label: "Email", type: "email", placeholder: "john@example.com" },
            { key: "phone", label: "Phone (optional)", type: "tel", placeholder: "+91 98765 43210" },
            { key: "password", label: "Password", type: "password", placeholder: "Min 6 characters" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.65)", fontSize: "12px", fontWeight: 600, marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                required={f.key !== "phone"}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)", color: "white", fontSize: "15px", outline: "none" }}
              />
            </div>
          ))}

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.65)", fontSize: "12px", fontWeight: 600, marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", background: "#1e3a5f", color: "white", fontSize: "15px", outline: "none" }}>
              <option value="passenger">🧑 Passenger</option>
              <option value="driver">🚗 Driver</option>
              <option value="conductor">🎫 Conductor</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "14px", borderRadius: "10px", border: "none",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            color: "white", fontWeight: 700, fontSize: "16px", cursor: "pointer",
            boxShadow: "0 4px 20px rgba(59,130,246,0.4)"
          }}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: "24px", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}