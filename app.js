const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 8000;
const db = new sqlite3.Database('./students.db');

app.use(express.urlencoded({ extended: true })); // soporta form-data / x-www-form-urlencoded (Postman)
app.use(express.json());

// Crear estudiante
app.post('/students', (req, res) => {
  const { firstname, lastname, gender, age } = req.body;
  db.run(
    'INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)',
    [firstname, lastname, gender, age],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.send(`Student with id: ${this.lastID} created successfully`);
    }
  );
});

// Leer todos los estudiantes
app.get('/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Leer un estudiante
app.get('/student/:id', (req, res) => {
  db.get('SELECT * FROM students WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Estudiante no encontrado' });
    res.json(row);
  });
});

// Modificar un estudiante
app.put('/student/:id', (req, res) => {
  const { firstname, lastname, gender, age } = req.body;
  db.run(
    'UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?',
    [firstname, lastname, gender, age, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
      db.get('SELECT * FROM students WHERE id = ?', [req.params.id], (err2, row) => {
        res.json(row);
      });
    }
  );
});

// Eliminar un estudiante
app.delete('/student/:id', (req, res) => {
  db.run('DELETE FROM students WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    res.send(`The Student with id: ${req.params.id} has been deleted.`);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API escuchando en http://0.0.0.0:${PORT}`);
});
