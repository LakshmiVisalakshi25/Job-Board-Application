const mongoose = require('mongoose');

const userSchema =
  new mongoose.Schema({

    // ===============================
    // NAME
    // ===============================
    name: {

      type: String,

      required: true,

      trim: true

    },

    // ===============================
    // EMAIL
    // ===============================
    email: {

      type: String,

      required: true,

      unique: true,

      lowercase: true,

      trim: true

    },

    // ===============================
    // PASSWORD
    // ===============================
    password: {

      type: String,

      required: true,

      minlength: 6

    },

    // ===============================
    // ROLE
    // ===============================
    role: {

      type: String,

      enum: [

        "user",

        "admin"

      ],

      default: "user"

    },

    // ===============================
    // PROFILE IMAGE
    // ===============================
    profileImage: {

      type: String,

      default: ""

    },

    // ===============================
    // BIO
    // ===============================
    bio: {

      type: String,

      default: ""

    },

    // ===============================
    // COLLEGE
    // ===============================
    college: {

      type: String,

      default: ""

    },

    // ===============================
    // SKILLS
    // ===============================
    skills: {

      type: [String],

      default: []

    },

    // ===============================
    // GITHUB
    // ===============================
    github: {

      type: String,

      default: ""

    },

    // ===============================
    // LINKEDIN
    // ===============================
    linkedin: {

      type: String,

      default: ""

    }

  },

  {

    // ===============================
    // TIMESTAMPS
    // ===============================
    timestamps: true

  }

);

module.exports =
  mongoose.model(
    'User',
    userSchema
  );