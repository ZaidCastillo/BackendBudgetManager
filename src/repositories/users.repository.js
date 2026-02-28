const { pool } = require('../db');

class UsersRepository {
  async findByEmail(email) {
    const r = await pool.query(
      'SELECT id, email, username, password_hash, role FROM users WHERE email = $1',
      [email]
    );
    return r.rows[0] || null;
  }

  async findByUsername(username) {
    const r = await pool.query(
      'SELECT id, email, username, password_hash, role FROM users WHERE username = $1',
      [username]
    );
    return r.rows[0] || null;
  }

  async create({ email, username, passwordHash, role = 'user' }) {
    const r = await pool.query(
      `INSERT INTO users (email, username, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, role, created_at`,
      [email, username, passwordHash, role]
    );
    return r.rows[0];
  }

  async findById(id) {
    const r = await pool.query(
      'SELECT id, email, username, role FROM users WHERE id = $1',
      [id]
    );
    return r.rows[0] || null;
  }
}

module.exports = { UsersRepository };
