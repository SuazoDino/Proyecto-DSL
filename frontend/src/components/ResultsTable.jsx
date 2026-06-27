import { useState } from 'react';

const PAGE_SIZE = 50;

function getCategoryClass(val) {
  const map = {
    'Electrónica': 'badge-electronica',
    'Ropa': 'badge-ropa',
    'Alimentos': 'badge-alimentos',
    'Herramientas': 'badge-herramientas',
    'Muebles': 'badge-muebles',
  };
  return map[val] || 'badge-default';
}

function formatCell(col, val) {
  if (val === null || val === undefined) return <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>NULL</span>;
  if (col === 'precio') return <span>S/. {Number(val).toFixed(2)}</span>;
  if (col === 'stock') {
    const n = parseInt(val);
    const cls = n < 10 ? 'stock-low' : n < 30 ? 'stock-medium' : 'stock-ok';
    return <span className={cls}>{n}</span>;
  }
  if (col === 'categoria') {
    return <span className={`badge ${getCategoryClass(val)}`}>{val}</span>;
  }
  return String(val);
}

export default function ResultsTable({ rows, columns, loading, executionTime }) {
  const [page, setPage] = useState(0);

  if (loading) {
    return (
      <div className="empty-state">
        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></span>
        <span style={{ marginTop: 8 }}>Ejecutando consulta...</span>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <div className="empty-state-title">Sin resultados</div>
        <div className="empty-state-desc">Ejecuta una consulta para ver los resultados aquí</div>
      </div>
    );
  }

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <div className="results-meta">
        <span>
          <strong style={{ color: 'var(--text-primary)' }}>{rows.length}</strong> fila{rows.length !== 1 ? 's' : ''} ·{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{columns.length}</strong> columna{columns.length !== 1 ? 's' : ''}
          {executionTime !== undefined && (
            <span className="execution-time">· {executionTime}ms</span>
          )}
        </span>
        {totalPages > 1 && (
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Página {page + 1} de {totalPages}
          </span>
        )}
      </div>

      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              {columns.map(col => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col}>{formatCell(col, row[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(0)} disabled={page === 0}>«</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>‹</button>
          <span className="pagination-info">Pág. {page + 1} / {totalPages}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>›</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>»</button>
        </div>
      )}
    </div>
  );
}
