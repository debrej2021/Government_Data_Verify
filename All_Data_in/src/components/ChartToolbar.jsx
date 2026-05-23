import { useState } from 'react';
import { exportCSV, downloadChartPNG } from '../utils/chartExport';

export default function ChartToolbar({ chartRef, data, csvFilename }) {
  const [copied, setCopied] = useState(false);
  const btn = (active) => ({
    background: active ? '#ff6b00' : 'transparent',
    border: `1px solid ${active ? '#ff6b00' : '#222'}`,
    color: active ? '#000' : '#555',
    padding: '4px 12px', borderRadius: 2,
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10, cursor: 'pointer', letterSpacing: 1,
    transition: 'all 0.15s',
  });
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginBottom: 12 }}>
      <button style={btn(copied)} onClick={() => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true); setTimeout(() => setCopied(false), 2000);
      }}>{copied ? '✓ COPIED' : '⤴ SHARE'}</button>
      {data && <button style={btn(false)} onClick={() => exportCSV(data, csvFilename || 'data')}>{String.fromCharCode(8595)} CSV</button>}
      {chartRef && <button style={btn(false)} onClick={() => downloadChartPNG(chartRef, csvFilename || 'chart')}>{String.fromCharCode(8595)} PNG</button>}
    </div>
  );
}
