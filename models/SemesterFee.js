const mongoose = require('mongoose');

const semesterFeeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required']
    },
    batch: {
      type: String,
      required: [true, 'Batch is required'],
      trim: true
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      trim: true
    },
    dueFee: {
      type: Number,
      required: [true, 'Due fee amount is required'],
      min: [0, 'Due fee cannot be negative'],
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Ensure one semester fee record per student per semester
semesterFeeSchema.index({ student: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('SemesterFee', semesterFeeSchema);
