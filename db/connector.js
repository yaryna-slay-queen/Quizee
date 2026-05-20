import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const createTableQueries = [
    //-------------таблиця користувачів----------
    `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firstname VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
);`,
    //-------------таблиця тестування (збір питань з таблиці polls)----------
    `CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'achieved')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    //-------------таблиця питань зі статусами----------
    `CREATE TABLE IF NOT EXISTS polls (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        order_index INTEGER DEFAULT 0,
        correct_text TEXT
    );`,

    // ------------таблиця варіантів відповідей (для питань типу одинарного/множинного вибору)----------
    `CREATE TABLE IF NOT EXISTS poll_options (
        id SERIAL PRIMARY KEY,
        poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
        option_text TEXT NOT NULL,
        is_correct BOOLEAN DEFAULT false
    );`,

    //---------Таблиця спроб проходжень----------
    `CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER,
    total INTEGER,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    //---------Таблиця з інфою про кожне проходження----------
    `CREATE TABLE IF NOT EXISTS attempt_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
    answer_text TEXT,
    is_correct BOOLEAN
    );`
];

for await (const query of createTableQueries) {
    try {
        await pool.query(query);
    } catch (err) {
        console.error("table creation error: ", err.message);
    }
}

export default pool;