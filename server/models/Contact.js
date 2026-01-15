import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  phone: {
    type: String,
    default: "+91 98765 43210",
    trim: true
  },
  email: {
    type: String,
    default: "support@vasstra.com",
    lowercase: true,
    trim: true
  },
  address: {
    type: String,
    default: "123 Fashion Street, Textile Hub\nMumbai, Maharashtra 400001"
  },
  businessHours: {
    type: String,
    default: "Monday - Saturday: 10:00 AM - 7:00 PM\nSunday: Closed"
  },
  whatsapp: {
    type: String,
    default: "919876543210",
    trim: true
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

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
