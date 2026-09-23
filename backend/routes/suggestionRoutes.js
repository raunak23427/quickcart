const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST: Submit a product suggestion (customer-facing)
router.post('/', async (req, res) => {
    const { user_id, product_name, category, description } = req.body;
    try {
        if (!product_name || !user_id) {
            return res.status(400).json({ message: 'Product name and user ID are required.' });
        }

        await db.query(
            'INSERT INTO product_suggestions (user_id, product_name, category, description) VALUES (?, ?, ?, ?)',
            [user_id, product_name, category || 'General', description || '']
        );

        res.status(201).json({ message: 'Thank you! Your product suggestion has been submitted.' });
    } catch (error) {
        console.error('Error submitting suggestion:', error);
        res.status(500).json({ message: 'Failed to submit suggestion' });
    }
});

// GET: Fetch all suggestions (admin-facing)
router.get('/', async (req, res) => {
    try {
        const [suggestions] = await db.query(`
            SELECT ps.*, u.name AS user_name, u.email AS user_email
            FROM product_suggestions ps
            JOIN users u ON ps.user_id = u.user_id
            ORDER BY ps.created_at DESC
        `);
        res.json(suggestions);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ message: 'Server error fetching suggestions' });
    }
});

// PUT: Update suggestion status (admin action: approve/reject)
router.put('/:id', async (req, res) => {
    const { status, admin_note } = req.body;
    const { id } = req.params;
    try {
        await db.query(
            'UPDATE product_suggestions SET status = ?, admin_note = ?, reviewed_at = NOW() WHERE suggestion_id = ?',
            [status, admin_note || '', id]
        );
        res.json({ message: `Suggestion ${status}` });
    } catch (error) {
        console.error('Error updating suggestion:', error);
        res.status(500).json({ message: 'Failed to update suggestion' });
    }
});

// DELETE: Remove a suggestion
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM product_suggestions WHERE suggestion_id = ?', [req.params.id]);
        res.json({ message: 'Suggestion deleted' });
    } catch (error) {
        console.error('Error deleting suggestion:', error);
        res.status(500).json({ message: 'Failed to delete suggestion' });
    }
});

module.exports = router;
