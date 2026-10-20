const mongoose = require('mongoose');

const feeSlipSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null
    },
    rollNo: {
      type: String,
      trim: true,
      default: ''
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    fname: {
      type: String,
      required: [true, 'Father name is required'],
      trim: true
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
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    creditedTo: {
      type: String,
      required: [true, 'Credited account is required'],
      enum: {
        values: ['owner', 'bank', 'utilized in college'],
        message: '{VALUE} is not a valid credit destination. Must be one of: owner, bank, utilized in college'
      }
    },
    photo: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('FeeSlip', feeSlipSchema);
