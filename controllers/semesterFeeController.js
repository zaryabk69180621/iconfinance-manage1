const SemesterFee = require('../models/SemesterFee');
const Student = require('../models/Student');
const FeeSlip = require('../models/FeeSlip');

// @desc    Set/Initialize due fee for all students in a batch for a semester
// @route   POST /api/semester-fees/batch-setup
const setSemesterFeeForBatch = async (req, res) => {
  try {
    const { batch, semester, dueFee } = req.body;

    if (!batch || !semester || dueFee === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide batch, semester, and due fee amount'
      });
    }

    const students = await Student.find({ batch });
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No students found in batch "${batch}"`
      });
    }

    // Bulk upsert semester fee for all students in batch
    const operations = students.map((student) => ({
      updateOne: {
        filter: { student: student._id, semester },
        update: {
          $set: {
            batch,
            dueFee: Number(dueFee)
          }
        },
        upsert: true
      }
    }));

    await SemesterFee.bulkWrite(operations);

    res.status(200).json({
      success: true,
      message: `Due fee set to PKR ${dueFee} for ${students.length} students in ${batch} (${semester})`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update single student's semester due fee
// @route   PUT /api/semester-fees/student
const updateStudentSemesterFee = async (req, res) => {
  try {
    const { studentId, batch, semester, dueFee } = req.body;

    if (!studentId || !semester || dueFee === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide studentId, semester, and dueFee'
      });
    }

    const record = await SemesterFee.findOneAndUpdate(
      { student: studentId, semester },
      {
        batch,
        dueFee: Number(dueFee)
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get complete fee ledger matrix for a batch & semester
// @route   GET /api/semester-fees/ledger
const getSemesterFeeLedger = async (req, res) => {
  try {
    const { batch, semester } = req.query;

    if (!batch || !semester) {
      return res.status(400).json({
        success: false,
        error: 'Both batch and semester query parameters are required'
      });
    }

    // 1. Get all students in the batch
    const students = await Student.find({ batch }).sort({ rollNo: 1 });

    // 2. Get all semester fee setups for this batch & semester
    const studentIds = students.map((s) => s._id);
    const semesterFeeRecords = await SemesterFee.find({
      student: { $in: studentIds },
      semester
    });

    const feeMap = {};
    semesterFeeRecords.forEach((rec) => {
      feeMap[rec.student.toString()] = rec.dueFee;
    });

    // 3. Get all fee slips for this batch & semester
    const feeSlips = await FeeSlip.find({ batch, semester }).sort({ createdAt: 1 });

    // Group fee slips by student ID or student Roll No/Name
    const slipsMapByStudentId = {};
    const slipsMapByRollNo = {};

    feeSlips.forEach((slip) => {
      if (slip.student) {
        const sId = slip.student.toString();
        if (!slipsMapByStudentId[sId]) slipsMapByStudentId[sId] = [];
        slipsMapByStudentId[sId].push(slip);
      } else if (slip.rollNo) {
        const rNo = slip.rollNo.trim();
        if (!slipsMapByRollNo[rNo]) slipsMapByRollNo[rNo] = [];
        slipsMapByRollNo[rNo].push(slip);
      }
    });

    let maxInstallmentsCount = 0;

    const ledger = students.map((student) => {
      const sId = student._id.toString();
      const rNo = student.rollNo;

      const dueFee = feeMap[sId] !== undefined ? feeMap[sId] : 0;

      // Find matching slips
      const studentSlips = slipsMapByStudentId[sId] || slipsMapByRollNo[rNo] || [];

      if (studentSlips.length > maxInstallmentsCount) {
        maxInstallmentsCount = studentSlips.length;
      }

      const installments = studentSlips.map((slip, index) => ({
        installmentNo: index + 1,
        slipId: slip._id,
        amount: slip.amount,
        creditedTo: slip.creditedTo,
        photo: slip.photo,
        date: slip.createdAt
      }));

      const totalPaid = installments.reduce((acc, curr) => acc + curr.amount, 0);
      const pendingFee = Math.max(0, dueFee - totalPaid);

      let status = 'Unpaid';
      if (dueFee > 0 && totalPaid >= dueFee) {
        status = 'Paid';
      } else if (totalPaid > 0) {
        status = 'Partial';
      }

      return {
        student: {
          _id: student._id,
          name: student.name,
          fname: student.fname,
          rollNo: student.rollNo,
          batch: student.batch
        },
        dueFee,
        installments,
        totalPaid,
        pendingFee,
        status
      };
    });

    res.status(200).json({
      success: true,
      batch,
      semester,
      maxInstallmentsCount,
      count: ledger.length,
      data: ledger
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  setSemesterFeeForBatch,
  updateStudentSemesterFee,
  getSemesterFeeLedger
};
