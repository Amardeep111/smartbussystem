// import { useState, useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
// import { apiPost } from "../../api";

// export default function CheckIn() {
//   const [searchParams] = useSearchParams();
//   const [tab, setTab] = useState(searchParams.get("tab") === "rfid" ? "rfid" : "qr");
//   const [qrInput, setQrInput] = useState("");
//   const [rfidInput, setRfidInput] = useState("");
//   const [busId, setBusId] = useState("");
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [recentScans, setRecentScans] = useState([]);

//   const handleQR = async () => {
//     if (!qrInput.trim()) return;
//     setLoading(true); setResult(null); setError("");
//     const data = await apiPost("/checkin/qr", { qrCode: qrInput.trim() });
//     setLoading(false);
//     if (data.success) {
//       setResult({ ...data, type: "qr" });
//       setRecentScans(p => [{ name: data.passenger?.name, seat: data.passenger?.seatNumber, success: true, time: new Date() }, ...p.slice(0, 9)]);
//       setQrInput("");
//     } else {
//       setError(data.message);
//       setRecentScans(p => [{ name: qrInput.substring(0, 8) + "...", success: false, time: new Date() }, ...p.slice(0, 9)]);
//     }
//   };

//   const handleRFID = async () => {
//     if (!rfidInput.trim()) return;
//     setLoading(true); setResult(null); setError("");
//     const data = await apiPost("/checkin/rfid", { rfidUid: rfidInput.trim(), busId: busId || undefined });
//     setLoading(false);
//     if (data.success) {
//       setResult({ ...data, type: "rfid" });
//       setRecentScans(p => [{ name: data.passenger?.name, seat: data.passenger?.seatNumber, success: true, time: new Date() }, ...p.slice(0, 9)]);
//       setRfidInput("");
//     } else {
//       setError(data.message);
//       setRecentScans(p => [{ name: rfidInput, success: false, time: new Date() }, ...p.slice(0, 9)]);
//     }
//   };

//   const handleKey = (e, fn) => { if (e.key === "Enter") fn(); };

//   return (
//     <div>
//       <div className="mb-6 md:mb-7">
//         <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 m-0 mb-1">Passenger Check-in</h1>
//         <p className="text-gray-500 m-0 text-sm md:text-base">Scan QR codes or RFID cards to check in passengers</p>
//       </div>

