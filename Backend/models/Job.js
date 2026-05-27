const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({

  // ===============================
  // JOB TITLE
  // ===============================
  title: {
    type: String,
    required: true,
    trim: true
  },

  // ===============================
  // LOCATION
  // ===============================
  location: {
    type: String,
    required: true,
    trim: true
  },

  // ===============================
  // COMPANY
  // ===============================
  company: {
    type: String,
    required: true,
    trim: true
  },

  // ===============================
  // SALARY
  // ===============================
  salary: {
    type: Number,
    required: true,
    min: 0
  },

  // ===============================
  // JOB TYPE
  // ===============================
  type: {
    type: String,
    enum: ["Remote", "Hybrid", "Onsite"],
    default: "Remote"
  },

  // ===============================
  // SKILLS
  // ===============================
  skills: {
    type: [String],
    default: []
  }

},
{
  // ===============================
  // TIMESTAMPS
  // ===============================
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);