const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET endpoint to fetch all users
router.get('/', async (req, res) => {
    try {
        const [users] = await db.query('SELECT user_id, name, email, phone, role FROM users');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
});

// UPDATE user role
router.put('/:id/role', async (req, res) => {
    const { role } = req.body;
    try {
        await db.query('UPDATE users SET role = ? WHERE user_id = ?', [role, req.params.id]);
        res.json({ message: 'User role updated' });
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
});

// DELETE user (FK-safe, with self-delete prevention)
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;
    const requestingUserId = req.headers['x-user-id']; // Sent from frontend

    // Prevent admin from deleting themselves
    if (String(userId) === String(requestingUserId)) {
        return res.status(400).json({ message: 'You cannot delete your own account!' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Delete cart items for this user's cart
        await connection.query(
            'DELETE FROM cart_item WHERE cart_id IN (SELECT cart_id FROM carts WHERE user_id = ?)',
            [userId]
        );
        // 2. Delete user's cart
        await connection.query('DELETE FROM carts WHERE user_id = ?', [userId]);
        // 3. Delete wishlist entries  
        await connection.query('DELETE FROM wishlist WHERE user_id = ?', [userId]);
        // 4. Delete product ratings
        await connection.query('DELETE FROM product_ratings WHERE user_id = ?', [userId]);
        // 5. Delete the user (orders are kept for historical record)
        await connection.query('DELETE FROM users WHERE user_id = ?', [userId]);

        await connection.commit();
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        await connection.rollback();
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Delete failed. User may have existing orders.' });
    } finally {
        connection.release();
    }
});

module.exports = router;