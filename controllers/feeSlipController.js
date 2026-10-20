const FeeSlip = require('../models/FeeSlip');
const fs = require('fs');
const path = require('path');

// Helper to safely delete file from uploads
const deleteUploadedFile = (photoPath) => {
  if (!photoPath) return;
  const filename = photoPath.replace('/uploads/', '');
  const filePath = path.join(__dirname, '../uploads', filename);
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Failed to delete file ${filePath}:`, err);
    });
  }
};

// @desc    Create new fee slip
// @route   POST /api/fee-slips
// @access  Public
const createFeeSlip = async (req, res) => {
  try {
    const { student, rollNo, name, fname, batch, semester, amount, creditedTo } = req.body;
    let photo = '';

    if (req.file) {
      photo = `/uploads/${req.file.filename}`;
    }

    const feeSlip = await FeeSlip.create({
      student: student || null,
      rollNo: rollNo || '',
      name,
      fname,
      batch,
      semester,
      amount,
      creditedTo,
      photo
    });

    res.status(201).json({
      success: true,
      data: feeSlip
    });
  } catch (error) {
    // Clean up uploaded file if DB save fails
    if (req.file) {
      deleteUploadedFile(`/uploads/${req.file.filename}`);
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all fee slips (with optional filtering)
// @route   GET /api/fee-slips
// @access  Public
const getAllFeeSlips = async (req, res) => {
  try {
    const { batch, semester, creditedTo, search } = req.query;
    let query = {};

    if (batch) query.batch = batch;
    if (semester) query.semester = semester;
    if (creditedTo) query.creditedTo = creditedTo;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fname: { $regex: search, $options: 'i' } }
      ];
    }

    const feeSlips = await FeeSlip.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feeSlips.length,
      data: feeSlips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single fee slip by ID
// @route   GET /api/fee-slips/:id
// @access  Public
const getFeeSlipById = async (req, res) => {
  try {
    const feeSlip = await FeeSlip.findById(req.params.id);

    if (!feeSlip) {
      return res.status(404).json({
        success: false,
        error: 'Fee slip not found'
      });
    }

    res.status(200).json({
      success: true,
      data: feeSlip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update fee slip
// @route   PUT /api/fee-slips/:id
// @access  Public
const updateFeeSlip = async (req, res) => {
  try {
    let feeSlip = await FeeSlip.findById(req.params.id);

    if (!feeSlip) {
      if (req.file) deleteUploadedFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({
        success: false,
        error: 'Fee slip not found'
      });
    }

    const updateData = { ...req.body };

    if (req.file) {
      // Delete old photo if new one uploaded
      if (feeSlip.photo) {
        deleteUploadedFile(feeSlip.photo);
      }
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    feeSlip = await FeeSlip.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: feeSlip
    });
  } catch (error) {
    if (req.file) deleteUploadedFile(`/uploads/${req.file.filename}`);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete fee slip
// @route   DELETE /api/fee-slips/:id
// @access  Public
const deleteFeeSlip = async (req, res) => {
  try {
    const feeSlip = await FeeSlip.findByIdAndDelete(req.params.id);

    if (!feeSlip) {
      return res.status(404).json({
        success: false,
        error: 'Fee slip not found'
      });
    }

    // Remove photo from uploads directory
    if (feeSlip.photo) {
      deleteUploadedFile(feeSlip.photo);
    }

    res.status(200).json({
      success: true,
      message: 'Fee slip removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get financial summary grouped by creditedTo
// @route   GET /api/fee-slips/summary
// @access  Public
const getFinanceSummary = async (req, res) => {
  try {
    const summary = await FeeSlip.aggregate([
      {
        $group: {
          _id: '$creditedTo',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalOverall = summary.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const totalFeeSlipsCount = summary.reduce((acc, curr) => acc + (curr.count || 0), 0);

    const breakdown = {
      owner: { amount: 0, count: 0 },
      bank: { amount: 0, count: 0 },
      collegeUtilization: { amount: 0, count: 0 }
    };

    summary.forEach((item) => {
      const key = item._id ? item._id.trim().toLowerCase() : '';
      if (key === 'owner') {
        breakdown.owner = { amount: item.totalAmount, count: item.count };
      } else if (key === 'bank') {
        breakdown.bank = { amount: item.totalAmount, count: item.count };
      } else if (key === 'utilized in college') {
        breakdown.collegeUtilization = { amount: item.totalAmount, count: item.count };
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalAmount: totalOverall,
        totalFeeSlips: totalFeeSlipsCount,
        breakdown
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createFeeSlip,
  getAllFeeSlips,
  getFeeSlipById,
  updateFeeSlip,
  deleteFeeSlip,
  getFinanceSummary
};
