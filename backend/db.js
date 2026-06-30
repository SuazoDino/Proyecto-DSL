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
      // Electrónica (18)
      ['Laptop HP ProBook 450 G9', 'Electrónica', 2499.99, 15, 'TechDistrib SAC', '2024-01-10'],
      ['Monitor LG 27" UltraWide QHD', 'Electrónica', 899.50, 8, 'TechDistrib SAC', '2024-01-15'],
      ['Teclado Mecánico Redragon K552', 'Electrónica', 189.90, 42, 'GameZone Peru', '2024-02-01'],
      ['Mouse Logitech MX Master 3', 'Electrónica', 259.00, 30, 'GameZone Peru', '2024-02-01'],
      ['Auriculares Sony WH-1000XM5', 'Electrónica', 1199.00, 5, 'ElectroImport', '2024-02-20'],
      ['Tablet Samsung Galaxy Tab A8', 'Electrónica', 799.00, 12, 'ElectroImport', '2024-03-01'],
      ['Smartphone Xiaomi Redmi Note 12', 'Electrónica', 649.00, 25, 'MovilTech', '2024-03-10'],
      ['Cámara Canon EOS R50', 'Electrónica', 3299.00, 3, 'FotoShop Lima', '2024-03-15'],
      ['Smart TV LG 55" 4K OLED', 'Electrónica', 1899.00, 6, 'TechDistrib SAC', '2024-04-05'],
      ['Impresora Epson EcoTank L3250', 'Electrónica', 549.00, 9, 'OffiTech SAC', '2024-04-20'],
      ['Router TP-Link AX3000 Wi-Fi 6', 'Electrónica', 289.00, 22, 'NetSolutions', '2024-05-08'],
      ['Disco Duro Externo Seagate 2TB', 'Electrónica', 199.00, 35, 'TechDistrib SAC', '2024-05-15'],
      ['Memoria RAM Kingston 16GB DDR4', 'Electrónica', 149.00, 48, 'HardwareZone', '2024-06-01'],
      ['SSD Samsung 970 EVO Plus 500GB', 'Electrónica', 329.00, 18, 'HardwareZone', '2024-06-12'],
      ['Parlante JBL Charge 5', 'Electrónica', 399.00, 14, 'AudioShop Lima', '2024-07-03'],
      ['Proyector Epson EB-E01', 'Electrónica', 1299.00, 4, 'OffiTech SAC', '2024-07-20'],
      ['Webcam Logitech C920 HD Pro', 'Electrónica', 219.00, 27, 'NetSolutions', '2025-01-10'],
      ['UPS APC Back-UPS 1000VA', 'Electrónica', 489.00, 7, 'TechDistrib SAC', '2025-02-05'],
      // Ropa (13)
      ['Polo Deportivo Nike Dri-FIT', 'Ropa', 89.90, 60, 'Deportes Lima', '2024-01-05'],
      ["Jeans Levi's 501 Original", 'Ropa', 229.00, 35, 'Fashion Import', '2024-01-20'],
      ['Zapatillas Adidas Ultraboost 22', 'Ropa', 459.00, 18, 'Deportes Lima', '2024-02-10'],
      ['Chompa Alpaca Premium', 'Ropa', 189.00, 22, 'Artesanía Perú', '2024-02-25'],
      ['Casaca Cuero Genuino', 'Ropa', 349.00, 9, 'Fashion Import', '2024-03-05'],
      ['Polo Tommy Hilfiger Classic Fit', 'Ropa', 159.00, 45, 'Fashion Import', '2024-04-10'],
      ['Pantalón Cargo Columbia Silver Ridge', 'Ropa', 199.00, 28, 'Deportes Lima', '2024-05-22'],
      ['Vestido Floral Zara Primavera', 'Ropa', 129.00, 33, 'Fashion Import', '2024-06-12'],
      ['Zapatillas Converse All Star Hi', 'Ropa', 289.00, 24, 'Deportes Lima', '2024-07-28'],
      ['Shorts Deportivo Puma Active', 'Ropa', 79.00, 55, 'Deportes Lima', '2024-08-15'],
      ['Calzado Formal Bata Executive', 'Ropa', 249.00, 16, 'Fashion Import', '2024-09-08'],
      ['Blusa Seda Natural Importada', 'Ropa', 119.00, 40, 'Fashion Import', '2025-01-20'],
      ['Gorra New Era MLB 59FIFTY', 'Ropa', 149.00, 32, 'Deportes Lima', '2025-03-14'],
      // Alimentos (13)
      ['Arroz Extra Cosecha Premium 50kg', 'Alimentos', 159.00, 100, 'Agro Sur SAC', '2024-01-08'],
      ['Aceite de Oliva Extra Virgen 5L', 'Alimentos', 89.50, 75, 'Distribuidora Gourmet', '2024-01-25'],
      ['Quinua Orgánica Certificada 25kg', 'Alimentos', 225.00, 50, 'Agro Sur SAC', '2024-02-15'],
      ['Café Tunki Especial 1kg', 'Alimentos', 65.00, 120, 'Cafés del Perú', '2024-02-28'],
      ['Miel de Abeja Natural 3kg', 'Alimentos', 78.00, 40, 'Apicultura Huánuco', '2024-03-12'],
      ['Harina de Trigo Selecta 50kg', 'Alimentos', 135.00, 80, 'Molinos del Perú', '2024-04-05'],
      ['Azúcar Blanca Refinada 50kg', 'Alimentos', 185.00, 65, 'Agro Sur SAC', '2024-05-18'],
      ['Leche Evaporada Gloria Pack x24', 'Alimentos', 89.00, 90, 'Distribuidora Central', '2024-06-10'],
      ['Atún en Conserva Florida Pack x48', 'Alimentos', 145.00, 70, 'Distribuidora Central', '2024-07-25'],
      ['Fideos Lavaggi Surtidos 20kg', 'Alimentos', 95.00, 85, 'Molinos del Perú', '2024-08-08'],
      ['Aceite Vegetal Primor 20L', 'Alimentos', 119.00, 55, 'Distribuidora Gourmet', '2024-09-20'],
      ['Sal de Mesa Emsal 25kg', 'Alimentos', 45.00, 110, 'Molinos del Perú', '2025-01-05'],
      ['Cacao en Polvo Organico 5kg', 'Alimentos', 98.00, 60, 'Cafés del Perú', '2025-04-12'],
      // Herramientas (13)
      ['Taladro Bosch GSB 13 RE', 'Herramientas', 329.00, 20, 'Ferretería Central', '2024-01-12'],
      ['Amoladora Makita GA4530 4.5"', 'Herramientas', 289.00, 14, 'Ferretería Central', '2024-01-30'],
      ['Set Llaves Combinadas Stanley 14pcs', 'Herramientas', 145.00, 28, 'Herramientas Pro', '2024-02-18'],
      ['Nivel Láser Bosch GLL 3-80', 'Herramientas', 599.00, 7, 'Herramientas Pro', '2024-03-08'],
      ['Compresor de Aire 50L 2HP', 'Herramientas', 899.00, 4, 'Maquinaria Lima', '2024-03-20'],
      ['Sierra Circular DeWalt 7-1/4"', 'Herramientas', 479.00, 10, 'Ferretería Central', '2024-04-15'],
      ['Destornillador Eléctrico Bosch GO 2', 'Herramientas', 189.00, 32, 'Herramientas Pro', '2024-05-02'],
      ['Martillo Carpintero Stanley 600g', 'Herramientas', 69.00, 45, 'Ferretería Central', '2024-06-18'],
      ['Juego de Dados Gedore 108pcs', 'Herramientas', 359.00, 8, 'Herramientas Pro', '2024-07-05'],
      ['Cinta Métrica Stanley FatMax 8m', 'Herramientas', 49.00, 60, 'Ferretería Central', '2024-08-22'],
      ['Lijadora Orbital Black Decker 300W', 'Herramientas', 219.00, 15, 'Ferretería Central', '2024-09-10'],
      ['Pistola de Calor Bosch PHG 600', 'Herramientas', 259.00, 11, 'Herramientas Pro', '2025-01-28'],
      ['Cortadora de Azulejo Rubi TX-700', 'Herramientas', 689.00, 6, 'Maquinaria Lima', '2025-03-05'],
      // Muebles (11)
      ['Sofá 3 Cuerpos Milano Cuero Eco', 'Muebles', 1899.00, 6, 'Mueblería Moderna', '2024-01-18'],
      ['Escritorio Esquinero Executive L', 'Muebles', 749.00, 10, 'Mueblería Moderna', '2024-02-05'],
      ['Silla Ergonómica Herman Miller Aeron', 'Muebles', 2199.00, 4, 'Oficinas & Co', '2024-02-22'],
      ['Estante Biblioteca 5 Niveles MDF', 'Muebles', 389.00, 16, 'Maderería Perú', '2024-03-03'],
      ['Mesa Comedor Extensible 6 sillas', 'Muebles', 2499.00, 3, 'Mueblería Moderna', '2024-04-18'],
      ['Cama Matrimonial Premium con Cajones', 'Muebles', 1299.00, 5, 'Maderería Perú', '2024-05-08'],
      ['Ropero 3 Puertas con Espejo', 'Muebles', 899.00, 8, 'Mueblería Moderna', '2024-06-14'],
      ['Mesa de Centro Vidrio Templado', 'Muebles', 449.00, 12, 'Mueblería Moderna', '2024-07-30'],
      ['Silla de Oficina Ejecutiva con Ruedas', 'Muebles', 569.00, 14, 'Oficinas & Co', '2024-08-18'],
      ['Estante Metálico Industrial 5 Niveles', 'Muebles', 329.00, 20, 'Maderería Perú', '2025-02-15'],
      ['Velador 2 Cajones Madera Maciza', 'Muebles', 279.00, 18, 'Maderería Perú', '2025-04-05'],
    ];
    const insertMany = db.transaction(() => {
      products.forEach(p => insertProd.run(...p));
    });
    insertMany();
  }

  console.log('Database initialized successfully.');
}

module.exports = { db, initDB };
