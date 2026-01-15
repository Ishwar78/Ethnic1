import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  invoiceDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  // Customer Details
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  customerAddress: String,
  customerCity: String,
  customerState: String,
  customerZipCode: String,
  customerCountry: String,
  // Order Details
  orderItems: [{
    name: String,
    quantity: Number,
    price: Number,
    subtotal: Number,
    image: String,
    size: String,
    color: String
  }],
  subtotal: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  // Company Details (used for invoice at the time of generation)
  companyLogo: String,
  companyName: String,
  companyGST: String,
  companyAddress: String,
  companyCity: String,
  companyState: String,
  companyZipCode: String,
  companyCountry: String,
  companyPhone: String,
  companyEmail: String,
  paymentMethod: String,
  transactionId: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);
