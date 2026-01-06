const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 3000;

// MySQL kapcsolat
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Az adatbázis felhasználója
  password: '', // Az adatbázis jelszava
  database: 'news_db', // Az adatbázis neve
});

// Kapcsolódás a MySQL adatbázishoz
db.connect((err) => {
  if (err) {
    console.error('Hiba a MySQL kapcsolatban:', err);
    return;
  }
  console.log('Sikeres MySQL kapcsolat!');
});

// Statikus fájlok kiszolgálása
app.use(express.static(path.join(__dirname, 'public')));

// Cikkek lekérése
app.get('/articles', (req, res) => {
  db.query('SELECT * FROM articles', (err, results) => {
    if (err) {
      console.error('Hiba a cikkek lekérésekor:', err);
      res.status(500).send('Hiba történt.');
      return;
    }
    res.json(results);
  });
});

// Alapértelmezett route, ami kiszolgálja az index.html fájlt
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Szerver indítása
app.listen(port, () => {
  console.log(`Szerver fut a http://localhost:${port}`);
});
