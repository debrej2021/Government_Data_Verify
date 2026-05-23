import { useState, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line
} from "recharts";
import { useSearchParams } from "react-router-dom";
import ChartToolbar from "./ChartToolbar";
import { exportCSV, downloadChartPNG } from "../utils/chartExport";

const RAPE_MURDER_TREND = [
  { year: "2018", cases: 312,  conviction: 12.1 },
  { year: "2019", cases: 338,  conviction: 11.8 },
  { year: "2020", cases: 289,  conviction: 9.4  },
  { year: "2021", cases: 351,  conviction: 11.2 },
  { year: "2022", cases: 376,  conviction: 15.38 },
  { year: "2023", cases: 389,  conviction: 14.2 },
];

const RAPE_MURDER_STATE = [
  { state: "Uttar Pradesh",  cases: 78 },
  { state: "Madhya Pradesh", cases: 52 },
  { state: "Rajasthan",      cases: 44 },
  { state: "Maharashtra",    cases: 38 },
  { state: "Bihar",          cases: 31 },
  { state: "Odisha",         cases: 28 },
  { state: "West Bengal",    cases: 24 },
  { state: "Jharkhand",      cases: 22 },
  { state: "Andhra Pradesh", cases: 18 },
  { state: "Haryana",        cases: 17 },
  { state: "Chhattisgarh",   cases: 16 },
  { state: "Karnataka",      cases: 12 },
].sort((a, b) => b.cases - a.cases);

const TRAFFICKING_STATE = [
  { state: "Maharashtra", cases: 388, victims: 955,  sexual: 852, labor: 3,   other: 94  },
  { state: "Telangana",   cases: 336, victims: 621,  sexual: 597, labor: 12,  other: 12  },
  { state: "Odisha",      cases: 162, victims: 312,  sexual: 198, labor: 44,  other: 70  },
  { state: "Bihar",       cases: 155, victims: 289,  sexual: 155, labor: 62,  other: 72  },
  { state: "West Bengal", cases: 98,  victims: 187,  sexual: 121, labor: 31,  other: 35  },
  { state: "Karnataka",   cases: 87,  victims: 164,  sexual: 108, labor: 22,  other: 34  },
  { state: "UP",          cases: 76,  victims: 143,  sexual: 89,  labor: 38,  other: 16  },
  { state: "MP",          cases: 68,  victims: 131,  sexual: 84,  labor: 28,  other: 19  },
  { state: "Andhra Pr.",  cases: 54,  victims: 98,   sexual: 72,  labor: 14,  other: 12  },
  { state: "Assam",       cases: 44,  victims: 82,   sexual: 51,  labor: 18,  other: 13  },
];

const PURPOSE_DATA = [
  { name: "Sexual Exploitation", value: 40, color: "#ff4444" },
  { name: "Forced Labour",       value: 23, color: "#ff8800" },
  { name: "Children",            value: 30, color: "#ffcc00" },
  { name: "Other",               value: 7,  color: "#555"    },
];

const TRAFFICKING_JUSTICE = [
  { label: "Cases investigated",       value: 2189, color: "#4da6ff" },
  { label: "Prosecutions completed",   value: 201,  color: "#ffcc00" },
  { label: "Convictions",              value: 64,   color: "#00c896" },
  { label: "Acquittals",               value: 520,  color: "#ff4444" },
];

const STRUCTURAL_TRAFFICKING = [
  { system: "Devadasi System", states: "Karnataka, Andhra Pradesh, Tamil Nadu", desc: "Girls from lower castes ritually 'dedicated' to temples from ages 13–15. Normalised as religious practice. Estimated 250,000–450,000 devadasis in India, many forced into sex work.", status: "Illegal since 1988 under Karnataka Devadasi Act. Still practiced in rural areas.", color: "#ff4444" },
  { system: "Bedia / Banchhara Community", states: "Madhya Pradesh, Rajasthan, UP", desc: "Caste-based tradition where girls are groomed for prostitution from ages 13–15 as a familial economic strategy. NCRB notes MP topped child trafficking cases in 2019 partly due to this.", status: "No specific law targeting caste-based trafficking traditions.", color: "#ff8800" },
  { system: "Cross-Border Trafficking", states: "West Bengal, Bihar, Assam, UP", desc: "Nepal and Bangladesh border states are primary source/transit points. Of 955 Maharashtra victims in 2023 — 4 Nepalese, 23 Bangladeshi nationals among those rescued.", status: "SAARC Convention on Trafficking signed. Ground-level enforcement inadequate.", color: "#ffcc00" },
  { system: "Missing Children Pipeline", states: "All states — Maharashtra worst", desc: "4,619 children went missing in Maharashtra in 2023. 2,347 were girls. Only 2,574 traced. Missing children are the feeder pipeline into trafficking networks.", status: "1,22,248 persons missing in Maharashtra till 2023. 71,079 traced. 51,169 still untraced.", color: "#aa44ff" },
];

const TraffickingTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = TRAFFICKING_STATE.find(x => x.state === label);
  if (!d) return null;
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #ff4444", padding: "10px 14px", borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
      <p style={{ color: "#ff4444", margin: 0, marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#e0e0e0", margin: "2px 0" }}>Cases: {d.cases}</p>
      <p style={{ color: "#e0e0e0", margin: "2px 0" }}>Victims rescued: {d.victims}</p>
      <p style={{ color: "#ff8800", margin: "2px 0" }}>For sexual exploitation: {d.sexual}</p>
      <p style={{ color: "#ffcc00", margin: "2px 0" }}>Forced labour: {d.labor}</p>
    </div>
  );
};

export default function SexualViolenceModule() {
  const chartRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedState = searchParams.get('state');

  const [tab, setTab] = useState(searchParams.get('tab') || 'rapemurder');

  const handleTabChange = (t) => {
    setTab(t);
    setSearchParams(p => { const n = new URLSearchParams(p); n.set('tab', t); return n; }, { replace: true });
  };

  const totalTraffickingCases   = TRAFFICKING_STATE.reduce((s, d) => s + d.cases, 0);
  const totalVictimsRescued     = TRAFFICKING_STATE.reduce((s, d) => s + d.victims, 0);
  const totalSexualExploitation = TRAFFICKING_STATE.reduce((s, d) => s + d.sexual, 0);

  return (
    <div style={{ background: "#080808", color: "#e0e0e0", fontFamily: "'IBM Plex Sans', sans-serif", borderTop: "1px solid #1a1a1a" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;600&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <div style={{ padding: "28px 40px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 4, color: "#ff2244", lineHeight: 1 }}>SEXUAL VIOLENCE & TRAFFICKING</div>
          <div style={{ fontSize: 12, color: "#555", letterSpacing: 3, marginTop: 4 }}>RAPE + MURDER · HUMAN TRAFFICKING · FORCED EXPLOITATION · STRUCTURAL CAUSES</div>
        </div>
        <div style={{ fontSize: 10, color: "#333", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2, textAlign: "right" }}>SOURCE · NCRB 2023 · US STATE DEPT TIP 2025<br />CHRI · UNODC · MINISTRY OF WCD</div>
      </div>

      <div style={{ background: "#110000", borderBottom: "1px solid #330000", padding: "10px 40px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#884444", letterSpacing: 1, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#ff2222", fontSize: 16 }}>⚠</span>
        852 women trafficked for prostitution in Maharashtra alone in 2023. Trafficking conviction rate: 10%. Acquittal rate: 84%. Devadasi system still active despite being illegal since 1988.
        <span style={{ marginLeft: "auto", color: "#553333" }}>NCRB 2023</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid #1a1a1a" }}>
        {[
          { label: "RAPE + MURDER 2023",        value: "389",                    sub: "Sexual assault leading to death",              color: "#ff2222" },
          { label: "TRAFFICKING CASES 2023",    value: totalTraffickingCases.toLocaleString(), sub: "Top 10 states — NCRB 2023",      color: "#ff8800" },
          { label: "TRAFFICKED FOR SEX",         value: `${totalSexualExploitation}+`, sub: "Women for prostitution — confirmed",    color: "#ff4444" },
          { label: "TRAFFICKING CONVICTION",    value: "10%",                    sub: "Cases leading to conviction — NCRB",          color: "#ff2244" },
        ].map((kpi, i) => (
          <div key={i} style={{ padding: "20px 32px", borderRight: i < 3 ? "1px solid #1a1a1a" : "none" }}>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: 3, marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: kpi.color, letterSpacing: 2 }}>{kpi.value}</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2, fontFamily: "monospace" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #1a1a1a", padding: "0 40px", overflowX: "auto" }}>
        {[
          { id: "rapemurder",  label: "RAPE + MURDER" },
          { id: "trafficking", label: "HUMAN TRAFFICKING" },
          { id: "justice",     label: "JUSTICE GAP" },
          { id: "structural",  label: "ROOT CAUSES" },
        ].map(t => (
          <button key={t.id} onClick={() => handleTabChange(t.id)} style={{ background: "none", border: "none", borderBottom: tab === t.id ? "2px solid #ff2244" : "2px solid transparent", color: tab === t.id ? "#ff2244" : "#444", padding: "14px 20px", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, marginBottom: -1, transition: "all 0.15s", whiteSpace: "nowrap" }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "32px 40px" }}>
        {highlightedState && (
          <div style={{ marginBottom: 16, padding: '8px 16px', background: '#0d0d00', border: '1px solid #ff6b0044', borderLeft: '3px solid #ff6b00', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>
            <span style={{ color: '#ff6b00', letterSpacing: 2 }}>&#9685; HIGHLIGHTING · {highlightedState.toUpperCase()}</span>
            <button onClick={() => setSearchParams(p => { const n = new URLSearchParams(p); n.delete('state'); return n; }, { replace: true })} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>✕ CLEAR</button>
          </div>
        )}

        {tab === "rapemurder" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>RAPE / GANGRAPE WITH MURDER · INDIA · 2018–2023</div>
            <div style={{ fontSize: 10, color: "#553333", marginBottom: 24, fontFamily: "monospace" }}>CONVICTION RATE PEAKED AT 15.38% IN 2022 — NEVER CROSSED 16% IN ANY YEAR</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
              <div>
                <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 12 }}>CASES TREND</div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={RAPE_MURDER_TREND} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#111" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={{ stroke: "#1a1a1a" }} />
                    <YAxis tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #ff2222", fontFamily: "monospace", fontSize: 11 }} />
                    <Line type="monotone" dataKey="cases" name="Cases" stroke="#ff2222" strokeWidth={2} dot={{ r: 4, fill: "#ff2222" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 12 }}>CONVICTION RATE %</div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={RAPE_MURDER_TREND} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#111" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={{ stroke: "#1a1a1a" }} />
                    <YAxis tickFormatter={v => `${v}%`} tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} domain={[0, 20]} />
                    <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #00c896", fontFamily: "monospace", fontSize: 11 }} formatter={v => [`${v}%`, "Conviction rate"]} />
                    <Line type="monotone" dataKey="conviction" name="Conviction %" stroke="#00c896" strokeWidth={2} dot={{ r: 4, fill: "#00c896" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 16 }}>STATE-WISE RAPE + MURDER CASES · 2022</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={RAPE_MURDER_STATE} margin={{ top: 0, right: 20, left: 10, bottom: 60 }}>
                  <CartesianGrid stroke="#111" vertical={false} />
                  <XAxis dataKey="state" tick={{ fill: "#444", fontSize: 9, fontFamily: "IBM Plex Mono" }} angle={-40} textAnchor="end" interval={0} tickLine={false} axisLine={{ stroke: "#1a1a1a" }} />
                  <YAxis tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #ff2222", fontFamily: "monospace", fontSize: 11 }} cursor={{ fill: "#111" }} />
                  <Bar dataKey="cases" name="Cases" fill="#ff222255" radius={[2, 2, 0, 0]}>
                    {RAPE_MURDER_STATE.map((d, i) => (
                      <Cell key={i} fill={i < 3 ? "#ff2222" : i < 6 ? "#ff8800" : "#ff222233"} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: 20, padding: "14px 20px", background: "#0a0000", border: "1px solid #330000", fontFamily: "monospace", fontSize: 11, color: "#884444", lineHeight: 1.8 }}>
              ⚠ &nbsp;UP, MP and Rajasthan account for nearly 45% of all rape + murder cases nationally. &nbsp;The conviction rate for rape with murder has never crossed 16% in any year — CHRI Sep 2024.
            </div>
          </>
        )}

        {tab === "trafficking" && (
          <div ref={chartRef}>
            <ChartToolbar chartRef={chartRef} data={TRAFFICKING_STATE} csvFilename="trafficking-state-data" />
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>HUMAN TRAFFICKING STATE-WISE · 2023 · VICTIMS RESCUED</div>
            <div style={{ fontSize: 10, color: "#553333", marginBottom: 24, fontFamily: "monospace" }}>852 WOMEN TRAFFICKED FOR PROSTITUTION IN MAHARASHTRA ALONE · NCRB 2023</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
              <div>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={TRAFFICKING_STATE} layout="vertical" margin={{ top: 0, right: 20, left: 100, bottom: 0 }}>
                    <CartesianGrid stroke="#111" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#444", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="state" tick={{ fill: "#888", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickLine={false} axisLine={false} width={100} />
                    <Tooltip content={<TraffickingTooltip />} cursor={{ fill: "#111" }} />
                    <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 10, paddingTop: 12 }} />
                    <Bar dataKey="sexual" name="For sexual exploitation" fill="#ff444480" radius={[0, 2, 2, 0]} stackId="a" />
                    <Bar dataKey="labor"  name="Forced labour"           fill="#ff880080" radius={[0, 2, 2, 0]} stackId="a" />
                    <Bar dataKey="other"  name="Other"                   fill="#55555580" radius={[0, 2, 2, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 16 }}>PURPOSE OF TRAFFICKING · NATIONAL 2023</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={PURPOSE_DATA} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={{ stroke: "#333" }}>
                      {PURPOSE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0d0d0d", border: "1px solid #333", fontFamily: "monospace", fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 12 }}>NATIONALITY OF VICTIMS (MAHARASHTRA 2023)</div>
                  {[
                    { label: "Indian nationals",      count: 907, color: "#ff8800" },
                    { label: "Bangladeshi nationals", count: 23,  color: "#ffcc00" },
                    { label: "Nepalese nationals",    count: 4,   color: "#4da6ff" },
                    { label: "Others",                count: 21,  color: "#555"    },
                  ].map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #0d0d0d", fontFamily: "monospace", fontSize: 11 }}>
                      <span style={{ color: "#888" }}>{d.label}</span>
                      <span style={{ color: d.color }}>{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "justice" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>TRAFFICKING JUSTICE SCORECARD · INDIA · 2021 DATA (LATEST AVAILABLE)</div>
            <div style={{ fontSize: 10, color: "#553333", marginBottom: 24, fontFamily: "monospace" }}>SOURCE · US STATE DEPT TRAFFICKING IN PERSONS REPORT 2023 / NCRB 2021</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
              {TRAFFICKING_JUSTICE.map((item, i) => (
                <div key={i} style={{ padding: "20px 24px", background: "#0a0000", border: "1px solid #1a0000", borderLeft: `3px solid ${item.color}` }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: item.color, lineHeight: 1, marginBottom: 6 }}>{item.value.toLocaleString()}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#cc6666" }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 24, padding: "16px 20px", background: "#0a0000", border: "1px solid #330000", fontFamily: "monospace", fontSize: 11, color: "#884444", lineHeight: 1.8 }}>
              ⚠ &nbsp;For every 1 trafficker convicted, 8 suspects are acquitted. &nbsp;Acquittal rate: 84%. Conviction rate: 10%. &nbsp;Only 1 Anti-Human Trafficking Unit (AHTU) for every 10 states. &nbsp;NCRB did not issue 2023 Crime in India Report for trafficking — "unspecified reasons." (US State Dept TIP 2025)
            </div>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 16 }}>MISSING PERSONS — THE FEEDER PIPELINE</div>
            {[
              { label: "Children missing in Maharashtra 2023",     value: "4,619",   sub: "2,347 were girls",                         color: "#ff4444" },
              { label: "Children traced",                           value: "2,574",   sub: "Only 55.7% found",                         color: "#ffaa00" },
              { label: "Total missing persons Maharashtra till 2023", value: "1,22,248", sub: "51,169 still untraced",                  color: "#ff2222" },
              { label: "Persons missing nationally (NCRB 2022)",   value: "10.6L",   sub: "Mostly women and children",                color: "#ff8800" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", marginBottom: 6, background: "#0a0000", borderLeft: `3px solid ${item.color}` }}>
                <div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#ccc", marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace" }}>{item.sub}</div>
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: item.color, letterSpacing: 2 }}>{item.value}</div>
              </div>
            ))}
          </>
        )}

        {tab === "structural" && (
          <>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 6 }}>STRUCTURAL & CULTURAL ROOT CAUSES · THE SYSTEMS THAT FEED TRAFFICKING</div>
            <div style={{ fontSize: 10, color: "#553333", marginBottom: 24, fontFamily: "monospace" }}>DATA FROM ETHNOGRAPHIC STUDIES · MINISTRY OF WCD · UNODC · GROKIPEDIA</div>
            <div style={{ display: "grid", gap: 16 }}>
              {STRUCTURAL_TRAFFICKING.map((item, i) => (
                <div key={i} style={{ padding: "20px 24px", background: "#0a0000", border: "1px solid #1a0000", borderLeft: `3px solid ${item.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: item.color, letterSpacing: 2 }}>{item.system}</div>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#555", background: "#111", padding: "3px 8px", borderRadius: 2 }}>{item.states}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#888", fontFamily: "monospace", marginBottom: 8, lineHeight: 1.7 }}>{item.desc}</div>
                  <div style={{ fontSize: 10, color: item.color, fontFamily: "monospace", fontStyle: "italic" }}>STATUS · {item.status}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: "16px 20px", background: "#0a0000", border: "1px solid #330000", fontFamily: "monospace", fontSize: 11, color: "#884444", lineHeight: 1.8 }}>
              ⚠ &nbsp;The Devadasi system has been illegal for 36 years. It is still practiced. &nbsp;The Bedia community has no specific law targeting their trafficking traditions. &nbsp;These are not "crimes in the shadows" — they are known, documented, and tolerated. &nbsp;The failure is not awareness. The failure is political will.
            </div>
          </>
        )}
      </div>

      <div style={{ borderTop: "1px solid #111", padding: "12px 40px", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#333", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2 }}>
        <span>SOURCE · NCRB 2023 · US STATE DEPT TIP REPORT 2025 · CHRI · UNODC · MINISTRY OF WCD</span>
        <span>FACTCHECK.DEBPROD.COM</span>
      </div>
    </div>
  );
}
