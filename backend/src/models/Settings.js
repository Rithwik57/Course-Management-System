const mongoose = require('mongoose');

const SETTINGS_ID = 'SYSTEM_SETTINGS';

const settingsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: SETTINGS_ID,
      immutable: true,
    },
    allowSelfEnrollment: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maxEnrollment: {
      type: Number,
      default: 60,
      min: 1,
    },
    activeSemesters: {
      type: [String],
      default: [],
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

settingsSchema.pre('save', function preSave(next) {
  this.updatedAt = new Date();
  next();
});

settingsSchema.statics.getSystemSettings = async function getSystemSettings() {
  let settings = await this.findById(SETTINGS_ID);
  if (!settings) {
    settings = await this.create({ _id: SETTINGS_ID });
  }
  return settings;
};

settingsSchema.statics.SETTINGS_ID = SETTINGS_ID;

module.exports = mongoose.model('Settings', settingsSchema);
