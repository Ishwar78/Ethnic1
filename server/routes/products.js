import express from 'express';
import Product from '../models/Product.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Utility function to generate slug from product name
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Get all active products (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, sortBy } = req.query;

    let query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let products = Product.find(query);

    if (sortBy === 'price-low') {
      products = products.sort({ price: 1 });
    } else if (sortBy === 'price-high') {
      products = products.sort({ price: -1 });
    } else if (sortBy === 'latest') {
      products = products.sort({ createdAt: -1 });
    } else if (sortBy === 'rating') {
      products = products.sort({ rating: -1 });
    }

    const result = await products.lean().exec();

    res.json({
      success: true,
      products: result || [],
      total: result?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching products:', error.message || error);
    res.status(500).json({
      error: 'Failed to fetch products',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all products (admin - including inactive)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const products = await Product.find().lean();

    res.json({
      success: true,
      products,
      total: products.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug.toLowerCase() }).lean();

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get single product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      image,
      images,
      sizes,
      colors,
      stock,
      rating,
      isNew,
      isBestseller,
      isSummer,
      isWinter,
    } = req.body;

    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const slug = generateSlug(name);

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({ error: 'A product with similar name already exists. Please use a different name.' });
    }

    const product = new Product({
      name,
      slug,
      description,
      price,
      originalPrice: originalPrice || price,
      category,
      image,
      images: images || [image],
      sizes: sizes || [],
      colors: colors || [],
      stock: stock || 0,
      rating: rating || 0,
      isNew: isNew || false,
      isBestseller: isBestseller || false,
      isSummer: isSummer || false,
      isWinter: isWinter || false,
      isActive: true,
    });

    await product.save();
    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      image,
      images,
      sizes,
      colors,
      stock,
      rating,
      isActive,
      isNew,
      isBestseller,
      isSummer,
      isWinter,
    } = req.body;

    // Get current product to check if name changed
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Generate new slug if name changed
    let slug = currentProduct.slug;
    if (name && name !== currentProduct.name) {
      slug = generateSlug(name);

      // Check if new slug already exists (exclude current product)
      const existingProduct = await Product.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingProduct) {
        return res.status(400).json({ error: 'A product with similar name already exists. Please use a different name.' });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug,
        description,
        price,
        originalPrice,
        category,
        image,
        images,
        sizes,
        colors,
        stock,
        rating,
        isActive,
        isNew,
        isBestseller,
        isSummer,
        isWinter,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
