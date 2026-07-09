# Quizee

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![HBS](https://img.shields.io/badge/Handlebars-f0772b?style=flat&logo=handlebarsdotjs&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)

Quizee is a platform for creating and taking quizzes. Create a quiz, name it, mark the correct answers, and let others take it. The platform automatically checks the answers and calculates a score (e.g. 3/3 for three correct answers out of three questions).

## Features

- **User accounts** — register, log in, and log out
- **Password and account validation** during registration/login
- **Quiz creation** — add questions and mark correct answers
- **Automatic grading** — answers are checked automatically and a score is calculated (e.g. X/Y correct)
- **Quiz statuses:**
  - **Draft** — quiz is being created/edited, not yet available to take
  - **Active** — quiz is published and can be taken by users
  - **Archived** — quiz is locked (can no longer be taken or edited), but all results remain saved

## Tech Stack

- **Language:** JavaScript (Node.js)
- **Server:** Express
- **Templating:** HBS (Handlebars)
- **Styling:** CSS
- **Database:** PostgreSQL

### Libraries

- `bcrypt` — password hashing
- `cookie-parser` — cookie parsing
- `dotenv` — environment variable management
- `express` — web framework
- `express-async-errors` — async error handling
- `hbs` — Handlebars templating engine
- `http-errors` — HTTP error handling
- `morgan` — HTTP request logging
- `pg` — PostgreSQL client

## Requirements

- [Node.js](https://nodejs.org/)
- A PostgreSQL database (local or cloud, e.g. [Neon](https://neon.tech/))

## Installation

1. **Clone the repository**

   On GitHub, click the green **Code** button and copy the link. Then run:

   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**

   ```bash
   npm i
   ```

3. **Set up environment variables**

   Create a `.env` file in the root of the project:

   ```env
   DB_URL=postgresql://user:password@host/database
   PORT=3000
   ```

4. **Start the app**

   ```bash
   npm start
   ```

5. **Open in browser**

   ```
   http://localhost:3000
   ```

## Usage

1. Register or log in to your account
2. Create a quiz — add questions and mark the correct answers
3. Change the quiz status to **Active** so others can take it
4. Users take the quiz and receive an automatic score (e.g. X/Y correct)
5. Archive the quiz once you no longer want it to be edited or retaken — results stay saved

## License

No license specified.
