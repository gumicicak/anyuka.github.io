import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import newsRoutes from './routes/newsRoutes.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true })); // To read form data
app.use(express.static(path.join(__dirname, 'public')));

// Session Setup
app.use(session({
  secret: 'news-project-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use('/', newsRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});