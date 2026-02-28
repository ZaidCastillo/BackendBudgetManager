const express = require('express');
const controller = require('../controllers/users.controller');
const { authMiddleware } = require('../auth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.post('/login', asyncHandler(controller.loginUser));
router.post('/register', asyncHandler(controller.register));
router.get('/me', authMiddleware, asyncHandler(controller.getMe));

module.exports = { router };
