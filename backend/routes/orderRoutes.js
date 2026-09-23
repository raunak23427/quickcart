const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * ============================================================
 * TASK 6: TRANSACTIONAL CHECKOUT WITH ROW LOCKING
 * ============================================================
 * 
 * Transaction Steps:
 * 1. START TRANSACTION
 * 2. Lock inventory rows with SELECT ... FOR UPDATE
 * 3. Validate stock availability (fail-fast if insufficient)
 * 4. INSERT order
 * 5. INSERT order_items
 * 6. UPDATE inventory (deduct stock)
 * 7. INSERT payment record
 * 8. Generate low-stock notifications
 * 9. Clear cart
 * 10. COMMIT
 * 
 * On ANY failure → ROLLBACK (no partial updates)
 * 
 * Concurrency safety:
 * - SELECT ... FOR UPDATE acquires exclusive row locks on inventory
 * - If User A locks Milk (stock=5), User B's query WAITS
 * - User A commits (stock→0), then User B's lock is released
 * - User B sees stock=0, gets "Insufficient stock" error
 * - Result: no negative inventory, no race conditions
 * ============================================================
 */
router.post('/checkout', async (req, res) => {
    const { userId, cartId: frontendCartId, totalAmount, paymentMethod, transactionId } = req.body;
    const connection = await db.getConnection();

    // Transaction logging for academic demonstration
    const txLog = [];
    const log = (step, detail) => {
        const entry = `[TX-${Date.now()}] Step ${step}: ${detail}`;
        txLog.push(entry);
        console.log(entry);
    };

    try {
        // ──────────────────────────────────────────────────
        // STEP 1: START TRANSACTION
        // ──────────────────────────────────────────────────
        await connection.beginTransaction();
        log(1, 'START TRANSACTION');

        // Resolve the actual cart ID from user ID
        let actualCartId = frontendCartId;
        const [cartRows] = await connection.query('SELECT cart_id FROM carts WHERE user_id = ?', [userId]);
        if (cartRows.length > 0) {
            actualCartId = cartRows[0].cart_id;
        }
        log(2, `Resolved cart_id=${actualCartId} for user_id=${userId}`);

        // ──────────────────────────────────────────────────
        // STEP 3: LOCK INVENTORY ROWS (SELECT ... FOR UPDATE)
        // This is the critical concurrency-safety mechanism.
        // It acquires EXCLUSIVE row-level locks on the inventory
        // rows for all products in this cart. Any other transaction
        // trying to read these same rows FOR UPDATE will WAIT
        // until this transaction commits or rolls back.
        // ──────────────────────────────────────────────────
        const [cartItems] = await connection.query(`
            SELECT ci.product_id, ci.quantity AS requested_qty, 
                   p.product_name, p.unit_quantity, p.price, p.discount_percentage, p.sale_start, p.sale_end,
                   CASE 
                       WHEN p.discount_percentage > 0 
                            AND (p.sale_start IS NULL OR p.sale_start <= NOW()) 
                            AND (p.sale_end IS NULL OR p.sale_end >= NOW())
                       THEN p.price * (1 - p.discount_percentage/100)
                       ELSE p.price
                   END AS final_price,
                   i.quantity_available
            FROM cart_item ci
            JOIN products p ON ci.product_id = p.product_id
            JOIN inventory i ON p.product_id = i.product_id
            WHERE ci.cart_id = ?
              AND p.is_active = TRUE
            FOR UPDATE
        `, [actualCartId]);
        log(3, `Locked ${cartItems.length} inventory rows with SELECT ... FOR UPDATE`);

        // Check if cart is empty
        if (cartItems.length === 0) {
            await connection.rollback();
            log('ROLLBACK', 'Cart is empty');
            return res.status(400).json({ message: 'Your cart is empty.' });
        }

        // ──────────────────────────────────────────────────
        // STEP 4: VALIDATE STOCK AVAILABILITY
        // After locking, we have the TRUE current stock.
        // No other transaction can modify it while we hold the lock.
        // ──────────────────────────────────────────────────
        const outOfStockItems = cartItems.filter(item => item.requested_qty > item.quantity_available);
        if (outOfStockItems.length > 0) {
            const itemNames = outOfStockItems.map(i => 
                `${i.product_name} (Requested: ${i.requested_qty}, Available: ${i.quantity_available})`
            ).join(', ');
            
            await connection.rollback();
            log('ROLLBACK', `Insufficient stock: ${itemNames}`);
            return res.status(400).json({ 
                message: `Insufficient stock for: ${itemNames}`,
                outOfStockItems: outOfStockItems.map(i => ({
                    product_id: i.product_id,
                    product_name: i.product_name,
                    requested: i.requested_qty,
                    available: i.quantity_available
                }))
            });
        }
        log(4, 'Stock validation PASSED – all items available');

        // ──────────────────────────────────────────────────
        // STEP 5: INSERT ORDER
        // ──────────────────────────────────────────────────
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, order_date, total_amount, status) VALUES (?, NOW(), ?, ?)',
            [userId, totalAmount, 'Placed']
        );
        const orderId = orderResult.insertId;
        log(5, `Order #${orderId} created (total: ₹${totalAmount})`);

        // ──────────────────────────────────────────────────
        // STEP 6: INSERT ORDER ITEMS
        // We insert each item individually so the existing
        // BEFORE INSERT trigger (prevent_insufficient_stock)
        // can validate each one. The trigger provides a
        // second layer of DB-level safety.
        // ──────────────────────────────────────────────────
        for (const item of cartItems) {
            await connection.query(
                'INSERT INTO order_item (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.requested_qty, item.final_price]
            );
        }
        log(6, `Inserted ${cartItems.length} order items`);

        // ──────────────────────────────────────────────────
        // STEP 7: UPDATE INVENTORY (deduct stock)
        // SKIPPED: The database already has an AFTER INSERT trigger 
        // ('update_inventory_after_order') on the 'order_item' table
        // which automatically deducts the stock.
        // ──────────────────────────────────────────────────
        log(7, 'Inventory deducted automatically by AFTER INSERT trigger');

        // ──────────────────────────────────────────────────
        // STEP 8: INSERT PAYMENT RECORD
        // Payment is part of the same atomic transaction.
        // If payment insert fails → everything rolls back.
        // ──────────────────────────────────────────────────
        const [maxPay] = await connection.query('SELECT MAX(payment_id) as maxId FROM payments');
        const nextPaymentId = (maxPay[0].maxId || 9000) + 1;
        
        await connection.query(
            'INSERT INTO payments (payment_id, order_id, amount, status) VALUES (?, ?, ?, ?)',
            [nextPaymentId, orderId, totalAmount, 'success']
        );
        log(8, `Payment #${nextPaymentId} recorded (₹${totalAmount})`);

        // ──────────────────────────────────────────────────
        // STEP 9: LOW-STOCK NOTIFICATIONS
        // ──────────────────────────────────────────────────
        const [lowStockItems] = await connection.query(`
            SELECT p.product_name, i.quantity_available 
            FROM inventory i 
            JOIN products p ON i.product_id = p.product_id
            WHERE i.product_id IN (?) AND i.quantity_available <= i.low_stock_threshold
        `, [cartItems.map(i => i.product_id)]);

        for (const item of lowStockItems) {
            await connection.query(
                'INSERT INTO notifications (message) VALUES (?)',
                [`⚠️ Low stock alert for ${item.product_name}! Only ${item.quantity_available} left.`]
            );
        }
        log(9, `Generated ${lowStockItems.length} low-stock notifications`);

        // ──────────────────────────────────────────────────
        // STEP 10: CLEAR CART & COMMIT
        // ──────────────────────────────────────────────────
        await connection.query('DELETE FROM cart_item WHERE cart_id = ?', [actualCartId]);
        log(10, 'Cart cleared');

        await connection.commit();
        log('COMMIT', `Transaction SUCCESS – Order #${orderId}`);

        res.status(201).json({ 
            message: 'Order placed successfully!', 
            orderId: orderId,
            transactionLog: txLog
        });

    } catch (error) {
        await connection.rollback();
        log('ROLLBACK', `Transaction FAILED – ${error.message}`);
        console.error('Checkout error:', error);
        
        // Handle the trigger's SIGNAL SQLSTATE '45000' error
        if (error.message && error.message.includes('Insufficient stock')) {
            return res.status(400).json({ message: 'Insufficient stock – another order was placed first.' });
        }
        
        res.status(500).json({ message: 'Failed to process checkout', error: error.message });
    } finally {
        connection.release();
    }
});

