import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import heroMediaRoutes from './routes/heroMedia.js';
import productsRoutes from './routes/products.js';
import categoriesRoutes from './routes/categories.js';
import ticketsRoutes from './routes/tickets.js';
import couponsRoutes from './routes/coupons.js';
import sizeChartsRoutes from './routes/sizeCharts.js';
import ordersRoutes from './routes/orders.js';
import invoicesRoutes from './routes/invoices.js';
import User from './models/User.js';
import Contact from './models/Contact.js';
import HeroMedia from './models/HeroMedia.js';
import PaymentSettings from './models/PaymentSettings.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sharmaishwar970:ISHWAR123@cluster0.b73q6ph.mongodb.net/Vastra';

// Function to seed admin user if it doesn't exist
async function initializeAdminUser() {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@vasstra.com' });

    if (!existingAdmin) {
      console.log('🔄 Creating admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin@123', salt);

      const adminUser = new User({
        name: 'Vasstra Admin',
        email: 'admin@vasstra.com',
        password: hashedPassword,
        phone: '+91-9876543210',
        role: 'admin',
        isActive: true,
        address: {
          street: 'Admin Street',
          city: 'Admin City',
          state: 'Admin State',
          zipCode: '000000',
          country: 'India'
        }
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('📋 Admin Credentials: admin@vasstra.com / admin@123');
    } else {
      console.log('✅ Admin user already exists!');
    }
  } catch (error) {
    console.error('❌ Error initializing admin user:', error);
  }
}

// Function to initialize contact information if it doesn't exist
async function initializeContact() {
  try {
    const existingContact = await Contact.findOne();

    if (!existingContact) {
      console.log('🔄 Creating default contact information...');
      const contact = new Contact({
        phone: '+91 98765 43210',
        email: 'support@vasstra.com',
        address: '123 Fashion Street, Textile Hub\nMumbai, Maharashtra 400001',
        businessHours: 'Monday - Saturday: 10:00 AM - 7:00 PM\nSunday: Closed',
        whatsapp: '919876543210'
      });

      await contact.save();
      console.log('✅ Contact information initialized successfully!');
    } else {
      console.log('✅ Contact information already exists!');
    }
  } catch (error) {
    console.error('❌ Error initializing contact:', error);
  }
}

// Function to initialize default hero media
async function initializeHeroMedia() {
  try {
    const existingMedia = await HeroMedia.countDocuments();

    if (existingMedia === 0) {
      console.log('🔄 Creating default hero media...');
      const defaultMedia = [
        {
          title: 'New Arrivals',
          subtitle: 'Festive Suit Collection',
          description: 'Discover exquisite handcrafted ethnic wear for every occasion',
          mediaUrl: 'https://images.unsplash.com/photo-1610706406159-b21bd25c5e9c?w=1200&q=80',
          mediaType: 'image',
          cta: 'Shop Now',
          ctaLink: '/shop?category=new-arrivals',
          order: 0,
          isActive: true,
        },
        {
          title: 'Exclusive',
          subtitle: 'Royal Lehenga Collection',
          description: 'Timeless elegance meets contemporary design',
          mediaUrl: 'https://images.unsplash.com/photo-1610706406159-b21bd25c5e9c?w=1200&q=80',
          mediaType: 'image',
          cta: 'Explore Collection',
          ctaLink: '/shop?category=lehengas',
          order: 1,
          isActive: true,
        },
        {
          title: 'Bridal Edit',
          subtitle: 'Wedding Season Special',
          description: 'Make your special day unforgettable',
          mediaUrl: 'https://images.unsplash.com/photo-1610706406159-b21bd25c5e9c?w=1200&q=80',
          mediaType: 'image',
          cta: 'View Collection',
          ctaLink: '/shop?category=bridal',
          order: 2,
          isActive: true,
        },
      ];

      await HeroMedia.insertMany(defaultMedia);
      console.log('✅ Default hero media initialized successfully!');
    } else {
      console.log('✅ Hero media already exists!');
    }
  } catch (error) {
    console.error('❌ Error initializing hero media:', error);
  }
}

// Function to initialize payment settings if it doesn't exist
async function initializePaymentSettings() {
  try {
    const existingPaymentSettings = await PaymentSettings.findOne();

    if (!existingPaymentSettings) {
      console.log('🔄 Creating default payment settings...');
      const paymentSettings = new PaymentSettings({
        upiEnabled: true,
        upiAddress: '',
        upiQrCode: '',
        upiName: 'Vasstra Payments',
        codePaymentEnabled: true,
        paymentCodes: []
      });

      await paymentSettings.save();
      console.log('✅ Payment settings initialized successfully!');
    } else {
      console.log('✅ Payment settings already exist!');
    }
  } catch (error) {
    console.error('❌ Error initializing payment settings:', error);
  }
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected successfully!');
    await initializeAdminUser();
    await initializeContact();
    await initializeHeroMedia();
    await initializePaymentSettings();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Public endpoints (before routes that require auth)
app.get('/api/contact', async (req, res) => {
  try {
    let contact = await Contact.findOne();

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hero-media', heroMediaRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/size-charts', sizeChartsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/invoices', invoicesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API routes available at http://localhost:${PORT}/api`);
});
