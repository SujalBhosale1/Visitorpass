import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Visitor from "./pages/Visitor";
import Appointment from "./pages/Appointment";
import Pass from "./pages/Pass";
import Scanner from "./pages/Scanner";
import Navbar from "./components/Navbar";

// Show navbar on all pages except login and register
function Layout({ children }) {
  const location = useLocation();
  const noNavbar = ["/", "/register"];
  const showNav = !noNavbar.includes(location.pathname);

  return (
    <>
      {showNav && <Navbar />}
      {children}
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/visitors" element={<Visitor />} />
          <Route path="/appointments" element={<Appointment />} />
          <Route path="/passes" element={<Pass />} />
          <Route path="/scanner" element={<Scanner />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;