// ============================================================
// EXISTING ROUTES (preserved exactly)
// ============================================================

// GET: Fetch the bill using the 'order_bill' SQL View
router.get('/bill/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const query = 'SELECT * FROM order_bill WHERE order_id = ?';
        const [billDetails] = await db.query(query, [orderId]);

        if (billDetails.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(billDetails);
    } catch (error) {
        console.error('Error fetching bill:', error);
        res.status(500).json({ message: 'Server error while fetching bill' });
    }
});

// GET: Fetch all orders for the Admin Dashboard
router.get('/all', async (req, res) => {
    try {
        const { start, end } = req.query;
        let query = `
            SELECT o.order_id, o.total_amount, o.order_date, u.name AS customer_name, u.email
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
        `;
        const params = [];

        if (start && end) {
            query += ` WHERE DATE(o.order_date) BETWEEN ? AND ?`;
            params.push(start, end);
        }

        query += ` ORDER BY o.order_date DESC;`;
        
        const [orders] = await db.query(query, params);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ message: 'Server error while fetching orders' });
    }
});

// GET: Fetch a specific user's order history for their Profile page
router.get('/history/:userId', async (req, res) => {
    try {
        const query = `
            SELECT order_id, total_amount, order_date
            FROM orders
            WHERE user_id = ?
            ORDER BY order_date DESC;
        `;
        const [orders] = await db.query(query, [req.params.userId]);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).json({ message: 'Server error while fetching history' });
    }
});

// GET: Fetch a specific order's details (for PaymentSuccess page)
router.get('/order/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        
        // Get order info
        const [orderRows] = await db.query(
            'SELECT order_id, user_id, total_amount, order_date, status FROM orders WHERE order_id = ?',
            [orderId]
        );
        if (orderRows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Get order items
        const [items] = await db.query(`
            SELECT oi.product_id, p.product_name, p.unit_quantity, oi.quantity, oi.price_at_purchase AS price
            FROM order_item oi
            JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
        `, [orderId]);

        res.json({
            ...orderRows[0],
            items
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Server error while fetching order details' });
    }
});

module.exports = router;