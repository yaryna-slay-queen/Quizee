import express from 'express';
import db from '../db/connector.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.get('/login', (req, res) => {
    if (req.cookies.userId) return res.redirect('/polls');
    res.render('login');
});

router.get('/signup', (req, res) => {
    if (req.cookies.userId) return res.redirect('/polls');
    res.render('signup');
});

router.get('/logout-signup', (req, res) => {
    res.clearCookie('userId');
    res.redirect('/signup');
});

router.post('/signup', async (req, res) => {
    const { firstname, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
        'INSERT INTO users (firstname, email, password) VALUES ($1, $2, $3) RETURNING id',
        [firstname, email, hash]
    );
    res.cookie('userId', result.rows[0].id, { httpOnly: true });
    res.redirect(`/polls?greeting=welcome&name=${encodeURIComponent(firstname)}`);
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.render('login', { error: 'Incorrect email or password!' });
    }
    res.cookie('userId', user.id, { httpOnly: true });
    res.redirect(`/polls?greeting=welcomeBack&name=${encodeURIComponent(user.firstname)}`);
});

router.get('/logout', (req, res) => {
    res.clearCookie('userId');
    res.redirect('/login');
});

export default router;