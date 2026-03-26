import { useState, useEffect } from "react";
import axios from "axios";

function Visitor() {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [photo, setPhoto] = useState(null);
  const [visitors, setVisitors] = useState([]);
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

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("phone", form.phone);
    formData.append("email", form.email);
    if (photo) formData.append("photo", photo);

    try {
      await axios.post("http://localhost:5000/api/visitors", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setMsg("Visitor added successfully.");
      setForm({ name: "", phone: "", email: "" });
      setPhoto(null);
      fetchVisitors();
    } catch (err) {
      setMsg("Error: " + (err.response?.data?.error || "Could not add visitor"));
    }
  };

  return (
    <div className="page">
      <h2>Visitors</h2>

      {/* Add Visitor Form */}
      <div className="card">
        <h3>Add New Visitor</h3>
        {msg && (
          <div className={`msg ${msg.startsWith("Error") ? "msg-error" : "msg-success"}`}>
            {msg}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              name="name"
              placeholder="Visitor's full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              name="phone"
              placeholder="Phone number"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Photo (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
            />
          </div>
          <button type="submit" className="btn btn-primary">Add Visitor</button>
        </form>
      </div>

      {/* Visitor List */}
      <h3>Registered Visitors ({visitors.length})</h3>

      {visitors.length === 0 && (
        <p style={{ color: "#777", fontSize: "14px" }}>No visitors registered yet.</p>
      )}

      {visitors.map((v) => (
        <div key={v._id} className="visitor-item">
          {v.photo ? (
            <img src={`http://localhost:5000/${v.photo}`} alt="visitor" />
          ) : (
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                color: "#999"
              }}
            >
              ?
            </div>
          )}
          <div className="visitor-info">
            <p><strong>{v.name}</strong></p>
            <p style={{ color: "#555" }}>{v.email || "No email"} &nbsp;|&nbsp; {v.phone || "No phone"}</p>
            <p style={{ fontSize: 12, color: "#999" }}>ID: {v._id}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Visitor;