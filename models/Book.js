const mongoose = require ('mongoose');

const bookSchema = new mongoose.Schema ({
  title_bn: {
    type: String,
    required: true,
    trim: true,
  },
  title_en: {
    type: String,
    trim: true,
  },
  author_bn: {
    type: String,
    required: true,
    trim: true,
  },
  author_en: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  discount_price: {
    type: Number,
    min: 0,
    validate: {
      validator: function (v) {
        return v <= this.price;
      },
      message: 'Discount price should be less than or equal to original price',
    },
  },
  language: {
    type: String,
    enum: ['Bangla', 'English', 'Hindi', 'Other'],
    required: true,
  },
  cover_image: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Must be a valid image URL'],
  },
  description: {
    type: String,
  },
  publication: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model ('Book', bookSchema);
