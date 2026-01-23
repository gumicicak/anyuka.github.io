import db from '../models/db.js';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
export const upload = multer({ storage: storage });

// Formatting logic for both public and admin views
const formatArticle = (article) => {
  if (article.text && article.text.includes("-")) {
    const parts = article.text.split("-");
    const imageName = parts[0].trim();
    const cleanText = parts.slice(1).join("-").trim();
    return { ...article, imagePath: `/images/${imageName}`, cleanText };
  }
  return { ...article, imagePath: null, cleanText: article.text };
};

// --- AUTH MIDDLEWARE ---
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.isAdmin) return next();
  res.redirect('/administrator');
};

// --- ADMIN FUNCTIONS ---
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedInput = crypto.createHash('sha256').update(password).digest('hex');
    const [rows] = await db.query(`SELECT * FROM writers WHERE name = ? AND password = ?`, [username, hashedInput]);

    if (rows.length > 0) {
      req.session.isAdmin = true;
      res.redirect('/administrator/console');
    } else {
      res.render('login', { error: 'Invalid credentials' });
    }
  } catch (err) { res.status(500).send(err.message); }
};

// Dashboard with Search Functionality
export const getConsole = async (req, res) => {
  const searchTerm = req.query.search || ''; 
  try {
    let articleQuery = `
      SELECT a.id, a.title, a.date, w.name as writer_name, c.name as category_name 
      FROM articles a
      JOIN writers w ON a.writer_id = w.id 
      JOIN category c ON a.category_id = c.id `;
    
    let queryParams = [];
    if (searchTerm) {
      articleQuery += ` WHERE a.title LIKE ?`;
      queryParams.push(`%${searchTerm}%`);
    }
    
    articleQuery += ` ORDER BY a.date DESC`;
    
    const [articles] = await db.query(articleQuery, queryParams);
    const [writers] = await db.query("SELECT id, name FROM writers");
    const [categories] = await db.query("SELECT id, name FROM category");

    res.render('adminConsole', { articles, writers, categories, editingArticle: null, searchTerm });
  } catch (err) { res.status(500).send(err.message); }
};

export const editArticleView = async (req, res) => {
  const searchTerm = req.query.search || '';
  try {
    const [writers] = await db.query("SELECT id, name FROM writers");
    const [categories] = await db.query("SELECT id, name FROM category");
    const [target] = await db.query("SELECT * FROM articles WHERE id = ?", [req.params.id]);
    
    let articleQuery = `SELECT a.id, a.title, a.date, w.name as writer_name, c.name as category_name FROM articles a JOIN writers w ON a.writer_id = w.id JOIN category c ON a.category_id = c.id `;
    let queryParams = [];
    if (searchTerm) {
      articleQuery += ` WHERE a.title LIKE ?`;
      queryParams.push(`%${searchTerm}%`);
    }
    articleQuery += ` ORDER BY a.date DESC`;
    const [articles] = await db.query(articleQuery, queryParams);

    res.render('adminConsole', { articles, writers, categories, editingArticle: target[0], searchTerm });
  } catch (err) { res.status(500).send(err.message); }
};

export const saveArticle = async (req, res) => {
  const { id, title, text, writer_id, category_id } = req.body;
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  let finalClientText = text;

  if (req.file) {
    finalClientText = `${req.file.filename}- ${text}`;
  }

  try {
    if (id) {
      await db.query("UPDATE articles SET title=?, text=?, writer_id=?, category_id=?, date=? WHERE id=?", 
        [title, finalClientText, writer_id, category_id, currentDate, id]);
    } else {
      await db.query("INSERT INTO articles (title, text, writer_id, category_id, date) VALUES (?,?,?,?,?)", 
        [title, finalClientText, writer_id, category_id, currentDate]);
    }
    res.redirect('/administrator/console');
  } catch (err) { res.status(500).send(err.message); }
};

export const deleteArticle = async (req, res) => {
  try {
    await db.query("DELETE FROM articles WHERE id = ?", [req.params.id]);
    res.redirect('/administrator/console');
  } catch (err) { res.status(500).send(err.message); }
};

// --- PUBLIC FUNCTIONS ---
export const getHome = async (req, res) => {
  try {
    const query = `SELECT a.*, w.name as writer_name, c.name as category_name FROM articles a JOIN writers w ON a.writer_id = w.id JOIN category c ON a.category_id = c.id ORDER BY a.date DESC`;
    const [rows] = await db.query(query);
    const articles = rows.map(formatArticle);
    const exclusive = articles.length > 0 ? articles[Math.floor(Math.random() * articles.length)] : undefined;
    const popular = [...articles].sort(() => 0.5 - Math.random()).slice(0, 4);
    res.render('index', { articles, exclusive, popular, categoryName: 'all' });
  } catch (err) { res.status(500).send(err.message); }
};

export const getByCategory = async (req, res) => {
  try {
    const query = `SELECT a.*, w.name as writer_name, c.name as category_name FROM articles a JOIN writers w ON a.writer_id = w.id JOIN category c ON a.category_id = c.id WHERE c.name = ?`;
    const [rows] = await db.query(query, [req.params.catName]);
    const articles = rows.map(formatArticle);
    res.render('index', { articles, categoryName: req.params.catName });
  } catch (err) { res.status(500).send(err.message); }
};

export const getArticle = async (req, res) => {
  try {
    const query = `SELECT a.*, w.name as writer_name, c.name as category_name FROM articles a JOIN writers w ON a.writer_id = w.id JOIN category c ON a.category_id = c.id WHERE a.id = ?`;
    const [rows] = await db.query(query, [req.params.id]);
    if (rows.length > 0) {
      const article = formatArticle(rows[0]);
      res.render('article', { article });
    } else { res.status(404).send("Not Found"); }
  } catch (err) { res.status(500).send(err.message); }
};