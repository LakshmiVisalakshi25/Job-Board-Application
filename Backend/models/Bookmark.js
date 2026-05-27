const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({

  // ===============================
  // USER ID
  // ===============================
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // ===============================
  // JOB ID
  // ===============================
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true
  }

},
{
  // ===============================
  // TIMESTAMPS
  // ===============================
  timestamps: true
});

module.exports = mongoose.model(
  'Bookmark',
  bookmarkSchema
);