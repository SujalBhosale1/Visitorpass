import { useState, useEffect } from "react";
import axios from "axios";

function Appointment() {
  const [visitors, setVisitors] = useState([]);
  const [visitorId, setVisitorId] = useState("");
  const [hostId, setHostId] = useState("");
  const [date, setDate] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [msg, setMsg] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchVisitors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/visitors", { headers });
      setVisitors(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/appointments", { headers });
      setAppointments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchVisitors();
    fetchAppointments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await axios.post(
        "http://localhost:5000/api/appointments",
        { visitorId, hostId, date },
        { headers }
      );
      setMsg("Appointment created.");
      fetchAppointments();
    } catch (err) {
      setMsg("Error: " + (err.response?.data?.error || "Could not create appointment"));
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/approve/${id}`, {}, { headers });
      fetchAppointments();
    } catch (err) {
      alert("Could not approve: " + err.response?.data?.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/reject/${id}`, {}, { headers });
      fetchAppointments();
    } catch (err) {
      alert("Could not reject: " + err.response?.data?.message);
    }
  };

  return (
    <div className="page">
      <h2>Appointments</h2>

      {/* Create Appointment */}
      <div className="card">
        <h3>Create New Appointment</h3>
        {msg && (
          <div className={`msg ${msg.startsWith("Error") ? "msg-error" : "msg-success"}`}>
            {msg}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Visitor</label>
            <select value={visitorId} onChange={(e) => setVisitorId(e.target.value)} required>
              <option value="">-- Pick a visitor --</option>
              {visitors.map((v) => (
                <option key={v._id} value={v._id}>{v.name} ({v.email || v.phone})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Host Employee ID</label>
            <input
              type="text"
              placeholder="Paste the user ID of the host"
              value={hostId}
              onChange={(e) => setHostId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Appointment Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">Create Appointment</button>
        </form>
      </div>

      {/* Appointment List */}
      <h3>All Appointments ({appointments.length})</h3>

      {appointments.length === 0 && (
        <p style={{ color: "#777", fontSize: "14px" }}>No appointments yet.</p>
      )}

      {appointments.map((a) => (
        <div key={a._id} className="appt-item">
          <div>
            <p><strong>Visitor:</strong> {a.visitorId?.name || "Unknown"}</p>
            <p><strong>Host:</strong> {a.hostId?.name || "Unknown"}</p>
            <p><strong>Date:</strong> {new Date(a.date).toLocaleDateString()}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`badge badge-${a.status}`}>{a.status}</span>
            </p>
            <p style={{ fontSize: 12, color: "#999" }}>ID: {a._id}</p>
          </div>

          {a.status === "pending" && (
            <div className="appt-actions">
              <button className="btn btn-success btn-sm" onClick={() => handleApprove(a._id)}>
                Approve
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleReject(a._id)}>
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Appointment;