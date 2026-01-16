import express from 'express';
import Category from '../models/Category.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all active categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentId', 'name slug')
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all categories (admin - including inactive) - MUST BE BEFORE /:id
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parentId', 'name slug')
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category (public)
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentId', 'name slug')
      .lean();

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create category (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      image,
      parentId,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const category = new Category({
      name,
      slug: slug.toLowerCase(),
      description: description || '',
      image: image || '',
      parentId: parentId || null,
      isActive: true,
    });

    await category.save();
    await category.populate('parentId', 'name slug');

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      image,
      parentId,
      isActive,
    } = req.body;

    // Check if slug is being changed and already exists
    if (slug) {
      const existingCategory = await Category.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingCategory) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug: slug ? slug.toLowerCase() : undefined,
        description,
        image,
        parentId: parentId || null,
        isActive,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate('parentId', 'name slug');

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Check if category has subcategories
    const hasSubcategories = await Category.findOne({ parentId: req.params.id });
    if (hasSubcategories) {
      return res.status(400).json({ error: 'Cannot delete category with subcategories' });
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
