import express from 'express';
import Ticket from '../models/Ticket.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// User: Create a new ticket
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { subject, category, message, orderId } = req.body;

    if (!subject || !category || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ticket = new Ticket({
      userId: req.user._id,
      subject,
      category,
      message,
      orderId: orderId || null,
      status: 'open',
      priority: category === 'payment' || category === 'complaint' ? 'high' : 'medium'
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// User: Get their own tickets
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// User: Get a single ticket with details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user owns this ticket or is admin
    if (ticket.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// User: Add a response to their ticket
router.post('/:id/respond', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user owns this ticket
    if (ticket.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    ticket.responses.push({
      message,
      isAdmin: false,
      createdAt: new Date()
    });

    ticket.updatedAt = new Date();
    await ticket.save();

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({ error: 'Failed to add response' });
  }
});

// Admin: Get all tickets
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status = '', category = '', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const tickets = await Ticket.find(query)
      .populate('userId', 'name email phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Ticket.countDocuments(query);

    res.json({
      success: true,
      tickets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Admin: Update ticket status
router.put('/admin/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, priority } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        status: status || undefined,
        priority: priority || undefined,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Admin: Add admin response to ticket
router.post('/admin/:id/respond', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          responses: {
            message,
            isAdmin: true,
            createdAt: new Date()
          }
        },
        status: 'in-progress',
        updatedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({ error: 'Failed to add response' });
  }
});

export default router;
