import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h1>Visitor Pass System</h1>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/visitors">Visitors</Link>
      <Link to="/appointments">Appointments</Link>
      <Link to="/passes">Passes</Link>
      <Link to="/scanner">Scanner</Link>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;
