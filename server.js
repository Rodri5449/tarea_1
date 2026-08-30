const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.db');

app.use(express.json());

// Conexión a SQLite (crea el archivo database.db si no existe)
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) return console.error('Error al conectar con SQLite:', err.message);
  console.log('Conectado a la base de datos SQLite:', DB_FILE);
});

// Crear tabla si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL,
    stock INTEGER DEFAULT 0
  )
`);

// GET /productos - listar todos
app.get('/productos', (req, res) => {
  db.all('SELECT * FROM productos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /productos/:id - obtener uno
app.get('/productos/:id', (req, res) => {
  db.get('SELECT * FROM productos WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(row);
  });
});

// POST /productos - crear
app.post('/productos', (req, res) => {
  const { nombre, precio, stock } = req.body;
  if (!nombre || precio === undefined) {
    return res.status(400).json({ error: 'nombre y precio son obligatorios' });
  }
  db.run(
    'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
    [nombre, precio, stock || 0],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, nombre, precio, stock: stock || 0 });
    }
  );
});

// PUT /productos/:id - actualizar
app.put('/productos/:id', (req, res) => {
  const { nombre, precio, stock } = req.body;
  db.run(
    'UPDATE productos SET nombre = COALESCE(?, nombre), precio = COALESCE(?, precio), stock = COALESCE(?, stock) WHERE id = ?',
    [nombre, precio, stock, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json({ mensaje: 'Producto actualizado' });
    }
  );
});

// DELETE /productos/:id - eliminar
app.delete('/productos/:id', (req, res) => {
  db.run('DELETE FROM productos WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado' });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API escuchando en http://0.0.0.0:${PORT}`);
});
