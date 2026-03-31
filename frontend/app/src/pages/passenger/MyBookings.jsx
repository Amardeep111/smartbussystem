import { useState, useEffect } from "react";
import { apiRequest, apiPut } from "../../api";

const STATUS_COLORS = {
  booked: { bg: "#dbeafe", text: "#1d4ed8" },
  "in-progress": { bg: "#fef9c3", text: "#854d0e" },
  completed: { bg: "#dcfce7", text: "#15803d" },
  cancelled: { bg: "#fee2e2", text: "#b91c1c" },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      const data = await apiRequest("/bookings/my");
      if (data.success) setBookings(data.bookings);
      setLoading(false);
    };
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancelling(id);
    const data = await apiPut(`/bookings/${id}/cancel`);
    setCancelling(null);
    if (data.success) {
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: "cancelled" } : b));
    }
  };

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div>
      <div className="mb-6 md:mb-7">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 m-0 mb-1">My Bookings</h1>
        <p className="text-gray-500 m-0 text-sm md:text-base">{bookings.length} total booking{bookings.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 md:mb-6 flex-wrap">
        {["all", "booked", "in-progress", "completed", "cancelled"].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            className={`
              px-3 md:px-4 py-1.5 md:py-2 rounded-full border-none cursor-pointer font-semibold text-xs md:text-sm transition-all duration-150
              ${filter === f 
                ? 'bg-blue-700 text-white' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }
            `}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 md:py-16 text-gray-400">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl py-12 md:py-16 text-center border border-gray-200">
          <div className="text-5xl mb-3">🎫</div>
          <p className="text-gray-500 m-0 text-sm md:text-base">No {filter !== "all" ? filter : ""} bookings found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(b => {
            const colors = STATUS_COLORS[b.status] || { bg: "#f1f5f9", text: "#64748b" };
            const isOpen = expanded === b._id;
            return (
              <div key={b._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div 
                  className="p-4 md:p-5 lg:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : b._id)}
                >
                  <div className="flex gap-3 md:gap-4 items-start sm:items-center">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">
                      🚌
                    </div>
                    <div>
                      <div className="font-bold text-sm md:text-base text-gray-800">
                        Bus {b.bus?.busNumber || "—"}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 mt-0.5">
                        {b.boardingStop?.name || "—"} → {b.destinationStop?.name || "—"}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {b.totalSeats} seat{b.totalSeats > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center self-end sm:self-auto">
                    <span 
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {b.status}
                    </span>
                    <span className="text-gray-400 text-base md:text-lg">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-gray-100 p-4 md:p-5 lg:p-6">
                    <h4 className="m-0 mb-3 text-sm font-bold text-gray-700">Passengers</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-4">
                      {b.passengers.map((p, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3 md:p-3.5 border border-gray-200">
                          <div className="font-semibold text-sm text-gray-800 flex justify-between">
                            <span>{p.name}</span>
                            <span 
                              className="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ 
                                backgroundColor: p.checkedIn ? "#dcfce7" : "#f1f5f9",
                                color: p.checkedIn ? "#15803d" : "#94a3b8"
                              }}
                            >
                              {p.checkedIn ? "✓ In" : "Pending"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Age: {p.age} · Seat: {p.seatNumber} · {p.type}
                          </div>
                          {p.type === "adult" && p.qrCode && (
                            <div className="text-[10px] md:text-xs text-cyan-700 mt-1 font-mono">QR: {p.qrCode.substring(0, 8)}...</div>
                          )}
                          {p.type === "child" && p.rfidUid && (
                            <div className="text-[10px] md:text-xs text-purple-700 mt-1">RFID: {p.rfidUid}</div>
                          )}
                        </div>
                      ))}
                    </div>
                    {["booked", "in-progress"].includes(b.status) && (
                      <button 
                        onClick={() => handleCancel(b._id)} 
                        disabled={cancelling === b._id}
                        className="px-4 md:px-5 py-2 rounded-lg border-none bg-red-50 text-red-700 font-semibold text-xs md:text-sm cursor-pointer disabled:opacity-50 hover:bg-red-100 transition-colors"
                      >
                        {cancelling === b._id ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}