import dotenv from 'dotenv'
dotenv.config()
import 'express-async-errors';
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import hbs from 'hbs';
import { fileURLToPath } from 'url';

import authRouter from './routes/auth.js';
import { requireAuth } from './middleware/auth.js';
import pollRouter from './routes/polls.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

hbs.registerHelper('eq', function (a, b) {
  return a === b;
});

hbs.registerHelper('add', function (a, b) {
  return a + b;
});

hbs.registerHelper('json', function (context) {
  return JSON.stringify(context);
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/polls'));

app.use('/', authRouter);
app.use('/polls', requireAuth, pollRouter);



app.use((err, req, res, next) => {
  console.error('Global error caught:', err.message || 'Unknown error');
  res.status(err.status || 500).render('error', { 
    message: err.message || 'Server error',
    error: process.env.NODE_ENV === 'development' ? err : {} 
  });
});

export default app;