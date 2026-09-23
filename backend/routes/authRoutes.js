const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// POST: Register a new user
router.post('/register', async (req, res) => {
    let { name, email, phone, password, role } = req.body;
    const userRole = role || 'customer';

    // Trim and normalize
    email = (email || '').trim().toLowerCase();
    name = (name || '').trim();
    phone = (phone || '').trim();

    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    try {
        // Check if email already exists (case-insensitive, trimmed)
        const [existingEmails] = await db.query(
            'SELECT user_id FROM users WHERE LOWER(TRIM(email)) = ?',
            [email]
        );
        if (existingEmails.length > 0) {
            return res.status(400).json({ message: 'Email already registered!' });
        }

        // Check if phone already exists (phone also has UNIQUE constraint)
        if (phone) {
            const [existingPhones] = await db.query(
                'SELECT user_id FROM users WHERE phone = ?',
                [phone]
            );
            if (existingPhones.length > 0) {
                return res.status(400).json({ message: 'Phone number already registered!' });
            }
        }

        // HASH THE PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = 'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(query, [name, email, phone, hashedPassword, userRole]);

        const userId = result.insertId;

        // Automatically create a cart for the new user
        await db.query('INSERT IGNORE INTO carts (cart_id, user_id) VALUES (?, ?)', [userId, userId]);

        res.status(201).json({ message: 'User registered successfully!', userId: userId });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            // Distinguish which field caused the conflict
            const msg = error.sqlMessage || '';
            if (msg.includes('phone')) {
                res.status(400).json({ message: 'Phone number already registered!' });
            } else if (msg.includes('email')) {
                res.status(400).json({ message: 'Email already registered!' });
            } else {
                res.status(400).json({ message: 'Account with these details already exists!' });
            }
        } else {
            res.status(500).json({ message: 'Server error during registration' });
        }
    }
});

// POST: Login an existing user
router.post('/login', async (req, res) => {
    let { email, password } = req.body;

    // Trim and normalize
    email = (email || '').trim().toLowerCase();

    try {
        const query = 'SELECT * FROM users WHERE LOWER(TRIM(email)) = ?';
        const [users] = await db.query(query, [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = users[0];

        // COMPARE HASHED PASSWORD
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Send back the user details (but hide the password!)
        res.json({
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address || ''
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// PUT: Update user profile
router.put('/update', async (req, res) => {
    const { userId, name, phone, address } = req.body;
    try {
        const query = 'UPDATE users SET name = ?, phone = ?, address = ? WHERE user_id = ?';
        await db.query(query, [name, phone, address, userId]);
        res.json({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error during profile update' });
    }
});

// POST: Forgot Password — generate reset token
router.post('/forgot-password', async (req, res) => {
    let { email } = req.body;
    email = (email || '').trim().toLowerCase();

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const [users] = await db.query('SELECT user_id FROM users WHERE LOWER(TRIM(email)) = ?', [email]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'No account found with this email' });
        }

        // Generate a secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour from now

        await db.query(
            'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE user_id = ?',
            [resetToken, expiry, users[0].user_id]
        );

        // In a real app, we'd send email. Here we return the token directly.
        res.json({
            message: 'Reset token generated. Use it to reset your password.',
            resetToken: resetToken
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST: Reset Password — validate token and set new password
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        const [users] = await db.query(
            'SELECT user_id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = ?',
            [hashedPassword, users[0].user_id]
        );

        res.json({ message: 'Password reset successfully! You can now log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;