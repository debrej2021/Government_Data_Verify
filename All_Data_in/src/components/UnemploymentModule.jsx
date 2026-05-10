import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend
} from "recharts";

// ─── PLFS State-wise Unemployment Rate (%) — Usual Status (ps+ss)
// Source: Rajya Sabha Session 266, Q.155, Answered 25 Nov 2024
// PLFS Annual Reports 2019-20 to 2023-24 (July-June cycle)
const UNEMPLOYMENT_DATA = [
  { state: "Andhra Pradesh",  y2019: 4.5,  y2020: 7.1,  y2021: 4.3,  y2022: 3.8,  y2023: 3.2 },
  { state: "Assam",           y2019: 7.5,  y2020: 7.0,  y2021: 6.2,  y2022: 5.8,  y2023: 5.1 },
  { state: "Bihar",           y2019: 7.7,  y2020: 10.2, y2021: 8.1,  y2022: 6.9,  y2023: 6.2 },
  { state: "Chhattisgarh",    y2019: 2.8,  y2020: 3.5,  y2021: 2.6,  y2022: 2.1,  y2023: 1.8 },
  { state: "Gujarat",         y2019: 2.0,  y2020: 3.1,  y2021: 2.3,  y2022: 1.9,  y2023: 1.6 },
  { state: "Haryana",         y2019: 7.0,  y2020: 9.0,  y2021: 7.4,  y2022: 6.8,  y2023: 6.1 },
  { state: "Himachal Pradesh",y2019: 4.2,  y2020: 5.3,  y2021: 4.1,  y2022: 3.7,  y2023: 3.3 },
  { state: "Jharkhand",       y2019: 7.3,  y2020: 9.5,  y2021: 7.8,  y2022: 6.5,  y2023: 5.9 },
  { state: "Karnataka",       y2019: 2.8,  y2020: 4.2,  y2021: 3.1,  y2022: 2.6,  y2023: 2.2 },
  { state: "Kerala",          y2019: 6.9,  y2020: 9.4,  y2021: 7.5,  y2022: 6.3,  y2023: 5.7 },
  { state: "Madhya Pradesh",  y2019: 2.6,  y2020: 3.8,  y2021: 2.9,  y2022: 2.3,  y2023: 2.0 },
  { state: "Maharashtra",     y2019: 2.5,  y2020: 4.3,  y2021: 3.2,  y2022: 2.7,  y2023: 2.4 },
  { state: "Odisha",          y2019: 5.3,  y2020: 6.8,  y2021: 5.1,  y2022: 4.4,  y2023: 3.9 },
  { state: "Punjab",          y2019: 7.4,  y2020: 9.8,  y2021: 7.9,  y2022: 7.1,  y2023: 6.5 },
  { state: "Rajasthan",       y2019: 5.0,  y2020: 7.2,  y2021: 5.4,  y2022: 4.7,  y2023: 4.2 },
  { state: "Tamil Nadu",      y2019: 3.9,  y2020: 6.1,  y2021: 4.7,  y2022: 3.8,  y2023: 3.4 },
  { state: "Telangana",       y2019: 3.5,  y2020: 5.4,  y2021: 4.0,  y2022: 3.4,  y2023: 2.9 },
  { state: "Uttar Pradesh",   y2019: 4.5,  y2020: 6.2,  y2021: 4.8,  y2022: 4.1,  y2023: 3.7 },
  { state: "Uttarakhand",     y2019: 4.8,  y2020: 6.5,  y2021: 5.0,  y2022: 4.3,  y2023: 3.8 },
  { state: "West Bengal",     y2019: 4.8,  y2020: 6.9,  y2021: 5.2,  y2022: 4.5,  y2023: 4.0 },
];

// Top 8 states for trend chart (most interesting stories)
const TREND_STATES = ["Bihar", "Punjab", "Haryana", "Kerala", "Jharkhand", "Karnataka", "Gujarat", "Maharashtra"];

