import { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

function Pass() {
  const [visitors, setVisitors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [visitorId, setVisitorId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [pass, setPass] = useState(null);
  const [passes, setPasses] = useState([]);
  const [msg, setMsg] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchDropdowns = async () => {
    try {
      const [vRes, aRes] = await Promise.all([
        axios.get("http://localhost:5000/api/visitors", { headers }),
        axios.get("http://localhost:5000/api/appointments", { headers })
      ]);
      setVisitors(vRes.data);
      // Only show approved appointments
      setAppointments(aRes.data.filter((a) => a.status === "approved"));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchPasses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/passes", { headers });
      setPasses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDropdowns();
    fetchPasses();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setMsg("");
    setPass(null);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/passes/generate",
        {
          visitorId,
          appointmentId,
          validFrom: new Date(),
          validTo: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        { headers }
      );

      setPass(res.data.pass);
      setMsg("Pass generated successfully!");
      fetchPasses();
    } catch (err) {
      setMsg("Error: " + (err.response?.data?.message || "Could not generate pass"));
    }
  };

  return (
    <div className="page">
      <h2>Visitor Passes</h2>

      {/* Generate Pass */}
      <div className="card">
        <h3>Generate New Pass</h3>
        <p style={{ fontSize: "13px", color: "#777", marginBottom: "14px" }}>
          Only approved appointments appear below.
        </p>

        {msg && (
          <div className={`msg ${msg.startsWith("Error") ? "msg-error" : "msg-success"}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label>Select Visitor</label>
            <select value={visitorId} onChange={(e) => setVisitorId(e.target.value)} required>
              <option value="">-- Select visitor --</option>
              {visitors.map((v) => (
                <option key={v._id} value={v._id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Approved Appointment</label>
            <select value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} required>
              <option value="">-- Select appointment --</option>
              {appointments.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.visitorId?.name} — {new Date(a.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary">Generate Pass</button>
        </form>

        {/* Show generated pass */}
        {pass && (
          <div className="pass-display" style={{ marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "16px" }}>
            <h3>Pass Generated</h3>
            <p><strong>Pass ID:</strong> {pass._id}</p>
            <p><strong>Valid Until:</strong> {new Date(pass.validTo).toLocaleString()}</p>
            <QRCodeCanvas value={pass._id} size={180} />
            <br />
            <a
              href={`http://localhost:5000/uploads/pass_${pass._id}.pdf`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-success"
              style={{ marginTop: "10px", display: "inline-block" }}
            >
              Download PDF
            </a>
          </div>
        )}
      </div>

      {/* All passes */}
      <h3>All Passes ({passes.length})</h3>
      {passes.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Valid To</th>
              <th>Status</th>
              <th>QR / PDF</th>
            </tr>
          </thead>
          <tbody>
            {passes.map((p) => (
              <tr key={p._id}>
                <td>{p.visitorId?.name || "N/A"}</td>
                <td>{new Date(p.validTo).toLocaleDateString()}</td>
                <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                <td>
                  <a
                    href={`http://localhost:5000/uploads/pass_${p._id}.pdf`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#2c3e50", fontSize: "13px" }}
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Pass;