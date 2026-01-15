import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Contact from '../models/Contact.js';
import PaymentSettings from '../models/PaymentSettings.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Public endpoint - Get contact information (no authentication required)
router.get('/contact/public', async (req, res) => {
  try {
    let contact = await Contact.findOne();

    // If no contact exists, create one with defaults
    if (!contact) {
      contact = new Contact();
      await contact.save();
    }

    res.json({
      success: true,
      contact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Failed to fetch contact information' });
  }
});

// Public endpoint - Get payment settings (no authentication required - needed for checkout page)
router.get('/payment-settings/public', async (req, res) => {
  try {
    let paymentSettings = await PaymentSettings.findOne();

    // If no payment settings exist, create one with defaults
    if (!paymentSettings) {
      paymentSettings = new PaymentSettings({
        upiEnabled: true,
        codEnabled: true,
        codePaymentEnabled: true,
        upiName: 'Vasstra Payments',
        upiAddress: '',
        upiQrCode: '',
        paymentCodes: []
      });
      await paymentSettings.save();
    }

    res.json({
      success: true,
      paymentSettings
    });
  } catch (error) {
    console.error('Get payment settings error:', error);
    res.status(500).json({ error: 'Failed to fetch payment settings' });
  }
});

// Apply auth middleware to all subsequent admin routes
router.use(authMiddleware, adminMiddleware);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = search 
      ? { $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]}
      : {};

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('wishlist');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const orders = await Order.find({ userId: user._id });

    res.json({
      success: true,
      user,
      orderCount: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, phone, address, role, isActive } = req.body;

    // Check email uniqueness if changed
    if (email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's orders
    await Order.deleteMany({ userId: req.params.id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user password (by admin)
router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Password updated successfully',
      user
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        adminUsers,
        activeUsers,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .populate('userId', 'name email phone address')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get new orders count (confirmed status)
router.get('/orders/count/pending', async (req, res) => {
  try {
    const pendingCount = await Order.countDocuments({ status: 'confirmed' });

    res.json({
      success: true,
      pendingCount,
      totalPending: pendingCount
    });
  } catch (error) {
    console.error('Get new orders count error:', error);
    res.status(500).json({ error: 'Failed to fetch new orders count' });
  }
});

// Update order status and tracking ID
router.put('/orders/:id', async (req, res) => {
  try {
    const { status, trackingId } = req.body;
    const updateData = { updatedAt: new Date() };

    if (status) updateData.status = status;
    if (trackingId) updateData.trackingId = trackingId;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Get contact information
router.get('/contact', async (req, res) => {
  try {
    let contact = await Contact.findOne();

    // If no contact exists, create one with defaults
    if (!contact) {
      contact = new Contact();
      await contact.save();
    }

    res.json({
      success: true,
      contact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Failed to fetch contact information' });
  }
});

// Update contact information
router.put('/contact', async (req, res) => {
  try {
    const { phone, email, address, businessHours, whatsapp } = req.body;

    let contact = await Contact.findOne();

    // If no contact exists, create one
    if (!contact) {
      contact = new Contact();
    }

    // Update fields
    if (phone) contact.phone = phone;
    if (email) contact.email = email;
    if (address) contact.address = address;
    if (businessHours) contact.businessHours = businessHours;
    if (whatsapp) contact.whatsapp = whatsapp;

    contact.updatedAt = new Date();
    await contact.save();

    res.json({
      success: true,
      contact,
      message: 'Contact information updated successfully'
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Failed to update contact information' });
  }
});

// Get payment settings
router.get('/payment-settings', async (req, res) => {
  try {
    let paymentSettings = await PaymentSettings.findOne();

    // If no payment settings exist, create one with defaults
    if (!paymentSettings) {
      paymentSettings = new PaymentSettings({
        upiEnabled: true,
        codEnabled: true,
        codePaymentEnabled: true,
        upiName: 'Vasstra Payments',
        upiAddress: '',
        upiQrCode: '',
        paymentCodes: []
      });
      await paymentSettings.save();
    }

    res.json({
      success: true,
      paymentSettings
    });
  } catch (error) {
    console.error('Get payment settings error:', error);
    res.status(500).json({ error: 'Failed to fetch payment settings' });
  }
});

// Update payment settings
router.put('/payment-settings', async (req, res) => {
  try {
    const {
      upiEnabled,
      upiAddress,
      upiQrCode,
      upiName,
      codEnabled,
      codePaymentEnabled,
      paymentCodes,
      invoiceCompanyLogo,
      invoiceCompanyName,
      invoiceCompanyGST,
      invoiceCompanyAddress,
      invoiceCompanyCity,
      invoiceCompanyState,
      invoiceCompanyZipCode,
      invoiceCompanyCountry,
      invoiceCompanyPhone,
      invoiceCompanyEmail
    } = req.body;

    let paymentSettings = await PaymentSettings.findOne();

    // If no payment settings exist, create one
    if (!paymentSettings) {
      paymentSettings = new PaymentSettings();
    }

    // Update fields
    if (upiEnabled !== undefined) paymentSettings.upiEnabled = upiEnabled;
    if (upiAddress) paymentSettings.upiAddress = upiAddress;
    if (upiQrCode) paymentSettings.upiQrCode = upiQrCode;
    if (upiName) paymentSettings.upiName = upiName;
    if (codEnabled !== undefined) paymentSettings.codEnabled = codEnabled;
    if (codePaymentEnabled !== undefined) paymentSettings.codePaymentEnabled = codePaymentEnabled;
    if (paymentCodes) paymentSettings.paymentCodes = paymentCodes;

    // Update invoice settings
    if (invoiceCompanyLogo !== undefined) paymentSettings.invoiceCompanyLogo = invoiceCompanyLogo;
    if (invoiceCompanyName !== undefined) paymentSettings.invoiceCompanyName = invoiceCompanyName;
    if (invoiceCompanyGST !== undefined) paymentSettings.invoiceCompanyGST = invoiceCompanyGST;
    if (invoiceCompanyAddress !== undefined) paymentSettings.invoiceCompanyAddress = invoiceCompanyAddress;
    if (invoiceCompanyCity !== undefined) paymentSettings.invoiceCompanyCity = invoiceCompanyCity;
    if (invoiceCompanyState !== undefined) paymentSettings.invoiceCompanyState = invoiceCompanyState;
    if (invoiceCompanyZipCode !== undefined) paymentSettings.invoiceCompanyZipCode = invoiceCompanyZipCode;
    if (invoiceCompanyCountry !== undefined) paymentSettings.invoiceCompanyCountry = invoiceCompanyCountry;
    if (invoiceCompanyPhone !== undefined) paymentSettings.invoiceCompanyPhone = invoiceCompanyPhone;
    if (invoiceCompanyEmail !== undefined) paymentSettings.invoiceCompanyEmail = invoiceCompanyEmail;

    paymentSettings.updatedAt = new Date();
    await paymentSettings.save();

    res.json({
      success: true,
      paymentSettings,
      message: 'Payment settings updated successfully'
    });
  } catch (error) {
    console.error('Update payment settings error:', error);
    res.status(500).json({ error: 'Failed to update payment settings' });
  }
});

// Get invoice settings (public - no auth needed)
router.get('/invoice-settings/public', async (req, res) => {
  try {
    let paymentSettings = await PaymentSettings.findOne();

    if (!paymentSettings) {
      paymentSettings = new PaymentSettings();
      await paymentSettings.save();
    }

    res.json({
      success: true,
      invoiceSettings: {
        companyLogo: paymentSettings.invoiceCompanyLogo,
        companyName: paymentSettings.invoiceCompanyName,
        companyGST: paymentSettings.invoiceCompanyGST,
        companyAddress: paymentSettings.invoiceCompanyAddress,
        companyCity: paymentSettings.invoiceCompanyCity,
        companyState: paymentSettings.invoiceCompanyState,
        companyZipCode: paymentSettings.invoiceCompanyZipCode,
        companyCountry: paymentSettings.invoiceCompanyCountry,
        companyPhone: paymentSettings.invoiceCompanyPhone,
        companyEmail: paymentSettings.invoiceCompanyEmail
      }
    });
  } catch (error) {
    console.error('Get invoice settings error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice settings' });
  }
});

export default router;
