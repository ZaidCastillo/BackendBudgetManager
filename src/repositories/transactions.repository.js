const { pool } = require('../db');

class TransactionsRepository {
  async create({ userId, type, amount, reason, transactionDate }) {
    const r = await pool.query(
      `INSERT INTO budget_transactions (user_id, type, amount, reason, transaction_date)
       VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE))
       RETURNING id, user_id, type, amount, reason, transaction_date, created_at`,
      [userId, type, amount, reason, transactionDate]
    );
    return r.rows[0];
  }

  async findByUserId(userId, options = {}) {
    const { fromDate, toDate, type, limit = 100, offset = 0 } = options;
    let query = `
      SELECT id, user_id, type, amount, reason, transaction_date, created_at
      FROM budget_transactions
      WHERE user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (fromDate) {
      query += ` AND transaction_date >= $${paramIndex}`;
      params.push(fromDate);
      paramIndex++;
    }
    if (toDate) {
      query += ` AND transaction_date <= $${paramIndex}`;
      params.push(toDate);
      paramIndex++;
    }
    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ` ORDER BY transaction_date DESC, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const r = await pool.query(query, params);
    return r.rows;
  }

  async countByUserId(userId, options = {}) {
    const { fromDate, toDate, type } = options;
    let query = 'SELECT COUNT(*)::int AS total FROM budget_transactions WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;
    if (fromDate) {
      query += ` AND transaction_date >= $${paramIndex}`;
      params.push(fromDate);
      paramIndex++;
    }
    if (toDate) {
      query += ` AND transaction_date <= $${paramIndex}`;
      params.push(toDate);
      paramIndex++;
    }
    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
    }
    const r = await pool.query(query, params);
    return r.rows[0].total;
  }

  async getBalance(userId) {
    const r = await pool.query(
      'SELECT balance FROM budget_balance WHERE user_id = $1',
      [userId]
    );
    return r.rows[0] ? Number(r.rows[0].balance) : 0;
  }

  async findById(id, userId) {
    const r = await pool.query(
      'SELECT id, user_id, type, amount, reason, transaction_date, created_at FROM budget_transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return r.rows[0] || null;
  }

  async delete(id, userId) {
    const r = await pool.query(
      'DELETE FROM budget_transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return r.rows[0] || null;
  }
}

module.exports = { TransactionsRepository };
