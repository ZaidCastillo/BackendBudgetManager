const { SavingsRepository } = require('../repositories/savings.repository');
const { TransactionsRepository } = require('../repositories/transactions.repository');
const { asyncHandler } = require('../utils/asyncHandler');

const repo = new SavingsRepository();
const transactionsRepo = new TransactionsRepository();

async function createSaving(req, res) {
  const userId = req.user.id;
  const { name, amount } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  const numAmount = amount != null ? Number(amount) : 0;
  if (!Number.isFinite(numAmount) || numAmount < 0) {
    return res.status(400).json({ error: 'El importe debe ser un número mayor o igual a 0' });
  }

  const saving = await repo.create({
    userId,
    name: String(name).trim(),
    amount: numAmount,
  });

  return res.status(201).json(saving);
}

async function listSavings(req, res) {
  const userId = req.user.id;
  const savings = await repo.findByUserId(userId);
  return res.json(savings);
}

async function getSaving(req, res) {
  const userId = req.user.id;
  const id = Number(req.params.id);
  const saving = await repo.findById(id, userId);

  if (!saving) {
    return res.status(404).json({ error: 'Hucha no encontrada' });
  }

  return res.json(saving);
}

async function addToSaving(req, res) {
  const userId = req.user.id;
  const id = Number(req.params.id);
  const { amount } = req.body;

  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'El importe debe ser un número positivo' });
  }

  const balance = await transactionsRepo.getBalance(userId);
  if (numAmount > balance) {
    return res.status(400).json({
      error: `No tienes esa cantidad disponible. Tu balance es $${Number(balance).toFixed(2)}.`,
    });
  }

  const saving = await repo.addAmount(id, userId, numAmount);

  if (!saving) {
    return res.status(404).json({ error: 'Hucha no encontrada' });
  }

  return res.json(saving);
}

async function updateSaving(req, res) {
  const userId = req.user.id;
  const id = Number(req.params.id);
  const { name } = req.body;

  const saving = await repo.update(id, userId, {
    name: name !== undefined ? String(name).trim() : undefined,
  });

  if (!saving) {
    return res.status(404).json({ error: 'Hucha no encontrada' });
  }

  return res.json(saving);
}

async function deleteSaving(req, res) {
  const userId = req.user.id;
  const id = Number(req.params.id);
  const deleted = await repo.delete(id, userId);

  if (!deleted) {
    return res.status(404).json({ error: 'Hucha no encontrada' });
  }

  return res.status(204).send();
}

module.exports = {
  createSaving,
  listSavings,
  getSaving,
  addToSaving,
  updateSaving,
  deleteSaving,
};
