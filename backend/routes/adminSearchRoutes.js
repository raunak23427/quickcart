const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /api/admin/search?q=<query>
 * 
 * Universal admin search across all entities.
 * Returns grouped results: products, users, orders, categories, inventory, support
 * Each group is limited to 5 results for performance.
 */
router.get('/', async (req, res) => {
    const { q } = req.query;

    // Return empty results for blank queries
    if (!q || q.trim().length === 0) {
        return res.json({
            products: [],
            users: [],
            orders: [],
            categories: [],
            inventory: [],
            support: []
        });
    }

    const searchTerm = `%${q.trim()}%`;

    try {
        // Run all queries in parallel for performance
        const [
            [products],
            [users],
            [orders],
            [categories],
            [inventory],
            [support]
        ] = await Promise.all([
            // 1. Products — search by name, category, or quantity
            db.query(`
                SELECT p.product_id, p.product_name, p.unit_quantity, p.price, 
                       c.category_name, i.quantity_available,
                       p.discount_percentage
                FROM products p
                LEFT JOIN inventory i ON p.product_id = i.product_id
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE p.is_active = TRUE
                  AND (p.product_name LIKE ? OR c.category_name LIKE ? OR p.unit_quantity LIKE ?)
                ORDER BY p.product_name ASC
                LIMIT 5
            `, [searchTerm, searchTerm, searchTerm]),

            // 2. Users — search by name, email, or phone
            db.query(`
                SELECT user_id, name, email, phone, role
                FROM users
                WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?
                ORDER BY name ASC
                LIMIT 5
            `, [searchTerm, searchTerm, searchTerm]),

            // 3. Orders — search by order_id or customer name
            db.query(`
                SELECT o.order_id, o.total_amount, o.order_date, o.status,
                       u.name AS customer_name, u.email AS customer_email
                FROM orders o
                JOIN users u ON o.user_id = u.user_id
                WHERE CAST(o.order_id AS CHAR) LIKE ? OR u.name LIKE ?
                ORDER BY o.order_date DESC
                LIMIT 5
            `, [searchTerm, searchTerm]),

            // 4. Categories — search by category name
            db.query(`
                SELECT c.category_id, c.category_name,
                       COUNT(p.product_id) AS product_count
                FROM categories c
                LEFT JOIN products p ON c.category_id = p.category_id AND p.is_active = TRUE
                WHERE c.category_name LIKE ?
                GROUP BY c.category_id, c.category_name
                ORDER BY c.category_name ASC
                LIMIT 5
            `, [searchTerm]),

            // 5. Inventory — low stock items matching query
            db.query(`
                SELECT p.product_id, p.product_name, i.quantity_available, 
                       i.low_stock_threshold, c.category_name
                FROM inventory i
                JOIN products p ON i.product_id = p.product_id
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE p.is_active = TRUE
                  AND i.quantity_available <= i.low_stock_threshold
                  AND (p.product_name LIKE ? OR c.category_name LIKE ?)
                ORDER BY i.quantity_available ASC
                LIMIT 5
            `, [searchTerm, searchTerm]),

            // 6. Support Tickets — search by subject, message, user name
            db.query(`
                SELECT t.ticket_id, t.subject, t.message, t.status, t.priority, t.category,
                       u.name AS user_name
                FROM support_tickets t
                JOIN users u ON t.user_id = u.user_id
                WHERE t.subject LIKE ? OR t.message LIKE ? OR u.name LIKE ?
                ORDER BY t.created_at DESC
                LIMIT 5
            `, [searchTerm, searchTerm, searchTerm])
        ]);

        res.json({
            products,
            users,
            orders,
            categories,
            inventory,
            support
        });
    } catch (error) {
        console.error('Admin search error:', error);
        res.status(500).json({ message: 'Search failed', error: error.message });
    }
});

module.exports = router;
