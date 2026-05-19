import { useState, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie, Legend
} from "recharts";
import { useSearchParams } from "react-router-dom";
import ChartToolbar from "./ChartToolbar";
import { exportCSV, downloadChartPNG } from "../utils/chartExport";

const PARTY_MLA_DATA = [
  { party: "BJP",    women: 163, total: 1441, color: "#ff6600" },
  { party: "INC",    women: 59,  total: 688,  color: "#0080ff" },
  { party: "AITC",   women: 34,  total: 215,  color: "#00aa44" },
  { party: "SP",     women: 21,  total: 108,  color: "#cc0000" },
  { party: "TDP",    women: 20,  total: 135,  color: "#ffcc00" },
  { party: "AAP",    women: 13,  total: 92,   color: "#005566" },
  { party: "JDU",    women: 12,  total: 119,  color: "#008866" },
  { party: "Others", women: 79,  total: 1325, color: "#333" },
];

const CRIMINAL_DATA = [
  { party: "AAP",  total: 13,  criminal: 9,  pct: 69, serious: 4,  sPct: 31, color: "#005566" },
  { party: "TDP",  total: 20,  criminal: 13, pct: 65, serious: 9,  sPct: 45, color: "#ffcc00" },
  { party: "INC",  total: 83,  criminal: 28, pct: 34, serious: 17, sPct: 20, color: "#0080ff" },
  { party: "SP",   total: 21,  criminal: 6,  pct: 29, serious: 3,  sPct: 14, color: "#cc0000" },
  { party: "BJP",  total: 217, criminal: 49, pct: 23, serious: 24, sPct: 11, color: "#ff6600" },
  { party: "AITC", total: 54,  criminal: 12, pct: 22, serious: 6,  sPct: 11, color: "#00aa44" },
];

const STATE_MLA_DATA = [
  { state: "Uttar Pradesh",  women: 47, total: 403 },
  { state: "West Bengal",    women: 40, total: 294 },
  { state: "Bihar",          women: 29, total: 243 },
  { state: "Madhya Pradesh", women: 24, total: 230 },
  { state: "Rajasthan",      women: 28, total: 200 },
  { state: "Maharashtra",    women: 21, total: 288 },
  { state: "Odisha",         women: 20, total: 147 },
  { state: "Andhra Pradesh", women: 18, total: 175 },
  { state: "Telangana",      women: 12, total: 119 },
  { state: "Karnataka",      women: 15, total: 224 },
  { state: "Tamil Nadu",     women: 12, total: 234 },
  { state: "Kerala",         women: 14, total: 140 },
  { state: "Punjab",         women: 14, total: 117 },
  { state: "Haryana",        women: 13, total: 90  },
  { state: "Gujarat",        women: 18, total: 182 },
  { state: "Jharkhand",      women: 11, total: 81  },
  { state: "Assam",          women: 13, total: 126 },
  { state: "Chhattisgarh",   women: 15, total: 90  },
  { state: "Uttarakhand",    women: 8,  total: 70  },
  { state: "Himachal",       women: 5,  total: 68  },
].map(d => ({ ...d, pct: ((d.women / d.total) * 100).toFixed(1) }))
 .sort((a, b) => b.pct - a.pct);

const PARLIAMENT_TREND = [
  { year: "1957", women: 22, pct: 4.4 },
  { year: "1962", women: 34, pct: 6.7 },
  { year: "1967", women: 31, pct: 5.9 },
  { year: "1971", women: 22, pct: 4.2 },
  { year: "1977", women: 19, pct: 3.5 },
  { year: "1980", women: 28, pct: 5.2 },
  { year: "1984", women: 44, pct: 8.1 },
  { year: "1989", women: 27, pct: 5.0 },
  { year: "1991", women: 36, pct: 7.0 },
  { year: "1996", women: 40, pct: 7.4 },
  { year: "1998", women: 43, pct: 7.9 },
  { year: "1999", women: 49, pct: 9.0 },
  { year: "2004", women: 45, pct: 8.3 },
  { year: "2009", women: 59, pct: 10.9 },
  { year: "2014", women: 62, pct: 11.4 },
  { year: "2019", women: 78, pct: 14.4 },
  { year: "2024", women: 74, pct: 13.6 },
];

const PartyTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = PARTY_MLA_DATA.find(p => p.party === label);
  if (!d) return null;
  return (
    <div style={{ background: "#0d0d0d", border: `1px solid ${d.color}`, padding: "10px 14px", borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
      <p style={{ color: d.color, margin: 0, marginBottom: 6 }}>{label}</p>
      <p style={{ color: "#e0e0e0", margin: "2px 0" }}>Women MLAs: {d.women}</p>
      <p style={{ color: "#e0e0e0", margin: "2px 0" }}>Total MLAs: {d.total}</p>
      <p style={{ color: "#888", margin: "2px 0" }}>Women %: {((d.women / d.total) * 100).toFixed(1)}%</p>
    </div>
  );
};

const CriminalTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = CRIMINAL_DATA.find(p => p.party === label);
  if (!d) return null;
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #ff4444", padding: "10px 14px", borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
      <p style={{ color: d.color, margin: 0, marginBottom: 6 }}>{label}</p>
      <p style={{ color: "#ff4444", margin: "2px 0" }}>Criminal: {d.criminal}/{d.total} ({d.pct}%)</p>
      <p style={{ color: "#ff8800", margin: "2px 0" }}>Serious: {d.serious}/{d.total} ({d.sPct}%)</p>
    </div>
  );
};

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #cc88ff", padding: "10px 14px", borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
      <p style={{ color: "#cc88ff", margin: 0, marginBottom: 4 }}>Lok Sabha {label}</p>
      <p style={{ color: "#e0e0e0", margin: "2px 0" }}>Women MPs: {payload[0]?.value}</p>
      <p style={{ color: "#888", margin: "2px 0" }}>Share: {payload[1]?.value}%</p>
    </div>
  );
};

