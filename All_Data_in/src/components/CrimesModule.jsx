import { useState, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend
} from "recharts";
import { useSearchParams } from "react-router-dom";
import ChartToolbar from "./ChartToolbar";
import { exportCSV, downloadChartPNG } from "../utils/chartExport";

const TREND_DATA = [
  { year: "2017", total: 359849, rape: 32559 },
  { year: "2018", total: 378236, rape: 33356 },
  { year: "2019", total: 405326, rape: 32033 },
  { year: "2020", total: 371503, rape: 28046 },
  { year: "2021", total: 428278, rape: 31677 },
  { year: "2022", total: 445256, rape: 31516 },
  { year: "2023", total: 471000, rape: 32032 },
];

const CATEGORY_DATA = [
  { category: "Domestic Cruelty (498A)", count: 146085, pct: 31.0, color: "#ff4444" },
  { category: "Assault on Modesty",      count: 94220,  pct: 20.0, color: "#ff8800" },
  { category: "Kidnapping/Abduction",    count: 89432,  pct: 19.0, color: "#ffcc00" },
  { category: "POCSO",                   count: 170000, pct: 36.1, color: "#aa44ff" },
  { category: "Rape",                    count: 32032,  pct: 6.8,  color: "#cc0000" },
  { category: "Stalking",                count: 17006,  pct: 3.6,  color: "#ff6688" },
  { category: "Dowry Deaths",            count: 6456,   pct: 1.4,  color: "#cc4400" },
  { category: "Acid Attack",             count: 322,    pct: 0.07, color: "#ff2200" },
];

const STATE_CRIME_RATE = [
  { state: "Delhi",         rate: 144.4, rapes: 1226 },
  { state: "Haryana",       rate: 118.7, rapes: 1524 },
  { state: "Telangana",     rate: 117.6, rapes: 1612 },
  { state: "Rajasthan",     rate: 112.3, rapes: 5399 },
  { state: "Odisha",        rate: 98.4,  rapes: 1893 },
  { state: "MP",            rate: 94.1,  rapes: 2947 },
  { state: "Assam",         rate: 91.2,  rapes: 1984 },
  { state: "UP",            rate: 74.3,  rapes: 3690 },
  { state: "National Avg",  rate: 66.4,  rapes: null  },
  { state: "West Bengal",   rate: 62.1,  rapes: 842  },
  { state: "Maharashtra",   rate: 61.8,  rapes: 2904 },
  { state: "Gujarat",       rate: 48.2,  rapes: 1022 },
  { state: "Tamil Nadu",    rate: 43.1,  rapes: 1521 },
  { state: "Kerala",        rate: 39.4,  rapes: 735  },
  { state: "Karnataka",     rate: 38.7,  rapes: 1198 },
];

const CONVICTION_TREND = [
  { year: "2017", conviction: 18.9, acquittal: 10.37, pending: 70.73 },
  { year: "2018", conviction: 17.2, acquittal: 9.81,  pending: 72.99 },
  { year: "2019", conviction: 16.1, acquittal: 10.37, pending: 73.53 },
  { year: "2020", conviction: 9.12, acquittal: 5.21,  pending: 85.67 },
  { year: "2021", conviction: 11.4, acquittal: 3.52,  pending: 85.08 },
  { year: "2022", conviction: 15.38,acquittal: 5.96,  pending: 78.66 },
];

const JUSTICE_GAP = [
  { label: "Rape conviction rate",      value: "27.8%",    context: "Of cases reaching courts — NCRB 2022",       color: "#ff4444" },
  { label: "Cases pending trial",       value: "1.3 Lakh", context: "Rape cases in courts — NCRB 2023",           color: "#ff8800" },
  { label: "Avg trial duration",        value: "5+ Years", context: "FIR to judgment — MoSPI data",               color: "#ffcc00" },
  { label: "Rapes by known persons",    value: "89%",      context: "Family/acquaintances — NCRB 2021",           color: "#cc88ff" },
  { label: "POCSO cases increase",      value: "+9.2%",    context: "Child sexual abuse cases rose in 2023",      color: "#ff2222" },
  { label: "Domestic cruelty pending",  value: "2 Lakh",   context: "Cases pending under 498A — NCRB 2023",       color: "#ff6600" },
  { label: "Crimes per hour",           value: "51",       context: "Average in 2022 — 4,45,256 annual cases",    color: "#ff4488" },
  { label: "Spousal violence (NFHS-5)", value: "29.3%",    context: "Married women — unreported, never in NCRB",  color: "#aa44ff" },
];

