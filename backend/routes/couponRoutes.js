const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET: Validate a coupon
router.get('/:code', async (req, res) => {
    const { code } = req.params;
    const { amount } = req.query; // Total cart amount to check min_cart_amount

    try {
        const [coupons] = await db.query('SELECT * FROM coupons WHERE code = ?', [code]);

        if (coupons.length === 0) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        const coupon = coupons[0];

        // Check minimum amount requirement
        if (amount && Number(amount) < Number(coupon.min_cart_amount)) {
            return res.status(400).json({ 
                message: `This coupon requires a minimum purchase of ₹${coupon.min_cart_amount}` 
            });
        }

        res.json({
            message: 'Coupon applied!',
            discount_percent: coupon.discount_percent
        });
    } catch (error) {
        console.error('Coupon error:', error);
        res.status(500).json({ message: 'Server error validating coupon' });
    }
});

module.exports = router;
