import { useState, useCallback } from 'react';
import QueryBuilder from './QueryBuilder';
import ResultsTable from './ResultsTable';
import ChartView from './ChartView';
import ExportButtons from './ExportButtons';

export default function Dashboard({ user, onLogout }) {
  const [results, setResults] = useState(null);
  const [sql, setSql] = useState('');
  const [activeTab, setActiveTab] = useState('table');
  const [chartType, setChartType] = useState('bar');
  const [loading, setLoading] = useState(false);

  const handleQueryResult = useCallback((data) => {
    setResults(data);
    setLoading(false);
  }, []);

  const handleSQLGenerated = useCallback((generatedSql) => {
    setSql(generatedSql);
  }, []);

  const rows = results?.rows || [];
  const columns = results?.columns || [];

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="logo-icon">C</div>
          CodeLAB
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 400, marginLeft: 4 }}>
            Inventario DSL
          </span>
        </div>
        <div className="navbar-right">
          <div className="user-info">
            <span style={{ color: 'var(--text-secondary)' }}>Usuario:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user.username}</span>
            <span className={`badge badge-${user.role}`}>{user.role === 'admin' ? 'Admin' : 'Viewer'}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="main-content">
        <div className="dashboard-layout">
          {/* Left: Query Builder */}
          <div className="dashboard-left">
            <QueryBuilder
              onQueryResult={handleQueryResult}
              onSQLGenerated={handleSQLGenerated}
              userRole={user.role}
            />
          </div>

          {/* Right: Results */}
          <div>
            <div className="card results-section">
              <div className="section-header">
                <div className="section-title">Resultados</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {rows.length > 0 && (
                    <ExportButtons rows={rows} columns={columns} sql={sql} />
                  )}
                  <div className="results-tabs">
                    <button
                      className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`}
                      onClick={() => setActiveTab('table')}
                    >
                      Tabla
                    </button>
                    <button
                      className={`tab-btn ${activeTab === 'chart' ? 'active' : ''}`}
                      onClick={() => setActiveTab('chart')}
                    >
                      Gráfico
                    </button>
                  </div>
                </div>
              </div>

              {activeTab === 'table' ? (
                <ResultsTable
                  rows={rows}
                  columns={columns}
                  loading={loading}
                  executionTime={results?.executionTime}
                />
              ) : (
                <ChartView
                  rows={rows}
                  columns={columns}
                  chartType={chartType}
                  onChartTypeChange={setChartType}
                />
              )}

              {results?.message && (
                <div className="alert alert-success" style={{ marginTop: 12 }}>
                  {results.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
