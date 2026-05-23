import { BrowserRouter, Routes, Route, NavLink, useSearchParams } from "react-router-dom"
import IndiaEconomyDashboard from "./components/IndiaEconomyDashboard"
import UnemploymentModule from "./components/UnemploymentModule"
import PoliticalModule from "./components/PoliticalModule"
import AspirationalDistrictsModule from "./components/AspirationalDistrictsModule"
import HealthGapsModule from "./components/HealthGapsModule"
import CrimesModule from "./components/CrimesModule"
import NREGAModule from "./components/NREGAModule"
import SexualViolenceModule from "./components/SexualViolenceModule"
import GlobalFooter from "./components/GlobalFooter"
import GlobalSearch from "./components/GlobalSearch"

function Nav() {
  const [searchParams] = useSearchParams();
  const activeState = searchParams.get('state');

  const linkStyle = ({ isActive }) => ({
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11, letterSpacing: 2,
    padding: "14px 20px",
    textDecoration: "none",
    borderBottom: isActive ? "2px solid #ff6b00" : "2px solid transparent",
    color: isActive ? "#ff6b00" : "#444",
    transition: "all 0.15s",
    whiteSpace: "nowrap"
  })

  return (
    <nav style={{
      background: "#080808",
      borderBottom: "1px solid #1a1a1a",
      display: "flex", alignItems: "center",
      padding: "0 24px 0 40px", gap: 4,
      position: "sticky", top: 0, zIndex: 100,
      overflowX: "auto"
    }}>
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 20, color: "#ff6b00",
        letterSpacing: 4, marginRight: 24,
        whiteSpace: "nowrap"
      }}>
        FACTS & TRUTH
      </span>
      <NavLink to="/"            style={linkStyle}>ECONOMY</NavLink>
      <NavLink to="/jobs"        style={linkStyle}>UNEMPLOYMENT</NavLink>
      <NavLink to="/political"   style={linkStyle}>POLITICAL</NavLink>
      <NavLink to="/social"      style={linkStyle}>DISTRICTS</NavLink>
      <NavLink to="/health"      style={linkStyle}>HEALTH</NavLink>
      <NavLink to="/crimes"      style={linkStyle}>CRIMES</NavLink>
      <NavLink to="/nrega"       style={linkStyle}>NREGA</NavLink>
      <NavLink to="/trafficking" style={linkStyle}>TRAFFICKING</NavLink>
      <GlobalSearch />
      {activeState && (
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
          color: '#ff6b00', background: '#ff6b0011',
          border: '1px solid #ff6b0033', padding: '3px 8px',
          borderRadius: 2, whiteSpace: 'nowrap', flexShrink: 0,
        }}>&#9677; {activeState}</span>
      )}
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/"            element={<IndiaEconomyDashboard />} />
        <Route path="/jobs"        element={<UnemploymentModule />} />
        <Route path="/political"   element={<PoliticalModule />} />
        <Route path="/social"      element={<AspirationalDistrictsModule />} />
        <Route path="/health"      element={<HealthGapsModule />} />
        <Route path="/crimes"      element={<CrimesModule />} />
        <Route path="/nrega"       element={<NREGAModule />} />
        <Route path="/trafficking" element={<SexualViolenceModule />} />
      </Routes>
      <GlobalFooter />
    </BrowserRouter>
  )
}
