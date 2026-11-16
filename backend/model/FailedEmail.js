const mongoose = require('mongoose');

const FailedEmailSchema = new mongoose.Schema({
  to:        String,
  subject:   String,
  html:      String,
  attempts:  { type: Number, default: 0 },
  lastError: String,
  status:    { type: String, enum: ['pending', 'sent', 'gave_up'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('FailedEmail', FailedEmailSchema);