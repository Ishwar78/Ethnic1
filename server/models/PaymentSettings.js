import mongoose from 'mongoose';

const paymentSettingsSchema = new mongoose.Schema({
  // UPI Payment Settings
  upiEnabled: {
    type: Boolean,
    default: true
  },
  upiAddress: {
    type: String,
    default: '',
    trim: true
  },
  upiQrCode: {
    type: String, // Base64 encoded QR code image
    default: ''
  },
  upiName: {
    type: String,
    default: 'Vasstra Payments',
    trim: true
  },

  // Cash on Delivery Settings
  codEnabled: {
    type: Boolean,
    default: true
  },

  // Code/Reference Payment Settings (for codes like phone pay, paytm)
  codePaymentEnabled: {
    type: Boolean,
    default: true
  },
  paymentCodes: [{
    name: {
      type: String,
      enum: ['phonepe', 'paytm', 'googlepay', 'amazon_pay', 'other'],
      required: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    qrCode: {
      type: String, // Base64 encoded QR code image
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Invoice Settings
  invoiceCompanyLogo: {
    type: String, // Base64 encoded image
    default: ''
  },
  invoiceCompanyName: {
    type: String,
    default: 'Vasstra Fashion',
    trim: true
  },
  invoiceCompanyGST: {
    type: String,
    default: '',
    trim: true
  },
  invoiceCompanyAddress: {
    type: String,
    default: '',
    trim: true
  },
  invoiceCompanyCity: {
    type: String,
    default: '',
    trim: true
  },
  invoiceCompanyState: {
    type: String,
    default: '',
    trim: true
  },
  invoiceCompanyZipCode: {
    type: String,
    default: '',
    trim: true
  },
  invoiceCompanyCountry: {
    type: String,
    default: 'India',
    trim: true
  },
  invoiceCompanyPhone: {
    type: String,
    default: '',
    trim: true
  },
  invoiceCompanyEmail: {
    type: String,
    default: '',
    trim: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const PaymentSettings = mongoose.model('PaymentSettings', paymentSettingsSchema);

export default PaymentSettings;
