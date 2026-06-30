const express = require('express');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const FORBIDDEN_ALWAYS = /\b(DROP|TRUNCATE|ALTER|CREATE|GRANT|REVOKE)\b/i;
const WRITE_OPS = /^\s*(INSERT|UPDATE|DELETE)\b/i;
const SELECT_ONLY = /^\s*SELECT\b/i;

const SCHEMA = {
  tables: ['productos'],
  columns: {
    productos: [
      { name: 'id', type: 'INTEGER' },
      { name: 'nombre', type: 'TEXT' },
      { name: 'categoria', type: 'TEXT' },
      { name: 'precio', type: 'REAL' },
      { name: 'stock', type: 'INTEGER' },
      { name: 'proveedor', type: 'TEXT' },
      { name: 'fecha_ingreso', type: 'TEXT' },
    ],
  },
};

function validateSQL(sql, role) {
  if (!sql || typeof sql !== 'string' || sql.trim() === '') {
    return { valid: false, message: 'La consulta SQL está vacía' };
  }
  const trimmed = sql.trim();
  if (FORBIDDEN_ALWAYS.test(trimmed)) {
    return { valid: false, message: 'Operación no permitida: DROP, TRUNCATE, ALTER, CREATE, GRANT y REVOKE están prohibidos' };
  }
  if (role === 'viewer' && !SELECT_ONLY.test(trimmed)) {
    return { valid: false, message: 'El rol Viewer solo puede ejecutar consultas SELECT' };
  }
  try {
    db.prepare(trimmed);
    return { valid: true, message: 'Consulta SQL válida' };
  } catch (err) {
    return { valid: false, message: `Error de sintaxis SQL: ${err.message}` };
  }
}

router.get('/schema', (req, res) => {
  res.json(SCHEMA);
});

router.get('/stats', (req, res) => {
  try {
    const totalProductos = db.prepare('SELECT COUNT(*) as c FROM productos').get().c;
    const valorRow = db.prepare('SELECT SUM(precio * stock) as total FROM productos').get();
    const valorTotal = valorRow.total || 0;
    const totalCategorias = db.prepare('SELECT COUNT(DISTINCT categoria) as c FROM productos').get().c;
    const stockBajo = db.prepare('SELECT COUNT(*) as c FROM productos WHERE stock < 10').get().c;
    const topCatRow = db.prepare('SELECT categoria, COUNT(*) as c FROM productos GROUP BY categoria ORDER BY c DESC LIMIT 1').get();
    res.json({ totalProductos, valorTotal, totalCategorias, stockBajo, topCategoria: topCatRow?.categoria || '-' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', (req, res) => {
  try {
    const rows = db.prepare('SELECT DISTINCT categoria FROM productos ORDER BY categoria').all();
    res.json({ categories: rows.map(r => r.categoria) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/validate', (req, res) => {
  const { sql } = req.body;
  const result = validateSQL(sql, req.user.role);
  res.json(result);
});

router.post('/execute', (req, res) => {
  const { sql } = req.body;
  const validation = validateSQL(sql, req.user.role);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.message });
  }
  const start = Date.now();
  try {
    const trimmed = sql.trim();
    const isSelect = SELECT_ONLY.test(trimmed);
    if (isSelect) {
      const stmt = db.prepare(trimmed);
      let rows = stmt.all();
      const columns = rows.length > 0 ? Object.keys(rows[0]) : (stmt.columns ? stmt.columns().map(c => c.name) : []);
      if (rows.length > 1000) rows = rows.slice(0, 1000);
      res.json({
        success: true,
        rows,
        rowCount: rows.length,
        columns,
        executionTime: Date.now() - start,
      });
    } else {
      const stmt = db.prepare(trimmed);
      const info = stmt.run();
      res.json({
        success: true,
        rows: [],
        rowCount: info.changes,
        columns: [],
        executionTime: Date.now() - start,
        message: `Operación completada. Filas afectadas: ${info.changes}`,
      });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/build', (req, res) => {
  const { table, columns, filters, orderBy, limit } = req.body;
  if (!table) return res.status(400).json({ error: 'Tabla requerida' });

  const cols = (columns && columns.length > 0) ? columns.join(', ') : '*';
  let sql = `SELECT ${cols} FROM ${table}`;

  if (filters && filters.length > 0) {
    const conditions = filters
      .filter(f => f.column && f.operator)
      .map(f => {
        if (f.operator === 'IS NULL') return `${f.column} IS NULL`;
        if (f.operator === 'IS NOT NULL') return `${f.column} IS NOT NULL`;
        if (f.operator === 'LIKE' || f.operator === 'NOT LIKE') {
          return `${f.column} ${f.operator} '%${f.value}%'`;
        }
        const numericCols = ['id', 'precio', 'stock'];
        const isNumeric = numericCols.includes(f.column);
        const val = isNumeric ? f.value : `'${f.value}'`;
        return `${f.column} ${f.operator} ${val}`;
      });
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
  }

  if (orderBy && orderBy.column) {
    sql += ` ORDER BY ${orderBy.column} ${orderBy.direction || 'ASC'}`;
  }

  const lim = parseInt(limit) || 100;
  sql += ` LIMIT ${Math.min(lim, 1000)}`;

  res.json({ sql });
});

module.exports = router;
