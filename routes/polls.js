import express from 'express';
import { QuizService } from '../controllers/pollController.js';
const router = express.Router();

function buildQuestions(body) {
    const texts = [].concat(body.question_text || []);
    const types = [].concat(body.type || []);

    return texts.map((text, i) => {
        const options = [].concat(body[`options_${i}[]`] || body[`options_${i}`] || []);
        const correct_options = [].concat(body[`correct_options_${i}[]`] || body[`correct_options_${i}`] || []);
        const correct_text = body[`correct_text_${i}`] || null;
        return {
            question_text: text,
            type: types[i] || 'text',
            options,
            correct_options,
            correct_text
        };
    });
}

router.get('/', async (req, res) => {
    const { status = 'active' } = req.query;
    try {
        const quizzes = await QuizService.getAll(req.userId, status);
        const formatted = quizzes.map(q => ({
            ...q,
            created_at: q.created_at ? q.created_at.toLocaleDateString() : ''
        }));
        res.render('polls', {
            polls: formatted,
            showList: true,
            showForm: false,
            showResults: false,
            currentStatus: status
        });
    } catch (err) {
        console.error('Failed to load:', err);
        res.status(500).send('Server error');
    }
});

router.get('/new', (req, res) => {
    res.render('polls', {
        showList: false,
        showForm: true,
        editingPoll: null
    });
});

router.post('/', async (req, res) => {
    try {
        const { title, status } = req.body;
        const questions = buildQuestions(req.body);
        QuizService.validate(title, questions);
        await QuizService.create(title, status || 'draft', req.userId, questions);
        res.redirect('/polls');
    } catch (err) {
        console.error('Creating error:', err.message);
        res.status(400).send(`Error: ${err.message} <br><br><a href="/polls/new">Back</a>`);
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const quiz = await QuizService.getById(req.params.id);
        res.render('polls', {
            showList: false,
            showForm: true,
            editingPoll: quiz
        });
    } catch (err) {
        console.error('Editing failed:', err);
        res.status(500).send('Server error');
    }
});

router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { title, status } = req.body;
        const questions = buildQuestions(req.body);
        QuizService.validate(title, questions);
        await QuizService.update(id, title, status, questions);
        res.redirect('/polls');
    } catch (err) {
        console.error('Editing failed:', err.message);
        res.status(400).send(`Error: ${err.message} <br><br><a href="/polls/edit/${id}">Back</a>`);
    }
});

router.get('/:id/answer', async (req, res) => {
    try {
        const quiz = await QuizService.getById(req.params.id);
        res.render('answer', { quiz });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.post('/:id/answer', async (req, res) => {
    try {
        const result = await QuizService.submitAnswers(req.params.id, req.body);
        res.render('answer', {
            showScore: true,
            score: result.score,
            total: result.total,
            quizId: req.params.id
        });
    } catch (err) {
        console.error('Failed to answer:', err.message);
        res.status(500).send('Server error');
    }
});

router.get('/:id/results', async (req, res) => {
    try {
        const quiz = await QuizService.getById(req.params.id);
        const attempts = await QuizService.getAttempts(req.params.id);
        const formattedAttempts = attempts.map(q => ({
            ...q,
            submitted_at: q.submitted_at ? new Date(q.submitted_at).toLocaleDateString('en-GB').split('/').join('.') : ''
        }));
        res.render('polls', {
            showList: false,
            showForm: false,
            showResults: true,
            quiz,
            attempts: formattedAttempts
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await QuizService.delete(req.params.id);
        res.status(200).json({ message: 'Deleted quiz' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;