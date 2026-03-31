// // import { useState, useEffect } from "react";
// // import { Link } from "react-router-dom";
// // import { useAuth } from "../../context/AuthContext";
// // import { apiRequest } from "../../api";

// // export default function ConductorDashboard() {
// //   const { user } = useAuth();
// //   const [bus, setBus] = useState(null);
// //   const [stats, setStats] = useState({ total: 0, checkedIn: 0 });
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     apiRequest("/buses").then(d => {
// //       if (d.success) {
// //         const myBus = d.buses.find(b => b.conductor?._id === user.id || b.conductor === user.id);
// //         if (myBus) {
// //           setBus(myBus);
// //           apiRequest(`/checkin/bus/${myBus._id}/passengers`).then(pd => {
// //             if (pd.success) setStats({ total: pd.total, checkedIn: pd.checkedIn });
// //           });
// //         }
// //       }
// //       setLoading(false);
// //     });
// //   }, [user._id]);

// //   const pct = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0;

// //   return (
// //     <div>
// //       <div className="mb-6 md:mb-7">
// //         <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 m-0 mb-1">Conductor Panel</h1>
// //         <p className="text-gray-500 m-0 text-sm md:text-base">Welcome, {user.name}</p>
// //       </div>

// //       {!bus && !loading ? (
// //         <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 md:p-8 text-center">
// //           <div className="text-4xl md:text-5xl mb-3">🎫</div>
// //           <p className="text-amber-800 m-0 font-semibold text-sm md:text-base">No bus assigned yet. Contact admin.</p>
// //         </div>
// //       ) : (
// //         <div className="flex flex-col gap-4 md:gap-5">
// //           {bus && (
// //             <div className="bg-emerald-800 rounded-xl p-5 md:p-6 text-white">
// //               <div className="text-xs md:text-sm opacity-75 mb-2">Assigned Bus</div>
// //               <div className="text-2xl md:text-3xl font-extrabold">{bus.busNumber}</div>
// //               <div className="opacity-75 text-xs md:text-sm mt-1">
// //                 Capacity: {bus.capacity} · Status: {bus.status}
// //               </div>
// //             </div>
// //           )}

// //           {/* Check-in progress */}
// //           <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200">
// //             <h3 className="m-0 mb-4 text-base md:text-lg font-bold text-gray-800">Today's Check-in Progress</h3>
// //             <div className="flex justify-between mb-2.5">
// //               <span className="text-xs md:text-sm text-gray-500">{stats.checkedIn} of {stats.total} passengers</span>
// //               <span className="text-xs md:text-sm font-bold text-green-600">{pct}%</span>
// //             </div>
// //             <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
// //               <div 
// //                 className="h-full bg-green-600 rounded-full transition-all duration-500"
// //                 style={{ width: `${pct}%` }}
// //               />
// //             </div>
// //             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
// //               <div className="bg-green-50 rounded-lg p-3 md:p-3.5 text-center">
// //                 <div className="text-xl md:text-2xl font-extrabold text-green-800">{stats.checkedIn}</div>
// //                 <div className="text-[11px] md:text-xs text-gray-500">Checked In</div>
// //               </div>
// //               <div className="bg-gray-50 rounded-lg p-3 md:p-3.5 text-center">
// //                 <div className="text-xl md:text-2xl font-extrabold text-gray-500">{stats.total - stats.checkedIn}</div>
// //                 <div className="text-[11px] md:text-xs text-gray-500">Pending</div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Quick actions */}
// //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
// //             <Link to="/conductor/checkin" className="no-underline">
// //               <div className="bg-green-600 rounded-xl p-5 md:p-6 text-white cursor-pointer hover:bg-green-700 transition-colors">
// //                 <div className="text-2xl md:text-3xl mb-3">📱</div>
// //                 <div className="font-bold text-sm md:text-base">QR Check-in</div>
// //                 <div className="opacity-75 text-xs md:text-sm mt-1">Scan adult QR codes</div>
// //               </div>
// //             </Link>
// //             <Link to="/conductor/checkin?tab=rfid" className="no-underline">
// //               <div className="bg-cyan-700 rounded-xl p-5 md:p-6 text-white cursor-pointer hover:bg-cyan-800 transition-colors">
// //                 <div className="text-2xl md:text-3xl mb-3">🏷️</div>
// //                 <div className="font-bold text-sm md:text-base">RFID Check-in</div>
// //                 <div className="opacity-75 text-xs md:text-sm mt-1">Scan child RFID cards</div>
// //               </div>
// //             </Link>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { apiRequest } from "../../api";

// export default function ConductorDashboard() {
//   const { user } = useAuth();
//   const [bus, setBus] = useState(null);
//   const [stats, setStats] = useState({ total: 0, checkedIn: 0 });
//   const [passengers, setPassengers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all"); // all, checked, pending

//   useEffect(() => {
//     // Wait for user to be loaded
//     if (!user || !user.id) {
//       console.log('Waiting for user data...');
//       return;
//     }

//     console.log("User ID:", user.id);
    
//     apiRequest("/buses").then(d => {
//       console.log("Buses API response:", d);
//       if (d.success) {
//         // Find bus where conductor matches current user
//         const myBus = d.buses.find(b => {
//           const conductorId = b.conductor?._id || b.conductor;
//           return conductorId === user.id;
//         });
        
//         console.log("Found bus:", myBus);
        
//         if (myBus) {
//           setBus(myBus);
//           apiRequest(`/bookings/bus/${myBus._id}`).then(d => {
//             console.log('new api person data: ', d)
//           })
//           apiRequest(`/checkin/bus/${myBus._id}/passengers`).then(pd => {
//             console.log("Passengers data:", pd);
//             if (pd.success) {
//               setPassengers(pd.passengers || []);
//               setStats({ 
//                 total: pd.total || 0, 
//                 checkedIn: pd.checkedIn || 0 
//               });
//             }
//           });
//         }
//       }
//       setLoading(false);
//     }).catch(error => {
//       console.error('Error fetching buses:', error);
//       setLoading(false);
//     });
//   }, [user, user?.id]);

//   const pct = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0;

//   // Filter passengers based on search and status
//   console.log('passengers: ', passengers)
//   const filteredPassengers = passengers.filter((p) => {
//     const matchesSearch = 
//       p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       p.seatNumber?.toString().includes(searchTerm) ||
//       p.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
//     let matchesStatus = true;
//     if (filterStatus === "checked") {
//       matchesStatus = p.checkedIn === true;
//     } else if (filterStatus === "pending") {
//       matchesStatus = p.checkedIn === false;
//     }
    
//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <div>
//       <div className="mb-6 md:mb-7">
//         <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 m-0 mb-1">Conductor Panel</h1>
//         <p className="text-gray-500 m-0 text-sm md:text-base">Welcome, {user?.name}</p>
//       </div>

//       {!bus && !loading ? (
//         <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 md:p-8 text-center">
//           <div className="text-4xl md:text-5xl mb-3">🎫</div>
//           <p className="text-amber-800 m-0 font-semibold text-sm md:text-base">No bus assigned yet. Contact admin.</p>
//           <p className="text-amber-600 text-xs mt-2">Your ID: {user?.id}</p>
//         </div>
//       ) : (
//         <div className="flex flex-col gap-4 md:gap-5">
//           {bus && (
//             <div className="bg-emerald-800 rounded-xl p-5 md:p-6 text-white">
//               <div className="text-xs md:text-sm opacity-75 mb-2">Assigned Bus</div>
//               <div className="text-2xl md:text-3xl font-extrabold">{bus.busNumber}</div>
//               <div className="opacity-75 text-xs md:text-sm mt-1">
//                 Capacity: {bus.capacity} · Status: {bus.status}
//               </div>
//             </div>
//           )}

//           {/* Check-in progress */}
//           <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200">
//             <h3 className="m-0 mb-4 text-base md:text-lg font-bold text-gray-800">Today's Check-in Progress</h3>
//             <div className="flex justify-between mb-2.5">
//               <span className="text-xs md:text-sm text-gray-500">{stats.checkedIn} of {stats.total} passengers</span>
//               <span className="text-xs md:text-sm font-bold text-green-600">{pct}%</span>
//             </div>
//             <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
//               <div 
//                 className="h-full bg-green-600 rounded-full transition-all duration-500"
//                 style={{ width: `${pct}%` }}
//               />
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
//               <div className="bg-green-50 rounded-lg p-3 md:p-3.5 text-center">
//                 <div className="text-xl md:text-2xl font-extrabold text-green-800">{stats.checkedIn}</div>
//                 <div className="text-[11px] md:text-xs text-gray-500">Checked In</div>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-3 md:p-3.5 text-center">
//                 <div className="text-xl md:text-2xl font-extrabold text-gray-500">{stats.total - stats.checkedIn}</div>
//                 <div className="text-[11px] md:text-xs text-gray-500">Pending</div>
//               </div>
//             </div>
//           </div>

//           {/* Quick actions */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
//             <Link to="/conductor/checkin" className="no-underline">
//               <div className="bg-green-600 rounded-xl p-5 md:p-6 text-white cursor-pointer hover:bg-green-700 transition-colors">
//                 <div className="text-2xl md:text-3xl mb-3">📱</div>
//                 <div className="font-bold text-sm md:text-base">QR Check-in</div>
//                 <div className="opacity-75 text-xs md:text-sm mt-1">Scan adult QR codes</div>
//               </div>
//             </Link>
//             <Link to="/conductor/checkin?tab=rfid" className="no-underline">
//               <div className="bg-cyan-700 rounded-xl p-5 md:p-6 text-white cursor-pointer hover:bg-cyan-800 transition-colors">
//                 <div className="text-2xl md:text-3xl mb-3">🏷️</div>
//                 <div className="font-bold text-sm md:text-base">RFID Check-in</div>
//                 <div className="opacity-75 text-xs md:text-sm mt-1">Scan child RFID cards</div>
//               </div>
//             </Link>
//           </div>

//           {/* Passengers Table Section */}
//           <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
//               <h3 className="m-0 text-base md:text-lg font-bold text-gray-800">Passenger List</h3>
//               <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
//                 <input
//                   type="text"
//                   placeholder="Search by name, seat or type..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 w-full sm:w-64"
//                 />
//                 <select
//                   value={filterStatus}
//                   onChange={(e) => setFilterStatus(e.target.value)}
//                   className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
//                 >
//                   <option value="all">All Passengers</option>
//                   <option value="checked">Checked In</option>
//                   <option value="pending">Pending Check-in</option>
//                 </select>
//               </div>
//             </div>

//             {passengers.length === 0 ? (
//               <div className="text-center py-8 text-gray-400">
//                 <div className="text-3xl mb-2">👥</div>
//                 <p className="text-sm">No passengers booked yet</p>
//               </div>
//             ) : filteredPassengers.length === 0 ? (
//               <div className="text-center py-8 text-gray-400">
//                 <p className="text-sm">No passengers match your search</p>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr className="bg-gray-50 border-b border-gray-200">
//                       <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Passenger</th>
//                       <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Seat</th>
//                       <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Type</th>
//                       <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Boarding Stop</th>
//                       <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Destination</th>
//                       <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredPassengers.map((p, i) => (
                      
//                       <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
//                         <td className="p-3">
//                           <div>
//                             <div className="font-semibold text-sm text-gray-800">{p.name}</div>
//                             {p.type === "child" && p.rfidUid && (
//                               <div className="text-[10px] text-gray-400 font-mono mt-0.5">RFID: {p.rfidUid}</div>
//                             )}
//                           </div>
//                         </td>
//                         <td className="p-3">
//                           <span className="text-sm text-gray-700">{p.seatNumber}</span>
//                         </td>
//                         <td className="p-3">
//                           <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
//                             p.type === "adult" ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
//                           }`}>
//                             {p.type === "adult" ? "👤 Adult" : "🧒 Child"}
//                           </span>
//                         </td>
//                         <td className="p-3">
//                           <span className="text-sm text-gray-700">{p.boardingStop?.name || "—"}</span>
//                         </td>
//                         <td className="p-3">
//                           <span className="text-sm text-gray-700">{p.destinationStop?.name || "—"}</span>
//                         </td>
//                         <td className="p-3">
//                           <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
//                             p.checkedIn 
//                               ? 'bg-green-100 text-green-800' 
//                               : 'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {p.checkedIn ? "✓ Checked In" : "⏳ Pending"}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
            
//             {/* Summary row */}
//             {passengers.length > 0 && (
//               <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
//                 <span>Total: {filteredPassengers.length} passenger{filteredPassengers.length !== 1 ? "s" : ""}</span>
//                 <span>Showing {filteredPassengers.length} of {passengers.length}</span>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../api";

export default function ConductorDashboard() {
  const { user } = useAuth();
  const [bus, setBus] = useState(null);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 });
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!user || !user.id) {
      console.log('Waiting for user data...');
      return;
    }

    console.log("User ID:", user.id);
    
    apiRequest("/buses").then(d => {
      console.log("Buses API response:", d);
      if (d.success) {
        const myBus = d.buses.find(b => {
          const conductorId = b.conductor?._id || b.conductor;
          return conductorId === user.id;
        });
        
        console.log("Found bus:", myBus);
        
        if (myBus) {
          setBus(myBus);
          // Use the bookings endpoint instead of checkin endpoint
          apiRequest(`/bookings/bus/${myBus._id}`).then(async (response) => {
            console.log('Bookings data:', response);
            if (response.success && response.bookings) {
              // Process each booking to fetch stop names
              const allPassengersPromises = [];
              
              response.bookings.forEach(booking => {
                // Create promises for fetching both stops
                const boardingStopPromise = apiRequest(`/stops/${booking.boardingStop}`);
                const destinationStopPromise = apiRequest(`/stops/${booking.destinationStop}`);
                
                // Wait for both stop fetches to complete
                allPassengersPromises.push(
                  Promise.all([boardingStopPromise, destinationStopPromise]).then(([boardingResponse, destinationResponse]) => {
                    const boardingStopName = boardingResponse.success ? boardingResponse.stop.name : "Unknown Stop";
                    const destinationStopName = destinationResponse.success ? destinationResponse.stop.name : "Unknown Stop";
                    
                    // Create passenger objects for this booking
                    return booking.passengers.map(passenger => ({
                      _id: passenger._id,
                      name: passenger.name,
                      age: passenger.age,
                      type: passenger.type,
                      seatNumber: passenger.seatNumber,
                      qrCode: passenger.qrCode,
                      rfidUid: passenger.rfidUid,
                      checkedIn: passenger.checkedIn,
                      checkedInAt: passenger.checkedInAt,
                      boardingStop: boardingStopName,
                      destinationStop: destinationStopName,
                      bookingId: booking._id,
                      status: booking.status
                    }));
                  })
                );
              });
              
              // Wait for all passengers to be processed
              const passengersArrays = await Promise.all(allPassengersPromises);
              const allPassengers = passengersArrays.flat();
              
              // Calculate checked-in count
              const totalCheckedIn = allPassengers.filter(p => p.checkedIn === true).length;
              
              console.log('All passengers with stop names:', allPassengers);
              setPassengers(allPassengers);
              setStats({ 
                total: allPassengers.length, 
                checkedIn: totalCheckedIn 
              });
            }
            setLoading(false);
          }).catch(err => {
            console.error('Error fetching bookings:', err);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }).catch(error => {
      console.error('Error fetching buses:', error);
      setLoading(false);
    });
  }, [user, user?.id]);

  const pct = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0;

  // Filter passengers based on search and status
  const filteredPassengers = passengers.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.seatNumber?.toString().includes(searchTerm) ||
      p.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === "checked") {
      matchesStatus = p.checkedIn === true;
    } else if (filterStatus === "pending") {
      matchesStatus = p.checkedIn === false;
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-6 md:mb-7">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 m-0 mb-1">Conductor Panel</h1>
        <p className="text-gray-500 m-0 text-sm md:text-base">Welcome, {user?.name}</p>
      </div>

      {!bus && !loading ? (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 md:p-8 text-center">
          <div className="text-4xl md:text-5xl mb-3">🎫</div>
          <p className="text-amber-800 m-0 font-semibold text-sm md:text-base">No bus assigned yet. Contact admin.</p>
          <p className="text-amber-600 text-xs mt-2">Your ID: {user?.id}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 md:gap-5">
          {bus && (
            <div className="bg-emerald-800 rounded-xl p-5 md:p-6 text-white">
              <div className="text-xs md:text-sm opacity-75 mb-2">Assigned Bus</div>
              <div className="text-2xl md:text-3xl font-extrabold">{bus.busNumber}</div>
              <div className="opacity-75 text-xs md:text-sm mt-1">
                Capacity: {bus.capacity} · Status: {bus.status}
              </div>
            </div>
          )}

          {/* Check-in progress */}
          <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200">
            <h3 className="m-0 mb-4 text-base md:text-lg font-bold text-gray-800">Today's Check-in Progress</h3>
            <div className="flex justify-between mb-2.5">
              <span className="text-xs md:text-sm text-gray-500">{stats.checkedIn} of {stats.total} passengers</span>
              <span className="text-xs md:text-sm font-bold text-green-600">{pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="bg-green-50 rounded-lg p-3 md:p-3.5 text-center">
                <div className="text-xl md:text-2xl font-extrabold text-green-800">{stats.checkedIn}</div>
                <div className="text-[11px] md:text-xs text-gray-500">Checked In</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 md:p-3.5 text-center">
                <div className="text-xl md:text-2xl font-extrabold text-gray-500">{stats.total - stats.checkedIn}</div>
                <div className="text-[11px] md:text-xs text-gray-500">Pending</div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <Link to="/conductor/checkin" className="no-underline">
              <div className="bg-green-600 rounded-xl p-5 md:p-6 text-white cursor-pointer hover:bg-green-700 transition-colors">
                <div className="text-2xl md:text-3xl mb-3">📱</div>
                <div className="font-bold text-sm md:text-base">QR Check-in</div>
                <div className="opacity-75 text-xs md:text-sm mt-1">Scan adult QR codes</div>
              </div>
            </Link>
            <Link to="/conductor/checkin?tab=rfid" className="no-underline">
              <div className="bg-cyan-700 rounded-xl p-5 md:p-6 text-white cursor-pointer hover:bg-cyan-800 transition-colors">
                <div className="text-2xl md:text-3xl mb-3">🏷️</div>
                <div className="font-bold text-sm md:text-base">RFID Check-in</div>
                <div className="opacity-75 text-xs md:text-sm mt-1">Scan child RFID cards</div>
              </div>
            </Link>
          </div>

          {/* Passengers Table Section */}
          <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h3 className="m-0 text-base md:text-lg font-bold text-gray-800">Passenger List</h3>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search by name, seat or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 w-full sm:w-64"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
                >
                  <option value="all">All Passengers</option>
                  <option value="checked">Checked In</option>
                  <option value="pending">Pending Check-in</option>
                </select>
              </div>
            </div>

            {passengers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">👥</div>
                <p className="text-sm">No passengers booked yet</p>
              </div>
            ) : filteredPassengers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No passengers match your search</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Passenger</th>
                      <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Seat</th>
                      <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Type</th>
                      <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Boarding Stop</th>
                      <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Destination</th>
                      <th className="text-left p-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPassengers.map((p, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <div>
                            <div className="font-semibold text-sm text-gray-800">{p.name}</div>
                            {p.type === "child" && p.rfidUid && (
                              <div className="text-[10px] text-gray-400 font-mono mt-0.5">RFID: {p.rfidUid}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-700">{p.seatNumber}</span>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            p.type === "adult" ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {p.type === "adult" ? "👤 Adult" : "🧒 Child"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-700">
                            {p.boardingStop || "—"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-700">
                            {p.destinationStop || "—"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            p.checkedIn 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {p.checkedIn ? "✓ Checked In" : "⏳ Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Summary row */}
            {passengers.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                <span>Total: {filteredPassengers.length} passenger{filteredPassengers.length !== 1 ? "s" : ""}</span>
                <span>Showing {filteredPassengers.length} of {passengers.length}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}