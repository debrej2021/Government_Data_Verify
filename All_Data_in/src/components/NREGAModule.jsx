import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend
} from "recharts";

// ─── DATA — Source: Ministry of Rural Development, NREGASoft, LibTech India ─
// Rajya Sabha Session 266, Q.1222, Answered 5 Dec 2024

// National trend — person-days generated (crores)
const NATIONAL_TREND = [
  { year: "2019-20", personDays: 265, budget: 71619,  expenditure: 71687,  households: 7.88 },
  { year: "2020-21", personDays: 389, budget: 111500, expenditure: 111170, households: 11.19 }, // COVID spike
  { year: "2021-22", personDays: 364, budget: 98000,  expenditure: 98468,  households: 10.67 },
  { year: "2022-23", personDays: 295, budget: 89400,  expenditure: 89369,  households: 8.61  },
  { year: "2023-24", personDays: 184, budget: 60000,  expenditure: 105450, households: 5.96  },
];

// State-wise average days per household 2023-24
// Source: Rajya Sabha data, NREGASoft
const STATE_DAYS_DATA = [
  { state: "Rajasthan",      days: 67.3, households: 51.2, women_pct: 68, color: "#00c896" },
  { state: "Tamil Nadu",     days: 65.1, households: 43.8, women_pct: 82, color: "#00c896" },
  { state: "Andhra Pradesh", days: 61.4, households: 38.1, women_pct: 74, color: "#00c896" },
  { state: "Jharkhand",      days: 55.2, households: 29.4, women_pct: 59, color: "#00c896" },
  { state: "Odisha",         days: 52.8, households: 24.6, women_pct: 62, color: "#ffaa00" },
  { state: "Chhattisgarh",   days: 51.3, households: 22.8, women_pct: 61, color: "#ffaa00" },
  { state: "West Bengal",    days: 48.6, households: 33.2, women_pct: 54, color: "#ffaa00" },
  { state: "Kerala",         days: 47.9, households: 8.4,  women_pct: 91, color: "#ffaa00" },
  { state: "Madhya Pradesh", days: 44.2, households: 39.7, women_pct: 58, color: "#ffaa00" },
  { state: "Assam",          days: 43.1, households: 18.9, women_pct: 53, color: "#ffaa00" },
  { state: "Karnataka",      days: 41.8, households: 21.4, women_pct: 64, color: "#ffaa00" },
  { state: "Uttar Pradesh",  days: 38.4, households: 51.8, women_pct: 48, color: "#ff4444" },
  { state: "Bihar",          days: 36.2, households: 44.3, women_pct: 46, color: "#ff4444" },
  { state: "Maharashtra",    days: 34.7, households: 19.2, women_pct: 57, color: "#ff4444" },
  { state: "Gujarat",        days: 32.1, households: 12.8, women_pct: 52, color: "#ff4444" },
  { state: "Punjab",         days: 28.4, households: 4.1,  women_pct: 44, color: "#ff4444" },
  { state: "Haryana",        days: 27.6, households: 5.8,  women_pct: 49, color: "#ff4444" },
].sort((a, b) => b.days - a.days);

// Participation breakdown 2022-23
const PARTICIPATION_DATA = [
  { category: "Women",           pct: 56.19, color: "#ff88aa" },
  { category: "Scheduled Tribe", pct: 17.47, color: "#ffcc00" },
  { category: "Scheduled Caste", pct: 19.75, color: "#4da6ff" },
  { category: "Others",          pct: 6.59,  color: "#888"    },
];

// Key issues
const KEY_ISSUES = [
  { issue: "Avg days vs 100-day guarantee", actual: 47, guaranteed: 100, color: "#ff4444" },
  { issue: "Aadhaar-linked workers (active)", actual: 92, guaranteed: 100, color: "#ffaa00" },
  { issue: "Wage payment within 15 days",   actual: 61, guaranteed: 100, color: "#ff8800" },
  { issue: "States with positive fund balance", actual: 2, guaranteed: 36, color: "#ff2222" },
];

// ─── Tooltips ──────────────────────────────────────────────────────────────
const NregaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0d0d0d", border: "1px solid #00c896",
      padding: "10px 14px", borderRadius: 4,
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11
    }}>
      <p style={{ color: "#00c896", margin: 0, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: "#e0e0e0", margin: "2px 0" }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
          {p.dataKey === "personDays" ? " crore person-days" : ""}
          {p.dataKey === "expenditure" ? " crore ₹" : ""}
        </p>
      ))}
    </div>
  );
};

const StateTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = STATE_DAYS_DATA.find(x => x.state === label);
  if (!d) return null;
  return (
    <div style={{
      background: "#0d0d0d", border: `1px solid ${d.color}`,
      padding: "10px 14px", borderRadius: 4,
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11
    }}>
      <p style={{ color: d.color, margin: 0, marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#e0e0e0", margin: "2px 0" }}>Avg days/household: {d.days}</p>
      <p style={{ color: "#888",    margin: "2px 0" }}>Households (lakh): {d.households}</p>
      <p style={{ color: "#ff88aa",  margin: "2px 0" }}>Women workers: {d.women_pct}%</p>
      <p style={{ color: d.days >= 50 ? "#00c896" : d.days >= 35 ? "#ffaa00" : "#ff4444", margin: "4px 0", fontSize: 10 }}>
        {d.days >= 50 ? "✓ ABOVE NATIONAL AVG" : d.days >= 35 ? "↗ MODERATE" : "⚠ UNDERPERFORMING"}
      </p>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
export default function NREGAModule() {
  const [tab, setTab] = useState("overview");

  const nationalAvgDays = (STATE_DAYS_DATA.reduce((s, d) => s + d.days, 0) / STATE_DAYS_DATA.length).toFixed(1);
  const topState        = STATE_DAYS_DATA[0];
  const bottomState     = STATE_DAYS_DATA[STATE_DAYS_DATA.length - 1];

  return (
    <div style={{
      background: "#080808", color: "#e0e0e0",
      fontFamily: "'IBM Plex Sans', sans-serif",
      borderTop: "1px solid #1a1a1a",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;600&family=Bebas+Neue&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <div style={{
        padding: "28px 40px 20px",
        borderBottom: "1px solid #1a1a1a",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end"
      }}>
        <div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 36, letterSpacing: 4, color: "#88ffcc", lineHeight: 1
          }}>
            MGNREGA UTILISATION
          </div>
          <div style={{ fontSize: 12, color: "#555", letterSpacing: 3, marginTop: 4 }}>
            100 DAYS GUARANTEED · STATE-WISE DELIVERY · FUND GAPS · WORKER DELETIONS
          </div>
        </div>
        <div style={{
          fontSize: 10, color: "#333",
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: 2, textAlign: "right"
        }}>
          SOURCE · MINISTRY OF RURAL DEVELOPMENT<br />
          NREGASOFT · LIBTECH INDIA 2024 · RS Q.1222
        </div>
      </div>

      {/* ── Context Banner ── */}
      <div style={{
        background: "#001a0f", borderBottom: "1px solid #003322",
        padding: "10px 40px",
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
        color: "#448866", letterSpacing: 1,
        display: "flex", alignItems: "center", gap: 12
      }}>
        <span style={{ color: "#88ffcc", fontSize: 14 }}>◉</span>
        MGNREGA guarantees every rural household 100 days of paid work/year.
        National average actually delivered: ~47 days.
        Only 2 of 36 states had positive fund balance as of April 2024.
        <span style={{ marginLeft: "auto", color: "#224433" }}>LIBTECH INDIA 2024</span>
      </div>

      {/* ── KPI Strip ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        borderBottom: "1px solid #1a1a1a"
      }}>
        {[
          { label: "GUARANTEED DAYS",    value: "100",          sub: "Per rural household per year",                color: "#88ffcc" },
          { label: "NATIONAL AVG ACTUAL",value: `~${nationalAvgDays} days`,  sub: "Actually delivered 2023-24",    color: "#ffaa00" },
          { label: "TOP PERFORMER",      value: topState.state,  sub: `${topState.days} days avg — 2023-24`,       color: "#00c896" },
          { label: "WORST PERFORMER",    value: bottomState.state, sub: `Only ${bottomState.days} days avg`,       color: "#ff4444" },
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
          { id: "overview",  label: "NATIONAL TREND" },
          { id: "states",    label: "STATE-WISE DAYS" },
          { id: "issues",    label: "DELIVERY GAPS" },
          { id: "workers",   label: "WHO WORKS" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none",
            borderBottom: tab === t.id ? "2px solid #88ffcc" : "2px solid transparent",
            color: tab === t.id ? "#88ffcc" : "#444",
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

        {tab === "overview" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>
              PERSON-DAYS GENERATED · NATIONAL · 2019-20 TO 2023-24
            </div>
            <div style={{ fontSize: 10, color: "#224433", marginBottom: 20, fontFamily: "monospace" }}>
              2020-21 SPIKE = COVID REVERSE MIGRATION — HIGHEST EVER DEMAND · 389 CRORE PERSON-DAYS
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={NATIONAL_TREND} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid stroke="#111" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={{ stroke: "#1a1a1a" }} />
                <YAxis tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} label={{ value: "crore person-days", angle: -90, position: "insideLeft", fill: "#333", fontSize: 9 }} />
                <Tooltip content={<NregaTooltip />} cursor={{ fill: "#111" }} />
                <Bar dataKey="personDays" name="Person-days (crore)" radius={[2, 2, 0, 0]}>
                  {NATIONAL_TREND.map((d, i) => (
                    <Cell key={i} fill={d.year === "2020-21" ? "#ffaa00" : "#88ffcc55"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Budget vs Expenditure */}
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 20 }}>
                BUDGET ALLOCATION VS EXPENDITURE · ₹ CRORE
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={NATIONAL_TREND} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid stroke="#111" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={{ stroke: "#1a1a1a" }} />
                  <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}K Cr`} tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<NregaTooltip />} cursor={{ fill: "#111" }} />
                  <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 10, paddingTop: 12 }} />
                  <Bar dataKey="budget"      name="Budget allocated" fill="#88ffcc44" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="expenditure" name="Actual expenditure" fill="#00c896" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 16, padding: "12px 20px", background: "#001a0f", border: "1px solid #003322", fontFamily: "monospace", fontSize: 10, color: "#448866", lineHeight: 1.8 }}>
                ◉ &nbsp;In 2023-24, expenditure (₹1,05,450 Cr) exceeded budget allocation (₹60,000 Cr) significantly.
                &nbsp;Result: 20 states ran into negative fund balance — workers did the work but payment was delayed.
                &nbsp;Source: LibTech India MGNREGA Status Report 2023-24.
              </div>
            </div>
          </>
        )}

        {tab === "states" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>
              AVERAGE DAYS OF EMPLOYMENT PER HOUSEHOLD · STATE-WISE · 2023-24
            </div>
            <div style={{ fontSize: 10, color: "#224433", marginBottom: 20, fontFamily: "monospace" }}>
              100 DAYS GUARANTEED · NATIONAL AVG: ~47 DAYS · GREEN ≥ 50 · AMBER 35-50 · RED &lt; 35
            </div>
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={STATE_DAYS_DATA} margin={{ top: 0, right: 20, left: 20, bottom: 80 }}>
                <CartesianGrid stroke="#111" vertical={false} />
                <XAxis dataKey="state" tick={{ fill: "#444", fontSize: 9, fontFamily: "IBM Plex Mono" }} angle={-40} textAnchor="end" interval={0} tickLine={false} axisLine={{ stroke: "#1a1a1a" }} />
                <YAxis tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} domain={[0, 110]} label={{ value: "days", angle: -90, position: "insideLeft", fill: "#333", fontSize: 9 }} />
                <Tooltip content={<StateTooltip />} cursor={{ fill: "#111" }} />
                <Bar dataKey="days" name="Avg days/household" radius={[2, 2, 0, 0]}>
                  {STATE_DAYS_DATA.map((d, i) => (
                    <Cell key={i} fill={d.color} fillOpacity={0.8} />
                  ))}
                </Bar>
                {/* Reference line for 100 days */}
                <Bar dataKey={() => 100} fill="transparent" />
              </BarChart>
            </ResponsiveContainer>

            <div style={{
              marginTop: 20, padding: "14px 20px",
              background: "#001a0f", border: "1px solid #003322",
              fontFamily: "monospace", fontSize: 11, color: "#448866", lineHeight: 1.8
            }}>
              ◉ &nbsp;No state has achieved the 100-day guarantee on average.
              &nbsp;Rajasthan leads at 67 days — still only 67% of what is legally mandated.
              &nbsp;Haryana and Punjab, despite being prosperous states, show the lowest utilisation —
              &nbsp;suggesting low rural poverty demand OR poor administration of job cards.
            </div>
          </>
        )}

        {tab === "issues" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 24 }}>
              DELIVERY GAP SCORECARD · WHERE THE GUARANTEE FAILS
            </div>

            {KEY_ISSUES.map((item, i) => (
              <div key={i} style={{
                marginBottom: 24, padding: "20px 24px",
                background: "#0a0a0a", borderLeft: `3px solid ${item.color}`
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  marginBottom: 10, fontFamily: "'IBM Plex Mono', monospace"
                }}>
                  <span style={{ fontSize: 12, color: "#ccc" }}>{item.issue}</span>
                  <span style={{ fontSize: 11, color: "#555" }}>
                    Actual: <span style={{ color: item.color }}>{item.actual}</span>
                    &nbsp;/ Guaranteed: <span style={{ color: "#888" }}>{item.guaranteed}</span>
                  </span>
                </div>
                <div style={{ height: 8, background: "#111", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${(item.actual / item.guaranteed) * 100}%`,
                    background: item.color, borderRadius: 4,
                    transition: "width 0.8s ease"
                  }} />
                </div>
                <div style={{ fontSize: 10, color: "#333", marginTop: 6, fontFamily: "monospace" }}>
                  {((item.actual / item.guaranteed) * 100).toFixed(0)}% of guarantee fulfilled
                </div>
              </div>
            ))}

            {/* Worker Deletion Crisis */}
            <div style={{
              padding: "20px 24px",
              background: "#0a0000", border: "1px solid #330000",
              fontFamily: "monospace", fontSize: 11, color: "#884444", lineHeight: 1.8,
              marginTop: 8
            }}>
              <div style={{ color: "#ff4444", fontSize: 12, marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>
                ⚠ THE JOB CARD DELETION CRISIS
              </div>
              1.46 crore workers were deleted from NREGA job cards in 2022-23 and 2023-24.
              &nbsp;LibTech India found ~15% of these deletions in Andhra Pradesh were wrongful.
              &nbsp;Extrapolated nationally: ~22 lakh genuine workers may have lost access.
              &nbsp;<br />
              Since Jan 1 2024, Aadhaar-Based Payment System is mandatory.
              &nbsp;27.4% of all registered workers are not Aadhaar-linked — they cannot be paid.
              &nbsp;Their work is real. Their wages are withheld by a system requirement.
            </div>
          </>
        )}

        {tab === "workers" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 20 }}>
              WHO ACTUALLY WORKS UNDER NREGA · PARTICIPATION BREAKDOWN · 2022-23
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
              <div>
                {PARTICIPATION_DATA.map((d, i) => (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12
                    }}>
                      <span style={{ color: d.color }}>{d.category}</span>
                      <span style={{ color: "#888" }}>{d.pct}%</span>
                    </div>
                    <div style={{ height: 8, background: "#111", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${d.pct}%`,
                        background: d.color, borderRadius: 4
                      }} />
                    </div>
                  </div>
                ))}

                <div style={{
                  marginTop: 24, padding: "14px 16px",
                  background: "#001a0f", border: "1px solid #003322",
                  fontFamily: "monospace", fontSize: 10, color: "#448866", lineHeight: 1.8
                }}>
                  ◉ Women make up 56% of NREGA workers — higher than the 33% legal minimum.
                  &nbsp;For many rural women this is their only source of independent income.
                  &nbsp;Kerala has 91% women participation — highest in India.
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 16 }}>
                  WOMEN PARTICIPATION % BY STATE · 2023-24
                </div>
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart
                    data={[...STATE_DAYS_DATA].sort((a, b) => b.women_pct - a.women_pct)}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 120, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#111" horizontal={false} />
                    <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <YAxis type="category" dataKey="state" tick={{ fill: "#888", fontSize: 9, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} width={120} />
                    <Tooltip
                      contentStyle={{ background: "#0d0d0d", border: "1px solid #ff88aa", fontFamily: "monospace", fontSize: 11 }}
                      cursor={{ fill: "#111" }}
                      formatter={(v) => [`${v}%`, "Women workers"]}
                    />
                    <Bar dataKey="women_pct" name="Women %" radius={[0, 2, 2, 0]}>
                      {[...STATE_DAYS_DATA].sort((a, b) => b.women_pct - a.women_pct).map((d, i) => (
                        <Cell key={i} fill={d.women_pct >= 60 ? "#ff88aa" : d.women_pct >= 50 ? "#ff88aa77" : "#ff88aa33"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
        <span>SOURCE · MINISTRY OF RURAL DEVELOPMENT · NREGASOFT · LIBTECH INDIA 2024 · RAJYA SABHA Q.1222 DEC 2024</span>
        <span>FACTCHECK.DEBPROD.COM</span>
      </div>
    </div>
  );
}
