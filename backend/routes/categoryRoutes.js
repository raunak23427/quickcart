const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET: Fetch all categories
router.get('/', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT category_id, category_name FROM categories ORDER BY category_name');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error while fetching categories' });
    }
});

// POST: Create a new category
router.post('/', async (req, res) => {
    const { category_name } = req.body;
    if (!category_name || !category_name.trim()) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    try {
        // Check if category already exists (case-insensitive)
        const [existing] = await db.query(
            'SELECT category_id FROM categories WHERE LOWER(category_name) = LOWER(?)',
            [category_name.trim()]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const [result] = await db.query('INSERT INTO categories (category_name) VALUES (?)', [category_name.trim()]);
        res.status(201).json({
            message: 'Category created successfully',
            category: { category_id: result.insertId, category_name: category_name.trim() }
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Server error while creating category' });
    }
});

module.exports = router;
