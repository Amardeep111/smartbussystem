import { useState, useEffect } from "react";
import { apiRequest, apiPost } from "../../api";

const ROLE_BADGE = {
  admin:     { bg: "#fee2e2", text: "#b91c1c" },
  driver:    { bg: "#fef9c3", text: "#854d0e" },
  conductor: { bg: "#dcfce7", text: "#15803d" },
  passenger: { bg: "#dbeafe", text: "#1d4ed8" },
};

const EMPTY_NEW = { name: "", email: "", password: "", role: "driver", phone: "" };

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_NEW);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const data = await apiRequest("/users");
    if (data.success) setUsers(data.users);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) return setError("Name, email, and password required.");
    setSaving(true); setError("");
    const data = await apiPost("/auth/signup", form);
    setSaving(false);
    if (!data.success) return setError(data.message);
    setModal(false);
    load();
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = { all: users.length, admin: 0, driver: 0, conductor: 0, passenger: 0 };
  users.forEach(u => { if (counts[u.role] !== undefined) counts[u.role]++; });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 md:mb-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 m-0 mb-1">Manage Users</h1>
          <p className="text-gray-500 m-0 text-sm md:text-base">{users.length} registered users</p>
        </div>
        <button 
          onClick={() => { setForm(EMPTY_NEW); setError(""); setModal(true); }}
          className="px-4 md:px-5 py-2.5 md:py-3 rounded-xl border-none bg-amber-600 text-white font-bold text-sm cursor-pointer hover:bg-amber-700 transition-colors"
        >
          + Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-5 items-start sm:items-center">
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search by name or email..."
          className="w-full sm:w-64 p-2.5 md:p-3 rounded-xl border border-gray-200 text-sm outline-none text-gray-800 focus:border-amber-500"
        />
        <div className="flex flex-wrap gap-1.5">
          {["all", "admin", "driver", "conductor", "passenger"].map(r => (
            <button 
              key={r} 
              onClick={() => setRoleFilter(r)} 
              className={`
                px-3 md:px-3.5 py-1.5 md:py-2 rounded-full border-none cursor-pointer font-semibold text-xs transition-all duration-150
                ${roleFilter === r 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }
              `}
            >
              {r === "all" ? `All (${counts.all})` : `${r.charAt(0).toUpperCase() + r.slice(1)} (${counts[r]})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50">
                {["User", "Email", "Role", "Phone", "Joined"].map(h => (
                  <th key={h} className="p-3 md:p-4 text-left text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const rb = ROLE_BADGE[u.role] || { bg: "#f1f5f9", text: "#64748b" };
                return (
                  <tr key={u._id} className="border-b border-gray-100 last:border-b-0">
                    <td className="p-3 md:p-4">
                      <div className="flex items-center gap-2 md:gap-2.5">
                        <div 
                          className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-sm md:text-base"
                          style={{ backgroundColor: rb.bg }}
                        >
                          {u.role === "driver" ? "🚗" : u.role === "conductor" ? "🎫" : u.role === "admin" ? "🔑" : "🧑"}
                        </div>
                        <div>
                          <div className="font-semibold text-xs md:text-sm text-gray-800">{u.name}</div>
                          <div className="text-[10px] md:text-xs text-gray-400">{u._id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 md:p-4 text-xs md:text-sm text-gray-700">{u.email}</td>
                    <td className="p-3 md:p-4">
                      <span 
                        className="text-[11px] md:text-xs font-semibold px-2 md:px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: rb.bg, color: rb.text }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 md:p-4 text-xs md:text-sm text-gray-500">{u.phone || "—"}</td>
                    <td className="p-3 md:p-4 text-xs md:text-sm text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-10 md:py-12 text-center text-gray-400">
              <div className="text-3xl md:text-4xl mb-2">👥</div>
              <p className="m-0 text-sm">No users found</p>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5 md:p-6">
          <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 w-full max-w-md">
            <h2 className="m-0 mb-5 md:mb-6 text-lg md:text-xl font-bold text-gray-800">Add New User</h2>
            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 md:p-3.5 text-red-700 text-xs md:text-sm mb-4">{error}</div>}
            {[
              { key: "name", label: "Full Name *", type: "text", placeholder: "John Doe" },
              { key: "email", label: "Email *", type: "email", placeholder: "john@example.com" },
              { key: "password", label: "Password *", type: "password", placeholder: "Min 6 chars" },
              { key: "phone", label: "Phone", type: "tel", placeholder: "+91 ..." },
            ].map(f => (
              <div key={f.key} className="mb-3 md:mb-3.5">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">{f.label}</label>
                <input 
                  type={f.type} 
                  value={form[f.key]} 
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} 
                  placeholder={f.placeholder}
                  className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none text-gray-800 focus:border-amber-500"
                />
              </div>
            ))}
            <div className="mb-4 md:mb-5">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role</label>
              <select 
                value={form.role} 
                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none text-gray-800 focus:border-amber-500"
              >
                <option value="driver">Driver</option>
                <option value="conductor">Conductor</option>
                <option value="passenger">Passenger</option>
              </select>
            </div>
            <div className="flex gap-2.5">
              <button 
                onClick={handleCreate} 
                disabled={saving}
                className="flex-1 py-3 rounded-lg border-none bg-amber-600 text-white font-bold text-sm cursor-pointer disabled:opacity-50 hover:bg-amber-700 transition-colors"
              >
                {saving ? "Creating..." : "Create User"}
              </button>
              <button 
                onClick={() => setModal(false)} 
                className="flex-1 py-3 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-sm cursor-pointer hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}