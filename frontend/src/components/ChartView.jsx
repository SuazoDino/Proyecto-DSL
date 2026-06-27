import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const CATEGORY_COLORS = {
  'Electrónica': '#3b82f6',
  'Ropa': '#ec4899',
  'Alimentos': '#10b981',
  'Herramientas': '#f59e0b',
  'Muebles': '#8b5cf6',
};

function aggregateByCategory(rows, numericCol) {
  const map = {};
  rows.forEach(row => {
    const cat = row.categoria || 'Sin categoría';
    if (!map[cat]) map[cat] = { name: cat, count: 0, sum: 0 };
    map[cat].count += 1;
    if (numericCol && row[numericCol] !== undefined) {
      map[cat].sum += Number(row[numericCol]) || 0;
    }
  });
  return Object.values(map);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6, padding: '10px 14px' }}>
      <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 13 }}>
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? `S/. ${p.value.toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function ChartView({ rows, columns, chartType, onChartTypeChange }) {
  const hasCategoria = columns.includes('categoria');
  const numericCols = columns.filter(c => ['precio', 'stock', 'id'].includes(c) && c !== 'id' || c === 'id');
  const mainNumeric = columns.find(c => c === 'precio') || columns.find(c => c === 'stock') || columns.find(c => !['nombre', 'categoria', 'proveedor', 'fecha_ingreso'].includes(c));

  const chartData = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    if (hasCategoria) return aggregateByCategory(rows, mainNumeric);
    return rows.slice(0, 30).map((r, i) => ({
      name: r.nombre || r.id || `#${i + 1}`,
      value: r[mainNumeric] !== undefined ? Number(r[mainNumeric]) : i + 1,
    }));
  }, [rows, hasCategoria, mainNumeric]);

  if (!rows || rows.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <div className="empty-state-title">Sin datos para graficar</div>
        <div className="empty-state-desc">Ejecuta una consulta para ver el gráfico</div>
      </div>
    );
  }

  if (!hasCategoria && !mainNumeric) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💡</div>
        <div className="empty-state-title">Selecciona columnas numéricas</div>
        <div className="empty-state-desc">Incluye "categoría" y una columna numérica (precio, stock) para ver el gráfico</div>
      </div>
    );
  }

  const barKey = hasCategoria ? (mainNumeric ? 'sum' : 'count') : 'value';
  const barLabel = hasCategoria ? (mainNumeric === 'precio' ? 'Total precio (S/.)' : mainNumeric === 'stock' ? 'Stock total' : 'Cantidad') : (mainNumeric || 'Valor');

  return (
    <div>
      <div className="chart-type-tabs">
        <button
          className={`tab-btn ${chartType === 'bar' ? 'active' : ''}`}
          onClick={() => onChartTypeChange('bar')}
        >
          Barras
        </button>
        <button
          className={`tab-btn ${chartType === 'pie' ? 'active' : ''}`}
          onClick={() => onChartTypeChange('pie')}
        >
          Torta
        </button>
      </div>

      {chartType === 'bar' ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              angle={-25}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={barKey} name={barLabel} radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[entry.name] || COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey={barKey}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#94a3b8' }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[entry.name] || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
