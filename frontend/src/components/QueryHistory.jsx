const HISTORY_KEY = 'codelab_query_history';
const MAX_HISTORY = 5;

export function saveToHistory(sql, rowCount) {
  try {
    const prev = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const entry = { sql, rowCount, timestamp: new Date().toISOString() };
    const filtered = prev.filter(h => h.sql !== sql);
    const next = [entry, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch (_) {}
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch (_) {
    return [];
  }
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function truncateSql(sql, max = 60) {
  return sql.length > max ? sql.slice(0, max) + '…' : sql;
}

export default function QueryHistory({ history, onReplay }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="card history-card">
      <div className="card-title">Historial de Consultas</div>
      <div className="history-list">
        {history.map((h, i) => (
          <div key={i} className="history-item" onClick={() => onReplay(h.sql)} title={h.sql}>
            <div className="history-sql">{truncateSql(h.sql)}</div>
            <div className="history-meta">
              <span className="history-time">{formatTime(h.timestamp)}</span>
              {h.rowCount !== undefined && (
                <span className="history-rows">{h.rowCount} fila{h.rowCount !== 1 ? 's' : ''}</span>
              )}
              <span className="history-replay">↩ Repetir</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