const DEATH_PENALTY_TREND = [
  { year: "2001", sentenced: 111, executed: 0, deathRow: 0   },
  { year: "2002", sentenced: 104, executed: 0, deathRow: 0   },
  { year: "2003", sentenced: 98,  executed: 0, deathRow: 0   },
  { year: "2004", sentenced: 95,  executed: 1, deathRow: 0   },
  { year: "2005", sentenced: 77,  executed: 0, deathRow: 0   },
  { year: "2006", sentenced: 86,  executed: 0, deathRow: 0   },
  { year: "2007", sentenced: 99,  executed: 0, deathRow: 0   },
  { year: "2008", sentenced: 40,  executed: 0, deathRow: 0   },
  { year: "2009", sentenced: 55,  executed: 0, deathRow: 0   },
  { year: "2010", sentenced: 60,  executed: 0, deathRow: 0   },
  { year: "2011", sentenced: 110, executed: 0, deathRow: 0   },
  { year: "2012", sentenced: 68,  executed: 1, deathRow: 0   },
  { year: "2013", sentenced: 72,  executed: 1, deathRow: 0   },
  { year: "2014", sentenced: 98,  executed: 0, deathRow: 385 },
  { year: "2015", sentenced: 112, executed: 1, deathRow: 400 },
  { year: "2016", sentenced: 153, executed: 0, deathRow: 385 },
  { year: "2017", sentenced: 109, executed: 0, deathRow: 371 },
  { year: "2018", sentenced: 162, executed: 0, deathRow: 426 },
  { year: "2019", sentenced: 102, executed: 0, deathRow: 378 },
  { year: "2020", sentenced: 77,  executed: 4, deathRow: 488 },
  { year: "2021", sentenced: 144, executed: 0, deathRow: 488 },
  { year: "2022", sentenced: 165, executed: 0, deathRow: 539 },
  { year: "2023", sentenced: 120, executed: 0, deathRow: 545 },
  { year: "2024", sentenced: 132, executed: 0, deathRow: 564 },
];

const EXECUTIONS_WOMEN = [
  { year: 2004, name: "Dhananjoy Chatterjee", victim: "Hetal Parekh, 18 years old", crime: "Rape & murder in her own apartment building where he worked as a security guard. Executed after 14 years on death row.", prison: "Alipore Central Jail, Kolkata", years_on_row: 14, note: "First execution in India after an 8-year gap since 1995." },
  { year: 2020, name: "Mukesh Singh", victim: "Jyoti Singh — Nirbhaya — 23 years old", crime: "Gangrape & murder on a moving bus in Delhi on December 16, 2012. One of four executed simultaneously.", prison: "Tihar Jail, Delhi", years_on_row: 7, note: "All four Nirbhaya convicts were hanged simultaneously at 5:30 AM on March 20, 2020." },
  { year: 2020, name: "Akshay Kumar Singh", victim: "Jyoti Singh — Nirbhaya — 23 years old", crime: "Gangrape & murder on a moving bus in Delhi on December 16, 2012. One of four executed simultaneously.", prison: "Tihar Jail, Delhi", years_on_row: 7, note: "All four Nirbhaya convicts were hanged simultaneously at 5:30 AM on March 20, 2020." },
  { year: 2020, name: "Vinay Sharma", victim: "Jyoti Singh — Nirbhaya — 23 years old", crime: "Gangrape & murder on a moving bus in Delhi on December 16, 2012. One of four executed simultaneously.", prison: "Tihar Jail, Delhi", years_on_row: 7, note: "All four Nirbhaya convicts were hanged simultaneously at 5:30 AM on March 20, 2020." },
  { year: 2020, name: "Pawan Gupta", victim: "Jyoti Singh — Nirbhaya — 23 years old", crime: "Gangrape & murder on a moving bus in Delhi on December 16, 2012. One of four executed simultaneously.", prison: "Tihar Jail, Delhi", years_on_row: 7, note: "All four Nirbhaya convicts were hanged simultaneously at 5:30 AM on March 20, 2020." },
];

