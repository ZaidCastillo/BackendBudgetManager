const { pool } = require('../db');

class GoalsRepository {
  async create({ userId, name, targetAmount, deadline }) {
    const r = await pool.query(
      `INSERT INTO budget_goals (user_id, name, target_amount, deadline)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, name, target_amount, current_amount, deadline, created_at`,
      [userId, name, targetAmount, deadline || null]
    );
    return r.rows[0];
  }

  async findByUserId(userId) {
    const r = await pool.query(
      `SELECT id, user_id, name, target_amount, current_amount, deadline, created_at
       FROM budget_goals
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return r.rows;
  }

  async findById(id, userId) {
    const r = await pool.query(
      'SELECT id, user_id, name, target_amount, current_amount, deadline, created_at FROM budget_goals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return r.rows[0] || null;
  }

  async addToGoal(id, userId, amount) {
    const r = await pool.query(
      `UPDATE budget_goals
       SET current_amount = current_amount + $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, user_id, name, target_amount, current_amount, deadline, created_at`,
      [amount, id, userId]
    );
    return r.rows[0] || null;
  }

  async update(id, userId, { name, targetAmount, deadline }) {
    const updates = [];
    const params = [];
    let i = 1;

    if (name !== undefined) {
      updates.push(`name = $${i++}`);
      params.push(name);
    }
    if (targetAmount !== undefined) {
      updates.push(`target_amount = $${i++}`);
      params.push(targetAmount);
    }
    if (deadline !== undefined) {
      updates.push(`deadline = $${i++}`);
      params.push(deadline);
    }

    if (updates.length === 0) return this.findById(id, userId);

    params.push(id, userId);
    const r = await pool.query(
      `UPDATE budget_goals SET ${updates.join(', ')} WHERE id = $${i} AND user_id = $${i + 1}
       RETURNING id, user_id, name, target_amount, current_amount, deadline, created_at`,
      params
    );
    return r.rows[0] || null;
  }

  async delete(id, userId) {
    const r = await pool.query(
      'DELETE FROM budget_goals WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return r.rows[0] || null;
  }
}

module.exports = { GoalsRepository };
