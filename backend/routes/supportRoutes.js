const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all tickets for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const [tickets] = await db.query(
            'SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC',
            [req.params.userId]
        );
        res.json(tickets);
    } catch (err) {
        console.error('Error fetching user tickets:', err);
        res.status(500).json({ message: 'Error fetching tickets' });
    }
});

// GET all tickets (Admin)
router.get('/admin/all', async (req, res) => {
    try {
        const [tickets] = await db.query(
            'SELECT t.*, u.name as user_name, u.email as user_email FROM support_tickets t JOIN users u ON t.user_id = u.user_id ORDER BY created_at DESC'
        );
        res.json(tickets);
    } catch (err) {
        console.error('Error fetching all tickets:', err);
        res.status(500).json({ message: 'Error fetching all tickets' });
    }
});

// POST new ticket (User)
router.post('/create', async (req, res) => {
    const { user_id, subject, message, category, priority } = req.body;
    console.log('Ticket creation request:', req.body);
    
    if (!user_id || !subject || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO support_tickets (user_id, subject, message, category, priority) VALUES (?, ?, ?, ?, ?)',
            [user_id, subject, message, category || 'other', priority || 'medium']
        );
        res.status(201).json({ message: 'Ticket submitted successfully', ticketId: result.insertId });
    } catch (err) {
        console.error('Error creating ticket:', err);
        res.status(500).json({ message: 'Error submitting ticket' });
    }
});

// PUT update ticket reply and status (Admin)
router.put('/reply/:ticketId', async (req, res) => {
    const { admin_reply, status, priority } = req.body;
    try {
        await db.query(
            'UPDATE support_tickets SET admin_reply = ?, status = ?, priority = ? WHERE ticket_id = ?',
            [admin_reply, status, priority, req.params.ticketId]
        );
        res.json({ message: 'Ticket updated successfully' });
    } catch (err) {
        console.error('Error updating ticket:', err);
        res.status(500).json({ message: 'Error updating ticket' });
    }
});

module.exports = router;
