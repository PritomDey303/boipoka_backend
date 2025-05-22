const mongoose = require ('mongoose');

const userSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  mobile: {
    type: String,
    required: true,
    trim: true,
    match: [
      /^\+8801[3-9]\d{8}$/,
      'Please enter a valid Bangladeshi mobile number',
    ],
  },
  userType: {
    type: String,
    enum: ['normal', 'admin'],
    default: 'normal',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model ('User', userSchema);
