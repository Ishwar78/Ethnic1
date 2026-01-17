import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    size: String,
    color: String,
    sku: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'wallet', 'cod'],
    required: true
  },
  paymentDetails: {
    transactionId: {
      type: String,
      default: null
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  },
  notes: String,
  trackingId: {
    type: String,
    default: null
  },
  trackingUpdates: [{
    status: {
      type: String,
      enum: ['confirmed', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'],
      default: 'confirmed'
    },
    message: String,
    location: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  estimatedDelivery: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Order', orderSchema);