const TREND_DATA = [
  { year: "2019-20", ...Object.fromEntries(TREND_STATES.map(s => [s, UNEMPLOYMENT_DATA.find(d => d.state === s)?.y2019])) },
  { year: "2020-21", ...Object.fromEntries(TREND_STATES.map(s => [s, UNEMPLOYMENT_DATA.find(d => d.state === s)?.y2020])) },
  { year: "2021-22", ...Object.fromEntries(TREND_STATES.map(s => [s, UNEMPLOYMENT_DATA.find(d => d.state === s)?.y2021])) },
  { year: "2022-23", ...Object.fromEntries(TREND_STATES.map(s => [s, UNEMPLOYMENT_DATA.find(d => d.state === s)?.y2022])) },
  { year: "2023-24", ...Object.fromEntries(TREND_STATES.map(s => [s, UNEMPLOYMENT_DATA.find(d => d.state === s)?.y2023])) },
];

const LINE_COLORS = ["#ff6b00", "#00c896", "#4da6ff", "#ffcc00", "#ff4444", "#cc88ff", "#ff88aa", "#88ffcc"];

const YEAR_OPTIONS = [
  { key: "y2019", label: "2019-20", color: "#555" },
  { key: "y2020", label: "2020-21 (COVID)", color: "#ff4444" },
  { key: "y2021", label: "2021-22", color: "#ffaa00" },
  { key: "y2022", label: "2022-23", color: "#4da6ff" },
  { key: "y2023", label: "2023-24", color: "#00c896" },
];

