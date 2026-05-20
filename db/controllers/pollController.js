import db from '../db/connector.js';

export class QuizService {

    static async create(title, status, userId, questions) {
        const quizRes = await db.query(
            `INSERT INTO quizzes (title, status, user_id) VALUES ($1, $2, $3) RETURNING *`,
            [title, status, userId]
        );
        const quiz = quizRes.rows[0];

        for (let i = 0; i < questions.length; i++) {
            const { question_text, type, options, correct_options, correct_text } = questions[i];

            const pollRes = await db.query(
                `INSERT INTO polls (quiz_id, question_text, type, order_index, correct_text)
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [quiz.id, question_text, type || 'text', i, correct_text || null]
            );
            const poll = pollRes.rows[0];

            if (type !== 'text' && Array.isArray(options)) {
                for (let j = 0; j < options.length; j++) {
                    if (options[j] && options[j].trim() !== '') {
                        const isCorrect = Array.isArray(correct_options) && correct_options.includes(j.toString());
                        await db.query(
                            `INSERT INTO poll_options (poll_id, option_text, is_correct) VALUES ($1, $2, $3)`,
                            [poll.id, options[j].trim(), isCorrect]
                        );
                    }
                }
            }
        }

        return quiz;
    }

    static async getAll(userId, status) {
        const res = await db.query(
            `SELECT * FROM quizzes WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC`,
            [userId, status]
        );
        return res.rows;
    }

    static async getById(id) {
        const quizRes = await db.query(`SELECT * FROM quizzes WHERE id = $1`, [id]);
        if (quizRes.rows.length === 0) throw new Error('The quiz is not found.');
        const quiz = quizRes.rows[0];

        const pollsRes = await db.query(
            `SELECT * FROM polls WHERE quiz_id = $1 ORDER BY order_index ASC`, [id]
        );

        const polls = await Promise.all(pollsRes.rows.map(async (poll) => {
            const optionsRes = await db.query(
                `SELECT * FROM poll_options WHERE poll_id = $1 ORDER BY id ASC`, [poll.id]
            );
            return { ...poll, options: optionsRes.rows };
        }));

        return { ...quiz, polls };
    }

    static async update(id, title, status, questions) {
        const quizRes = await db.query(
            `UPDATE quizzes SET title = $1, status = $2 WHERE id = $3 RETURNING *`,
            [title, status, id]
        );
        if (quizRes.rows.length === 0) throw new Error('The quiz is not found.');

        await db.query(`DELETE FROM polls WHERE quiz_id = $1`, [id]);

        for (let i = 0; i < questions.length; i++) {
            const { question_text, type, options, correct_options, correct_text } = questions[i];

            const pollRes = await db.query(
                `INSERT INTO polls (quiz_id, question_text, type, order_index, correct_text)
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [id, question_text, type || 'text', i, correct_text || null]
            );
            const poll = pollRes.rows[0];

            if (type !== 'text' && Array.isArray(options)) {
                for (let j = 0; j < options.length; j++) {
                    if (options[j] && options[j].trim() !== '') {
                        const isCorrect = Array.isArray(correct_options) && correct_options.includes(j.toString());
                        await db.query(
                            `INSERT INTO poll_options (poll_id, option_text, is_correct) VALUES ($1, $2, $3)`,
                            [poll.id, options[j].trim(), isCorrect]
                        );
                    }
                }
            }
        }

        return true;
    }

    static async delete(id) {
        const res = await db.query(`DELETE FROM quizzes WHERE id = $1 RETURNING *`, [id]);
        if (res.rows.length === 0) throw new Error('The quiz is not found.');
        return true;
    }

    static async submitAnswers(quizId, body) {
        const quiz = await QuizService.getById(quizId);
        const polls = quiz.polls;

        let score = 0;
        const total = polls.length;
        const answerDetails = [];

        for (let i = 0; i < polls.length; i++) {
            const poll = polls[i];
            const type = poll.type;
            let isCorrect = false;
            let answerText = '';
            if (type === 'text') {
                answerText = (body[`answer_text_${i}`] || '').trim();
                if (poll.correct_text) {
                    const normalize = (str) => str.trim().toLowerCase().replace(/\s+/g, ' ');
                    isCorrect = normalize(answerText) === normalize(poll.correct_text);
                }

            } else if (type === 'single') {
                const selectedIndex = body[`answer_${i}`] ?? body[`answer_${i}[]`];
                if (selectedIndex !== undefined) {
                    const selectedOption = poll.options[parseInt(selectedIndex)];
                    answerText = selectedOption ? selectedOption.option_text : '';
                    isCorrect = selectedOption ? selectedOption.is_correct : false;
                }

            } else if (type === 'multiple') {
                let selected = body[`answer_${i}`] ?? body[`answer_${i}[]`] ?? [];
                selected = [].concat(selected);
                answerText = selected.join(', ');

                const correctIndices = poll.options
                    .map((o, idx) => o.is_correct ? idx.toString() : null)
                    .filter(Boolean);
                const selectedIndices = selected.map(String);

                isCorrect = correctIndices.length > 0 &&
                    correctIndices.length === selectedIndices.length &&
                    correctIndices.every(idx => selectedIndices.includes(idx));
            }

            if (isCorrect) score++;
            answerDetails.push({ poll_id: poll.id, answer_text: answerText || '—', is_correct: isCorrect });
        }

        const attemptRes = await db.query(
            `INSERT INTO quiz_attempts (quiz_id, score, total) VALUES ($1, $2, $3) RETURNING *`,
            [quizId, score, total]
        );
        const attempt = attemptRes.rows[0];

        for (const ans of answerDetails) {
            await db.query(
                `INSERT INTO attempt_answers (attempt_id, poll_id, answer_text, is_correct) VALUES ($1, $2, $3, $4)`,
                [attempt.id, ans.poll_id, ans.answer_text, ans.is_correct]
            );
        }

        return { score, total, attempt_id: attempt.id };
    }

    static async getAttempts(quizId) {
        const attemptsRes = await db.query(
            `SELECT * FROM quiz_attempts WHERE quiz_id = $1 ORDER BY submitted_at DESC`,
            [quizId]
        );
        const attempts = await Promise.all(attemptsRes.rows.map(async (attempt) => {
            const answersRes = await db.query(
                `SELECT aa.*, p.question_text, p.type
                 FROM attempt_answers aa
                 JOIN polls p ON p.id = aa.poll_id
                 WHERE aa.attempt_id = $1
                 ORDER BY p.order_index ASC`,
                [attempt.id]
            );
            return { ...attempt, answers: answersRes.rows };
        }));
        return attempts;
    }

    static validate(title, questions){
        if (!questions || questions.length === 0) {
            throw new Error('Add at least one question');
        }
    };
}