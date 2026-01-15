import mongoose from 'mongoose';

const sizeChartSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sizes: [{
    label: {
      type: String,
      required: true, // e.g., "S", "M", "L", "XL"
      trim: true
    },
    measurements: [{
      name: {
        type: String,
        required: true, // e.g., "Chest", "Waist", "Length"
        trim: true
      },
      value: {
        type: String,
        required: true, // e.g., "36 inches", "91 cm"
        trim: true
      }
    }]
  }],
  unit: {
    type: String,
    enum: ['cm', 'inches'],
    default: 'cm'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const SizeChart = mongoose.model('SizeChart', sizeChartSchema);

export default SizeChart;