//       {/* Tab switch */}
//       <div className="flex bg-gray-100 rounded-xl p-1 mb-5 md:mb-6 w-fit">
//         {[{ id: "qr", label: "📱 QR Code (Adult)" }, { id: "rfid", label: "🏷️ RFID (Child)" }].map(t => (
//           <button 
//             key={t.id} 
//             onClick={() => { setTab(t.id); setResult(null); setError(""); }}
//             className={`
//               px-3 md:px-5 py-2 md:py-2.5 rounded-lg border-none cursor-pointer font-semibold text-xs md:text-sm transition-all duration-150
//               ${tab === t.id 
//                 ? 'bg-white text-gray-800 shadow-sm' 
//                 : 'bg-transparent text-gray-500'
//               }
//             `}
//           >
//             {t.label}
//           </button>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
//         {/* Scanner */}
//         <div>
//           <div className="bg-white rounded-xl p-5 md:p-6 lg:p-7 border border-gray-200 mb-4 md:mb-5">
//             {tab === "qr" ? (
//               <>
//                 <label className="block font-semibold text-xs md:text-sm text-gray-700 mb-2">QR CODE VALUE</label>
//                 <input
//                   value={qrInput} 
//                   onChange={e => setQrInput(e.target.value)}
//                   onKeyDown={e => handleKey(e, handleQR)}
//                   placeholder="Scan or paste QR code..."
//                   autoFocus
//                   className="w-full p-3 md:p-3.5 rounded-lg border-2 border-gray-200 text-sm md:text-base font-mono outline-none mb-3 md:mb-3.5 text-gray-800 focus:border-blue-500"
//                 />
//                 <button 
//                   onClick={handleQR} 
//                   disabled={loading || !qrInput.trim()}
//                   className={`
//                     w-full py-3 md:py-3.5 rounded-lg border-none font-bold text-sm md:text-base
//                     ${!qrInput.trim() 
//                       ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
//                       : 'bg-green-600 text-white cursor-pointer hover:bg-green-700 transition-colors'
//                     }
//                   `}
//                 >
//                   {loading ? "Checking..." : "✓ Check In"}
//                 </button>
//               </>
//             ) : (
//               <>
//                 <label className="block font-semibold text-xs md:text-sm text-gray-700 mb-2">RFID UID</label>
//                 <input
//                   value={rfidInput} 
//                   onChange={e => setRfidInput(e.target.value)}
//                   onKeyDown={e => handleKey(e, handleRFID)}
//                   placeholder="Scan RFID card (e.g. A1B2C3D4)..."
//                   autoFocus
//                   className="w-full p-3 md:p-3.5 rounded-lg border-2 border-blue-200 text-sm md:text-base font-mono outline-none mb-2.5 text-gray-800 focus:border-blue-500"
//                 />
//                 <label className="block font-semibold text-xs md:text-sm text-gray-700 mb-2">BUS ID (optional)</label>
//                 <input
//                   value={busId} 
//                   onChange={e => setBusId(e.target.value)}
//                   placeholder="Filter by bus ID..."
//                   className="w-full p-2.5 md:p-3 rounded-lg border border-gray-200 text-sm md:text-base outline-none mb-3 md:mb-3.5 text-gray-800 focus:border-blue-500"
//                 />
//                 <button 
//                   onClick={handleRFID} 
//                   disabled={loading || !rfidInput.trim()}
//                   className={`
//                     w-full py-3 md:py-3.5 rounded-lg border-none font-bold text-sm md:text-base
//                     ${!rfidInput.trim() 
//                       ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
//                       : 'bg-cyan-700 text-white cursor-pointer hover:bg-cyan-800 transition-colors'
//                     }
//                   `}
//                 >
//                   {loading ? "Checking..." : "🏷️ Check In Child"}
//                 </button>
//               </>
//             )}
//           </div>

