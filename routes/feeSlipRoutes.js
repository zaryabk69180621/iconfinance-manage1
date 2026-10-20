const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const {
  createFeeSlip,
  getAllFeeSlips,
  getFeeSlipById,
  updateFeeSlip,
  deleteFeeSlip,
  getFinanceSummary
} = require('../controllers/feeSlipController');

// Apply JWT authentication middleware to all fee slip routes
router.use(protect);

// Summary route
router.get('/summary', getFinanceSummary);

// Base CRUD routes
router.route('/')
  .post(upload.single('photo'), createFeeSlip)
  .get(getAllFeeSlips);

router.route('/:id')
  .get(getFeeSlipById)
  .put(upload.single('photo'), updateFeeSlip)
  .delete(deleteFeeSlip);

module.exports = router;
