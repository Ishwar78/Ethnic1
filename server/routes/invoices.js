import express from 'express';
import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import PaymentSettings from '../models/PaymentSettings.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Generate invoice for an order
router.post('/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if invoice already exists
    let invoice = await Invoice.findOne({ orderId });

    if (invoice) {
      return res.json({
        success: true,
        invoice,
        message: 'Invoice already exists'
      });
    }

    // Fetch order
    const order = await Order.findById(orderId).populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization - only user who placed the order or admin
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get payment settings for company details
    const paymentSettings = await PaymentSettings.findOne();

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${orderId.toString().slice(-6)}`;

    // Create invoice
    invoice = new Invoice({
      orderId: order._id,
      userId: order.userId._id,
      invoiceNumber,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      // Customer Details
      customerName: order.shippingAddress?.name || order.userId.name,
      customerEmail: order.userId.email,
      customerPhone: order.shippingAddress?.phone || order.userId.phone,
      customerAddress: order.shippingAddress?.street || '',
      customerCity: order.shippingAddress?.city || '',
      customerState: order.shippingAddress?.state || '',
      customerZipCode: order.shippingAddress?.zipCode || '',
      customerCountry: order.shippingAddress?.country || 'India',
      // Order Details
      orderItems: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
        image: item.image || '',
        size: item.size || '',
        color: item.color || ''
      })),
      subtotal: order.totalAmount - (order.shipping || 0),
      taxAmount: 0,
      shippingCost: order.shipping || 0,
      totalAmount: order.totalAmount,
      // Company Details
      companyLogo: paymentSettings?.invoiceCompanyLogo || '',
      companyName: paymentSettings?.invoiceCompanyName || 'Vasstra Fashion',
      companyGST: paymentSettings?.invoiceCompanyGST || '',
      companyAddress: paymentSettings?.invoiceCompanyAddress || '',
      companyCity: paymentSettings?.invoiceCompanyCity || '',
      companyState: paymentSettings?.invoiceCompanyState || '',
      companyZipCode: paymentSettings?.invoiceCompanyZipCode || '',
      companyCountry: paymentSettings?.invoiceCompanyCountry || 'India',
      companyPhone: paymentSettings?.invoiceCompanyPhone || '',
      companyEmail: paymentSettings?.invoiceCompanyEmail || '',
      paymentMethod: order.paymentMethod,
      transactionId: order.paymentDetails?.transactionId || '',
      notes: order.notes || ''
    });

    await invoice.save();

    res.status(201).json({
      success: true,
      invoice,
      message: 'Invoice generated successfully'
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Get invoice by order ID
router.get('/order/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;

    const invoice = await Invoice.findOne({ orderId });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Check authorization
    if (invoice.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Get invoice by invoice ID
router.get('/:invoiceId', authMiddleware, async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Check authorization
    if (invoice.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Get all invoices (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin') {
      // Regular users can only get their own invoices
      const invoices = await Invoice.find({ userId: req.user._id }).sort({ createdAt: -1 });
      return res.json({
        success: true,
        invoices
      });
    }

    // Admin gets all invoices
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const invoices = await Invoice.find()
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Invoice.countDocuments();

    res.json({
      success: true,
      invoices,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

export default router;
