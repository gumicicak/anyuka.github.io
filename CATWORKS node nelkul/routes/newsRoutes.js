import express from 'express';
import * as newsController from '../controllers/newsController.js';

const router = express.Router();

// Public
router.get('/', newsController.getHome);
router.get('/category/:catName', newsController.getByCategory);
router.get('/article/:id', newsController.getArticle);

// Admin
router.get('/administrator', (req, res) => res.render('login', { error: null }));
router.post('/administrator/login', newsController.loginAdmin);
router.get('/administrator/console', newsController.isAuthenticated, newsController.getConsole);
router.get('/administrator/edit/:id', newsController.isAuthenticated, newsController.editArticleView);
router.get('/administrator/delete/:id', newsController.isAuthenticated, newsController.deleteArticle);
router.post('/administrator/save', newsController.isAuthenticated, newsController.upload.single('image'), newsController.saveArticle);

export default router;