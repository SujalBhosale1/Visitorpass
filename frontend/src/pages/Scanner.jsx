import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";

function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const scannerRef = useRef(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const startScanner = async () => {
    setMsg("");
    setResult(null);
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          // Stop after one successful scan
          await scanner.stop();
          setScanning(false);
          setResult(decodedText);

          // Try check-in first, if already checked in try check-out
          try {
            await axios.post(
              "http://localhost:5000/api/logs/check-in",
              { passId: decodedText },
              { headers }
            );
            setMsg("Check-in recorded successfully.");
          } catch (err) {
            const errMsg = err.response?.data?.message || "";

            if (errMsg === "Visitor is already checked in") {
              try {
                await axios.post(
                  "http://localhost:5000/api/logs/check-out",
                  { passId: decodedText },
                  { headers }
                );
                setMsg("Check-out recorded successfully.");
              } catch {
                setMsg("Error: Could not record check-out.");
              }
            } else {
              setMsg("Error: " + errMsg);
            }
          }
        },
        () => {} // ignore per-frame errors
      );

      setScanning(true);
    } catch (err) {
      setMsg("Could not access camera: " + err.message);
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
      }
    } catch {
      // already stopped
    }
    setScanning(false);
  };

  // Cleanup on page leave
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="page">
      <h2>QR Scanner</h2>

      <div className="card scanner-box">
        <p style={{ fontSize: "14px", color: "#555", marginBottom: "16px" }}>
          Scan a visitor's QR code to record their check-in or check-out.
        </p>

        {msg && (
          <div className={`msg ${msg.startsWith("Error") ? "msg-error" : "msg-success"}`}>
            {msg}
          </div>
        )}

        {result && (
          <div className="msg msg-success" style={{ wordBreak: "break-all", fontSize: "12px" }}>
            <strong>Scanned Pass ID:</strong> {result}
          </div>
        )}

        {/* Camera view */}
        <div id="reader" style={{ width: "100%", margin: "10px 0" }}></div>

        {!scanning ? (
          <button className="btn btn-primary" onClick={startScanner} style={{ width: "100%" }}>
            Start Camera
          </button>
        ) : (
          <button className="btn btn-danger" onClick={stopScanner} style={{ width: "100%" }}>
            Stop Camera
          </button>
        )}
      </div>

      {/* Manual check-in/out as fallback */}
      <ManualCheckInOut headers={headers} />
    </div>
  );
}

// Simple manual check-in/out as a backup if no camera
function ManualCheckInOut({ headers }) {
  const [passId, setPassId] = useState("");
  const [msg, setMsg] = useState("");

  const handleCheckIn = async () => {
    if (!passId) return;
    setMsg("");
    try {
      await axios.post("http://localhost:5000/api/logs/check-in", { passId }, { headers });
      setMsg("Check-in recorded.");
    } catch (err) {
      setMsg("Error: " + (err.response?.data?.message || "Failed"));
    }
  };

  const handleCheckOut = async () => {
    if (!passId) return;
    setMsg("");
    try {
      await axios.post("http://localhost:5000/api/logs/check-out", { passId }, { headers });
      setMsg("Check-out recorded.");
    } catch (err) {
      setMsg("Error: " + (err.response?.data?.message || "Failed"));
    }
  };

  return (
    <div className="card" style={{ marginTop: "20px" }}>
      <h3>Manual Entry (Fallback)</h3>
      <p style={{ fontSize: "13px", color: "#777", marginBottom: "12px" }}>
        If camera doesn't work, paste the Pass ID manually.
      </p>

      {msg && (
        <div className={`msg ${msg.startsWith("Error") ? "msg-error" : "msg-success"}`}>
          {msg}
        </div>
      )}

      <div className="form-group">
        <label>Pass ID</label>
        <input
          type="text"
          placeholder="Paste pass ID here"
          value={passId}
          onChange={(e) => setPassId(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button className="btn btn-success" onClick={handleCheckIn}>Check In</button>
        <button className="btn btn-danger" onClick={handleCheckOut}>Check Out</button>
      </div>
    </div>
  );
}

export default Scanner;