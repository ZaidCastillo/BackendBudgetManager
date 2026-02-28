const express = require('express');
const controller = require('../controllers/transactions.controller');
const { authMiddleware } = require('../auth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMiddleware);

router.get('/balance', asyncHandler(controller.getBalance));
router.get('/', asyncHandler(controller.listTransactions));
router.post('/', asyncHandler(controller.addTransaction));
router.get('/:id', asyncHandler(controller.getTransaction));
router.delete('/:id', asyncHandler(controller.deleteTransaction));

module.exports = { router };
