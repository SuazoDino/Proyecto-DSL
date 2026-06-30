import { useState, useEffect, useCallback, useRef } from 'react';
import { buildQuery, validateQuery, executeQuery } from '../services/api';

const ALL_COLUMNS = ['id', 'nombre', 'categoria', 'precio', 'stock', 'proveedor', 'fecha_ingreso'];
const OPERATORS = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'NOT LIKE', 'IS NULL', 'IS NOT NULL'];

function newFilter() {
  return { id: Date.now(), column: 'categoria', operator: '=', value: '' };
}

export default function QueryBuilder({ onQueryResult, onSQLGenerated, userRole }) {
  const [selectedCols, setSelectedCols] = useState(new Set(ALL_COLUMNS));
  const [filters, setFilters] = useState([]);
  const [orderBy, setOrderBy] = useState({ column: '', direction: 'ASC' });
  const [limit, setLimit] = useState(100);
  const [sql, setSql] = useState('');
  const [validation, setValidation] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [execError, setExecError] = useState('');
  const buildTimer = useRef(null);

  const triggerBuild = useCallback(() => {
    clearTimeout(buildTimer.current);
    buildTimer.current = setTimeout(async () => {
      const descriptor = {
        table: 'productos',
        columns: selectedCols.size === ALL_COLUMNS.length ? ['*'] : [...selectedCols],
        filters: filters.filter(f => f.column && f.operator),
        orderBy: orderBy.column ? orderBy : null,
        limit,
      };
      try {
        const data = await buildQuery(descriptor);
        setSql(data.sql);
        onSQLGenerated(data.sql);
        setValidation(null);
      } catch (_) {}
    }, 300);
  }, [selectedCols, filters, orderBy, limit, onSQLGenerated]);

  useEffect(() => { triggerBuild(); }, [triggerBuild]);

  const toggleCol = (col) => {
    setSelectedCols(prev => {
      const next = new Set(prev);
      if (next.has(col)) { if (next.size > 1) next.delete(col); }
      else next.add(col);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedCols(prev =>
      prev.size === ALL_COLUMNS.length ? new Set([ALL_COLUMNS[0]]) : new Set(ALL_COLUMNS)
    );
  };

  const addFilter = () => setFilters(prev => [...prev, newFilter()]);
  const removeFilter = (id) => setFilters(prev => prev.filter(f => f.id !== id));
  const updateFilter = (id, key, val) => setFilters(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f));

  const handleValidate = async () => {
    try {
      const result = await validateQuery(sql);
      setValidation(result);
    } catch (err) {
      setValidation({ valid: false, message: 'Error al validar' });
    }
  };

  const handleExecute = async () => {
    setExecError('');
    setExecuting(true);
    try {
      const result = await executeQuery(sql);
      onQueryResult(result, sql);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al ejecutar la consulta';
      setExecError(msg);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="card query-builder">
      <div className="card-title">Constructor de Consultas SQL</div>

      {userRole === 'viewer' && (
        <div className="viewer-notice">
          <span>👁</span> Rol: Viewer — Solo consultas SELECT permitidas
        </div>
      )}

      {/* Tabla */}
      <div className="form-group">
        <label className="form-label">Tabla</label>
        <div style={{ padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-secondary)', fontSize: 13 }}>
          productos
        </div>
      </div>

      {/* Columnas */}
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Columnas</span>
          <button className="btn btn-ghost btn-sm" type="button" onClick={toggleAll}>
            {selectedCols.size === ALL_COLUMNS.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
          </button>
        </label>
        <div className="columns-grid">
          {ALL_COLUMNS.map(col => (
            <label key={col} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedCols.has(col)}
                onChange={() => toggleCol(col)}
              />
              {col}
            </label>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* Filtros */}
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Filtros ({filters.length})</span>
          <button className="btn btn-ghost btn-sm" type="button" onClick={addFilter}>+ Agregar filtro</button>
        </label>
        {filters.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>Sin filtros — se mostrarán todos los registros</p>
        )}
        {filters.map(f => (
          <div key={f.id} className="filter-row">
            <select className="form-select" value={f.column} onChange={e => updateFilter(f.id, 'column', e.target.value)}>
              {ALL_COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="form-select" value={f.operator} onChange={e => updateFilter(f.id, 'operator', e.target.value)}>
              {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
            </select>
            <input
              className="form-control"
              type="text"
              placeholder="Valor"
              value={f.value}
              disabled={f.operator === 'IS NULL' || f.operator === 'IS NOT NULL'}
              onChange={e => updateFilter(f.id, 'value', e.target.value)}
            />
            <button className="btn btn-danger btn-icon btn-sm" type="button" onClick={() => removeFilter(f.id)}>✕</button>
          </div>
        ))}
      </div>

      <div className="divider" />

      {/* Ordenar por */}
      <div className="form-group">
        <label className="form-label">Ordenar por</label>
        <div className="order-row">
          <select className="form-select" value={orderBy.column} onChange={e => setOrderBy(p => ({ ...p, column: e.target.value }))}>
            <option value="">— Sin orden —</option>
            {ALL_COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="radio-group">
            {['ASC', 'DESC'].map(dir => (
              <label key={dir} className="radio-item">
                <input type="radio" value={dir} checked={orderBy.direction === dir} onChange={() => setOrderBy(p => ({ ...p, direction: dir }))} />
                {dir}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Límite */}
      <div className="form-group">
        <label className="form-label">Límite de resultados</label>
        <input
          className="form-control"
          type="number"
          min={1}
          max={1000}
          value={limit}
          onChange={e => setLimit(Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)))}
          style={{ width: 120 }}
        />
      </div>

      <div className="divider" />

      {/* SQL preview */}
      <div className="form-group">
        <label className="form-label">SQL Generado</label>
        <div className="sql-preview">{sql || 'Cargando...'}</div>
        {validation && (
          <div className={`sql-status ${validation.valid ? 'valid' : 'invalid'}`}>
            <span>{validation.valid ? '✓' : '✕'}</span>
            {validation.message}
          </div>
        )}
      </div>

      {execError && (
        <div className="alert alert-error">
          <span>✕</span> {execError}
        </div>
      )}

      <div className="query-actions">
        <button className="btn btn-secondary" type="button" onClick={handleValidate} disabled={!sql}>
          Validar SQL
        </button>
        <button className="btn btn-primary" type="button" onClick={handleExecute} disabled={!sql || executing}>
          {executing ? <><span className="spinner"></span> Ejecutando...</> : '▶ Ejecutar Consulta'}
        </button>
      </div>
    </div>
  );
}
