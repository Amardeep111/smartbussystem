import { useState, useEffect } from "react";
import { apiRequest, apiPost, apiPut, apiDelete } from "../../api";

const EMPTY = { name: "", latitude: "", longitude: "", address: "" };

export default function ManageStops() {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    const data = await apiRequest("/stops");
    if (data.success) setStops(data.stops);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setError(""); setModal(true); };
  const openEdit = (s) => { setForm({ name: s.name, latitude: s.latitude, longitude: s.longitude, address: s.address || "" }); setEditing(s._id); setError(""); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.latitude || !form.longitude) return setError("Name, latitude, and longitude are required.");
    setSaving(true); setError("");
    const payload = { ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) };
    const data = editing ? await apiPut(`/stops/${editing}`, payload) : await apiPost("/stops", payload);
    setSaving(false);
    if (!data.success) return setError(data.message);
    setModal(false); load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this stop?")) return;
    await apiDelete(`/stops/${id}`);
    load();
  };

  const filtered = stops.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.address || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 md:mb-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 m-0 mb-1">Manage Stops</h1>
          <p className="text-gray-500 m-0 text-sm md:text-base">{stops.length} stop{stops.length !== 1 ? "s" : ""}</p>
        </div>
        <button 
          onClick={openCreate} 
          className="px-4 md:px-5 py-2.5 md:py-3 rounded-xl border-none bg-purple-600 text-white font-bold text-sm cursor-pointer hover:bg-purple-700 transition-colors"
        >
          + Add Stop
        </button>
      </div>

      <div className="mb-4 md:mb-5">
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search stops..."
          className="w-full sm:w-80 p-2.5 md:p-3 rounded-xl border border-gray-200 text-sm outline-none text-gray-800 focus:border-purple-500"
        />
      </div>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.map(s => (
            <div key={s._id} className="bg-white rounded-xl p-4 md:p-5 border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex gap-2 items-center mb-1.5">
                    <span className="text-base md:text-lg">📍</span>
                    <span className="font-bold text-sm md:text-base text-gray-800">{s.name}</span>
                  </div>
                  {s.address && <div className="text-xs md:text-sm text-gray-500 mb-1.5">{s.address}</div>}
                  <div className="text-[11px] md:text-xs text-gray-400 font-mono">
                    {parseFloat(s.latitude).toFixed(6)}, {parseFloat(s.longitude).toFixed(6)}
                  </div>
                </div>
                <div className="flex gap-1.5 ml-3">
                  <button 
                    onClick={() => openEdit(s)} 
                    className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-[11px] md:text-xs cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(s._id)} 
                    className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg border-none bg-red-50 text-red-700 font-semibold text-[11px] md:text-xs cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5 md:p-6">
          <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 w-full max-w-md">
            <h2 className="m-0 mb-5 md:mb-6 text-lg md:text-xl font-bold text-gray-800">{editing ? "Edit Stop" : "Add New Stop"}</h2>
            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 md:p-3.5 text-red-700 text-xs md:text-sm mb-4">{error}</div>}

            {[
              { key: "name", label: "Stop Name *", placeholder: "e.g. City Center" },
              { key: "latitude", label: "Latitude *", placeholder: "e.g. 30.7046", type: "number" },
              { key: "longitude", label: "Longitude *", placeholder: "e.g. 76.7179", type: "number" },
              { key: "address", label: "Address", placeholder: "Full address" },
            ].map(f => (
              <div key={f.key} className="mb-3 md:mb-3.5">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">{f.label}</label>
                <input 
                  type={f.type || "text"} 
                  value={form[f.key]} 
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} 
                  placeholder={f.placeholder}
                  className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none text-gray-800 focus:border-purple-500"
                />
              </div>
            ))}

            <div className="bg-blue-50 rounded-lg p-3 text-xs md:text-sm text-blue-700 mb-4 md:mb-5">
              💡 You can get coordinates from <a 
                href="https://www.google.com/maps" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-700 font-semibold hover:underline"
              >
                Google Maps
              </a> by right-clicking any location.
            </div>

            <div className="flex gap-2.5">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="flex-1 py-3 rounded-lg border-none bg-purple-600 text-white font-bold text-sm cursor-pointer disabled:opacity-50 hover:bg-purple-700 transition-colors"
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Create Stop"}
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