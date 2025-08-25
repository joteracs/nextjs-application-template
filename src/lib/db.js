import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';

class Database {
  constructor() {
    this.db = new sqlite3.Database('./database.sqlite');
    this.init();
  }

  init() {
    // Create tables if they don't exist
    this.db.serialize(() => {
      // Users table
      this.db.run(`
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
      this.db.run(`
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
      this.db.run(`
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

      // Create default admin user if no users exist
      this.getUserCount().then(count => {
        if (count === 0) {
          this.createUser('Administrador', 'admin@cfp.com.br', 'admin123', 'admin');
        }
      });
    });
  }

  async getUserCount() {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  }

  async createUser(name, email, password, type = 'common') {
    const hashedPassword = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (name, email, password, type) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, type],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async getUserById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT id, name, email, type, created_at, last_login FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async updateUserSession(userId, sessionToken) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET session_token = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [sessionToken, userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async clearUserSession(userId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET session_token = NULL WHERE id = ?',
        [userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async validateSession(userId, sessionToken) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ? AND session_token = ? AND is_active = 1',
        [userId, sessionToken],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async getAllUsers() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT id, name, email, type, created_at, last_login FROM users ORDER BY created_at DESC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async updateUser(id, name, email, type) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET name = ?, email = ?, type = ? WHERE id = ?',
        [name, email, type, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async deleteUser(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async createQuestion(subject, statement, alternatives, correctAnswer) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO questions (subject, statement, alternatives, correct_answer) VALUES (?, ?, ?, ?)',
        [subject, statement, JSON.stringify(alternatives), correctAnswer],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async getAllQuestions() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM questions ORDER BY created_at DESC', (err, rows) => {
        if (err) reject(err);
        else {
          rows.forEach(row => {
            row.alternatives = JSON.parse(row.alternatives);
          });
          resolve(rows);
        }
      });
    });
  }

  async getQuestionById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM questions WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else if (row) {
          row.alternatives = JSON.parse(row.alternatives);
          resolve(row);
        } else {
          resolve(null);
        }
      });
    });
  }

  async updateQuestion(id, subject, statement, alternatives, correctAnswer) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE questions SET subject = ?, statement = ?, alternatives = ?, correct_answer = ? WHERE id = ?',
        [subject, statement, JSON.stringify(alternatives), correctAnswer, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async deleteQuestion(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM questions WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async saveAnswer(userId, questionId, givenAnswer, isCorrect) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO answers (user_id, question_id, given_answer, is_correct) VALUES (?, ?, ?, ?)',
        [userId, questionId, givenAnswer, isCorrect],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async getUserAnswers(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT a.*, q.subject, q.statement, q.alternatives, q.correct_answer 
         FROM answers a 
         JOIN questions q ON a.question_id = q.id 
         WHERE a.user_id = ? 
         ORDER BY a.answered_at DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else {
            rows.forEach(row => {
              row.alternatives = JSON.parse(row.alternatives);
            });
            resolve(rows);
          }
        }
      );
    });
  }

  async getUnansweredQuestions(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM questions 
         WHERE id NOT IN (
           SELECT question_id FROM answers WHERE user_id = ?
         )
         ORDER BY created_at DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else {
            rows.forEach(row => {
              row.alternatives = JSON.parse(row.alternatives);
            });
            resolve(rows);
          }
        }
      );
    });
  }

  async getUserStats(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT 
           COUNT(*) as total_answered,
           SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
           ROUND(CAST(SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 2) as accuracy_rate,
           MAX(answered_at) as last_answer_date
         FROM answers 
         WHERE user_id = ?`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  close() {
    this.db.close();
  }
}

export default new Database();
