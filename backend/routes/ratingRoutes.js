const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ADD or UPDATE a rating
router.post('/', async (req, res) => {
    try {
        const { user_id, product_id, rating, review_text } = req.body;
        
        if (!user_id || !product_id || !rating) {
            return res.status(400).json({ message: 'Missing user_id, product_id, or rating' });
        }

        // Insert or update (upsert)
        const query = `
            INSERT INTO product_ratings (user_id, product_id, rating, review_text)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            rating = VALUES(rating), 
            review_text = VALUES(review_text)
        `;
        
        await db.query(query, [user_id, product_id, rating, review_text]);
        
        res.status(200).json({ message: 'Rating saved successfully' });
    } catch (error) {
        console.error('Error saving rating:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET average rating for ALL products (optimization)
router.get('/all', async (req, res) => {
    try {
        const query = `
            SELECT product_id, AVG(rating) as avg_rating, COUNT(rating_id) as total_ratings
            FROM product_ratings
            GROUP BY product_id
        `;
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching all ratings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET ratings by product
router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const query = `
            SELECT pr.*, u.name as user_name 
            FROM product_ratings pr
            JOIN users u ON pr.user_id = u.user_id
            WHERE pr.product_id = ?
            ORDER BY pr.created_at DESC
        `;
        const [results] = await db.query(query, [productId]);
        
        // Calculate average
        const count = results.length;
        const avg = count > 0 ? results.reduce((sum, r) => sum + r.rating, 0) / count : 0;
        
        res.status(200).json({ ratings: results, avg_rating: avg, total_ratings: count });
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE a rating
router.delete('/:ratingId', async (req, res) => {
    try {
        const { ratingId } = req.params;
        await db.query('DELETE FROM product_ratings WHERE rating_id = ?', [ratingId]);
        res.status(200).json({ message: 'Rating deleted successfully' });
    } catch (error) {
        console.error('Error deleting rating:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