export default function PoliticalModule() {
  const chartRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedState = searchParams.get('state');

  const [tab, setTab] = useState(searchParams.get('tab') || 'party');

  const handleTabChange = (t) => {
    setTab(t);
    setSearchParams(p => { const n = new URLSearchParams(p); n.set('tab', t); return n; }, { replace: true });
  };

  const totalWomenMLAs = PARTY_MLA_DATA.reduce((s, d) => s + d.women, 0);
  const totalMLAs      = 4123;
  const womenPct       = ((totalWomenMLAs / totalMLAs) * 100).toFixed(1);
  const topState       = STATE_MLA_DATA[0];

  return (
    <div style={{ background: "#080808", color: "#e0e0e0", fontFamily: "'IBM Plex Sans', sans-serif", borderTop: "1px solid #1a1a1a" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;600&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <div style={{ padding: "28px 40px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 4, color: "#cc88ff", lineHeight: 1 }}>POLITICAL REPRESENTATION</div>
          <div style={{ fontSize: 12, color: "#555", letterSpacing: 3, marginTop: 4 }}>WOMEN IN LEGISLATURE · CRIMINAL CASES · TRENDS · SOURCE: ADR / ECI 2025–26</div>
        </div>
        <div style={{ fontSize: 10, color: "#333", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2, textAlign: "right" }}>SOURCE · ADR INDIA 2025/2026<br />ECI AFFIDAVIT DATA</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid #1a1a1a" }}>
        {[
          { label: "WOMEN MLAs INDIA",     value: `${totalWomenMLAs}`,   sub: `${womenPct}% of 4,123 MLAs`,           color: "#cc88ff" },
          { label: "MOST WOMEN MLAs",      value: "BJP",                  sub: "163 women MLAs",                        color: "#ff6600" },
          { label: "TOP STATE % WOMEN",    value: topState.state,         sub: `${topState.pct}% (${topState.women} MLAs)`, color: "#00c896" },
          { label: "LOK SABHA 2024",       value: "74 / 543",             sub: "13.6% — down from 14.4% in 2019",      color: "#ff4444" },
        ].map((kpi, i) => (
          <div key={i} style={{ padding: "20px 32px", borderRight: i < 3 ? "1px solid #1a1a1a" : "none" }}>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: 3, marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: kpi.color, letterSpacing: 2 }}>{kpi.value}</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2, fontFamily: "monospace" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#110000", borderBottom: "1px solid #330000", padding: "10px 40px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#884444", letterSpacing: 1, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#ff4444", fontSize: 14 }}>⚠</span>
        Women's Reservation Bill (33% seats) passed Sept 2023 — not yet implemented. Currently only {womenPct}% representation.
        <span style={{ marginLeft: "auto", color: "#553333" }}>ADR 2026</span>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #1a1a1a", padding: "0 40px" }}>
        {[
          { id: "party",   label: "PARTY WISE MLAs" },
          { id: "state",   label: "STATE WISE %" },
          { id: "criminal",label: "CRIMINAL CASES" },
          { id: "trend",   label: "LOK SABHA TREND" },
        ].map(t => (
          <button key={t.id} onClick={() => handleTabChange(t.id)} style={{ background: "none", border: "none", borderBottom: tab === t.id ? "2px solid #cc88ff" : "2px solid transparent", color: tab === t.id ? "#cc88ff" : "#444", padding: "14px 20px", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, marginBottom: -1, transition: "all 0.15s" }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "32px 40px" }}>
        {highlightedState && (
          <div style={{ marginBottom: 16, padding: '8px 16px', background: '#0d0d00', border: '1px solid #ff6b0044', borderLeft: '3px solid #ff6b00', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>
            <span style={{ color: '#ff6b00', letterSpacing: 2 }}>&#9685; HIGHLIGHTING · {highlightedState.toUpperCase()}</span>
            <button onClick={() => setSearchParams(p => { const n = new URLSearchParams(p); n.delete('state'); return n; }, { replace: true })} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>✕ CLEAR</button>
          </div>
        )}

        {tab === "party" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>PARTY-WISE WOMEN MLAs · CURRENT STATE ASSEMBLIES · 2026</div>
            <div style={{ fontSize: 10, color: "#333", marginBottom: 20, fontFamily: "monospace" }}>NOTE: BJPs higher count reflects larger overall seat count — check % column for true representation rate</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={PARTY_MLA_DATA} margin={{ top: 0, right: 0, left: 10, bottom: 20 }}>
                  <CartesianGrid stroke="#111" vertical={false} />
                  <XAxis dataKey="party" tick={{ fill: "#444", fontSize: 11, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={{ stroke: "#1a1a1a" }} />
                  <YAxis tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<PartyTooltip />} cursor={{ fill: "#111" }} />
                  <Bar dataKey="women" name="Women MLAs" radius={[2, 2, 0, 0]}>
                    {PARTY_MLA_DATA.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div>
                <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 16 }}>WOMEN AS % OF PARTY'S TOTAL MLAs</div>
                {PARTY_MLA_DATA.filter(d => d.party !== "Others").map((d, i) => {
                  const pct = ((d.women / d.total) * 100).toFixed(1);
                  return (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
                        <span style={{ color: d.color }}>{d.party}</span>
                        <span style={{ color: "#666" }}>{d.women} / {d.total} → {pct}%</span>
                      </div>
                      <div style={{ height: 4, background: "#111", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(pct * 3, 100)}%`, background: d.color, borderRadius: 2, transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: 20, padding: "12px 16px", background: "#0a0a0a", borderLeft: "2px solid #cc88ff", fontFamily: "monospace", fontSize: 10, color: "#666" }}>
                  India target: 33.3% (Women's Reservation Bill)<br />
                  Current best party rate: {Math.max(...PARTY_MLA_DATA.filter(d => d.party !== "Others").map(d => ((d.women / d.total) * 100))).toFixed(1)}% — ALL parties fall far short
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "state" && (
          <div ref={chartRef}>
            <ChartToolbar chartRef={chartRef} data={STATE_MLA_DATA} csvFilename="political-state-data" />
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 20 }}>WOMEN MLAs AS % OF STATE ASSEMBLY SEATS · RANKED BEST TO WORST</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              {STATE_MLA_DATA.map((d, i) => {
                const pct = parseFloat(d.pct);
                const color = pct >= 15 ? "#00c896" : pct >= 10 ? "#ffaa00" : "#ff4444";
                const isHighlighted = highlightedState && d.state === highlightedState;
                return (
                  <div key={i} style={{
                    padding: "12px 20px",
                    borderBottom: "1px solid #0d0d0d",
                    display: "flex", alignItems: "center", gap: 14,
                    background: highlightedState ? (isHighlighted ? '#0d0d18' : 'transparent') : 'transparent',
                    border: isHighlighted ? '1px solid #cc88ff' : 'none',
                  }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#1a1a1a", minWidth: 28 }}>{String(i + 1).padStart(2, "0")}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
                        <span style={{ color: isHighlighted ? "#cc88ff" : "#ccc" }}>{d.state}</span>
                        <span style={{ color: "#555", fontSize: 10 }}>{d.women}/{d.total}</span>
                      </div>
                      <div style={{ height: 3, background: "#111", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(pct * 3, 100)}%`, background: color, borderRadius: 2 }} />
                      </div>
                    </div>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color, minWidth: 48, textAlign: "right" }}>{d.pct}%</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 16, justifyContent: "center" }}>
              {[{ color: "#00c896", label: "≥ 15% GOOD" }, { color: "#ffaa00", label: "10–15% MODERATE" }, { color: "#ff4444", label: "< 10% POOR" }].map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                  <span style={{ fontSize: 10, color: "#444", fontFamily: "monospace" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "criminal" && (
          <>
            <div style={{ fontSize: 11, color: "#ff4444", letterSpacing: 2, marginBottom: 6 }}>CRIMINAL CASES DECLARED BY SITTING WOMEN MPs/MLAs · SELF-SWORN ECI AFFIDAVITS</div>
            <div style={{ fontSize: 10, color: "#553333", marginBottom: 24, fontFamily: "monospace" }}>SOURCE: ADR INDIA 2025 · DATA FROM CANDIDATES' OWN AFFIDAVITS SUBMITTED TO ECI</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
              <div>
                <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 16 }}>% WITH ANY CRIMINAL CASE</div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={CRIMINAL_DATA} margin={{ top: 0, right: 0, left: 10, bottom: 20 }} layout="vertical">
                    <CartesianGrid stroke="#111" horizontal={false} />
                    <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} domain={[0, 80]} />
                    <YAxis type="category" dataKey="party" tick={{ fill: "#888", fontSize: 11, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} width={40} />
                    <Tooltip content={<CriminalTooltip />} cursor={{ fill: "#111" }} />
                    <Bar dataKey="pct" name="% with cases" radius={[0, 2, 2, 0]}>
                      {CRIMINAL_DATA.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 16 }}>% WITH SERIOUS CRIMINAL CASE</div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={CRIMINAL_DATA} margin={{ top: 0, right: 0, left: 10, bottom: 20 }} layout="vertical">
                    <CartesianGrid stroke="#111" horizontal={false} />
                    <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} domain={[0, 60]} />
                    <YAxis type="category" dataKey="party" tick={{ fill: "#888", fontSize: 11, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} width={40} />
                    <Tooltip content={<CriminalTooltip />} cursor={{ fill: "#111" }} />
                    <Bar dataKey="sPct" name="% serious cases" radius={[0, 2, 2, 0]}>
                      {CRIMINAL_DATA.map((d, i) => <Cell key={i} fill="#ff4444" fillOpacity={0.4 + (d.sPct / 100)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ marginTop: 24, padding: "16px 20px", background: "#0a0000", border: "1px solid #330000", fontFamily: "monospace", fontSize: 11, color: "#884444", lineHeight: 1.8 }}>
              ⚠ &nbsp;27% of all sitting women MPs/MLAs have declared criminal cases in their own affidavits. &nbsp;| &nbsp; 14% have declared serious criminal cases. &nbsp;| &nbsp; This data is self-reported — actual numbers may be higher.
            </div>
          </>
        )}

        {tab === "trend" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>WOMEN IN LOK SABHA · 1957 TO 2024 · 67 YEARS OF "PROGRESS"</div>
            <div style={{ fontSize: 10, color: "#555", marginBottom: 20, fontFamily: "monospace" }}>WOMEN'S RESERVATION BILL PASSED 2023 · NOT YET IMPLEMENTED · TARGET: 33%</div>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={PARLIAMENT_TREND} margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid stroke="#111" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: "#444", fontSize: 9, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={{ stroke: "#1a1a1a" }} angle={-30} textAnchor="end" />
                <YAxis yAxisId="count" tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} label={{ value: "COUNT", angle: -90, position: "insideLeft", fill: "#333", fontSize: 9, fontFamily: "monospace" }} />
                <YAxis yAxisId="pct" orientation="right" tickFormatter={v => `${v}%`} tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} domain={[0, 18]} />
                <Tooltip content={<TrendTooltip />} />
                <Line yAxisId="count" type="monotone" dataKey="women" stroke="#cc88ff" strokeWidth={2} dot={{ r: 3, fill: "#cc88ff" }} name="Women MPs" />
                <Line yAxisId="pct" type="monotone" dataKey="pct" stroke="#ff6b00" strokeWidth={2} dot={{ r: 3, fill: "#ff6b00" }} strokeDasharray="4 2" name="% Share" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 16, fontFamily: "monospace", fontSize: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 20, height: 2, background: "#cc88ff" }} /><span style={{ color: "#555" }}>Women MPs count</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 20, height: 2, background: "#ff6b00", borderTop: "2px dashed #ff6b00" }} /><span style={{ color: "#555" }}>% share</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 20, height: 2, background: "#ff4444" }} /><span style={{ color: "#553333" }}>Target: 33% (not reached)</span></div>
            </div>
            <div style={{ marginTop: 20, padding: "14px 20px", background: "#0a0000", border: "1px solid #330000", fontFamily: "monospace", fontSize: 10, color: "#884444", lineHeight: 1.8 }}>
              At the current rate of growth (1957: 4.4% → 2024: 13.6%), India will reach 33% women representation in Parliament approximately in the year 2055. &nbsp;The Women's Reservation Bill was supposed to change this — but it still has no implementation date.
            </div>
          </>
        )}
      </div>

      <div style={{ borderTop: "1px solid #111", padding: "12px 40px", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#333", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2 }}>
        <span>SOURCE · ADR INDIA 2025/2026 · ECI AFFIDAVIT DATA · MYNETA.INFO</span>
        <span>INSIGHTS.DEBPROD.COM</span>
      </div>
    </div>
  );
}
