const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. GET endpoint to fetch a user's wishlist
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        // Join the wishlist and products tables so we can show the product details
        const query = `
            SELECT w.wishlist_id, p.product_id, p.product_name, p.price 
            FROM wishlist w
            JOIN products p ON w.product_id = p.product_id
            WHERE w.user_id = ?
        `;
        const [wishlistItems] = await db.query(query, [userId]);
        res.json(wishlistItems);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Server error while fetching wishlist' });
    }
});

// 2. POST endpoint to add a product to the wishlist
router.post('/add', async (req, res) => {
    const { userId, productId } = req.body;
    try {
        // We use INSERT IGNORE. If the UNIQUE constraint blocks it (because the item
        // is already in the wishlist), MySQL just ignores the error and moves on!
        const query = 'INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)';
        await db.query(query, [userId, productId]);
        res.status(201).json({ message: 'Added to wishlist!' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Failed to add to wishlist' });
    }
});

// 3. DELETE endpoint to remove a product from the wishlist
router.delete('/remove/:userId/:productId', async (req, res) => {
    const { userId, productId } = req.params;
    try {
        const query = 'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?';
        await db.query(query, [userId, productId]);
        res.json({ message: 'Removed from wishlist!' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Failed to remove from wishlist' });
    }
});

module.exports = router;