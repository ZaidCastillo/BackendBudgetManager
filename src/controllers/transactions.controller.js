const { TransactionsRepository } = require('../repositories/transactions.repository');
const { asyncHandler } = require('../utils/asyncHandler');

const repo = new TransactionsRepository();

async function addTransaction(req, res) {
  const userId = req.user.id;
  const { type, amount, reason, transaction_date } = req.body;

  if (!type || !amount) {
    return res.status(400).json({
      error: 'Tipo (ingreso/gasto) e importe son obligatorios',
    });
  }

  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'El tipo debe ser "income" o "expense"' });
  }

  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'El importe debe ser un número positivo' });
  }

  const reasonStr = (reason != null && String(reason).trim()) ? String(reason).trim() : 'General';

  const transaction = await repo.create({
    userId,
    type,
    amount: numAmount,
    reason: reasonStr,
    transactionDate: transaction_date || null,
  });

  return res.status(201).json(transaction);
}

async function listTransactions(req, res) {
  const userId = req.user.id;
  const { from_date, to_date, type, page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
  const offset = (pageNum - 1) * limitNum;

  const filters = {
    fromDate: from_date || null,
    toDate: to_date || null,
    type: type || null,
  };

  const [transactions, total] = await Promise.all([
    repo.findByUserId(userId, { ...filters, limit: limitNum, offset }),
    repo.countByUserId(userId, filters),
  ]);

  return res.json({
    data: transactions,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
  });
}

async function getBalance(req, res) {
  const userId = req.user.id;
  const balance = await repo.getBalance(userId);
  return res.json({ balance });
}

async function getTransaction(req, res) {
  const userId = req.user.id;
  const id = Number(req.params.id);
  const transaction = await repo.findById(id, userId);

  if (!transaction) {
    return res.status(404).json({ error: 'Transacción no encontrada' });
  }

  return res.json(transaction);
}

async function deleteTransaction(req, res) {
  const userId = req.user.id;
  const id = Number(req.params.id);
  const deleted = await repo.delete(id, userId);

  if (!deleted) {
    return res.status(404).json({ error: 'Transacción no encontrada' });
  }

  return res.status(204).send();
}

module.exports = {
  addTransaction,
  listTransactions,
  getBalance,
  getTransaction,
  deleteTransaction,
};
