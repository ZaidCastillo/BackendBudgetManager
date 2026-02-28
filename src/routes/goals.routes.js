const express = require('express');
const controller = require('../controllers/goals.controller');
const { authMiddleware } = require('../auth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMiddleware);

router.get('/', asyncHandler(controller.listGoals));
router.post('/', asyncHandler(controller.createGoal));
router.get('/:id', asyncHandler(controller.getGoal));
router.post('/:id/add', asyncHandler(controller.addToGoal));
router.put('/:id', asyncHandler(controller.updateGoal));
router.delete('/:id', asyncHandler(controller.deleteGoal));

module.exports = { router };
