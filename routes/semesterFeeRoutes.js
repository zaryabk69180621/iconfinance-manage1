const express = require('express');
const router = express.Router();
const {
  setSemesterFeeForBatch,
  updateStudentSemesterFee,
  getSemesterFeeLedger
} = require('../controllers/semesterFeeController');

router.post('/batch-setup', setSemesterFeeForBatch);
router.put('/student', updateStudentSemesterFee);
router.get('/ledger', getSemesterFeeLedger);

module.exports = router;
