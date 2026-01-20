import express from 'express';
import * as newsController from '../controllers/newsController.js';

const router = express.Router();

router.get('/', newsController.getHome);
router.get('/category/:catName', newsController.getByCategory);
router.get('/article/:id', newsController.getArticle);

export default router;
