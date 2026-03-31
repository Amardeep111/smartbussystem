import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apiPost } from "../../api";

const emptyPassenger = () => ({ name: "", age: "", rfidUid: "" });

export default function BookTicket() {
  const { busId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const bus         = state?.bus;
  const source      = state?.source;
  const destination = state?.destination;

  const [passengers, setPassengers] = useState([emptyPassenger()]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState(null);

  // ── Guard: state lost on refresh ────────────────────────────────
  if (!state || !source || !destination || !busId) {
    return (
      <div className="py-12 md:py-16 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-gray-800 mb-2 text-xl md:text-2xl font-bold">Session Expired</h2>
        <p className="text-gray-500 mb-6 text-sm md:text-base">
          Booking info was lost. Please search again and select a bus.
        </p>
        <button 
          onClick={() => navigate("/passenger/search")}
          className="px-6 md:px-8 py-3 rounded-xl border-none bg-blue-600 text-white font-bold text-sm md:text-base cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Back to Search
        </button>
      </div>
    );
  }

  const updatePassenger = (idx, field, value) =>
    setPassengers(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));

  const addPassenger    = () => setPassengers(p => [...p, emptyPassenger()]);
  const removePassenger = (idx) => setPassengers(p => p.filter((_, i) => i !== idx));
  const isChild         = (age) => parseInt(age) < 18;

  const handleBook = async () => {
    setError("");

    // ── Frontend validation ──────────────────────────────────────
    for (const p of passengers) {
      if (!p.name.trim())  return setError("All passenger names are required.");
      if (!p.age)          return setError("All passenger ages are required.");
      if (parseInt(p.age) < 1 || parseInt(p.age) > 120)
        return setError(`Invalid age for passenger "${p.name}".`);
      if (isChild(p.age) && !p.rfidUid.trim())
        return setError(`Child passenger "${p.name}" requires an RFID UID.`);
    }

    // ── Build payload with explicit checks ───────────────────────
    const boardingStop    = source?._id      || source?.id;
    const destinationStop = destination?._id || destination?.id;

    if (!boardingStop || !destinationStop) {
      return setError("Source or destination stop is missing. Please go back and search again.");
    }

    const payload = {
      busId,
      boardingStop,
      destinationStop,
      passengers: passengers.map(p => ({
        name:    p.name.trim(),
        age:     parseInt(p.age),
        // Only include rfidUid for children, omit entirely for adults
        ...(isChild(p.age) ? { rfidUid: p.rfidUid.trim() } : {})
      }))
    };

    // Debug — remove after confirming it works
    console.log("Booking payload:", JSON.stringify(payload, null, 2));

    setLoading(true);
    const data = await apiPost("/bookings", payload);
    setLoading(false);

    if (!data.success) return setError(data.message || "Booking failed. Please try again.");
    setSuccess(data.booking);
  };

  // ── Success screen ───────────────────────────────────────────────
  if (success) {
    return (
      <div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 md:p-8 text-center mb-6">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-green-800 mb-2 text-lg md:text-xl font-bold">Booking Confirmed!</h2>
          <p className="text-green-700 m-0 text-sm md:text-base">Your tickets have been booked successfully.</p>
        </div>

        <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 mb-4">
          <h3 className="m-0 mb-4 md:mb-5 text-base font-bold text-gray-800">Passenger Tickets</h3>
          {success.passengers?.map((p, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl mb-3 flex flex-col md:flex-row gap-4 items-start">
              <div className="flex-1">
                <div className="font-bold text-gray-800">{p.name}</div>
                <div className="text-xs md:text-sm text-gray-500 mt-1">
                  Age: {p.age} · Seat: {p.seatNumber} · Type: {p.type}
                </div>
                {p.type === "child" && (
                  <div className="text-xs text-cyan-700 mt-1 font-semibold">
                    🏷️ RFID: {p.rfidUid}
                  </div>
                )}
              </div>
              {p.qrCodeImage && (
                <div className="text-center flex-shrink-0">
                  <img src={p.qrCodeImage} alt="QR Code" className="w-20 h-20 md:w-24 md:h-24 rounded-lg" />
                  <div className="text-[10px] text-gray-400 mt-1">Show to conductor</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => navigate("/passenger/bookings")}
            className="flex-1 py-3 rounded-xl border-none bg-blue-600 text-white font-bold text-sm md:text-base cursor-pointer hover:bg-blue-700 transition-colors"
          >
            View My Bookings
          </button>
          <button 
            onClick={() => navigate("/passenger/search")}
            className="flex-1 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm md:text-base cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Search Again
          </button>
        </div>
      </div>
    );
  }

  // ── Booking form ─────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-6 md:mb-7">
        <button 
          onClick={() => navigate(-1)}
          className="bg-none border-none text-gray-500 cursor-pointer text-sm mb-3 p-0 hover:text-gray-700"
        >
          ← Back
        </button>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 m-0">Book Ticket</h1>
      </div>

      {/* Bus + route summary */}
      <div className="bg-blue-800 rounded-xl p-5 md:p-6 text-white mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="text-lg md:text-xl font-bold">Bus {bus?.busNumber}</div>
          <div className="opacity-75 text-xs md:text-sm mt-1">
            {source?.name} → {destination?.name}
          </div>
        </div>
        <div className="text-right text-xs md:text-sm opacity-75">
          <div>Capacity: {bus?.capacity}</div>
          <div className="mt-1">{bus?.status}</div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 md:p-4 text-red-700 mb-5 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Passengers */}
      <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 mb-5">
        <div className="flex justify-between items-center mb-4 md:mb-5">
          <h3 className="m-0 text-base font-bold text-gray-800">
            Passengers ({passengers.length})
          </h3>
          <button 
            onClick={addPassenger}
            className="px-4 py-2 rounded-lg border-none bg-blue-50 text-blue-700 font-semibold text-xs md:text-sm cursor-pointer hover:bg-blue-100 transition-colors"
          >
            + Add Passenger
          </button>
        </div>

        {passengers.map((p, i) => {
          const child = p.age && isChild(p.age);
          return (
            <div key={i} className={`bg-gray-50 rounded-xl p-4 md:p-5 mb-3 border ${child ? 'border-blue-200' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-800">Passenger {i + 1}</span>
                  {p.age && (
                    <span className={`text-[10px] md:text-xs font-semibold px-2 py-1 rounded-full ${child ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {child ? "🧒 Child" : "👤 Adult"}
                    </span>
                  )}
                </div>
                {passengers.length > 1 && (
                  <button 
                    onClick={() => removePassenger(i)}
                    className="bg-red-100 border-none text-red-600 rounded-lg px-3 py-1 cursor-pointer text-xs md:text-sm hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input 
                    value={p.name} 
                    onChange={e => updatePassenger(i, "name", e.target.value)}
                    placeholder="Enter name"
                    className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none text-gray-800 box-border focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Age *</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="120" 
                    value={p.age}
                    onChange={e => updatePassenger(i, "age", e.target.value)}
                    placeholder="Enter age"
                    className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none text-gray-800 box-border focus:border-blue-500"
                  />
                </div>
              </div>

              {child && (
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-blue-700 mb-1.5">
                    🏷️ RFID UID (required for child) *
                  </label>
                  <input 
                    value={p.rfidUid} 
                    onChange={e => updatePassenger(i, "rfidUid", e.target.value)}
                    placeholder="e.g. A1B2C3D4"
                    className="w-full p-2.5 rounded-lg border border-blue-200 text-sm outline-none text-gray-800 bg-blue-50 font-mono box-border focus:border-blue-500"
                  />
                  <div className="text-[10px] md:text-xs text-cyan-700 mt-1">
                    Scan the RFID card/wristband to get this ID
                  </div>
                </div>
              )}

              {p.age && !child && (
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                  <span>📱</span> QR code will be generated automatically for check-in
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button 
        onClick={handleBook} 
        disabled={loading} 
        className={`
          w-full py-4 rounded-xl border-none font-bold text-base cursor-pointer transition-colors
          ${loading 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        {loading ? "Booking..." : `Confirm Booking (${passengers.length} passenger${passengers.length > 1 ? "s" : ""})`}
      </button>
    </div>
  );
}