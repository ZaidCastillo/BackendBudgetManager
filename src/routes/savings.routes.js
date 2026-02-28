const express = require('express');
const controller = require('../controllers/savings.controller');
const { authMiddleware } = require('../auth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMiddleware);

router.get('/', asyncHandler(controller.listSavings));
router.post('/', asyncHandler(controller.createSaving));
router.get('/:id', asyncHandler(controller.getSaving));
router.post('/:id/add', asyncHandler(controller.addToSaving));
router.put('/:id', asyncHandler(controller.updateSaving));
router.delete('/:id', asyncHandler(controller.deleteSaving));

module.exports = { router };
