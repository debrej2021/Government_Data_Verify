import { useState, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ScatterChart, Scatter,
  ZAxis, Legend
} from "recharts";
import { useSearchParams } from "react-router-dom";
import ChartToolbar from "./ChartToolbar";
import { exportCSV, downloadChartPNG } from "../utils/chartExport";

const SNAKEBITE_DATA = [
  { state: "Uttar Pradesh",    reported: 422, actual: 8700, antivenom: 28, phcDoctors: 51 },
  { state: "Andhra Pradesh",   reported: 381, actual: 6100, antivenom: 42, phcDoctors: 63 },
  { state: "Odisha",           reported: 310, actual: 5900, antivenom: 31, phcDoctors: 44 },
  { state: "Bihar",            reported: 284, actual: 5200, antivenom: 24, phcDoctors: 38 },
  { state: "Jharkhand",        reported: 198, actual: 4800, antivenom: 19, phcDoctors: 35 },
  { state: "Maharashtra",      reported: 312, actual: 4600, antivenom: 55, phcDoctors: 71 },
  { state: "Madhya Pradesh",   reported: 267, actual: 4200, antivenom: 33, phcDoctors: 48 },
  { state: "Rajasthan",        reported: 189, actual: 3800, antivenom: 39, phcDoctors: 52 },
  { state: "West Bengal",      reported: 176, actual: 3400, antivenom: 47, phcDoctors: 68 },
  { state: "Telangana",        reported: 143, actual: 2900, antivenom: 38, phcDoctors: 59 },
  { state: "Chhattisgarh",     reported: 121, actual: 2600, antivenom: 22, phcDoctors: 41 },
  { state: "Gujarat",          reported: 134, actual: 2300, antivenom: 49, phcDoctors: 66 },
  { state: "Tamil Nadu",       reported: 98,  actual: 1800, antivenom: 61, phcDoctors: 78 },
  { state: "Karnataka",        reported: 87,  actual: 1600, antivenom: 58, phcDoctors: 74 },
  { state: "Kerala",           reported: 43,  actual: 900,  antivenom: 72, phcDoctors: 88 },
];

const FACILITY_DATA = [
  { level: "Sub-Centre",        availability: 4,  desc: "Village level — frontline but no drugs" },
  { level: "PHC",               availability: 31, desc: "Primary Health Centre" },
  { level: "CHC",               availability: 58, desc: "Community Health Centre" },
  { level: "Sub-District Hosp", availability: 74, desc: "Sub-District Hospital" },
  { level: "District Hospital",  availability: 89, desc: "District Hospital" },
];

const DOCTOR_VACANCY = [
  { speciality: "Surgeon",       sanctioned: 5765, inPosition: 1062, vacancy: 81.6 },
  { speciality: "Obstetrician",  sanctioned: 5765, inPosition: 1534, vacancy: 73.4 },
  { speciality: "Physician",     sanctioned: 5765, inPosition: 1023, vacancy: 82.3 },
  { speciality: "Paediatrician", sanctioned: 5765, inPosition: 986,  vacancy: 82.9 },
];

const CRISIS_DISTRICTS = [
  { district: "Kandhamal",   state: "Odisha",       snakebite: "HIGH",    antivenom: "ABSENT",    nearest: "87km" },
  { district: "Malkangiri",  state: "Odisha",       snakebite: "EXTREME", antivenom: "ABSENT",    nearest: "112km" },
  { district: "Gajapati",    state: "Odisha",       snakebite: "HIGH",    antivenom: "MINIMAL",   nearest: "64km" },
  { district: "Simdega",     state: "Jharkhand",    snakebite: "HIGH",    antivenom: "ABSENT",    nearest: "78km" },
  { district: "Gumla",       state: "Jharkhand",    snakebite: "EXTREME", antivenom: "ABSENT",    nearest: "94km" },
  { district: "Bahraich",    state: "Uttar Pradesh",snakebite: "HIGH",    antivenom: "MINIMAL",   nearest: "52km" },
  { district: "Shravasti",   state: "Uttar Pradesh",snakebite: "HIGH",    antivenom: "ABSENT",    nearest: "71km" },
  { district: "Narayanpur",  state: "Chhattisgarh", snakebite: "HIGH",    antivenom: "ABSENT",    nearest: "103km" },
  { district: "Bijapur",     state: "Chhattisgarh", snakebite: "EXTREME", antivenom: "ABSENT",    nearest: "118km" },
  { district: "Nandurbar",   state: "Maharashtra",  snakebite: "HIGH",    antivenom: "MINIMAL",   nearest: "58km" },
];

const RISK_COLOR = { "EXTREME": "#ff2222", "HIGH": "#ff8800", "MINIMAL": "#ffcc00", "ABSENT": "#660000" };
const AVAIL_COLOR = { "ABSENT": "#ff2222", "MINIMAL": "#ff8800" };

const SnakebiteTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = SNAKEBITE_DATA.find(x => x.state === label);
  if (!d) return null;
  const ratio = (d.actual / d.reported).toFixed(0);
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #ff4444", padding: "10px 14px", borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
      <p style={{ color: "#ff4444", margin: 0, marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#888", margin: "2px 0" }}>Reported deaths: {d.reported}</p>
      <p style={{ color: "#ff4444", margin: "2px 0" }}>Estimated actual: {d.actual.toLocaleString()}</p>
      <p style={{ color: "#ffcc00", margin: "2px 0" }}>Underreporting: {ratio}x</p>
      <p style={{ color: "#00c896", margin: "2px 0" }}>Antivenom at PHC: {d.antivenom}%</p>
    </div>
  );
};

export default function HealthGapsModule() {
  const chartRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedState = searchParams.get('state');

  const [tab, setTab] = useState(searchParams.get('tab') || 'snakebite');

  const handleTabChange = (t) => {
    setTab(t);
    setSearchParams(p => { const n = new URLSearchParams(p); n.set('tab', t); return n; }, { replace: true });
  };

  const totalReported = SNAKEBITE_DATA.reduce((s, d) => s + d.reported, 0);
  const totalActual   = SNAKEBITE_DATA.reduce((s, d) => s + d.actual, 0);
  const avgAntivenom  = (SNAKEBITE_DATA.reduce((s, d) => s + d.antivenom, 0) / SNAKEBITE_DATA.length).toFixed(0);
  const worstState    = [...SNAKEBITE_DATA].sort((a, b) => a.antivenom - b.antivenom)[0];

  return (
    <div style={{ background: "#080808", color: "#e0e0e0", fontFamily: "'IBM Plex Sans', sans-serif", borderTop: "1px solid #1a1a1a" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;600&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <div style={{ padding: "28px 40px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 4, color: "#ff4444", lineHeight: 1 }}>HEALTH GAPS</div>
          <div style={{ fontSize: 12, color: "#555", letterSpacing: 3, marginTop: 4 }}>SNAKEBITE CRISIS · ANTIVENOM VOIDS · DOCTOR VACANCIES · TRIBAL DISTRICTS</div>
        </div>
        <div style={{ fontSize: 10, color: "#333", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2, textAlign: "right" }}>SOURCE · THE LANCET 2020 · ICMR · HMIS<br />NHM RURAL HEALTH STATISTICS 2023</div>
      </div>

      <div style={{ background: "#110000", borderBottom: "1px solid #330000", padding: "10px 40px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#884444", letterSpacing: 1, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#ff4444", fontSize: 16 }}>⚠</span>
        India has ~58,000 snakebite deaths per year (The Lancet 2020) — the highest in the world. Only ~3,000 are officially reported. The gap is not a data problem. It is a governance problem.
        <span style={{ marginLeft: "auto", color: "#553333" }}>THE LANCET · 2020</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid #1a1a1a" }}>
        {[
          { label: "ACTUAL DEATHS / YEAR",   value: "~58,000",     sub: "The Lancet 2020 modelled estimate",       color: "#ff2222" },
          { label: "OFFICIALLY REPORTED",    value: `~${totalReported.toLocaleString()}`,  sub: "NCRB / hospital records — 20x undercount", color: "#ff8800" },
          { label: "AVG ANTIVENOM AT PHC",   value: `${avgAntivenom}%`,  sub: "National average across 15 states",      color: "#ffcc00" },
          { label: "WORST STATE ANTIVENOM",  value: worstState.state, sub: `Only ${worstState.antivenom}% PHCs stocked`,  color: "#ff4444" },
        ].map((kpi, i) => (
          <div key={i} style={{ padding: "20px 32px", borderRight: i < 3 ? "1px solid #1a1a1a" : "none" }}>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: 3, marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: kpi.color, letterSpacing: 2 }}>{kpi.value}</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2, fontFamily: "monospace" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #1a1a1a", padding: "0 40px" }}>
        {[
          { id: "snakebite", label: "SNAKEBITE BURDEN" },
          { id: "facility",  label: "FACILITY GAPS" },
          { id: "doctors",   label: "DOCTOR VACANCY" },
          { id: "crisis",    label: "CRISIS DISTRICTS" },
        ].map(t => (
          <button key={t.id} onClick={() => handleTabChange(t.id)} style={{ background: "none", border: "none", borderBottom: tab === t.id ? "2px solid #ff4444" : "2px solid transparent", color: tab === t.id ? "#ff4444" : "#444", padding: "14px 20px", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, marginBottom: -1, transition: "all 0.15s" }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "32px 40px" }}>
        {highlightedState && (
          <div style={{ marginBottom: 16, padding: '8px 16px', background: '#0d0d00', border: '1px solid #ff6b0044', borderLeft: '3px solid #ff6b00', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>
            <span style={{ color: '#ff6b00', letterSpacing: 2 }}>&#9685; HIGHLIGHTING · {highlightedState.toUpperCase()}</span>
            <button onClick={() => setSearchParams(p => { const n = new URLSearchParams(p); n.delete('state'); return n; }, { replace: true })} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>✕ CLEAR</button>
          </div>
        )}

        {tab === "snakebite" && (
          <div ref={chartRef}>
            <ChartToolbar chartRef={chartRef} data={SNAKEBITE_DATA} csvFilename="health-snakebite-data" />
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>REPORTED VS ACTUAL SNAKEBITE DEATHS · THE REPORTING GAP IS THE CRISIS</div>
            <div style={{ fontSize: 10, color: "#553333", marginBottom: 20, fontFamily: "monospace" }}>REPORTED = NCRB/HOSPITAL DATA · ACTUAL = THE LANCET 2020 MODELLED ESTIMATE</div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={[...SNAKEBITE_DATA].sort((a, b) => b.actual - a.actual)} margin={{ top: 0, right: 20, left: 20, bottom: 80 }}>
                <CartesianGrid stroke="#111" vertical={false} />
                <XAxis dataKey="state" tick={{ fill: "#444", fontSize: 9, fontFamily: "IBM Plex Mono" }} angle={-40} textAnchor="end" interval={0} tickLine={false} axisLine={{ stroke: "#1a1a1a" }} />
                <YAxis tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} />
                <Tooltip content={<SnakebiteTooltip />} cursor={{ fill: "#111" }} />
                <Legend wrapperStyle={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, paddingTop: 16 }} />
                <Bar dataKey="actual" name="Actual (Lancet estimate)" radius={[2, 2, 0, 0]}>
                  {[...SNAKEBITE_DATA].sort((a, b) => b.actual - a.actual).map((d, i) => (
                    <Cell key={i} fill={highlightedState ? (d.state === highlightedState ? "#ff444455" : "#1a1a1a") : "#ff444455"} />
                  ))}
                </Bar>
                <Bar dataKey="reported" name="Reported (NCRB)" fill="#ff8800" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 20, padding: "16px 20px", background: "#0a0000", border: "1px solid #330000", fontFamily: "monospace", fontSize: 11, color: "#884444", lineHeight: 1.8 }}>
              ⚠ &nbsp;India accounts for nearly 50% of global snakebite deaths. &nbsp;Most occur in rural/tribal areas at night with no transport to reach antivenom. &nbsp;Snakebite was designated a Neglected Tropical Disease by WHO in 2017. &nbsp;India launched a national programme in Sept 2022 — implementation is still nascent.
            </div>
          </div>
        )}

        {tab === "facility" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>ANTIVENOM AVAILABILITY BY FACILITY LEVEL · % OF FACILITIES STOCKED</div>
            <div style={{ fontSize: 10, color: "#553333", marginBottom: 24, fontFamily: "monospace" }}>SNAKEBITE VICTIMS REACH PHC/SUB-CENTRE FIRST · THAT IS WHERE STOCK IS LOWEST</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
              <div>
                {FACILITY_DATA.map((d, i) => (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
                      <span style={{ color: "#ccc" }}>{d.level}</span>
                      <span style={{ color: d.availability < 30 ? "#ff2222" : d.availability < 60 ? "#ff8800" : "#00c896" }}>{d.availability}%</span>
                    </div>
                    <div style={{ height: 8, background: "#111", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${d.availability}%`, background: d.availability < 30 ? "#ff2222" : d.availability < 60 ? "#ff8800" : "#00c896", borderRadius: 4, transition: "width 0.8s ease" }} />
                    </div>
                    <div style={{ fontSize: 9, color: "#333", marginTop: 4, fontFamily: "monospace" }}>{d.desc}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 16 }}>STATE-WISE PHC ANTIVENOM AVAILABILITY %</div>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={[...SNAKEBITE_DATA].sort((a, b) => a.antivenom - b.antivenom)} layout="vertical" margin={{ top: 0, right: 20, left: 120, bottom: 0 }}>
                    <CartesianGrid stroke="#111" horizontal={false} />
                    <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <YAxis type="category" dataKey="state" tick={{ fill: "#888", fontSize: 9, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} width={120} />
                    <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #333", fontFamily: "monospace", fontSize: 11 }} cursor={{ fill: "#111" }} formatter={(v) => [`${v}%`, "PHC Antivenom"]} />
                    <Bar dataKey="antivenom" name="PHC Antivenom %" radius={[0, 2, 2, 0]}>
                      {[...SNAKEBITE_DATA].sort((a, b) => a.antivenom - b.antivenom).map((d, i) => (
                        <Cell key={i} fill={d.antivenom < 30 ? "#ff2222" : d.antivenom < 55 ? "#ff8800" : "#00c896"} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {tab === "doctors" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>SPECIALIST DOCTOR VACANCY AT COMMUNITY HEALTH CENTRES · INDIA · 2023</div>
            <div style={{ fontSize: 10, color: "#553333", marginBottom: 24, fontFamily: "monospace" }}>SOURCE · RURAL HEALTH STATISTICS 2023 · MOHFW &nbsp;| &nbsp; CHC IS THE FIRST POINT OF SPECIALIST CARE FOR RURAL INDIA</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
              {DOCTOR_VACANCY.map((d, i) => (
                <div key={i} style={{ padding: "20px 24px", background: "#0a0000", border: "1px solid #1a0000", borderLeft: "3px solid #ff4444" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: "#ff2222", lineHeight: 1, marginBottom: 8 }}>{d.vacancy}%</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#cc6666", marginBottom: 8 }}>{d.speciality} VACANCY</div>
                  <div style={{ height: 4, background: "#1a0000", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", width: `${d.vacancy}%`, background: "#ff2222", borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#553333", fontFamily: "monospace" }}>{d.inPosition.toLocaleString()} of {d.sanctioned.toLocaleString()} posts filled</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "16px 20px", background: "#0a0000", border: "1px solid #330000", fontFamily: "monospace", fontSize: 11, color: "#884444", lineHeight: 1.8 }}>
              ⚠ &nbsp;Over 80% of specialist posts at Community Health Centres are vacant. &nbsp;A CHC serves a population of 80,000–1,20,000 in rural India. &nbsp;A snakebite victim reaching a CHC at night has an 80% chance of finding no specialist. &nbsp;Source: Rural Health Statistics 2023, MoHFW.
            </div>
          </>
        )}

        {tab === "crisis" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>HIGH SNAKEBITE BURDEN DISTRICTS WITH NO ANTIVENOM WITHIN REACH</div>
            <div style={{ fontSize: 10, color: "#553333", marginBottom: 20, fontFamily: "monospace" }}>"NEAREST" = DISTANCE TO NEAREST FACILITY WITH CONFIRMED ANTIVENOM STOCK &nbsp;| &nbsp; SOURCE: NHM FACILITY SURVEYS</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
              <thead>
                <tr>
                  {["DISTRICT", "STATE", "SNAKEBITE BURDEN", "ANTIVENOM STATUS", "NEAREST STOCK"].map((h, i) => (
                    <th key={i} style={{ textAlign: "left", padding: "10px 16px", color: "#444", letterSpacing: 2, fontWeight: 400, borderBottom: "1px solid #1a1a1a", fontSize: 10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRISIS_DISTRICTS.map((d, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #0d0d0d" }}>
                    <td style={{ padding: "12px 16px", color: "#ccc" }}>{d.district}</td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>{d.state}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ color: RISK_COLOR[d.snakebite], background: `${RISK_COLOR[d.snakebite]}22`, padding: "2px 8px", borderRadius: 2, fontSize: 10 }}>{d.snakebite}</span></td>
                    <td style={{ padding: "12px 16px" }}><span style={{ color: AVAIL_COLOR[d.antivenom] || "#ffcc00", background: `${(AVAIL_COLOR[d.antivenom] || "#ffcc00")}22`, padding: "2px 8px", borderRadius: 2, fontSize: 10 }}>{d.antivenom}</span></td>
                    <td style={{ padding: "12px 16px", color: parseInt(d.nearest) > 80 ? "#ff2222" : "#ff8800", fontWeight: 600 }}>{d.nearest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 24, padding: "16px 20px", background: "#0a0000", border: "1px solid #330000", fontFamily: "monospace", fontSize: 11, color: "#884444", lineHeight: 1.8 }}>
              ⚠ &nbsp;Notice: Kandhamal, Malkangiri, Gumla, Bijapur, Narayanpur — all are Aspirational Districts with high tribal population. &nbsp;The overlap between "underdeveloped district" and "no antivenom" is not a coincidence. &nbsp;It is the same administrative failure showing up in two different datasets.
            </div>
          </>
        )}
      </div>

      <div style={{ borderTop: "1px solid #111", padding: "12px 40px", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#333", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2 }}>
        <span>SOURCE · THE LANCET 2020 · ICMR · HMIS ANNUAL REPORT · NHM RURAL HEALTH STATISTICS 2023</span>
        <span>INSIGHTS.DEBPROD.COM</span>
      </div>
    </div>
  );
}
