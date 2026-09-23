const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET: Rating Analytics
router.get('/ratings', async (req, res) => {
    try {
        const platformAvgQuery = `SELECT AVG(rating) as avg_rating FROM product_ratings`;
        const topRatedQuery = `
            SELECT p.product_name, AVG(r.rating) as avg_rating, COUNT(r.rating_id) as total_ratings
            FROM product_ratings r
            JOIN products p ON r.product_id = p.product_id
            GROUP BY p.product_id, p.product_name
            HAVING total_ratings > 0
            ORDER BY avg_rating DESC, total_ratings DESC
            LIMIT 5
        `;
        const lowRatedQuery = `
            SELECT p.product_name, AVG(r.rating) as avg_rating, COUNT(r.rating_id) as total_ratings
            FROM product_ratings r
            JOIN products p ON r.product_id = p.product_id
            GROUP BY p.product_id, p.product_name
            HAVING total_ratings > 0
            ORDER BY avg_rating ASC, total_ratings DESC
            LIMIT 5
        `;
        const mostReviewedQuery = `
            SELECT p.product_name, AVG(r.rating) as avg_rating, COUNT(r.rating_id) as total_ratings
            FROM product_ratings r
            JOIN products p ON r.product_id = p.product_id
            GROUP BY p.product_id, p.product_name
            HAVING total_ratings > 0
            ORDER BY total_ratings DESC
            LIMIT 1
        `;

        const [[platformAvg]] = await db.query(platformAvgQuery);
        const [topRated] = await db.query(topRatedQuery);
        const [lowRated] = await db.query(lowRatedQuery);
        const [[mostReviewed]] = await db.query(mostReviewedQuery);

        res.json({
            platformAvg: platformAvg?.avg_rating || 0,
            topRated,
            lowRated,
            mostReviewed
        });
    } catch (error) {
        console.error('Error fetching rating analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET: Top Selling Products
router.get('/top-products', async (req, res) => {
    try {
        const query = `
            SELECT p.product_name, SUM(oi.quantity) AS total_sold
            FROM order_item oi
            JOIN products p ON oi.product_id = p.product_id
            GROUP BY p.product_name
            ORDER BY total_sold DESC
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET: Category Sales Rollups
router.get('/category-rollups', async (req, res) => {
    try {
        // Calculate gross sales distributed by category
        const query = `
            SELECT c.category_name, SUM(oi.price_at_purchase * oi.quantity) AS category_revenue
            FROM order_item oi
            JOIN products p ON oi.product_id = p.product_id
            JOIN categories c ON p.category_id = c.category_id
            GROUP BY c.category_name
            ORDER BY category_revenue DESC
        `;
        const [results] = await db.query(query);

        // Fetch total gross to compute percentages
        const totalGross = results.reduce((sum, row) => sum + Number(row.category_revenue), 0);
        
        const rollups = results.map(row => ({
            category_name: row.category_name,
            revenue: Number(row.category_revenue),
            percentage: totalGross > 0 ? ((Number(row.category_revenue) / totalGross) * 100).toFixed(1) : 0
        }));

        res.json({ rollups, totalGross });
    } catch (error) {
        console.error('Error fetching category rollups:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET: Revenue Summary
router.get('/revenue-summary', async (req, res) => {
    try {
        const query = `
            SELECT SUM(amount) AS total_revenue
            FROM payments
            WHERE status = 'success'
        `;
        const [results] = await db.query(query);
        res.json({ totalRevenue: results[0].total_revenue || 0 });
    } catch (error) {
        console.error('Error fetching revenue:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET: Total Orders Count
router.get('/orders-count', async (req, res) => {
    try {
        const query = `SELECT COUNT(*) AS total_orders FROM orders`;
        const [results] = await db.query(query);
        res.json({ totalOrders: results[0].total_orders || 0 });
    } catch (error) {
        console.error('Error fetching orders count:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET: Low Stock Products
router.get('/low-stock', async (req, res) => {
    try {
        const query = `
            SELECT p.product_id, p.product_name, i.quantity_available
            FROM inventory i
            JOIN products p ON p.product_id = i.product_id
            WHERE i.quantity_available <= i.low_stock_threshold
            ORDER BY i.quantity_available ASC
        `;
        const [results] = await db.query(query);
        res.json(results);
    } catch (error) {
        console.error('Error fetching low stock:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;