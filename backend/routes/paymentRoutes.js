const express = require('express');
const router = express.Router();
const { getPaymentHistory } = require('../controllers/paymentController');
const protect = require('../middleware/auth');

router.get('/history', protect, getPaymentHistory);

module.exports = router;