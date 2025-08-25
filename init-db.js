const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Create database connection
const db = new sqlite3.Database('./database.sqlite');

// Initialize tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      type TEXT CHECK(type IN ('admin', 'common')) DEFAULT 'common',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      is_active BOOLEAN DEFAULT 1,
      session_token TEXT
    )
  `);

  // Questions table
  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      statement TEXT NOT NULL,
      alternatives TEXT NOT NULL,
      correct_answer INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Answers table
  db.run(`
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      given_answer INTEGER NOT NULL,
      is_correct BOOLEAN NOT NULL,
      answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    )
  `);

  // Check if admin user exists
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) {
      console.error('Error checking users:', err);
      return;
    }

    if (row.count === 0) {
      // Create admin user
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run(
        'INSERT INTO users (name, email, password, type) VALUES (?, ?, ?, ?)',
        ['Administrador', 'admin@cfp.com.br', hashedPassword, 'admin'],
        function(err) {
          if (err) {
            console.error('Error creating admin user:', err);
          } else {
            console.log('Admin user created: admin@cfp.com.br / admin123');
          }
        }
      );

      // Create sample questions
      const sampleQuestions = [
        {
          subject: 'Matemática',
          statement: 'Qual é o resultado de 2 + 2?',
          alternatives: ['3', '4', '5', '6'],
          correct_answer: 1
        },
        {
          subject: 'Português',
          statement: 'Qual é o plural de "casa"?',
          alternatives: ['casas', 'case', 'casos', 'casais'],
          correct_answer: 0
        },
        {
          subject: 'História',
          statement: 'Em que ano o Brasil foi descoberto?',
          alternatives: ['1492', '1500', '1502', '1498'],
          correct_answer: 1
        },
        {
          subject: 'Geografia',
          statement: 'Qual é a capital do Brasil?',
          alternatives: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'],
          correct_answer: 2
        }
      ];

      sampleQuestions.forEach((question, index) => {
        db.run(
          'INSERT INTO questions (subject, statement, alternatives, correct_answer) VALUES (?, ?, ?, ?)',
          [question.subject, question.statement, JSON.stringify(question.alternatives), question.correct_answer],
          function(err) {
            if (err) {
              console.error('Error creating question:', err);
            } else {
              console.log(`Question ${index + 1} created`);
            }
          }
        );
      });
    } else {
      console.log('Database already initialized');
    }
  });
});

db.close();
console.log('Database initialization completed');
