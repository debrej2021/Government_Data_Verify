import { useState, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { useSearchParams } from "react-router-dom";
import ChartToolbar from "./ChartToolbar";
import { exportCSV, downloadChartPNG } from "../utils/chartExport";

const PILLARS = [
  { name: "Health & Nutrition",           weight: 30, color: "#ff6b00", key: "health" },
  { name: "Education",                    weight: 30, color: "#4da6ff", key: "edu" },
  { name: "Agriculture & Water",          weight: 20, color: "#00c896", key: "agri" },
  { name: "Financial Inclusion & Skills", weight: 10, color: "#ffcc00", key: "fin" },
  { name: "Basic Infrastructure",         weight: 10, color: "#cc88ff", key: "infra" },
];

const DISTRICT_DATA = [
  { district: "Sonbhadra",      state: "Uttar Pradesh",   baseline: 28.4, current: 71.2, health: 78, edu: 82, agri: 65, fin: 88, infra: 74 },
  { district: "Chandauli",      state: "Uttar Pradesh",   baseline: 31.2, current: 69.8, health: 72, edu: 79, agri: 68, fin: 85, infra: 71 },
  { district: "Singrauli",      state: "Madhya Pradesh",  baseline: 24.1, current: 68.5, health: 69, edu: 74, agri: 71, fin: 82, infra: 76 },
  { district: "Mewat",          state: "Haryana",         baseline: 22.8, current: 67.3, health: 73, edu: 71, agri: 66, fin: 79, infra: 68 },
  { district: "Asifabad",       state: "Telangana",       baseline: 23.5, current: 66.8, health: 68, edu: 76, agri: 69, fin: 77, infra: 72 },
  { district: "Rajgarh",        state: "Madhya Pradesh",  baseline: 26.3, current: 65.9, health: 71, edu: 73, agri: 64, fin: 76, infra: 69 },
  { district: "Simdega",        state: "Jharkhand",       baseline: 25.7, current: 64.4, health: 66, edu: 71, agri: 72, fin: 74, infra: 67 },
  { district: "Balangir",       state: "Odisha",          baseline: 29.1, current: 63.8, health: 67, edu: 70, agri: 68, fin: 73, infra: 65 },
  { district: "YSR Kadapa",     state: "Andhra Pradesh",  baseline: 33.4, current: 63.2, health: 70, edu: 68, agri: 63, fin: 71, infra: 70 },
  { district: "Hailakandi",     state: "Assam",           baseline: 27.6, current: 62.7, health: 65, edu: 69, agri: 61, fin: 72, infra: 64 },
  { district: "Namsai",         state: "Arunachal Pr.",   baseline: 32.1, current: 61.9, health: 74, edu: 77, agri: 55, fin: 68, infra: 60 },
  { district: "Virudhunagar",   state: "Tamil Nadu",      baseline: 45.6, current: 65.3, health: 76, edu: 80, agri: 58, fin: 82, infra: 66 },
  { district: "Ramanathapuram", state: "Tamil Nadu",      baseline: 46.8, current: 65.2, health: 74, edu: 78, agri: 56, fin: 80, infra: 64 },
  { district: "Korba",          state: "Chhattisgarh",    baseline: 41.2, current: 63.1, health: 64, edu: 66, agri: 70, fin: 75, infra: 73 },
  { district: "Shravasti",      state: "Uttar Pradesh",   baseline: 21.3, current: 58.4, health: 61, edu: 64, agri: 62, fin: 70, infra: 63 },
  { district: "Bahraich",       state: "Uttar Pradesh",   baseline: 22.1, current: 57.9, health: 60, edu: 63, agri: 60, fin: 68, infra: 61 },
  { district: "Chitrakoot",     state: "Uttar Pradesh",   baseline: 23.4, current: 57.2, health: 62, edu: 65, agri: 59, fin: 67, infra: 60 },
  { district: "Kishanganj",     state: "Bihar",           baseline: 19.8, current: 54.6, health: 58, edu: 61, agri: 57, fin: 65, infra: 58 },
  { district: "Araria",         state: "Bihar",           baseline: 18.9, current: 53.8, health: 56, edu: 59, agri: 55, fin: 63, infra: 57 },
  { district: "Dumka",          state: "Jharkhand",       baseline: 20.5, current: 53.1, health: 57, edu: 58, agri: 58, fin: 62, infra: 55 },
];

const STATE_DISTRICT_COUNT = [
  { state: "Jharkhand",        count: 19, color: "#00c896" },
  { state: "Bihar",            count: 13, color: "#4da6ff" },
  { state: "Odisha",           count: 10, color: "#cc88ff" },
  { state: "Assam",            count: 9,  color: "#ff88aa" },
  { state: "Uttar Pradesh",    count: 8,  color: "#ff6b00" },
  { state: "Madhya Pradesh",   count: 8,  color: "#ffcc00" },
  { state: "Andhra Pradesh",   count: 7,  color: "#aaffaa" },
  { state: "Rajasthan",        count: 5,  color: "#ff4444" },
  { state: "Chhattisgarh",     count: 4,  color: "#88ffcc" },
  { state: "Karnataka",        count: 3,  color: "#ff9966" },
  { state: "West Bengal",      count: 3,  color: "#66aaff" },
  { state: "Manipur",          count: 3,  color: "#ffaa66" },
  { state: "Nagaland",         count: 3,  color: "#aa88ff" },
  { state: "Arunachal Pr.",    count: 3,  color: "#66ffcc" },
  { state: "Uttarakhand",      count: 2,  color: "#ff6688" },
  { state: "Maharashtra",      count: 2,  color: "#88ccff" },
  { state: "Telangana",        count: 2,  color: "#ffdd88" },
  { state: "Meghalaya",        count: 2,  color: "#cc88aa" },
  { state: "Himachal Pr.",     count: 2,  color: "#88ffaa" },
  { state: "Mizoram",          count: 1,  color: "#ff8888" },
  { state: "Tripura",          count: 1,  color: "#88aaff" },
  { state: "Sikkim",           count: 1,  color: "#ffcc88" },
  { state: "Gujarat",          count: 1,  color: "#cc8888" },
  { state: "Kerala",           count: 1,  color: "#88ff88" },
].sort((a, b) => b.count - a.count);

const NATIONAL_STATS = [
  { label: "Districts improved by 50%+",   value: "67",   sub: "60% of all 112 districts",          color: "#00c896" },
  { label: "Score more than doubled",       value: "3+",   sub: "Singrauli, Mewat, Asifabad",        color: "#ff6b00" },
  { label: "Avg improvement 2018–2024",     value: "~40%", sub: "Across all 112 districts",          color: "#4da6ff" },
  { label: "CSR invested (2014–2023)",      value: "₹4,594 Cr", sub: "2.5% of total national CSR",  color: "#ffcc00" },
];

const DistrictTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = DISTRICT_DATA.find(x => x.district === label);
  if (!d) return null;
  const improvement = ((d.current - d.baseline) / d.baseline * 100).toFixed(0);
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #00c896", padding: "10px 14px", borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
      <p style={{ color: "#00c896", margin: 0, marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#888", margin: "2px 0", fontSize: 10 }}>{d.state}</p>
      <p style={{ color: "#e0e0e0", margin: "2px 0" }}>Baseline 2018: {d.baseline}%</p>
      <p style={{ color: "#00c896", margin: "2px 0" }}>Current 2024: {d.current}%</p>
      <p style={{ color: "#ffcc00", margin: "2px 0" }}>Improvement: +{improvement}%</p>
    </div>
  );
};

export default function AspirationalDistrictsModule() {
  const chartRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedState = searchParams.get('state');

  const [tab,      setTab]      = useState(searchParams.get('tab') || 'overview');
  const [selected, setSelected] = useState(DISTRICT_DATA[0]);
  const [sortBy,   setSortBy]   = useState("improvement");

  const handleTabChange = (t) => {
    setTab(t);
    setSearchParams(p => { const n = new URLSearchParams(p); n.set('tab', t); return n; }, { replace: true });
  };

  const sortedDistricts = [...DISTRICT_DATA].sort((a, b) => {
    if (sortBy === "improvement") return (b.current - b.baseline) - (a.current - a.baseline);
    if (sortBy === "least")       return (a.current - a.baseline) - (b.current - b.baseline);
    if (sortBy === "current")     return b.current - a.current;
    if (sortBy === "baseline")    return a.baseline - b.baseline;
    return 0;
  });

  const radarData = PILLARS.map(p => ({ pillar: p.name.split(" ")[0], score: selected[p.key], fullMark: 100 }));

  return (
    <div style={{ background: "#080808", color: "#e0e0e0", fontFamily: "'IBM Plex Sans', sans-serif", borderTop: "1px solid #1a1a1a" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;600&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <div style={{ padding: "28px 40px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 4, color: "#00c896", lineHeight: 1 }}>ASPIRATIONAL DISTRICTS</div>
          <div style={{ fontSize: 12, color: "#555", letterSpacing: 3, marginTop: 4 }}>112 DISTRICTS · 27 STATES · NITI AAYOG ADP · 2018–2024</div>
        </div>
        <div style={{ fontSize: 10, color: "#333", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2, textAlign: "right" }}>SOURCE · NITI AAYOG ADP REPORTS<br />CHAMPIONS OF CHANGE DASHBOARD</div>
      </div>

      <div style={{ background: "#001a0f", borderBottom: "1px solid #003322", padding: "10px 40px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#448866", letterSpacing: 1, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#00c896", fontSize: 14 }}>&#9685;</span>
        112 of India's most underdeveloped districts are scored monthly on 49 KPIs across 5 pillars. DC performance is directly proxied by district improvement scores.
        <span style={{ marginLeft: "auto", color: "#224433" }}>championsofchange.gov.in</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid #1a1a1a" }}>
        {NATIONAL_STATS.map((kpi, i) => (
          <div key={i} style={{ padding: "20px 32px", borderRight: i < 3 ? "1px solid #1a1a1a" : "none" }}>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: 3, marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: kpi.color, letterSpacing: 2 }}>{kpi.value}</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2, fontFamily: "monospace" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #1a1a1a", padding: "12px 40px", gap: 32, overflowX: "auto" }}>
        {PILLARS.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: p.color }} />
            <span style={{ fontSize: 10, color: "#555", fontFamily: "monospace" }}>{p.name}</span>
            <span style={{ fontSize: 11, color: p.color, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{p.weight}%</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #1a1a1a", padding: "0 40px" }}>
        {[
          { id: "overview",  label: "IMPROVEMENT RANKING" },
          { id: "drilldown", label: "DISTRICT DRILL-DOWN" },
          { id: "states",    label: "STATE DISTRIBUTION" },
        ].map(t => (
          <button key={t.id} onClick={() => handleTabChange(t.id)} style={{ background: "none", border: "none", borderBottom: tab === t.id ? "2px solid #00c896" : "2px solid transparent", color: tab === t.id ? "#00c896" : "#444", padding: "14px 20px", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, marginBottom: -1, transition: "all 0.15s" }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "32px 40px" }}>
        {highlightedState && (
          <div style={{ marginBottom: 16, padding: '8px 16px', background: '#0d0d00', border: '1px solid #ff6b0044', borderLeft: '3px solid #ff6b00', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>
            <span style={{ color: '#ff6b00', letterSpacing: 2 }}>&#9685; HIGHLIGHTING · {highlightedState.toUpperCase()}</span>
            <button onClick={() => setSearchParams(p => { const n = new URLSearchParams(p); n.delete('state'); return n; }, { replace: true })} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>✕ CLEAR</button>
          </div>
        )}

        {tab === "overview" && (
          <div ref={chartRef}>
            <ChartToolbar chartRef={chartRef} data={DISTRICT_DATA} csvFilename="aspirational-districts-data" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 4 }}>
                  {sortBy === "least" ? "⚠ LEAST IMPROVED DISTRICTS · DISTRICTS WHERE LITTLE HAS CHANGED SINCE 2018" : "MOST IMPROVED DISTRICTS · FROM WORST BASELINE TO HIGHEST DELTA · 2018–2024"}
                </div>
                <div style={{ fontSize: 10, color: sortBy === "least" ? "#884444" : "#448866", fontFamily: "monospace" }}>
                  {sortBy === "least" ? "These districts had the smallest improvement — DC accountability question" : "These were India's most underdeveloped districts in 2018 — ranked by how much they improved"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {[
                  { key: "improvement", label: "MOST IMPROVED",  activeColor: "#00c896" },
                  { key: "least",       label: "LEAST IMPROVED", activeColor: "#ff4444" },
                  { key: "current",     label: "CURRENT SCORE",  activeColor: "#4da6ff" },
                ].map(s => (
                  <button key={s.key} onClick={() => setSortBy(s.key)} style={{ background: sortBy === s.key ? s.activeColor : "transparent", border: `1px solid ${sortBy === s.key ? s.activeColor : "#222"}`, color: sortBy === s.key ? "#000" : "#555", padding: "4px 12px", borderRadius: 2, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, cursor: "pointer", letterSpacing: 1, transition: "all 0.15s" }}>{s.label}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={sortedDistricts} margin={{ top: 0, right: 20, left: 20, bottom: 80 }}>
                <CartesianGrid stroke="#111" vertical={false} />
                <XAxis dataKey="district" tick={{ fill: "#444", fontSize: 9, fontFamily: "IBM Plex Mono" }} angle={-40} textAnchor="end" interval={0} tickLine={false} axisLine={{ stroke: "#1a1a1a" }} />
                <YAxis tickFormatter={v => `${v}%`} tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} domain={[0, 90]} />
                <Tooltip content={<DistrictTooltip />} cursor={{ fill: "#111" }} />
                <Bar dataKey="baseline" name="Baseline 2018" fill="#ff6b0030" radius={[2, 2, 0, 0]} />
                <Bar dataKey="current" name="Current 2024"
                  radius={[2, 2, 0, 0]}
                  onClick={(d) => setSelected(DISTRICT_DATA.find(x => x.district === d.district) || selected)}
                >
                  {sortedDistricts.map((d, i) => (
                    <Cell key={i}
                      fill={highlightedState
                        ? (DISTRICT_DATA.find(x => x.district === d.district)?.state === highlightedState
                          ? (sortBy === "least" ? "#ff444460" : "#00c89660")
                          : "#1a1a1a")
                        : (sortBy === "least" ? "#ff444460" : "#00c89660")}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 24, marginTop: 8, justifyContent: "center" }}>
              {[
                { color: "#ff6b0050", label: "BASELINE SCORE 2018" },
                { color: sortBy === "least" ? "#ff444460" : "#00c89670", label: "CURRENT SCORE 2024" },
              ].map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: l.color }} />
                  <span style={{ fontSize: 10, color: "#444", fontFamily: "monospace" }}>{l.label}</span>
                </div>
              ))}
            </div>
            {sortBy === "least" && (
              <div style={{ marginTop: 16, padding: "14px 20px", background: "#0a0000", border: "1px solid #330000", fontFamily: "monospace", fontSize: 10, color: "#884444", lineHeight: 1.8 }}>
                ⚠ &nbsp;These districts had the least improvement despite being in the ADP programme since 2018. &nbsp;Low delta = systemic issues, poor governance, or lack of administrative push at district level.
              </div>
            )}
            <div style={{ marginTop: 24, padding: "14px 20px", background: "#001a0f", border: "1px solid #003322", fontFamily: "monospace", fontSize: 10, color: "#448866", lineHeight: 1.8 }}>
              &#9685; &nbsp;Click any bar to drill into that district's pillar-wise performance → Switch to "District Drill-Down" tab.
            </div>
          </div>
        )}

        {tab === "drilldown" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 20 }}>SELECT DISTRICT → VIEW PILLAR-WISE PERFORMANCE</div>
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 32 }}>
              <div style={{ overflowY: "auto", maxHeight: 460 }}>
                {DISTRICT_DATA.map((d, i) => {
                  const imp = ((d.current - d.baseline) / d.baseline * 100).toFixed(0);
                  return (
                    <div key={i} onClick={() => setSelected(d)} style={{ padding: "10px 14px", background: selected.district === d.district ? "#001a0f" : "transparent", border: selected.district === d.district ? "1px solid #00c896" : "1px solid transparent", borderRadius: 2, cursor: "pointer", marginBottom: 4, transition: "all 0.1s" }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: selected.district === d.district ? "#00c896" : "#888" }}>{d.district}</div>
                      <div style={{ fontSize: 9, color: "#444", fontFamily: "monospace", marginTop: 2 }}>{d.state} · +{imp}% improvement</div>
                    </div>
                  );
                })}
              </div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#00c896", letterSpacing: 3, marginBottom: 4 }}>{selected.district}</div>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace", marginBottom: 16 }}>{selected.state} · Baseline: {selected.baseline}% → Current: {selected.current}% &nbsp;(+{((selected.current - selected.baseline) / selected.baseline * 100).toFixed(0)}% improvement)</div>
                <ResponsiveContainer width="100%" height={340}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1a1a1a" />
                    <PolarAngleAxis dataKey="pillar" tick={{ fill: "#555", fontSize: 10, fontFamily: "IBM Plex Mono" }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#333", fontSize: 8 }} tickCount={4} />
                    <Radar name={selected.district} dataKey="score" stroke="#00c896" fill="#00c896" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                  {PILLARS.map((p, i) => (
                    <div key={i} style={{ padding: "8px 12px", background: "#0a0a0a", borderLeft: `2px solid ${p.color}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "#555", fontFamily: "monospace" }}>{p.name.split(" ")[0]}</span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: p.color }}>{selected[p.key]}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "states" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 20 }}>ASPIRATIONAL DISTRICTS BY STATE · NUMBER OF DISTRICTS INCLUDED</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <ResponsiveContainer width="100%" height={680}>
                <BarChart data={STATE_DISTRICT_COUNT} layout="vertical" margin={{ top: 0, right: 20, left: 120, bottom: 0 }}>
                  <CartesianGrid stroke="#111" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} domain={[0, 22]} />
                  <YAxis type="category" dataKey="state" tick={{ fill: "#888", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} width={120} />
                  <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #333", fontFamily: "monospace", fontSize: 11 }} cursor={{ fill: "#111" }} formatter={(value) => [`${value} districts`, "ADP Districts"]} />
                  <Bar dataKey="count" name="Districts" radius={[0, 2, 2, 0]}>
                    {STATE_DISTRICT_COUNT.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.75} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div>
                <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 16 }}>KEY INSIGHT — WHY THESE STATES?</div>
                {[
                  { title: "Jharkhand — 19 districts (most)", desc: "Despite being mineral-rich, tribal-dominated areas have poor infrastructure, low literacy, and historical administrative neglect.", color: "#00c896" },
                  { title: "Bihar — 13 districts", desc: "Persistent poverty, low HDI, and high population density. The state with the most systemic challenge.", color: "#4da6ff" },
                  { title: "Odisha — 10 districts", desc: "Southern tribal districts consistently lag on health and education. Kandhamal, Malkangiri remain chronic underperformers.", color: "#cc88ff" },
                  { title: "Assam — 9 districts", desc: "Flood-prone areas, tea garden communities, and border districts face structural barriers beyond normal governance.", color: "#ff88aa" },
                  { title: "UP & MP — 8 districts each", desc: "Eastern UP (Bundelkhand, Poorvanchal) and MP tribal belts show pockets of extreme deprivation despite overall state growth.", color: "#ffcc00" },
                  { title: "Developed states — 1 to 3 districts", desc: "Kerala (1), Gujarat (1), Maharashtra (2) — isolated deprivation pockets that survived despite broader state prosperity.", color: "#88ff88" },
                  { title: "Selection criteria", desc: "Districts chosen on Composite Index using poverty, health, education and infrastructure data from ministry sources. Last major revision: 2018.", color: "#888" },
                ].map((item, i) => (
                  <div key={i} style={{ padding: "12px 16px", borderLeft: `2px solid ${item.color}`, marginBottom: 10, background: "#0a0a0a" }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: item.color, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: "#555", fontFamily: "sans-serif", lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ borderTop: "1px solid #111", padding: "12px 40px", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#333", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2 }}>
        <span>SOURCE · NITI AAYOG ADP REPORTS 2018–2024 · CHAMPIONS OF CHANGE DASHBOARD</span>
        <span>INSIGHTS.DEBPROD.COM</span>
      </div>
    </div>
  );
}
