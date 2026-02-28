const { GoalsRepository } = require('../repositories/goals.repository');
const { TransactionsRepository } = require('../repositories/transactions.repository');
const { asyncHandler } = require('../utils/asyncHandler');

const repo = new GoalsRepository();
const transactionsRepo = new TransactionsRepository();

async function createGoal(req, res) {
  const userId = req.user.id;
  const { name, target_amount, deadline } = req.body;

  if (!name || target_amount == null) {
    return res.status(400).json({ error: 'Nombre y objetivo son obligatorios' });
  }

  const numTarget = Number(target_amount);
  if (!Number.isFinite(numTarget) || numTarget <= 0) {
    return res.status(400).json({ error: 'El objetivo debe ser un número positivo' });
  }

  const goal = await repo.create({
    userId,
    name: String(name).trim(),
    targetAmount: numTarget,
    deadline: deadline || null,
  });

  return res.status(201).json(goal);
}

async function listGoals(req, res) {
  const userId = req.user.id;
  const goals = await repo.findByUserId(userId);
  return res.json(goals);
}

async function getGoal(req, res) {
  const userId = req.user.id;
  const id = Number(req.params.id);
  const goal = await repo.findById(id, userId);

  if (!goal) {
    return res.status(404).json({ error: 'Meta no encontrada' });
  }

  return res.json(goal);
}

async function addToGoal(req, res) {
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

  const goal = await repo.addToGoal(id, userId, numAmount);

  if (!goal) {
    return res.status(404).json({ error: 'Meta no encontrada' });
  }

  return res.json(goal);
}

async function updateGoal(req, res) {
  const userId = req.user.id;
  const id = Number(req.params.id);
  const { name, target_amount, deadline } = req.body;

  const goal = await repo.update(id, userId, {
    name: name !== undefined ? String(name).trim() : undefined,
    targetAmount: target_amount !== undefined ? Number(target_amount) : undefined,
    deadline: deadline !== undefined ? deadline : undefined,
  });

  if (!goal) {
    return res.status(404).json({ error: 'Meta no encontrada' });
  }

  return res.json(goal);
}

async function deleteGoal(req, res) {
  const userId = req.user.id;
  const id = Number(req.params.id);
  const deleted = await repo.delete(id, userId);

  if (!deleted) {
    return res.status(404).json({ error: 'Meta no encontrada' });
  }

  return res.status(204).send();
}

module.exports = {
  createGoal,
  listGoals,
  getGoal,
  addToGoal,
  updateGoal,
  deleteGoal,
};
