const { pool } = require('../db');

class SavingsRepository {
  async create({ userId, name, amount = 0 }) {
    const r = await pool.query(
      `INSERT INTO budget_savings (user_id, name, amount)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, name, amount, created_at`,
      [userId, name, amount]
    );
    return r.rows[0];
  }

  async findByUserId(userId) {
    const r = await pool.query(
      `SELECT id, user_id, name, amount, created_at
       FROM budget_savings
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return r.rows;
  }

  async findById(id, userId) {
    const r = await pool.query(
      'SELECT id, user_id, name, amount, created_at FROM budget_savings WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return r.rows[0] || null;
  }

  async addAmount(id, userId, amount) {
    const r = await pool.query(
      `UPDATE budget_savings
       SET amount = amount + $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, user_id, name, amount, created_at`,
      [amount, id, userId]
    );
    return r.rows[0] || null;
  }

  async setAmount(id, userId, amount) {
    const r = await pool.query(
      `UPDATE budget_savings
       SET amount = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, user_id, name, amount, created_at`,
      [amount, id, userId]
    );
    return r.rows[0] || null;
  }

  async update(id, userId, { name }) {
    if (name === undefined) return this.findById(id, userId);
    const r = await pool.query(
      `UPDATE budget_savings SET name = $1 WHERE id = $2 AND user_id = $3
       RETURNING id, user_id, name, amount, created_at`,
      [name, id, userId]
    );
    return r.rows[0] || null;
  }

  async delete(id, userId) {
    const r = await pool.query(
      'DELETE FROM budget_savings WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return r.rows[0] || null;
  }
}

module.exports = { SavingsRepository };
