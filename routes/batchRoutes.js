const express = require('express');
const router = express.Router();
const {
  createBatch,
  getAllBatches,
  deleteBatch
} = require('../controllers/batchController');

router.route('/')
  .post(createBatch)
  .get(getAllBatches);

router.route('/:id')
  .delete(deleteBatch);

module.exports = router;
