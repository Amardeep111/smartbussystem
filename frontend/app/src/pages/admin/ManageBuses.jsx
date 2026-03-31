import { useState, useEffect } from "react";
import { apiRequest, apiPost, apiPut, apiDelete } from "../../api";

const EMPTY = { busNumber: "", capacity: "", driver: "", conductor: "", plateNumber: "", status: "active", route: [] };

export default function ManageBuses() {
  const [buses, setBuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const [b, u, s] = await Promise.all([apiRequest("/buses"), apiRequest("/users"), apiRequest("/stops")]);
    if (b.success) setBuses(b.buses);
    if (u.success) setUsers(u.users);
    if (s.success) setStops(s.stops);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setError(""); setModal(true); };
  const openEdit = (bus) => {
    setForm({
      busNumber: bus.busNumber,
      capacity: bus.capacity,
      driver: bus.driver?._id || "",
      conductor: bus.conductor?._id || "",
      plateNumber: bus.plateNumber || "",
      status: bus.status,
      route: bus.route?.map(s => s._id) || []
    });
    setEditing(bus._id);
    setError("");
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.busNumber || !form.capacity) return setError("Bus number and capacity are required.");
    setSaving(true); setError("");
    const payload = { ...form, capacity: parseInt(form.capacity), route: form.route };
    const data = editing ? await apiPut(`/buses/${editing}`, payload) : await apiPost("/buses", payload);
    setSaving(false);
    if (!data.success) return setError(data.message);
    setModal(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bus?")) return;
    await apiDelete(`/buses/${id}`);
    load();
  };

  const toggleRoute = (stopId) => {
    setForm(f => ({
      ...f,
      route: f.route.includes(stopId) ? f.route.filter(id => id !== stopId) : [...f.route, stopId]
    }));
  };

  const drivers = users.filter(u => u.role === "driver");
  const conductors = users.filter(u => u.role === "conductor");

  const STATUS_BADGE = { active: ["#dcfce7","#15803d"], inactive: ["#f1f5f9","#64748b"], maintenance: ["#fef9c3","#854d0e"], "en-route": ["#dbeafe","#1d4ed8"] };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 md:mb-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 m-0 mb-1">Manage Buses</h1>
          <p className="text-gray-500 m-0 text-sm md:text-base">{buses.length} bus{buses.length !== 1 ? "es" : ""} total</p>
        </div>
        <button 
          onClick={openCreate} 
          className="px-4 md:px-5 py-2.5 md:py-3 rounded-xl border-none bg-blue-600 text-white font-bold text-sm cursor-pointer hover:bg-blue-700 transition-colors"
        >
          + Add Bus
        </button>
      </div>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="flex flex-col gap-2.5">
          {buses.map(bus => {
            const [bg, text] = STATUS_BADGE[bus.status] || ["#f1f5f9","#64748b"];
            return (
              <div key={bus._id} className="bg-white rounded-xl p-4 md:p-5 lg:p-6 border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex gap-3 md:gap-4 items-center">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">
                    🚌
                  </div>
                  <div>
                    <div className="font-bold text-sm md:text-base text-gray-800">
                      {bus.busNumber}
                      <span 
                        className="text-xs font-semibold px-2 md:px-2.5 py-1 rounded-full ml-2"
                        style={{ backgroundColor: bg, color: text }}
                      >
                        {bus.status}
                      </span>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 mt-0.5">
                      Capacity: {bus.capacity} · Driver: {bus.driver?.name || "—"} · Conductor: {bus.conductor?.name || "—"}
                    </div>
                    <div className="text-[11px] md:text-xs text-gray-400 mt-0.5">
                      Route: {bus.route?.length || 0} stops · Plate: {bus.plateNumber || "—"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 self-end md:self-auto">
                  <button 
                    onClick={() => openEdit(bus)} 
                    className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-xs md:text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(bus._id)} 
                    className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg border-none bg-red-50 text-red-700 font-semibold text-xs md:text-sm cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5 md:p-6">
          <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="m-0 mb-5 md:mb-6 text-lg md:text-xl font-bold text-gray-800">{editing ? "Edit Bus" : "Add New Bus"}</h2>
            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 md:p-3.5 text-red-700 text-xs md:text-sm mb-4">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-3.5">
              {[
                { key: "busNumber", label: "Bus Number *", placeholder: "e.g. BUS001" },
                { key: "capacity", label: "Capacity *", placeholder: "e.g. 40", type: "number" },
                { key: "plateNumber", label: "Plate Number", placeholder: "e.g. PB01AB1234" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <input 
                    type={f.type || "text"} 
                    value={form[f.key]} 
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} 
                    placeholder={f.placeholder}
                    className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none text-gray-800 focus:border-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
                <select 
                  value={form.status} 
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none text-gray-800 focus:border-blue-500"
                >
                  {["active","inactive","maintenance","en-route"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Driver</label>
                <select 
                  value={form.driver} 
                  onChange={e => setForm(p => ({ ...p, driver: e.target.value }))}
                  className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none text-gray-800 focus:border-blue-500"
                >
                  <option value="">— Unassigned —</option>
                  {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Conductor</label>
                <select 
                  value={form.conductor} 
                  onChange={e => setForm(p => ({ ...p, conductor: e.target.value }))}
                  className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none text-gray-800 focus:border-blue-500"
                >
                  <option value="">— Unassigned —</option>
                  {conductors.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Route Stops (in order)</label>
              <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-36 overflow-y-auto">
                {stops.map(s => (
                  <button 
                    key={s._id} 
                    onClick={() => toggleRoute(s._id)} 
                    className={`
                      px-3 py-1 rounded-full border-none cursor-pointer text-xs font-semibold transition-all duration-150
                      ${form.route.includes(s._id) 
                        ? 'bg-blue-700 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                    `}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              {form.route.length > 0 && (
                <div className="text-xs text-gray-500 mt-1.5">
                  Selected order: {form.route.map(id => stops.find(s => s._id === id)?.name).join(" → ")}
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-6">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="flex-1 py-3 rounded-lg border-none bg-blue-600 text-white font-bold text-sm cursor-pointer disabled:opacity-50 hover:bg-blue-700 transition-colors"
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Create Bus"}
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