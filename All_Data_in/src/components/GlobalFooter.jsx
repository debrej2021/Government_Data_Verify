export default function GlobalFooter() {
  const sources = [
    { label: "MOSPI",       url: "https://mospi.gov.in" },
    { label: "PLFS",        url: "https://mospi.gov.in/periodic-labour-force-survey-plfs" },
    { label: "ADR India",   url: "https://adrindia.org" },
    { label: "NITI Aayog",  url: "https://niti.gov.in" },
    { label: "ECI",         url: "https://eci.gov.in" },
    { label: "data.gov.in", url: "https://data.gov.in" },
    { label: "Champions of Change", url: "https://championsofchange.gov.in" },
  ];

  return (
    <footer style={{
      background: "#040404",
      borderTop: "1px solid #111",
      padding: "24px 40px",
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      {/* Disclaimer */}
      <div style={{
        background: "#0a0a0a",
        border: "1px solid #1a1a1a",
        borderLeft: "3px solid #ff6b00",
        padding: "14px 20px",
        marginBottom: 20,
        fontSize: 11,
        color: "#666",
        lineHeight: 1.8,
      }}>
        <span style={{ color: "#ff6b00", fontWeight: 600 }}>DISCLAIMER · </span>
        All data presented on this platform is sourced from official Government of India
        publications, open data portals, and publicly available reports. Data is embedded
        as of 2024–25 and may not reflect the most recent figures. No political bias is
        intended — numbers are presented as published by the respective authorities.
        For the latest data, visit the source links below. This platform is independent
        and not affiliated with any government body or political party.
      </div>

      {/* Sources */}
      <div style={{
        display: "flex", flexWrap: "wrap",
        gap: 6, marginBottom: 20,
        alignItems: "center"
      }}>
        <span style={{ fontSize: 10, color: "#333", letterSpacing: 2, marginRight: 8 }}>
          DATA SOURCES ·
        </span>
        {sources.map((s, i) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 10,
              color: "#444",
              textDecoration: "none",
              border: "1px solid #1a1a1a",
              padding: "3px 10px",
              borderRadius: 2,
              letterSpacing: 1,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              e.target.style.color = "#ff6b00";
              e.target.style.borderColor = "#ff6b00";
            }}
            onMouseLeave={e => {
              e.target.style.color = "#444";
              e.target.style.borderColor = "#1a1a1a";
            }}
          >
            {s.label} ↗
          </a>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid #0d0d0d",
        paddingTop: 14,
        fontSize: 10, color: "#2a2a2a",
        letterSpacing: 2,
      }}>
        <span>FACTS & TRUTH · INSIGHTS.DEBPROD.COM · DATA-DRIVEN. UNFILTERED. INDEPENDENT.</span>
        <span>© {new Date().getFullYear()} · FOR PUBLIC INTEREST</span>
      </div>
    </footer>
  );
}
