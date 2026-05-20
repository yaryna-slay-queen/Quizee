import dotenv from 'dotenv';
dotenv.config();
import 'express-async-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import hbs from 'hbs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Сервер запущено!');
});

app.use((err, req, res, next) => {
  console.error('Global error caught:', err.message || 'Unknown error');
  res.status(err.status || 500).render('error', { 
    message: err.message || 'Server error',
    error: process.env.NODE_ENV === 'development' ? err : {} 
  });
});

export default app;