const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    fname: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true
    },
    rollNo: {
      type: String,
      required: [true, 'Roll No is required'],
      unique: true,
      trim: true
    },
    batch: {
      type: String,
      required: [true, 'Batch is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Student', studentSchema);
