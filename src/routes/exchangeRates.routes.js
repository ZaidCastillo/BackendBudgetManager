const express = require('express');
const { getRates } = require('../controllers/exchangeRates.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(getRates));

module.exports = { router };
