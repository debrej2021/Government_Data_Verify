import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom"
import IndiaEconomyDashboard from "./components/IndiaEconomyDashboard"
import UnemploymentModule from "./components/UnemploymentModule"
import PoliticalModule from "./components/PoliticalModule"
import AspirationalDistrictsModule from "./components/AspirationalDistrictsModule"
import GlobalFooter from "./components/GlobalFooter"

function Nav() {
  const linkStyle = ({ isActive }) => ({
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11, letterSpacing: 2,
    padding: "14px 24px",
    textDecoration: "none",
    borderBottom: isActive ? "2px solid #ff6b00" : "2px solid transparent",
    color: isActive ? "#ff6b00" : "#444",
    transition: "all 0.15s"
  })

  return (
    <nav style={{
      background: "#080808",
      borderBottom: "1px solid #1a1a1a",
      display: "flex", alignItems: "center",
      padding: "0 40px", gap: 8,
      position: "sticky", top: 0, zIndex: 100
    }}>
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 20, color: "#ff6b00",
        letterSpacing: 4, marginRight: 32
      }}>
        FACTS & TRUTH
      </span>
      <NavLink to="/"          style={linkStyle}>ECONOMY</NavLink>
      <NavLink to="/jobs"      style={linkStyle}>UNEMPLOYMENT</NavLink>
      <NavLink to="/political" style={linkStyle}>POLITICAL</NavLink>
      <NavLink to="/social"    style={linkStyle}>SOCIAL</NavLink>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/"          element={<IndiaEconomyDashboard />} />
        <Route path="/jobs"      element={<UnemploymentModule />} />
        <Route path="/political" element={<PoliticalModule />} />
        <Route path="/social"    element={<AspirationalDistrictsModule />} />
      </Routes>
      <GlobalFooter />
    </BrowserRouter>
  )
}