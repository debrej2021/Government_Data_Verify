import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

// ─── Embedded fallback data (MOSPI / RBI sourced) ──────────────────────────
const STATE_GDP_DATA = [
  { state: "Maharashtra",   gdp_2022: 3337169, gdp_2021: 2889204, gdp_2020: 2602573 },
  { state: "Tamil Nadu",    gdp_2022: 2414681, gdp_2021: 2090484, gdp_2020: 1882754 },
  { state: "Uttar Pradesh", gdp_2022: 2207906, gdp_2021: 1926427, gdp_2020: 1742193 },
  { state: "Karnataka",     gdp_2022: 2189744, gdp_2021: 1893432, gdp_2020: 1694301 },
  { state: "Gujarat",       gdp_2022: 2074418, gdp_2021: 1792931, gdp_2020: 1613094 },
  { state: "West Bengal",   gdp_2022: 1598349, gdp_2021: 1395271, gdp_2020: 1259823 },
  { state: "Rajasthan",     gdp_2022: 1421994, gdp_2021: 1247619, gdp_2020: 1133371 },
  { state: "Andhra Pradesh",gdp_2022: 1363755, gdp_2021: 1190087, gdp_2020: 1074391 },
  { state: "Telangana",     gdp_2022: 1320431, gdp_2021: 1142876, gdp_2020: 1018721 },
  { state: "Madhya Pradesh",gdp_2022: 1286410, gdp_2021: 1131204, gdp_2020: 1023879 },
  { state: "Kerala",        gdp_2022: 1025948, gdp_2021:  901723, gdp_2020:  818642 },
  { state: "Haryana",       gdp_2022:  970123, gdp_2021:  851307, gdp_2020:  773910 },
  { state: "Bihar",         gdp_2022:  803741, gdp_2021:  712093, gdp_2020:  647382 },
  { state: "Odisha",        gdp_2022:  701847, gdp_2021:  621038, gdp_2020:  563928 },
  { state: "Punjab",        gdp_2022:  683912, gdp_2021:  601437, gdp_2020:  549102 },
];

// ─── data.gov.in API ───────────────────────────────────────────────────────
const RESOURCE_ID = "ab40c054-5031-4376-b52e-9813e776f65e";
const API_KEY     = import.meta.env.VITE_DATA_GOV_KEY;

const STATE_KEYS = [
  { id: "maharashtra",     name: "Maharashtra" },
  { id: "tamil_nadu",      name: "Tamil Nadu" },
  { id: "uttar_pradesh",   name: "Uttar Pradesh" },
  { id: "karnataka",       name: "Karnataka" },
  { id: "gujarat",         name: "Gujarat" },
  { id: "west_bengal1",    name: "West Bengal" },
  { id: "rajasthan",       name: "Rajasthan" },
  { id: "andhra_pradesh_", name: "Andhra Pradesh" },
  { id: "telangana",       name: "Telangana" },
  { id: "madhya_pradesh",  name: "Madhya Pradesh" },
  { id: "kerala",          name: "Kerala" },
  { id: "haryana",         name: "Haryana" },
  { id: "bihar",           name: "Bihar" },
  { id: "odisha",          name: "Odisha" },
  { id: "punjab",          name: "Punjab" },
];

