import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEARCH_INDEX } from '../data/searchIndex';

const TYPE_COLOR = { module: '#ff6b00', state: '#4da6ff', fact: '#00c896' };
const TYPE_LABEL = { module: 'MODULE', state: 'STATE', fact: 'FACT' };

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const q = query.toLowerCase();
    const matches = SEARCH_INDEX.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.keywords.some(kw => kw.includes(q))
    ).slice(0, 7);
    setResults(matches);
    setOpen(matches.length > 0);
  }, [query]);

  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (item) => {
    const params = new URLSearchParams();
    if (item.tab)   params.set('tab', item.tab);
    if (item.state) params.set('state', item.state);
    const qs = params.toString();
    navigate(item.route + (qs ? '?' + qs : ''));
    setQuery(''); setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: '0 0 260px', marginLeft: 8 }}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => query && results.length && setOpen(true)}
        placeholder="SEARCH STATES · TOPICS · FACTS"
        style={{
          width: '100%', background: '#0d0d0d', border: '1px solid #1a1a1a',
          color: '#777', padding: '6px 12px',
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
          letterSpacing: 1, borderRadius: 2, outline: 'none', boxSizing: 'border-box',
        }}
      />
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: '#0d0d0d', border: '1px solid #1a1a1a', borderTop: 'none',
          zIndex: 200, maxHeight: 340, overflowY: 'auto',
        }}>
          {results.map((item, i) => (
            <div key={i} onClick={() => handleSelect(item)} style={{
              padding: '9px 12px', cursor: 'pointer', borderBottom: '1px solid #111',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'background 0.1s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#111'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{
                fontSize: 8, color: TYPE_COLOR[item.type],
                fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1, minWidth: 44,
              }}>{TYPE_LABEL[item.type]}</span>
              <span style={{ fontSize: 10, color: '#ccc', fontFamily: "'IBM Plex Mono', monospace" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