const EXECUTIONS_TERROR = [
  { year: 2012, name: "Ajmal Kasab", crime: "26/11 Mumbai terror attack — 166 people killed. Only surviving gunman. Hanged secretly to avoid protests.", prison: "Yerwada Jail, Pune", years_on_row: 4 },
  { year: 2013, name: "Afzal Guru", crime: "2001 Indian Parliament attack — 9 security personnel killed. Family was not informed before hanging.", prison: "Tihar Jail, Delhi", years_on_row: 11 },
  { year: 2015, name: "Yakub Memon", crime: "1993 Bombay serial blasts — 257 killed, 713 injured. Spent 21 years on death row — longest of all 8.", prison: "Nagpur Central Jail", years_on_row: 21 },
];

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #ff4444", padding: "10px 14px", borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
      <p style={{ color: "#ff4444", margin: 0, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: "#e0e0e0", margin: "2px 0" }}>{p.name}: {Number(p.value).toLocaleString("en-IN")}</p>)}
    </div>
  );
};

const StateTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = STATE_CRIME_RATE.find(x => x.state === label);
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #ff4444", padding: "10px 14px", borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
      <p style={{ color: "#ff4444", margin: 0, marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#e0e0e0", margin: "2px 0" }}>Crime rate: {d?.rate} per lakh women</p>
      {d?.rapes && <p style={{ color: "#ff8800", margin: "2px 0" }}>Rape cases: {d.rapes.toLocaleString()}</p>}
    </div>
  );
};

const DeathTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #cc88ff", padding: "10px 14px", borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
      <p style={{ color: "#cc88ff", margin: 0, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: "#e0e0e0", margin: "2px 0" }}>{p.name}: {p.value}{p.dataKey === "executed" && p.value > 0 && " ← EXECUTION YEAR"}</p>)}
    </div>
  );
};

