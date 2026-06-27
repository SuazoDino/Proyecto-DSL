const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'));

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'viewer'))
    );

    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL,
      precio REAL NOT NULL,
      stock INTEGER NOT NULL,
      proveedor TEXT NOT NULL,
      fecha_ingreso TEXT NOT NULL
    );
  `);

  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (userCount.c === 0) {
    const adminHash = bcrypt.hashSync('admin123', 10);
    const viewerHash = bcrypt.hashSync('viewer123', 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', adminHash, 'admin');
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('viewer', viewerHash, 'viewer');
  }

  const catCount = db.prepare('SELECT COUNT(*) as c FROM categorias').get();
  if (catCount.c === 0) {
    const cats = ['Electrónica', 'Ropa', 'Alimentos', 'Herramientas', 'Muebles'];
    const insertCat = db.prepare('INSERT INTO categorias (nombre) VALUES (?)');
    cats.forEach(c => insertCat.run(c));
  }

  const prodCount = db.prepare('SELECT COUNT(*) as c FROM productos').get();
  if (prodCount.c === 0) {
    const insertProd = db.prepare(
      'INSERT INTO productos (nombre, categoria, precio, stock, proveedor, fecha_ingreso) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const products = [
      ['Laptop HP ProBook', 'Electrónica', 2499.99, 15, 'TechDistrib SAC', '2024-01-10'],
      ['Monitor LG 27"', 'Electrónica', 899.50, 8, 'TechDistrib SAC', '2024-01-15'],
      ['Teclado Mecánico Redragon', 'Electrónica', 189.90, 42, 'GameZone Peru', '2024-02-01'],
      ['Mouse Logitech MX Master', 'Electrónica', 259.00, 30, 'GameZone Peru', '2024-02-01'],
      ['Auriculares Sony WH-1000XM5', 'Electrónica', 1199.00, 5, 'ElectroImport', '2024-02-20'],
      ['Tablet Samsung Galaxy Tab A8', 'Electrónica', 799.00, 12, 'ElectroImport', '2024-03-01'],
      ['Smartphone Xiaomi Redmi Note 12', 'Electrónica', 649.00, 25, 'MovilTech', '2024-03-10'],
      ['Cámara Canon EOS R50', 'Electrónica', 3299.00, 3, 'FotoShop Lima', '2024-03-15'],
      ['Polo Deportivo Nike Dri-FIT', 'Ropa', 89.90, 60, 'Deportes Lima', '2024-01-05'],
      ['Jeans Levi\'s 501 Original', 'Ropa', 229.00, 35, 'Fashion Import', '2024-01-20'],
      ['Zapatillas Adidas Ultraboost', 'Ropa', 459.00, 18, 'Deportes Lima', '2024-02-10'],
      ['Chompa Alpaca Premium', 'Ropa', 189.00, 22, 'Artesanía Perú', '2024-02-25'],
      ['Casaca Cuero Genuino', 'Ropa', 349.00, 9, 'Fashion Import', '2024-03-05'],
      ['Arroz Extra Cosecha Premium 50kg', 'Alimentos', 159.00, 100, 'Agro Sur SAC', '2024-01-08'],
      ['Aceite de Oliva Extra Virgen 5L', 'Alimentos', 89.50, 75, 'Distribuidora Gourmet', '2024-01-25'],
      ['Quinua Orgánica 25kg', 'Alimentos', 225.00, 50, 'Agro Sur SAC', '2024-02-15'],
      ['Café Tunki Especial 1kg', 'Alimentos', 65.00, 120, 'Cafés del Perú', '2024-02-28'],
      ['Miel de Abeja Natural 3kg', 'Alimentos', 78.00, 40, 'Apicultura Huánuco', '2024-03-12'],
      ['Taladro Bosch GSB 13 RE', 'Herramientas', 329.00, 20, 'Ferretería Central', '2024-01-12'],
      ['Amoladora Makita 4.5"', 'Herramientas', 289.00, 14, 'Ferretería Central', '2024-01-30'],
      ['Set Llaves Combinadas Stanley 14pcs', 'Herramientas', 145.00, 28, 'Herramientas Pro', '2024-02-18'],
      ['Nivel Láser Bosch GLL 3-80', 'Herramientas', 599.00, 7, 'Herramientas Pro', '2024-03-08'],
      ['Compresor de Aire 50L', 'Herramientas', 899.00, 4, 'Maquinaria Lima', '2024-03-20'],
      ['Sofá 3 Cuerpos Milano', 'Muebles', 1899.00, 6, 'Mueblería Moderna', '2024-01-18'],
      ['Escritorio Esquinero Executive', 'Muebles', 749.00, 10, 'Mueblería Moderna', '2024-02-05'],
      ['Silla Ergonómica Herman Miller', 'Muebles', 2199.00, 4, 'Oficinas & Co', '2024-02-22'],
      ['Estante Biblioteca 5 Niveles', 'Muebles', 389.00, 16, 'Maderería Perú', '2024-03-03'],
      ['Mesa de Comedor 6 sillas', 'Muebles', 2499.00, 3, 'Mueblería Moderna', '2024-03-18'],
    ];
    const insertMany = db.transaction(() => {
      products.forEach(p => insertProd.run(...p));
    });
    insertMany();
  }

  console.log('Database initialized successfully.');
}

module.exports = { db, initDB };
