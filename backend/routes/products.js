const express = require('express');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.post('/', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo el administrador puede agregar productos' });
  }
  const { nombre, categoria, precio, stock, proveedor, fecha_ingreso } = req.body;
  if (!nombre || !categoria || precio === undefined || stock === undefined || !proveedor || !fecha_ingreso) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  try {
    const stmt = db.prepare(
      'INSERT INTO productos (nombre, categoria, precio, stock, proveedor, fecha_ingreso) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const info = stmt.run(nombre, categoria, parseFloat(precio), parseInt(stock), proveedor, fecha_ingreso);
    res.json({ success: true, id: info.lastInsertRowid, message: `Producto "${nombre}" agregado correctamente` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
