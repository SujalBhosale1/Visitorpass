import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard() {
  const [stats, setStats] = useState({
    visitors: 0,
    appointments: 0,
    passes: 0
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    // Fetch counts for each resource
    const loadStats = async () => {
      try {
        const [vRes, aRes, pRes] = await Promise.all([
          axios.get("http://localhost:5000/api/visitors", { headers }),
          axios.get("http://localhost:5000/api/appointments", { headers }),
          axios.get("http://localhost:5000/api/passes", { headers })
        ]);

        setStats({
          visitors: vRes.data.length,
          appointments: aRes.data.length,
          passes: pRes.data.length
        });
      } catch (err) {
        console.log("Could not load stats", err.message);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="page">
      <h2>Dashboard</h2>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.visitors}</div>
          <div className="stat-label">Total Visitors</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.appointments}</div>
          <div className="stat-label">Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.passes}</div>
          <div className="stat-label">Passes Issued</div>
        </div>
      </div>

      {/* Quick navigation */}
      <div className="card">
        <h3>Quick Actions</h3>
        <div className="quick-links">
          <Link to="/visitors" className="btn btn-primary">Add Visitor</Link>
          <Link to="/appointments" className="btn btn-success">New Appointment</Link>
          <Link to="/passes" className="btn btn-primary">Generate Pass</Link>
          <Link to="/scanner" className="btn btn-success">Open Scanner</Link>
        </div>
      </div>

      {/* Info */}
      <div className="card">
        <h3>How it works</h3>
        <ol style={{ paddingLeft: "18px", lineHeight: "1.9", fontSize: "14px", color: "#555" }}>
          <li>Register a visitor under <strong>Visitors</strong></li>
          <li>Create an appointment linking visitor to a host</li>
          <li>Approve the appointment, then generate a pass</li>
          <li>Visitor gets a QR code — scan it at entry/exit</li>
        </ol>
      </div>
    </div>
  );
}

export default Dashboard;