const Batch = require('../models/Batch');
const Student = require('../models/Student');

// @desc    Create new batch
// @route   POST /api/batches
const createBatch = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Batch name is required'
      });
    }

    const existingBatch = await Batch.findOne({ name: name.trim() });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        error: `Batch "${name}" already exists`
      });
    }

    const batch = await Batch.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      data: batch
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all batches with student count
// @route   GET /api/batches
const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });
    
    // Count students per batch
    const batchesWithCount = await Promise.all(
      batches.map(async (b) => {
        const studentCount = await Student.countDocuments({ batch: b.name });
        return {
          ...b.toObject(),
          studentCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: batchesWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete batch
// @route   DELETE /api/batches/:id
const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Batch removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createBatch,
  getAllBatches,
  deleteBatch
};