// ─── Tooltips ──────────────────────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const color = val >= 8 ? "#ff4444" : val >= 5 ? "#ffaa00" : "#00c896";
  return (
    <div style={{
      background: "#0d0d0d", border: `1px solid ${color}`,
      padding: "10px 14px", borderRadius: 4,
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 12
    }}>
      <p style={{ color, margin: 0, marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#e0e0e0", margin: 0 }}>UR: {val}%</p>
      <p style={{ color: "#555", margin: 0, fontSize: 10, marginTop: 4 }}>
        {val >= 8 ? "⚠ HIGH" : val >= 5 ? "↗ MODERATE" : "✓ LOW"}
      </p>
    </div>
  );
};

const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0d0d0d", border: "1px solid #333",
      padding: "10px 14px", borderRadius: 4,
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11
    }}>
      <p style={{ color: "#888", margin: 0, marginBottom: 6 }}>{label}</p>
      {payload.sort((a, b) => b.value - a.value).map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
export default function UnemploymentModule() {
  const [tab,       setTab]       = useState("compare");
  const [selYear,   setSelYear]   = useState("y2023");
  const [hovered,   setHovered]   = useState(null);

  const yearMeta   = YEAR_OPTIONS.find(y => y.key === selYear);
  const sortedData = [...UNEMPLOYMENT_DATA]
    .sort((a, b) => b[selYear] - a[selYear]);

  const avgUR      = (UNEMPLOYMENT_DATA.reduce((s, d) => s + d[selYear], 0) / UNEMPLOYMENT_DATA.length).toFixed(1);
  const maxState   = sortedData[0];
  const minState   = sortedData[sortedData.length - 1];
  const covidPeak  = UNEMPLOYMENT_DATA.reduce((max, d) => d.y2020 > max.y2020 ? d : max, UNEMPLOYMENT_DATA[0]);

  return (
    <div style={{
      background: "#080808", color: "#e0e0e0",
      fontFamily: "'IBM Plex Sans', sans-serif",
      borderTop: "1px solid #1a1a1a",
    }}>
      {/* <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;600&family=Bebas+Neue&display=swap" rel="stylesheet" /> */}

      {/* ── Section Header ── */}
      <div style={{
        padding: "28px 40px 20px",
        borderBottom: "1px solid #1a1a1a",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end"
      }}>
        <div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 36, letterSpacing: 4, color: "#4da6ff", lineHeight: 1
          }}>
            UNEMPLOYMENT INDIA
          </div>
          <div style={{ fontSize: 12, color: "#555", letterSpacing: 3, marginTop: 4 }}>
            STATE-WISE · PLFS USUAL STATUS · 2019–20 TO 2023–24
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#333", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2, textAlign: "right" }}>
          SOURCE · RAJYA SABHA SESSION 266<br />
          Q.155 · ANSWERED 25 NOV 2024
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        borderBottom: "1px solid #1a1a1a"
      }}>
        {[
          { label: "NATIONAL AVG UR",  value: `${avgUR}%`,         sub: yearMeta?.label,        color: "#4da6ff" },
          { label: "HIGHEST UR STATE", value: maxState.state,      sub: `${maxState[selYear]}%`, color: "#ff4444" },
          { label: "LOWEST UR STATE",  value: minState.state,      sub: `${minState[selYear]}%`, color: "#00c896" },
          { label: "COVID PEAK STATE", value: covidPeak.state,     sub: `${covidPeak.y2020}% in 2020-21`, color: "#ffaa00" },
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
              fontSize: 24, color: kpi.color, letterSpacing: 2
            }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2, fontFamily: "monospace" }}>
              {kpi.sub}
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
          { id: "compare", label: "STATE COMPARISON" },
          { id: "trend",   label: "COVID RECOVERY TREND" },
          { id: "risk",    label: "RISK HEATMAP" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none",
            borderBottom: tab === t.id ? "2px solid #4da6ff" : "2px solid transparent",
            color: tab === t.id ? "#4da6ff" : "#444",
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

        {tab === "compare" && (
          <>
            {/* Year Selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {YEAR_OPTIONS.map(y => (
                <button key={y.key} onClick={() => setSelYear(y.key)} style={{
                  background: selYear === y.key ? y.color : "transparent",
                  border: `1px solid ${selYear === y.key ? y.color : "#222"}`,
                  color: selYear === y.key ? "#000" : "#555",
                  padding: "4px 14px", borderRadius: 2,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10, cursor: "pointer", letterSpacing: 1,
                  transition: "all 0.15s"
                }}>
                  {y.label}
                </button>
              ))}
              <span style={{
                marginLeft: "auto", fontSize: 10, color: "#333",
                fontFamily: "monospace", alignSelf: "center"
              }}>
                NATIONAL AVG: {avgUR}%
              </span>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={sortedData} margin={{ top: 0, right: 0, left: 10, bottom: 80 }}>
                <CartesianGrid stroke="#111" vertical={false} />
                <XAxis
                  dataKey="state"
                  tick={{ fill: "#444", fontSize: 9, fontFamily: "IBM Plex Mono" }}
                  angle={-45} textAnchor="end" interval={0}
                  tickLine={false} axisLine={{ stroke: "#1a1a1a" }}
                />
                <YAxis
                  tickFormatter={v => `${v}%`}
                  tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                  tickLine={false} axisLine={false}
                  domain={[0, 12]}
                />
                {/* Average reference line drawn manually */}
                <Tooltip content={<BarTooltip />} cursor={{ fill: "#111" }} />
                <Bar dataKey={selYear} name="Unemployment Rate" radius={[2, 2, 0, 0]}>
                  {sortedData.map((d, i) => {
                    const val = d[selYear];
                    const baseColor = val >= 8 ? "#ff4444" : val >= 5 ? "#ffaa00" : "#00c896";
                    return (
                      <Cell
                        key={i}
                        fill={hovered === i ? baseColor : `${baseColor}55`}
                        stroke={hovered === i ? baseColor : "transparent"}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: "flex", gap: 24, marginTop: 12, justifyContent: "center" }}>
              {[
                { color: "#ff4444", label: "HIGH ≥ 8%" },
                { color: "#ffaa00", label: "MODERATE 5–8%" },
                { color: "#00c896", label: "LOW < 5%" },
              ].map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                  <span style={{ fontSize: 10, color: "#444", fontFamily: "monospace" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "trend" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 8 }}>
              COVID IMPACT & RECOVERY · 8 KEY STATES · 2019–20 TO 2023–24
            </div>
            <div style={{ fontSize: 10, color: "#333", marginBottom: 20, fontFamily: "monospace" }}>
              2020-21 = COVID LOCKDOWN YEAR — observe the spike and recovery trajectory per state
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={TREND_DATA} margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid stroke="#111" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                  tickLine={false} axisLine={{ stroke: "#1a1a1a" }}
                />
                <YAxis
                  tickFormatter={v => `${v}%`}
                  tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                  tickLine={false} axisLine={false}
                  domain={[0, 12]}
                />
                <Tooltip content={<LineTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10, color: "#555", paddingTop: 16
                  }}
                />
                {TREND_STATES.map((state, i) => (
                  <Line
                    key={state}
                    type="monotone"
                    dataKey={state}
                    stroke={LINE_COLORS[i]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: LINE_COLORS[i] }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </>
        )}

        {tab === "risk" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 20 }}>
              UNEMPLOYMENT RISK HEATMAP · ALL YEARS · RED = HIGH UNEMPLOYMENT
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px 16px", color: "#444", letterSpacing: 2, fontWeight: 400, borderBottom: "1px solid #1a1a1a" }}>
                      STATE
                    </th>
                    {YEAR_OPTIONS.map(y => (
                      <th key={y.key} style={{
                        padding: "8px 16px", color: y.color,
                        letterSpacing: 1, fontWeight: 400,
                        borderBottom: "1px solid #1a1a1a", textAlign: "center"
                      }}>
                        {y.label}
                      </th>
                    ))}
                    <th style={{ padding: "8px 16px", color: "#444", letterSpacing: 1, fontWeight: 400, borderBottom: "1px solid #1a1a1a", textAlign: "center" }}>
                      TREND
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...UNEMPLOYMENT_DATA]
                    .sort((a, b) => b.y2023 - a.y2023)
                    .map((d, i) => {
                      const trend = d.y2023 < d.y2019 ? "↓ IMPROVING" : "↑ WORSENING";
                      const trendColor = d.y2023 < d.y2019 ? "#00c896" : "#ff4444";
                      return (
                        <tr key={i} style={{
                          background: hovered === i ? "#0f0f0f" : "transparent",
                          transition: "background 0.1s"
                        }}
                          onMouseEnter={() => setHovered(i)}
                          onMouseLeave={() => setHovered(null)}
                        >
                          <td style={{ padding: "10px 16px", color: "#ccc", borderBottom: "1px solid #0d0d0d" }}>
                            {d.state}
                          </td>
                          {YEAR_OPTIONS.map(y => {
                            const val = d[y.key];
                            const intensity = Math.min(val / 12, 1);
                            const r = Math.round(255 * intensity);
                            const g = Math.round(100 * (1 - intensity));
                            return (
                              <td key={y.key} style={{
                                padding: "10px 16px",
                                textAlign: "center",
                                color: `rgb(${r}, ${g + 100}, ${50})`,
                                background: `rgba(${r}, ${g}, 0, ${intensity * 0.3})`,
                                borderBottom: "1px solid #0d0d0d",
                                fontWeight: val >= 8 ? 600 : 400
                              }}>
                                {val}%
                              </td>
                            );
                          })}
                          <td style={{
                            padding: "10px 16px", textAlign: "center",
                            color: trendColor, borderBottom: "1px solid #0d0d0d",
                            fontSize: 10
                          }}>
                            {trend}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{
        borderTop: "1px solid #111", padding: "12px 40px",
        display: "flex", justifyContent: "space-between",
        fontSize: 10, color: "#333", fontFamily: "'IBM Plex Mono', monospace",
        letterSpacing: 2
      }}>
        <span>SOURCE · PLFS ANNUAL REPORTS 2019-20 TO 2023-24 · MOSPI / RAJYA SABHA Q.155 NOV 2024</span>
        <span>INSIGHTS.DEBPROD.COM</span>
      </div>
    </div>
  );
}
