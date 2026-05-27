const mongoose = require('mongoose');

const applicationSchema =
  new mongoose.Schema({

    userId: String,

    jobId: String,

    name: String,

    email: String,

    phone: String,

    address: String,

    percentage: String,

    resume: String,

    photo: String,

    // =========================
    // APPLICATION STATUS
    // =========================
    status: {

      type: String,

      enum: [

        "Pending",

        "Shortlisted",

        "Rejected",

        "Selected"

      ],

      default: "Pending"

    },

    // =========================
    // APPLIED DATE
    // =========================
    appliedAt: {

      type: Date,

      default: Date.now

    },

    // =========================
    // UPDATED DATE
    // =========================
    updatedAt: {

      type: Date,

      default: Date.now

    }

  });

module.exports =
  mongoose.model(
    'Application',
    applicationSchema
  );