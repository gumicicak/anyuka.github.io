import db from '../models/db.js';

// Replicates your logic: splits "image.jpg- Text" into image and text
const formatArticle = (article) => {
  if (article.text && article.text.includes("-")) {
    const parts = article.text.split("-");
    const imageName = parts[0].trim();
    const cleanText = parts.slice(1).join("-").trim();
    return { 
        ...article, 
        imagePath: `/images/${imageName}`, 
        cleanText 
    };
  }
  return { ...article, imagePath: null, cleanText: article.text };
};

export const getHome = async (req, res) => {
  try {
    const query = `
      SELECT a.*, w.name as writer_name, c.name as category_name 
      FROM articles a
      JOIN writers w ON a.writer_id = w.id 
      JOIN category c ON a.category_id = c.id 
      ORDER BY a.date DESC`;
    
    const [rows] = await db.query(query);
    const articles = rows.map(formatArticle);
    
    // Pick logic for Home Page components
    const exclusive = articles[Math.floor(Math.random() * articles.length)];
    const popular = [...articles].sort(() => 0.5 - Math.random()).slice(0, 4);

    res.render('index', { articles, exclusive, popular, categoryName: 'all' });
  } catch (err) {
    res.status(500).send("Database Error: " + err.message);
  }
};

export const getByCategory = async (req, res) => {
  const { catName } = req.params;
  try {
    const query = `
      SELECT a.*, w.name as writer_name, c.name as category_name 
      FROM articles a
      JOIN writers w ON a.writer_id = w.id 
      JOIN category c ON a.category_id = c.id 
      WHERE c.name = ?`;
    
    const [rows] = await db.query(query, [catName]);
    const articles = rows.map(formatArticle);
    res.render('index', { articles, categoryName: catName });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getArticle = async (req, res) => {
  try {
    const query = `
      SELECT a.*, w.name as writer_name, c.name as category_name 
      FROM articles a
      JOIN writers w ON a.writer_id = w.id 
      JOIN category c ON a.category_id = c.id 
      WHERE a.id = ?`;
      
    const [rows] = await db.query(query, [req.params.id]);
    if (rows.length > 0) {
      const article = formatArticle(rows[0]);
      res.render('article', { article });
    } else {
      res.status(404).render('404'); // Assuming you create a 404.ejs
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};
