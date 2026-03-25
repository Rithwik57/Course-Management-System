const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      default: '',
      trim: true,
    },
    semester: {
      type: String,
      required: true,
      trim: true,
    },
    enrollStatus: {
      type: String,
      enum: ['Open', 'Closed', 'Waitlisted'],
      default: 'Open',
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', courseSchema);