export default function CrimesModule() {
  const chartRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedState = searchParams.get('state');

  const [tab, setTab] = useState(searchParams.get('tab') || 'overview');

  const handleTabChange = (t) => {
    setTab(t);
    setSearchParams(p => { const n = new URLSearchParams(p); n.set('tab', t); return n; }, { replace: true });
  };

  const totalSentenced  = DEATH_PENALTY_TREND.reduce((s, d) => s + d.sentenced, 0);
  const totalExecuted   = DEATH_PENALTY_TREND.reduce((s, d) => s + d.executed, 0);

  return (
    <div style={{ background: "#080808", color: "#e0e0e0", fontFamily: "'IBM Plex Sans', sans-serif", borderTop: "1px solid #1a1a1a" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;600&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <div style={{ padding: "28px 40px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 4, color: "#ff2222", lineHeight: 1 }}>CRIMES AGAINST WOMEN · DEATH PENALTY</div>
          <div style={{ fontSize: 12, color: "#555", letterSpacing: 3, marginTop: 4 }}>NCRB 2023 · CONVICTION RATES · JUSTICE GAP · CAPITAL PUNISHMENT DATA</div>
        </div>
        <div style={{ fontSize: 10, color: "#333", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2, textAlign: "right" }}>SOURCE · NCRB 2022/2023 · CHRI SEP 2024<br />PROJECT 39A · FACTLY · NFHS-5</div>
      </div>

      <div style={{ background: "#110000", borderBottom: "1px solid #330000", padding: "10px 40px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#884444", letterSpacing: 1, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#ff2222", fontSize: 16 }}>⚠</span>
        4,71,000 crimes against women in 2023 — 51/hour. Only 27.8% rape conviction rate. 3,026 death sentences since 2001. Only 8 executions carried out.
        <span style={{ marginLeft: "auto", color: "#553333" }}>NCRB 2023 · PROJECT 39A</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid #1a1a1a" }}>
        {[
          { label: "TOTAL CASES 2023",       value: "4,71,000",   sub: "3% rise · 51 per hour",                  color: "#ff2222" },
          { label: "RAPE CONVICTION RATE",   value: "27.8%",      sub: "Of cases reaching court · NCRB 2022",    color: "#ff8800" },
          { label: "DEATH SENTENCES 2001–23",value: `${totalSentenced.toLocaleString()}`, sub: "Trial courts · avg 132/year",  color: "#cc88ff" },
          { label: "ACTUAL EXECUTIONS",      value: totalExecuted.toString(), sub: "Since 2000 · last was 2020 Nirbhaya", color: "#ff4444" },
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
          { id: "overview",    label: "TREND 2017–2023" },
          { id: "states",      label: "STATE-WISE BURDEN" },
          { id: "conviction",  label: "CONVICTION GAP" },
          { id: "justice",     label: "JUSTICE SCORECARD" },
          { id: "death",       label: "DEATH PENALTY" },
        ].map(t => (
          <button key={t.id} onClick={() => handleTabChange(t.id)} style={{ background: "none", border: "none", borderBottom: tab === t.id ? "2px solid #ff2222" : "2px solid transparent", color: tab === t.id ? "#ff2222" : "#444", padding: "14px 20px", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, marginBottom: -1, transition: "all 0.15s" }}>{t.label}</button>
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
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>TOTAL CRIMES AGAINST WOMEN · 2017–2023</div>
            <div style={{ fontSize: 10, color: "#553333", marginBottom: 20, fontFamily: "monospace" }}>2020 DIP = COVID LOCKDOWN — FEWER COMPLAINTS FILED, NOT FEWER CRIMES</div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={TREND_DATA} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid stroke="#111" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={{ stroke: "#1a1a1a" }} />
                <YAxis tickFormatter={v => `${(v/100000).toFixed(1)}L`} tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} />
                <Tooltip content={<TrendTooltip />} />
                <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 10, paddingTop: 12 }} />
                <Line type="monotone" dataKey="total" name="Total crimes" stroke="#ff4444" strokeWidth={2} dot={{ r: 4, fill: "#ff4444" }} />
                <Line type="monotone" dataKey="rape"  name="Rape cases"   stroke="#ff8800" strokeWidth={2} dot={{ r: 3, fill: "#ff8800" }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 20 }}>CRIME CATEGORY BREAKDOWN · 2023</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                {CATEGORY_DATA.map((d, i) => (
                  <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #0d0d0d", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
                        <span style={{ color: "#ccc" }}>{d.category}</span>
                        <span style={{ color: d.color }}>{d.count.toLocaleString("en-IN")}</span>
                      </div>
                      <div style={{ height: 3, background: "#111", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(d.pct * 2, 100)}%`, background: d.color, borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "states" && (
          <div ref={chartRef}>
            <ChartToolbar chartRef={chartRef} data={STATE_CRIME_RATE} csvFilename="crimes-state-data" />
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>CRIME RATE PER LAKH WOMEN · STATE-WISE · NCRB 2022</div>
            <div style={{ fontSize: 10, color: "#553333", marginBottom: 20, fontFamily: "monospace" }}>NATIONAL AVERAGE: 66.4 · DELHI IS 2.17X THE NATIONAL AVERAGE</div>
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={STATE_CRIME_RATE} margin={{ top: 0, right: 20, left: 20, bottom: 80 }}>
                <CartesianGrid stroke="#111" vertical={false} />
                <XAxis dataKey="state" tick={{ fill: "#444", fontSize: 9, fontFamily: "IBM Plex Mono" }} angle={-40} textAnchor="end" interval={0} tickLine={false} axisLine={{ stroke: "#1a1a1a" }} />
                <YAxis tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} />
                <Tooltip content={<StateTooltip />} cursor={{ fill: "#111" }} />
                <Bar dataKey="rate" name="Crime rate" radius={[2, 2, 0, 0]}>
                  {STATE_CRIME_RATE.map((d, i) => (
                    <Cell key={i}
                      fill={highlightedState
                        ? (d.state === highlightedState ? (d.state === "National Avg" ? "#ffdd00" : d.rate > 100 ? "#ff2222" : d.rate > 66.4 ? "#ff8800" : "#00c896") : "#222")
                        : (d.state === "National Avg" ? "#ffdd00" : d.rate > 100 ? "#ff2222" : d.rate > 66.4 ? "#ff8800" : "#00c896")}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {tab === "conviction" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>RAPE CASE DISPOSAL · CONVICTION VS ACQUITTAL VS PENDING · 2017–2022</div>
            <div style={{ fontSize: 10, color: "#553333", marginBottom: 20, fontFamily: "monospace" }}>SOURCE · CHRI ANALYSIS OF NCRB DATA · SEP 2024 · CONVICTION NEVER CROSSED 20%</div>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={CONVICTION_TREND} margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid stroke="#111" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={{ stroke: "#1a1a1a" }} />
                <YAxis tickFormatter={v => `${v}%`} tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #333", fontFamily: "monospace", fontSize: 11 }} formatter={(v, n) => [`${v}%`, n]} />
                <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 10, paddingTop: 12 }} />
                <Bar dataKey="conviction" name="Convicted %" fill="#00c896" radius={[2, 2, 0, 0]} />
                <Bar dataKey="acquittal"  name="Acquitted %" fill="#ffcc00" radius={[2, 2, 0, 0]} />
                <Bar dataKey="pending"    name="Pending %"   fill="#ff444455" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 24, padding: "16px 20px", background: "#0a0000", border: "1px solid #330000", fontFamily: "monospace", fontSize: 11, color: "#884444", lineHeight: 1.8 }}>
              ⚠ &nbsp;78.66% of rape cases in trial courts were still pending in 2022. &nbsp;Conviction peaked at 15.38% for rape/gangrape with murder. &nbsp;Source: CHRI Analysis of NCRB Data, September 2024.
            </div>
          </>
        )}

        {tab === "justice" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 24 }}>JUSTICE SYSTEM SCORECARD · CRIMES AGAINST WOMEN · INDIA 2023</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {JUSTICE_GAP.map((item, i) => (
                <div key={i} style={{ padding: "20px 24px", background: "#0a0000", border: "1px solid #1a0000", borderLeft: `3px solid ${item.color}` }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: item.color, lineHeight: 1, marginBottom: 6 }}>{item.value}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#cc6666", marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: "#553333", fontFamily: "monospace" }}>{item.context}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: "16px 20px", background: "#0a0000", border: "1px solid #330000", fontFamily: "monospace", fontSize: 11, color: "#884444", lineHeight: 1.8 }}>
              ⚠ &nbsp;29.3% of married women experienced spousal violence (NFHS-5). &nbsp;This number never appears in NCRB because it is almost never reported. &nbsp;The gap between NFHS and NCRB is not a data gap. It is a justice gap.
            </div>
          </>
        )}

        {tab === "death" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>DEATH SENTENCES AWARDED VS EXECUTIONS CARRIED OUT · 2001–2024</div>
            <div style={{ fontSize: 10, color: "#553333", marginBottom: 20, fontFamily: "monospace" }}>SOURCE · PROJECT 39A · FACTLY · NCRB · {totalSentenced.toLocaleString()} SENTENCED · ONLY {totalExecuted} EXECUTED</div>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={DEATH_PENALTY_TREND} margin={{ top: 0, right: 20, left: 10, bottom: 40 }}>
                <CartesianGrid stroke="#111" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: "#444", fontSize: 9, fontFamily: "IBM Plex Mono" }} angle={-40} textAnchor="end" interval={0} tickLine={false} axisLine={{ stroke: "#1a1a1a" }} />
                <YAxis tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} />
                <Tooltip content={<DeathTooltip />} cursor={{ fill: "#111" }} />
                <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 10, paddingTop: 56 }} />
                <Bar dataKey="sentenced" name="Death sentences awarded" fill="#cc88ff55" radius={[2, 2, 0, 0]} />
                <Bar dataKey="executed"  name="Actually executed"       fill="#ff2222"   radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 11, color: "#ff4444", letterSpacing: 3, marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace", borderLeft: "3px solid #ff4444", paddingLeft: 12 }}>EXECUTED FOR CRIMES AGAINST WOMEN · {EXECUTIONS_WOMEN.length} SOULS</div>
              <div style={{ display: "grid", gap: 8 }}>
                {EXECUTIONS_WOMEN.map((d, i) => (
                  <div key={i} style={{ padding: "16px 20px", background: "#0a0000", border: "1px solid #1a0000", borderLeft: "3px solid #ff2222" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#ff2222", letterSpacing: 2, marginRight: 12 }}>{d.year}</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#e0e0e0" }}>{d.name}</span>
                      </div>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: d.years_on_row > 10 ? "#ff8800" : "#666", whiteSpace: "nowrap" }}>{d.years_on_row} yrs on death row</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#ff88aa", fontFamily: "monospace", marginBottom: 6 }}>VICTIM · {d.victim}</div>
                    <div style={{ fontSize: 10, color: "#666", fontFamily: "monospace", marginBottom: 6, lineHeight: 1.6 }}>{d.crime}</div>
                    <div style={{ fontSize: 10, color: "#333", fontFamily: "monospace", fontStyle: "italic" }}>{d.prison} · {d.note}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 11, color: "#888", letterSpacing: 3, marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace", borderLeft: "3px solid #555", paddingLeft: 12 }}>EXECUTED FOR TERRORISM · {EXECUTIONS_TERROR.length} CASES · SEPARATE CATEGORY</div>
              <div style={{ display: "grid", gap: 8 }}>
                {EXECUTIONS_TERROR.map((d, i) => (
                  <div key={i} style={{ padding: "16px 20px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderLeft: "3px solid #555" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#888", letterSpacing: 2, marginRight: 12 }}>{d.year}</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#ccc" }}>{d.name}</span>
                      </div>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: d.years_on_row > 10 ? "#ff8800" : "#666" }}>{d.years_on_row} yrs on death row</span>
                    </div>
                    <div style={{ fontSize: 10, color: "#666", fontFamily: "monospace", lineHeight: 1.6 }}>{d.crime}</div>
                    <div style={{ fontSize: 10, color: "#333", fontFamily: "monospace", marginTop: 4 }}>{d.prison}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 24 }}>
              {[
                { label: "On death row (end 2024)", value: "564",      sub: "Highest since turn of century",               color: "#cc88ff" },
                { label: "Years avg on death row",  value: "5 Years",  sub: "Average wait before execution or commutation", color: "#ffcc00" },
                { label: "Sexual offence sentences",value: "65%",      sub: "Of 2020 death sentences — up from 17% in 2016",color: "#ff4444" },
              ].map((kpi, i) => (
                <div key={i} style={{ padding: "20px 24px", background: "#0a0000", border: "1px solid #1a0000", borderLeft: `3px solid ${kpi.color}` }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: kpi.color, lineHeight: 1, marginBottom: 6 }}>{kpi.value}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#cc6666", marginBottom: 4 }}>{kpi.label}</div>
                  <div style={{ fontSize: 10, color: "#553333", fontFamily: "monospace" }}>{kpi.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: "16px 20px", background: "#0a0000", border: "1px solid #330000", fontFamily: "monospace", fontSize: 11, color: "#884444", lineHeight: 1.8 }}>
              ⚠ &nbsp;3,026 death sentences awarded by trial courts between 2001–2023. &nbsp;Only 8 executions actually carried out — a ratio of 378:1. &nbsp;564 people currently live under a death sentence in Indian prisons — the highest in over 20 years. &nbsp;Source: Project 39A Annual Death Penalty Report 2024, Factly, NCRB.
            </div>
          </>
        )}
      </div>

      <div style={{ borderTop: "1px solid #111", padding: "12px 40px", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#333", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2 }}>
        <span>SOURCE · NCRB 2022/2023 · CHRI SEP 2024 · PROJECT 39A · NFHS-5 · FACTLY · NCW 2024</span>
        <span>FACTCHECK.DEBPROD.COM</span>
      </div>
    </div>
  );
}