//           {/* Result */}
//           {result && (
//             <div className="bg-green-50 border border-green-200 rounded-xl p-4 md:p-5">
//               <div className="flex gap-3 items-start">
//                 <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-green-600 flex items-center justify-center text-xl md:text-2xl text-white flex-shrink-0">
//                   ✓
//                 </div>
//                 <div>
//                   <div className="font-bold text-sm md:text-base text-green-800">Check-in Successful!</div>
//                   <div className="text-xs md:text-sm text-green-800 mt-1">{result.message}</div>
//                   {result.passenger && (
//                     <div className="mt-2 text-xs md:text-sm text-green-800">
//                       <div>Seat: <strong>{result.passenger.seatNumber}</strong></div>
//                       <div>Type: {result.passenger.type}</div>
//                       {result.bus && <div>Bus: {result.bus.busNumber}</div>}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-5 flex gap-3 items-center">
//               <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-red-600 flex items-center justify-center text-xl md:text-2xl text-white flex-shrink-0">
//                 ✕
//               </div>
//               <div>
//                 <div className="font-bold text-sm md:text-base text-red-700">Check-in Failed</div>
//                 <div className="text-xs md:text-sm text-red-800 mt-1">{error}</div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Recent scans */}
//         <div>
//           <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200">
//             <h3 className="m-0 mb-4 text-base md:text-lg font-bold text-gray-800">Recent Scans</h3>
//             {recentScans.length === 0 ? (
//               <div className="text-center py-6 md:py-8 text-gray-400">
//                 <div className="text-2xl md:text-3xl mb-2">📋</div>
//                 <p className="m-0 text-sm">No scans yet</p>
//               </div>
//             ) : (
//               <div className="flex flex-col gap-2">
//                 {recentScans.map((s, i) => (
//                   <div 
//                     key={i} 
//                     className={`
//                       flex justify-between items-center p-2.5 md:p-3 rounded-lg border
//                       ${s.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
//                     `}
//                   >
//                     <div className="flex gap-2 md:gap-2.5 items-center">
//                       <span className="text-sm md:text-base">{s.success ? "✓" : "✕"}</span>
//                       <div>
//                         <div className={`font-semibold text-xs md:text-sm ${s.success ? 'text-green-800' : 'text-red-700'}`}>
//                           {s.name || "Unknown"}
//                         </div>
//                         {s.seat && <div className="text-[10px] md:text-xs text-gray-400">Seat {s.seat}</div>}
//                       </div>
//                     </div>
//                     <div className="text-[10px] md:text-xs text-gray-400">
//                       {s.time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { apiPost } from "../../api";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function CheckIn() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") === "rfid" ? "rfid" : "qr");
  const [qrInput, setQrInput] = useState("");
  const [rfidInput, setRfidInput] = useState("");
  const [busId, setBusId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const scannerRef = useRef(null);
  const qrScannerContainerRef = useRef(null);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  const startQrScanner = () => {
    if (!qrScannerContainerRef.current) return;
    
    setCameraError("");
    
    // Clear existing scanner if any
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    
    try {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButton: true,
          formatsToSupport: [Html5QrcodeScanner.QRCODE],
        },
        false
      );
      
      scannerRef.current.render(
        (decodedText) => {
          // Success callback - QR code detected
          handleQRScan(decodedText);
          // Pause scanner after successful scan
          scannerRef.current.pause();
        },
        (errorMessage) => {
          // Error callback - usually no QR found, ignore
          console.log("QR scan in progress...");
        }
      );
    } catch (err) {
      console.error("Error starting QR scanner:", err);
      setCameraError("Failed to access camera. Please check permissions or use manual input.");
      setScanning(false);
    }
  };

  const handleQRScan = async (qrCode) => {
    if (!qrCode) return;
    if (loading) return; // Prevent multiple scans
    
    setLoading(true);
    setResult(null);
    setError("");
    
    const data = await apiPost("/checkin/qr", { qrCode: qrCode.trim() });
    setLoading(false);
    
    if (data.success) {
      setResult({ ...data, type: "qr" });
      setRecentScans(p => [
        { 
          name: data.passenger?.name, 
          seat: data.passenger?.seatNumber, 
          success: true, 
          time: new Date() 
        }, 
        ...p.slice(0, 9)
      ]);
      setQrInput("");
      
      // Stop scanning after successful check-in
      stopScanner();
    } else {
      setError(data.message);
      setRecentScans(p => [
        { 
          name: qrCode.substring(0, 8) + "...", 
          success: false, 
          time: new Date() 
        }, 
        ...p.slice(0, 9)
      ]);
      // Resume scanner after failed scan
      if (scannerRef.current) {
        scannerRef.current.resume();
      }
    }
  };

  const handleManualQR = async () => {
    if (!qrInput.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    const data = await apiPost("/checkin/qr", { qrCode: qrInput.trim() });
    setLoading(false);
    if (data.success) {
      setResult({ ...data, type: "qr" });
      setRecentScans(p => [{ 
        name: data.passenger?.name, 
        seat: data.passenger?.seatNumber, 
        success: true, 
        time: new Date() 
      }, ...p.slice(0, 9)]);
      setQrInput("");
    } else {
      setError(data.message);
      setRecentScans(p => [{ 
        name: qrInput.substring(0, 8) + "...", 
        success: false, 
        time: new Date() 
      }, ...p.slice(0, 9)]);
    }
  };

  const handleRFID = async () => {
    if (!rfidInput.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    const data = await apiPost("/checkin/rfid", { rfidUid: rfidInput.trim(), busId: busId || undefined });
    setLoading(false);
    if (data.success) {
      setResult({ ...data, type: "rfid" });
      setRecentScans(p => [{ 
        name: data.passenger?.name, 
        seat: data.passenger?.seatNumber, 
        success: true, 
        time: new Date() 
      }, ...p.slice(0, 9)]);
      setRfidInput("");
    } else {
      setError(data.message);
      setRecentScans(p => [{ 
        name: rfidInput, 
        success: false, 
        time: new Date() 
      }, ...p.slice(0, 9)]);
    }
  };

  const handleKey = (e, fn) => { 
    if (e.key === "Enter") fn(); 
  };

  const startScanner = () => {
    setScanning(true);
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      startQrScanner();
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
    setCameraError("");
  };

  return (
    <div>
      <div className="mb-6 md:mb-7">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 m-0 mb-1">Passenger Check-in</h1>
        <p className="text-gray-500 m-0 text-sm md:text-base">Scan QR codes or RFID cards to check in passengers</p>
      </div>

      {/* Tab switch */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-5 md:mb-6 w-fit">
        {[
          { id: "qr", label: "📱 QR Code (Adult)" }, 
          { id: "rfid", label: "🏷️ RFID (Child)" }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => { 
              setTab(t.id); 
              setResult(null); 
              setError("");
              if (scanning) {
                stopScanner();
              }
            }}
            className={`
              px-3 md:px-5 py-2 md:py-2.5 rounded-lg border-none cursor-pointer font-semibold text-xs md:text-sm transition-all duration-150
              ${tab === t.id 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'bg-transparent text-gray-500'
              }
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
        {/* Scanner */}
        <div>
          {tab === "qr" && (
            <div className="mb-4">
              {/* Camera Scanner Button */}
              {!scanning ? (
                <button
                  onClick={startScanner}
                  className="w-full py-3 mb-4 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-700 font-bold text-sm md:text-base cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                  📷 Open Camera to Scan QR
                </button>
              ) : (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-700">Scan QR Code</span>
                    <button
                      onClick={stopScanner}
                      className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold cursor-pointer hover:bg-red-200"
                    >
                      Close Camera
                    </button>
                  </div>
                  
                  {cameraError ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">📷</div>
                      <p className="text-red-700 text-sm mb-3">{cameraError}</p>
                      <button
                        onClick={startScanner}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <div 
                      id="qr-reader" 
                      ref={qrScannerContainerRef}
                      className="w-full border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-900"
                      style={{ minHeight: "320px" }}
                    ></div>
                  )}
                  
                  <div className="mt-2 text-center text-xs text-gray-500">
                    Position QR code within the camera frame
                  </div>
                </div>
              )}

              {/* Manual QR Input */}
              <div className="bg-white rounded-xl p-5 md:p-6 lg:p-7 border border-gray-200">
                <label className="block font-semibold text-xs md:text-sm text-gray-700 mb-2">OR Enter QR Code Manually</label>
                <input
                  value={qrInput} 
                  onChange={e => setQrInput(e.target.value)}
                  onKeyDown={e => handleKey(e, handleManualQR)}
                  placeholder="Scan or paste QR code..."
                  autoFocus={!scanning}
                  className="w-full p-3 md:p-3.5 rounded-lg border-2 border-gray-200 text-sm md:text-base font-mono outline-none mb-3 md:mb-3.5 text-gray-800 focus:border-blue-500"
                />
                <button 
                  onClick={handleManualQR} 
                  disabled={loading || !qrInput.trim()}
                  className={`
                    w-full py-3 md:py-3.5 rounded-lg border-none font-bold text-sm md:text-base
                    ${!qrInput.trim() 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 text-white cursor-pointer hover:bg-green-700 transition-colors'
                    }
                  `}
                >
                  {loading ? "Checking..." : "✓ Check In"}
                </button>
              </div>
            </div>
          )}

          {tab === "rfid" && (
            <div className="bg-white rounded-xl p-5 md:p-6 lg:p-7 border border-gray-200">
              <label className="block font-semibold text-xs md:text-sm text-gray-700 mb-2">RFID UID</label>
              <input
                value={rfidInput} 
                onChange={e => setRfidInput(e.target.value)}
                onKeyDown={e => handleKey(e, handleRFID)}
                placeholder="Scan RFID card (e.g. A1B2C3D4)..."
                autoFocus
                className="w-full p-3 md:p-3.5 rounded-lg border-2 border-blue-200 text-sm md:text-base font-mono outline-none mb-2.5 text-gray-800 focus:border-blue-500"
              />
              <label className="block font-semibold text-xs md:text-sm text-gray-700 mb-2">BUS ID (optional)</label>
              <input
                value={busId} 
                onChange={e => setBusId(e.target.value)}
                placeholder="Filter by bus ID..."
                className="w-full p-2.5 md:p-3 rounded-lg border border-gray-200 text-sm md:text-base outline-none mb-3 md:mb-3.5 text-gray-800 focus:border-blue-500"
              />
              <button 
                onClick={handleRFID} 
                disabled={loading || !rfidInput.trim()}
                className={`
                  w-full py-3 md:py-3.5 rounded-lg border-none font-bold text-sm md:text-base
                  ${!rfidInput.trim() 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-cyan-700 text-white cursor-pointer hover:bg-cyan-800 transition-colors'
                  }
                `}
              >
                {loading ? "Checking..." : "🏷️ Check In Child"}
              </button>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 md:p-5">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-green-600 flex items-center justify-center text-xl md:text-2xl text-white flex-shrink-0">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-sm md:text-base text-green-800">Check-in Successful!</div>
                  <div className="text-xs md:text-sm text-green-800 mt-1">{result.message}</div>
                  {result.passenger && (
                    <div className="mt-2 text-xs md:text-sm text-green-800">
                      <div>Seat: <strong>{result.passenger.seatNumber}</strong></div>
                      <div>Type: {result.passenger.type}</div>
                      {result.bus && <div>Bus: {result.bus.busNumber}</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 md:p-5 flex gap-3 items-center">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-red-600 flex items-center justify-center text-xl md:text-2xl text-white flex-shrink-0">
                ✕
              </div>
              <div>
                <div className="font-bold text-sm md:text-base text-red-700">Check-in Failed</div>
                <div className="text-xs md:text-sm text-red-800 mt-1">{error}</div>
              </div>
            </div>
          )}
        </div>

        {/* Recent scans */}
        <div>
          <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200">
            <h3 className="m-0 mb-4 text-base md:text-lg font-bold text-gray-800">Recent Scans</h3>
            {recentScans.length === 0 ? (
              <div className="text-center py-6 md:py-8 text-gray-400">
                <div className="text-2xl md:text-3xl mb-2">📋</div>
                <p className="m-0 text-sm">No scans yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentScans.map((s, i) => (
                  <div 
                    key={i} 
                    className={`
                      flex justify-between items-center p-2.5 md:p-3 rounded-lg border
                      ${s.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
                    `}
                  >
                    <div className="flex gap-2 md:gap-2.5 items-center">
                      <span className="text-sm md:text-base">{s.success ? "✓" : "✕"}</span>
                      <div>
                        <div className={`font-semibold text-xs md:text-sm ${s.success ? 'text-green-800' : 'text-red-700'}`}>
                          {s.name || "Unknown"}
                        </div>
                        {s.seat && <div className="text-[10px] md:text-xs text-gray-400">Seat {s.seat}</div>}
                      </div>
                    </div>
                    <div className="text-[10px] md:text-xs text-gray-400">
                      {s.time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        #qr-reader {
          width: 100%;
          background: #000;
        }
        #qr-reader video {
          width: 100%;
          height: auto;
        }
        #qr-reader__dashboard {
          padding: 12px;
          background: #1f2937;
          color: white;
        }
        #qr-reader__dashboard button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          margin: 4px;
        }
        #qr-reader__dashboard button:hover {
          background: #2563eb;
        }
        .torch-button {
          background: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
}