const express = require('express');
const router = express.Router();
const {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

router.route('/')
  .post(createStudent)
  .get(getStudents);

router.route('/:id')
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
