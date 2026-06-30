import { useState, useEffect } from 'react';
import { getStats } from '../services/api';

export default function StatsCards({ refreshKey }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, [refreshKey]);

  if (!stats) return null;

  const valorFormateado = stats.valorTotal.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const cards = [
    {
      label: 'Total Productos',
      value: stats.totalProductos,
      icon: '📦',
      color: 'var(--accent)',
      sub: `en ${stats.totalCategorias} categorías`,
    },
    {
      label: 'Valor del Inventario',
      value: `S/. ${valorFormateado}`,
      icon: '💰',
      color: 'var(--success)',
      sub: 'precio × stock total',
    },
    {
      label: 'Stock Bajo',
      value: stats.stockBajo,
      icon: '⚠️',
      color: 'var(--error)',
      sub: 'productos con stock < 10',
    },
    {
      label: 'Top Categoría',
      value: stats.topCategoria,
      icon: '🏆',
      color: '#f59e0b',
      sub: 'más productos',
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((c, i) => (
        <div key={i} className="stat-card" style={{ borderLeft: `3px solid ${c.color}` }}>
          <div className="stat-header">
            <span className="stat-icon">{c.icon}</span>
            <span className="stat-label">{c.label}</span>
          </div>
          <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
          <div className="stat-sub">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
