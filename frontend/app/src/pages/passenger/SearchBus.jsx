import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api";

// ── Safety Badge ──────────────────────────────────────────────────────
// Compact inline indicator shown on each bus card.
// Only score, band, label and flags — never raw sensor values.
function SafetyBadge({ safety, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
        </div>
        <span className="text-xs text-gray-400">Loading score...</span>
      </div>
    );
  }

  if (!safety) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs">—</div>
        <span className="text-xs text-gray-400">No live data</span>
      </div>
    );
  }

  const { score, band, label, color, flags } = safety;

  const bandBg = { green: "#f0fdf4", yellow: "#fffbeb", red: "#fef2f2" }[band] || "#f8fafc";
  const bandBorder = { green: "#bbf7d0", yellow: "#fde68a", red: "#fecaca" }[band] || "#e2e8f0";

  return (
    <div 
      className="rounded-xl p-2.5 md:p-3 min-w-[160px] md:min-w-[180px]"
      style={{ backgroundColor: bandBg, border: `1px solid ${bandBorder}` }}
    >
      {/* Score row */}
      <div className={`flex items-center gap-2 md:gap-2.5 ${flags?.length > 0 ? 'mb-2' : ''}`}>
        {/* Circle score */}
        <div 
          className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 relative"
          style={{ background: `conic-gradient(${color} ${(score / 10) * 360}deg, #e2e8f0 0deg)` }}
        >
          <div 
            className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: bandBg }}
          >
            <span className="text-[10px] md:text-xs font-black" style={{ color }}>{score}</span>
          </div>
        </div>
        <div>
          <div className="text-[11px] md:text-xs font-bold leading-tight" style={{ color }}>{label}</div>
          <div className="text-[10px] md:text-[11px] text-gray-400 mt-0.5">Safety Score · /10</div>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-600"
          style={{ 
            width: `${(score / 10) * 100}%`,
            background: `linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #22c55e 100%)`
          }}
        />
      </div>

      {/* Flags — human readable only */}
      {flags?.length > 0 && (
        <div className="mt-2 flex flex-col gap-0.5">
          {flags.slice(0, 2).map((f, i) => (
            <div key={i} className="text-[10px] md:text-xs text-gray-500 flex gap-1 items-center">
              <span className="text-[6px] md:text-[8px]" style={{ color }}>●</span>{f}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
export default function SearchBus() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceResults, setSourceResults] = useState([]);
  const [destResults, setDestResults] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showSrcDropdown, setShowSrcDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [buses, setBuses] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Safety scores keyed by busId: { [busId]: { safety, loading } }
  const [safetyMap, setSafetyMap] = useState({});

  const navigate = useNavigate();

  // ── Stop search ───────────────────────────────────────────────────
  useEffect(() => {
    if (source.length < 1 || selectedSource) {
      setSourceResults([]); setShowSrcDropdown(false); return;
    }
    const t = setTimeout(async () => {
      const data = await apiRequest(`/stops/search?name=${encodeURIComponent(source)}`);
      if (data.success && data.stops.length > 0) {
        setSourceResults(data.stops); setShowSrcDropdown(true);
      } else {
        setSourceResults([]); setShowSrcDropdown(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [source, selectedSource]);

  useEffect(() => {
    if (destination.length < 1 || selectedDestination) {
      setDestResults([]); setShowDestDropdown(false); return;
    }
    const t = setTimeout(async () => {
      const data = await apiRequest(`/stops/search?name=${encodeURIComponent(destination)}`);
      if (data.success && data.stops.length > 0) {
        setDestResults(data.stops); setShowDestDropdown(true);
      } else {
        setDestResults([]); setShowDestDropdown(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [destination, selectedDestination]);

  // ── After buses load, fetch live safety score for each ────────────
  useEffect(() => {
    if (buses.length === 0) return;

    // Mark all as loading first
    const initial = {};
    buses.forEach(b => { initial[b._id] = { safety: null, loading: true }; });
    setSafetyMap(initial);

    // Fetch each bus's live location (which includes cached safety score from Redis)
    buses.forEach(async (bus) => {
      const data = await apiRequest(`/buses/${bus._id}/live-location`);
      setSafetyMap(prev => ({
        ...prev,
        [bus._id]: {
          loading: false,
          // Redis location has safety score embedded (set by socketHandler)
          safety: data.success && data.location?.safety ? data.location.safety : null
        }
      }));
    });
  }, [buses]);

  // ── Handlers ──────────────────────────────────────────────────────
  const selectSource = (stop) => { setSelectedSource(stop); setSource(stop.name); setSourceResults([]); setShowSrcDropdown(false); };
  const selectDest   = (stop) => { setSelectedDestination(stop); setDestination(stop.name); setDestResults([]); setShowDestDropdown(false); };
  const clearSource  = () => { setSource(""); setSelectedSource(null); setSourceResults([]); setShowSrcDropdown(false); };
  const clearDest    = () => { setDestination(""); setSelectedDestination(null); setDestResults([]); setShowDestDropdown(false); };

  const handleSearch = async () => {
    if (!selectedSource || !selectedDestination) return;
    setLoading(true); setSearched(false); setSearchError(""); setSafetyMap({});
    const data = await apiRequest(`/buses/search?source=${selectedSource._id}&destination=${selectedDestination._id}`);
    setLoading(false); setSearched(true);
    if (data.success) setBuses(data.buses || []);
    else { setSearchError(data.message || "Search failed."); setBuses([]); }
  };

  const canSearch = selectedSource && selectedDestination && !loading;

  return (
    <div>
      <div className="mb-6 md:mb-7">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 m-0 mb-1">Search Buses</h1>
        <p className="text-gray-500 m-0 text-sm md:text-base">Find buses between stops</p>
      </div>

      {/* ── Search form ── */}
      <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 border border-gray-200 mb-6 md:mb-7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-5 md:mb-6">

          {/* Source */}
          <div>
            <label className="block font-bold text-xs md:text-sm text-gray-700 mb-2 uppercase tracking-wide">From</label>
            <div className="relative">
              <input 
                value={source}
                onChange={e => { setSource(e.target.value); setSelectedSource(null); }}
                onFocus={() => { if (sourceResults.length > 0) setShowSrcDropdown(true); }}
                onBlur={() => setTimeout(() => setShowSrcDropdown(false), 150)}
                placeholder="Type source stop name..."
                className={`
                  w-full py-3 px-4 pr-10 rounded-xl text-sm md:text-base outline-none box-border
                  border-2 ${selectedSource ? 'border-green-600' : showSrcDropdown ? 'border-blue-600' : 'border-gray-200'}
                `}
              />
              {selectedSource
                ? <span onClick={clearSource} className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-green-600 cursor-pointer">✓</span>
                : source && <button onClick={clearSource} className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-gray-400 text-lg p-0">✕</button>
              }
              {showSrcDropdown && sourceResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {sourceResults.map(s => (
                    <div 
                      key={s._id} 
                      onMouseDown={e => { e.preventDefault(); selectSource(s); }}
                      className="p-3 cursor-pointer border-b border-gray-100 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      <div className="font-semibold">📍 {s.name}</div>
                      {s.address && <div className="text-xs text-gray-400 mt-0.5">{s.address}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedSource && <div className="text-xs text-green-700 mt-1.5 font-semibold">✓ {selectedSource.name} selected</div>}
          </div>

          {/* Destination */}
          <div>
            <label className="block font-bold text-xs md:text-sm text-gray-700 mb-2 uppercase tracking-wide">To</label>
            <div className="relative">
              <input 
                value={destination}
                onChange={e => { setDestination(e.target.value); setSelectedDestination(null); }}
                onFocus={() => { if (destResults.length > 0) setShowDestDropdown(true); }}
                onBlur={() => setTimeout(() => setShowDestDropdown(false), 150)}
                placeholder="Type destination stop name..."
                className={`
                  w-full py-3 px-4 pr-10 rounded-xl text-sm md:text-base outline-none box-border
                  border-2 ${selectedDestination ? 'border-green-600' : showDestDropdown ? 'border-blue-600' : 'border-gray-200'}
                `}
              />
              {selectedDestination
                ? <span onClick={clearDest} className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-green-600 cursor-pointer">✓</span>
                : destination && <button onClick={clearDest} className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-gray-400 text-lg p-0">✕</button>
              }
              {showDestDropdown && destResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {destResults.map(s => (
                    <div 
                      key={s._id} 
                      onMouseDown={e => { e.preventDefault(); selectDest(s); }}
                      className="p-3 cursor-pointer border-b border-gray-100 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      <div className="font-semibold">📍 {s.name}</div>
                      {s.address && <div className="text-xs text-gray-400 mt-0.5">{s.address}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedDestination && <div className="text-xs text-green-700 mt-1.5 font-semibold">✓ {selectedDestination.name} selected</div>}
          </div>
        </div>

        {selectedSource && selectedDestination && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm text-blue-700 font-semibold">
            🗺️ {selectedSource.name} → {selectedDestination.name}
          </div>
        )}

        <button 
          onClick={handleSearch} 
          disabled={!canSearch} 
          className={`
            w-full py-3.5 rounded-xl border-none font-bold text-base
            ${canSearch 
              ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {loading ? "Searching..." : "🔍 Search Buses"}
        </button>

        {(!selectedSource || !selectedDestination) && (
          <p className="text-center text-gray-400 text-xs md:text-sm mt-2.5">
            {!selectedSource && !selectedDestination ? "Type at least 1 character to search for stops"
              : !selectedSource ? "Select a source stop to continue"
              : "Select a destination stop to continue"}
          </p>
        )}
      </div>

      {/* ── Error ── */}
      {searchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 md:p-4 mb-5 text-red-700 text-sm">
          ⚠️ {searchError}
        </div>
      )}

      {/* ── Results ── */}
      {searched && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base md:text-lg font-bold text-gray-800 m-0">
              {buses.length > 0 ? `${buses.length} Bus${buses.length > 1 ? "es" : ""} Found` : "No Buses Found"}
            </h3>
            {buses.length > 0 && (
              <div className="text-xs text-gray-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-600 inline-block" /> Safe
                <span className="w-2 h-2 rounded-full bg-yellow-600 inline-block ml-1.5" /> Moderate
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block ml-1.5" /> Unsafe
              </div>
            )}
          </div>

          {buses.length === 0 ? (
            <div className="bg-white rounded-xl py-12 md:py-16 text-center border border-gray-200">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-gray-500 m-0 mb-1.5 font-semibold">No active buses on this route</p>
              <p className="text-gray-400 m-0 text-xs md:text-sm">Try a different source/destination, or check if buses have been added for this route.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {buses.map(bus => {
                const busScore = safetyMap[bus._id];
                const safety   = busScore?.safety;
                const scoreColor = safety
                  ? { green: "#22c55e", yellow: "#f59e0b", red: "#ef4444" }[safety.band] || "#94a3b8"
                  : "#e2e8f0";

                return (
                  <div 
                    key={bus._id} 
                    className="bg-white rounded-xl overflow-hidden transition-shadow hover:shadow-md"
                    style={{ 
                      border: `1px solid ${safety ? scoreColor + "40" : "#e2e8f0"}`,
                      borderLeft: `4px solid ${scoreColor}`
                    }}
                  >
                    <div className="p-4 md:p-5 lg:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

                      {/* Bus info */}
                      <div className="flex gap-3 md:gap-4 items-center">
                        <div className="w-10 h-10 md:w-13 md:h-13 rounded-xl bg-blue-50 flex items-center justify-center text-xl md:text-2xl flex-shrink-0">
                          🚌
                        </div>
                        <div>
                          <div className="font-bold text-base md:text-lg text-gray-800">Bus {bus.busNumber}</div>
                          <div className="text-xs md:text-sm text-gray-500 mt-0.5">
                            Capacity: {bus.capacity} · Plate: {bus.plateNumber || "—"}
                          </div>
                          <div className="mt-1.5 flex gap-1.5 flex-wrap">
                            <span className={`
                              text-[10px] md:text-xs font-semibold px-2 md:px-2.5 py-0.5 md:py-1 rounded-full
                              ${["active","en-route"].includes(bus.status) 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-500'
                              }
                            `}>
                              {bus.status}
                            </span>
                            {bus.driver?.name && (
                              <span className="text-[10px] md:text-xs text-gray-400 py-0.5">
                                Driver: {bus.driver.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Safety badge — centre column */}
                      <SafetyBadge safety={safety} loading={busScore?.loading} />

                      {/* Action buttons */}
                      <div className="flex gap-2 flex-shrink-0 self-end lg:self-auto">
                        <button 
                          onClick={() => navigate(`/passenger/track/${bus._id}`)}
                          className="px-3 md:px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-xs md:text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          📍 Track
                        </button>
                        <button 
                          onClick={() => navigate(`/passenger/book/${bus._id}`, { state: { bus, source: selectedSource, destination: selectedDestination } })}
                          className="px-3 md:px-4 py-2 rounded-lg border-none bg-blue-600 text-white font-semibold text-xs md:text-sm cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 0.7s linear infinite;
        }
      `}</style>
    </div>
  );
}