async function fetchLiveGDP() {
  const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=11`;
  const res  = await fetch(url);
  const json = await res.json();
  const records = json.records;

  const sorted = records.sort((a, b) =>
    a.duration.localeCompare(b.duration)
  );

  // Use Maharashtra as anchor — only records where it has valid numeric data
  const clean = sorted.filter(r => parseFloat(r.maharashtra) > 0);

  const latest = clean[clean.length - 1];
  const prev1  = clean[clean.length - 2];
  const prev2  = clean[clean.length - 3];

  return STATE_KEYS
  .map(s => ({
    state:    s.name,
    gdp_2022: parseFloat((latest[s.id] || "0").replace(/,/g, "")) || 0,
    gdp_2021: parseFloat((prev1[s.id]  || "0").replace(/,/g, "")) || 0,
    gdp_2020: parseFloat((prev2[s.id]  || "0").replace(/,/g, "")) || 0,
    year:     latest.duration,
  }))
  .filter(s => s.gdp_2022 > 0);
}

// ─── Tooltips ──────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0d0d0d", border: "1px solid #ff6b00",
      padding: "10px 14px", borderRadius: 4,
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 12
    }}>
      <p style={{ color: "#ff6b00", margin: 0, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: "#e0e0e0", margin: 0 }}>
          {p.name}: ₹{Number(p.value).toLocaleString("en-IN")} Cr
        </p>
      ))}
    </div>
  );
};

const GrowthTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0d0d0d", border: "1px solid #00c896",
      padding: "10px 14px", borderRadius: 4,
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 12
    }}>
      <p style={{ color: "#00c896", margin: 0, marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#e0e0e0", margin: 0 }}>YoY Growth: {payload[0].value}%</p>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
export default function IndiaEconomyDashboard() {
  const [tab,      setTab]      = useState("gdp");
  const [loading,  setLoading]  = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [error,    setError]    = useState(null);
  const [apiData,  setApiData]  = useState(null);
  const [liveYear, setLiveYear] = useState(null);
  const [hovered,  setHovered]  = useState(null);

  const displayData = (liveMode && apiData) ? apiData : STATE_GDP_DATA;

  // Recompute growth dynamically from whatever data is displayed
  const growthData = displayData.map(d => ({
    state: d.state.length > 10 ? d.state.slice(0, 10) + "…" : d.state,
    growth: d.gdp_2021 > 0
      ? (((d.gdp_2022 - d.gdp_2021) / d.gdp_2021) * 100).toFixed(1)
      : "0",
  })).sort((a, b) => b.growth - a.growth);

  const handleLiveToggle = async () => {
    if (liveMode) { setLiveMode(false); return; }
    setLoading(true); setError(null);
    try {
      const records = await fetchLiveGDP();
      setApiData(records);
      setLiveYear(records[0]?.year || null);
      setLiveMode(true);
    } catch {
      setError("Failed to fetch. Check VITE_DATA_GOV_KEY in .env");
    } finally { setLoading(false); }
  };

  const totalGDP  = displayData.reduce((s, d) => s + d.gdp_2022, 0);
  const topGrowth = growthData[0]?.growth || "0";
  const yearLabel = liveMode && liveYear ? liveYear : "2022–23";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      color: "#e0e0e0",
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      {/* <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;600&family=Bebas+Neue&display=swap" rel="stylesheet" /> */}

      {/* ── Header ── */}
      <div style={{
        borderBottom: "1px solid #1a1a1a",
        padding: "28px 40px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end"
      }}>
        <div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 42, letterSpacing: 4,
            color: "#ff6b00", lineHeight: 1
          }}>
            INDIA ECONOMY
          </div>
          <div style={{ fontSize: 12, color: "#555", letterSpacing: 3, marginTop: 4 }}>
            STATE-WISE GDP INTELLIGENCE · MOSPI / DATA.GOV.IN
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {error && (
            <span style={{ fontSize: 11, color: "#ff4444", fontFamily: "monospace" }}>
              ⚠ {error}
            </span>
          )}
          <button onClick={handleLiveToggle} disabled={loading} style={{
            background: liveMode ? "#ff6b00" : "transparent",
            border: `1px solid ${liveMode ? "#ff6b00" : "#333"}`,
            color: liveMode ? "#000" : "#666",
            padding: "6px 16px", borderRadius: 2,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11, cursor: "pointer", letterSpacing: 2,
            transition: "all 0.2s"
          }}>
            {loading ? "LOADING…" : liveMode ? "● LIVE API" : "○ EMBEDDED"}
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        borderBottom: "1px solid #1a1a1a"
      }}>
        {[
          { label: "STATES TRACKED", value: displayData.length },
          { label: "COMBINED GSDP",  value: `₹${(totalGDP / 100000).toFixed(1)}L Cr` },
          { label: "TOP STATE",       value: "Maharashtra" },
          { label: "HIGHEST GROWTH", value: `${topGrowth}%`, unit: "YoY" },
        ].map((kpi, i) => (
          <div key={i} style={{
            padding: "20px 32px",
            borderRight: i < 3 ? "1px solid #1a1a1a" : "none"
          }}>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: 3, marginBottom: 6 }}>
              {kpi.label}
            </div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 28, color: "#ff6b00", letterSpacing: 2
            }}>
              {kpi.value}
              {kpi.unit && (
                <span style={{ fontSize: 14, color: "#555", marginLeft: 6 }}>{kpi.unit}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab Nav ── */}
      <div style={{
        display: "flex", borderBottom: "1px solid #1a1a1a",
        padding: "0 40px"
      }}>
        {[
          { id: "gdp",    label: "GSDP COMPARISON" },
          { id: "growth", label: "YoY GROWTH RATE" },
          { id: "share",  label: "GDP SHARE %" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none",
            borderBottom: tab === t.id ? "2px solid #ff6b00" : "2px solid transparent",
            color: tab === t.id ? "#ff6b00" : "#444",
            padding: "14px 20px", cursor: "pointer",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11, letterSpacing: 2,
            marginBottom: -1, transition: "all 0.15s"
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Chart Area ── */}
      <div style={{ padding: "32px 40px" }}>

        {tab === "gdp" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 20 }}>
              GROSS STATE DOMESTIC PRODUCT AT CURRENT PRICES · ₹ CRORE · FY {yearLabel}
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={displayData} margin={{ top: 0, right: 0, left: 20, bottom: 60 }}>
                <CartesianGrid stroke="#111" vertical={false} />
                <XAxis
                  dataKey="state"
                  tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                  angle={-40} textAnchor="end" interval={0}
                  tickLine={false} axisLine={{ stroke: "#1a1a1a" }}
                />
                <YAxis
                  tickFormatter={v => `₹${(v / 100000).toFixed(1)}L Cr`}
                  tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                  tickLine={false} axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#111" }} />
                <Bar dataKey="gdp_2022" name={`FY ${yearLabel}`} radius={[2, 2, 0, 0]}>
                  {displayData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={hovered === i ? "#ff6b00" : "#ff6b0040"}
                      stroke={hovered === i ? "#ff6b00" : "transparent"}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {tab === "growth" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 20 }}>
              YEAR-ON-YEAR GROWTH RATE · RANKED · FY {yearLabel}
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={growthData} margin={{ top: 0, right: 0, left: 10, bottom: 60 }}>
                <CartesianGrid stroke="#111" vertical={false} />
                <XAxis
                  dataKey="state"
                  tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                  angle={-40} textAnchor="end" interval={0}
                  tickLine={false} axisLine={{ stroke: "#1a1a1a" }}
                />
                <YAxis
                  tickFormatter={v => `${v}%`}
                  tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                  tickLine={false} axisLine={false}
                />
                <Tooltip content={<GrowthTooltip />} cursor={{ fill: "#111" }} />
                <Bar dataKey="growth" name="Growth %" radius={[2, 2, 0, 0]}>
                  {growthData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.growth > 15 ? "#00c896" : d.growth > 12 ? "#00c89670" : "#00c89630"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {tab === "share" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 20 }}>
              SHARE OF COMBINED GSDP · TOP 15 STATES · FY {yearLabel}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              {[...displayData]
                .sort((a, b) => b.gdp_2022 - a.gdp_2022)
                .map((d, i) => {
                  const pct = ((d.gdp_2022 / totalGDP) * 100).toFixed(1);
                  return (
                    <div key={i} style={{
                      padding: "14px 20px",
                      background: hovered === i ? "#0f0f0f" : "transparent",
                      borderBottom: "1px solid #111",
                      display: "flex", alignItems: "center", gap: 16,
                      cursor: "default", transition: "background 0.1s"
                    }}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <span style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 22, color: "#222", minWidth: 32
                      }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: "#ccc", marginBottom: 6 }}>
                          {d.state}
                        </div>
                        <div style={{
                          height: 3, background: "#111", borderRadius: 2, overflow: "hidden"
                        }}>
                          <div style={{
                            height: "100%", width: `${pct * 3}%`,
                            background: `hsl(${20 + i * 8}, 80%, 55%)`,
                            borderRadius: 2, transition: "width 0.6s ease"
                          }} />
                        </div>
                      </div>
                      <span style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 13, color: "#ff6b00", minWidth: 48, textAlign: "right"
                      }}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{
        borderTop: "1px solid #111", padding: "16px 40px",
        display: "flex", justifyContent: "space-between",
        fontSize: 10, color: "#333", fontFamily: "'IBM Plex Mono', monospace",
        letterSpacing: 2
      }}>
        <span>SOURCE · MOSPI / STATE DES / DATA.GOV.IN {liveMode ? "· LIVE" : "· EMBEDDED"}</span>
        <span>INSIGHTS.DEBPROD.COM · {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
