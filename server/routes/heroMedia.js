import express from 'express';
import HeroMedia from '../models/HeroMedia.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all hero media
router.get('/', async (req, res) => {
  try {
    const media = await HeroMedia.find({ isActive: true }).sort({ order: 1 });
    res.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error('Error fetching hero media:', error);
    res.status(500).json({ error: 'Failed to fetch hero media' });
  }
});

// Get all hero media (admin - including inactive)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const media = await HeroMedia.find().sort({ order: 1 });
    res.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error('Error fetching hero media:', error);
    res.status(500).json({ error: 'Failed to fetch hero media' });
  }
});

// Create hero media
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, subtitle, description, mediaUrl, mediaType, cta, ctaLink, order } = req.body;

    if (!title || !subtitle || !description || !mediaUrl || !mediaType || !ctaLink) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const media = new HeroMedia({
      title,
      subtitle,
      description,
      mediaUrl,
      mediaType,
      cta: cta || 'Shop Now',
      ctaLink,
      order: order || 0,
    });

    await media.save();
    res.status(201).json({
      success: true,
      media,
    });
  } catch (error) {
    console.error('Error creating hero media:', error);
    res.status(500).json({ error: 'Failed to create hero media' });
  }
});

// Update hero media
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, subtitle, description, mediaUrl, mediaType, cta, ctaLink, order, isActive } = req.body;

    const media = await HeroMedia.findByIdAndUpdate(
      req.params.id,
      {
        title,
        subtitle,
        description,
        mediaUrl,
        mediaType,
        cta,
        ctaLink,
        order,
        isActive,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!media) {
      return res.status(404).json({ error: 'Hero media not found' });
    }

    res.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error('Error updating hero media:', error);
    res.status(500).json({ error: 'Failed to update hero media' });
  }
});

// Delete hero media
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const media = await HeroMedia.findByIdAndDelete(req.params.id);

    if (!media) {
      return res.status(404).json({ error: 'Hero media not found' });
    }

    res.json({
      success: true,
      message: 'Hero media deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting hero media:', error);
    res.status(500).json({ error: 'Failed to delete hero media' });
  }
});

export default router;
