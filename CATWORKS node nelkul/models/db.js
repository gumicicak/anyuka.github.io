import mysql from 'mysql2';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP password
  database: 'news_db',
  waitForConnections: true,
  connectionLimit: 10
});

export default pool.promise();