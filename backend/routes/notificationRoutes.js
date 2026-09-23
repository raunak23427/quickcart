const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET endpoint to fetch all system notifications
router.get('/', async (req, res) => {
    try {
        // Fetch alerts, newest first
        const [notifications] = await db.query('SELECT * FROM notifications ORDER BY created_at DESC');
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
});

module.exports = router;