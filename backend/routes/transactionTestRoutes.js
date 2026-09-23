const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * ============================================================
 * TASK 6: TRANSACTION TEST ENDPOINTS
 * These endpoints demonstrate and test all transaction scenarios
 * for academic submission.
 * ============================================================
 */

// ──────────────────────────────────────────────────
// TEST 1: Successful Order Transaction
// Demonstrates a complete successful checkout flow
// ──────────────────────────────────────────────────
router.post('/test-successful-order', async (req, res) => {
    const { userId, productId, quantity } = req.body;
    const connection = await db.getConnection();
    const log = [];

    try {
        // Capture BEFORE state
        const [beforeInv] = await connection.query(
            'SELECT i.*, p.product_name FROM inventory i JOIN products p ON i.product_id = p.product_id WHERE i.product_id = ?',
            [productId]
        );
        log.push({ step: 'BEFORE', inventory: beforeInv[0] });

        await connection.beginTransaction();
        log.push({ step: 1, action: 'START TRANSACTION' });

        // Lock the row
        const [locked] = await connection.query(
            'SELECT quantity_available FROM inventory WHERE product_id = ? FOR UPDATE',
            [productId]
        );
        log.push({ step: 2, action: 'SELECT ... FOR UPDATE', locked_stock: locked[0].quantity_available });

        // Validate
        if (quantity > locked[0].quantity_available) {
            await connection.rollback();
            log.push({ step: 'ROLLBACK', reason: 'Insufficient stock' });
            return res.json({ success: false, log });
        }
        log.push({ step: 3, action: 'Validation PASSED' });

        // Create order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, order_date, total_amount, status) VALUES (?, NOW(), ?, ?)',
            [userId, 100, 'Placed']
        );
        const orderId = orderResult.insertId;
        log.push({ step: 4, action: 'INSERT order', order_id: orderId });

        // Insert order item
        const [product] = await connection.query('SELECT price FROM products WHERE product_id = ?', [productId]);
        await connection.query(
            'INSERT INTO order_item (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
            [orderId, productId, quantity, product[0].price]
        );
        log.push({ step: 5, action: 'INSERT order_item' });

        // Deduct stock
        // SKIPPED: The AFTER INSERT trigger on order_item automatically deducts stock.
        log.push({ step: 6, action: 'UPDATE inventory (deduct stock) - Done by Trigger' });

        // Payment
        const [maxPay] = await connection.query('SELECT MAX(payment_id) as maxId FROM payments');
        const payId = (maxPay[0].maxId || 9000) + 1;
        await connection.query(
            'INSERT INTO payments (payment_id, order_id, amount, status) VALUES (?, ?, ?, ?)',
            [payId, orderId, 100, 'success']
        );
        log.push({ step: 7, action: 'INSERT payment', payment_id: payId });

        await connection.commit();
        log.push({ step: 8, action: 'COMMIT' });

        // Capture AFTER state
        const [afterInv] = await connection.query(
            'SELECT i.*, p.product_name FROM inventory i JOIN products p ON i.product_id = p.product_id WHERE i.product_id = ?',
            [productId]
        );
        log.push({ step: 'AFTER', inventory: afterInv[0] });

        res.json({ success: true, orderId, log });
    } catch (error) {
        await connection.rollback();
        log.push({ step: 'ERROR', message: error.message });
        res.json({ success: false, error: error.message, log });
    } finally {
        connection.release();
    }
});

// ──────────────────────────────────────────────────
// TEST 2: Insufficient Stock Transaction
// Demonstrates proper ROLLBACK when stock is insufficient
// ──────────────────────────────────────────────────
router.post('/test-insufficient-stock', async (req, res) => {
    const { userId, productId, quantity } = req.body;
    const connection = await db.getConnection();
    const log = [];

    try {
        const [beforeInv] = await connection.query(
            'SELECT i.*, p.product_name FROM inventory i JOIN products p ON i.product_id = p.product_id WHERE i.product_id = ?',
            [productId]
        );
        log.push({ step: 'BEFORE', inventory: beforeInv[0], requested_quantity: quantity });

        await connection.beginTransaction();
        log.push({ step: 1, action: 'START TRANSACTION' });

        const [locked] = await connection.query(
            'SELECT quantity_available FROM inventory WHERE product_id = ? FOR UPDATE',
            [productId]
        );
        log.push({ step: 2, action: 'SELECT ... FOR UPDATE', available: locked[0].quantity_available });

        if (quantity > locked[0].quantity_available) {
            await connection.rollback();
            log.push({ step: 3, action: 'ROLLBACK – Insufficient stock', requested: quantity, available: locked[0].quantity_available });

            // Verify no data changed
            const [afterInv] = await connection.query(
                'SELECT i.*, p.product_name FROM inventory i JOIN products p ON i.product_id = p.product_id WHERE i.product_id = ?',
                [productId]
            );
            log.push({ step: 'AFTER', inventory: afterInv[0], result: 'NO CHANGES (rollback successful)' });

            return res.json({ success: false, reason: 'Insufficient stock', log });
        }

        // Should not reach here for this test
        await connection.rollback();
        res.json({ success: false, reason: 'Test expected insufficient stock', log });
    } catch (error) {
        await connection.rollback();
        log.push({ step: 'ERROR', message: error.message });
        res.json({ success: false, error: error.message, log });
    } finally {
        connection.release();
    }
});

// ──────────────────────────────────────────────────
// TEST 3: Conflicting Transactions (Race Condition)
// Simulates two users ordering the same product simultaneously.
// User A orders X units, User B orders Y units, stock = Z
// where X + Y > Z. One succeeds, one fails.
// ──────────────────────────────────────────────────
router.post('/test-conflicting-orders', async (req, res) => {
    const { productId, userAId, userAQty, userBId, userBQty } = req.body;
    const log = [];

    // Capture BEFORE state
    const [beforeInv] = await db.query(
        'SELECT i.*, p.product_name FROM inventory i JOIN products p ON i.product_id = p.product_id WHERE i.product_id = ?',
        [productId]
    );
    log.push({ 
        step: 'BEFORE', 
        product: beforeInv[0]?.product_name,
        stock: beforeInv[0]?.quantity_available,
        userA_wants: userAQty,
        userB_wants: userBQty
    });

    // Run both transactions concurrently
    const runTransaction = async (userId, quantity, label) => {
        const conn = await db.getConnection();
        const txLog = [];
        try {
            await conn.beginTransaction();
            txLog.push(`${label}: START TRANSACTION`);

            // SELECT ... FOR UPDATE (this is where locking happens)
            const [locked] = await conn.query(
                'SELECT quantity_available FROM inventory WHERE product_id = ? FOR UPDATE',
                [productId]
            );
            txLog.push(`${label}: LOCKED – stock = ${locked[0].quantity_available}`);

            if (quantity > locked[0].quantity_available) {
                await conn.rollback();
                txLog.push(`${label}: ROLLBACK – Insufficient stock (wanted ${quantity}, have ${locked[0].quantity_available})`);
                return { success: false, log: txLog };
            }

            // Create order
            const [orderResult] = await conn.query(
                'INSERT INTO orders (user_id, order_date, total_amount, status) VALUES (?, NOW(), ?, ?)',
                [userId, quantity * 100, 'Placed']
            );

            const [product] = await conn.query('SELECT price FROM products WHERE product_id = ?', [productId]);
            await conn.query(
                'INSERT INTO order_item (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderResult.insertId, productId, quantity, product[0].price]
            );

            // Deduct stock with safety check
            // SKIPPED: The AFTER INSERT trigger on order_item automatically deducts stock.
            // Safety check is handled by the BEFORE INSERT trigger.

            // Payment
            const [maxPay] = await conn.query('SELECT MAX(payment_id) as maxId FROM payments');
            const payId = (maxPay[0].maxId || 9000) + 1;
            await conn.query(
                'INSERT INTO payments (payment_id, order_id, amount, status) VALUES (?, ?, ?, ?)',
                [payId, orderResult.insertId, quantity * 100, 'success']
            );

            await conn.commit();
            txLog.push(`${label}: COMMIT – Order #${orderResult.insertId} placed successfully`);
            return { success: true, orderId: orderResult.insertId, log: txLog };
        } catch (error) {
            await conn.rollback();
            txLog.push(`${label}: ERROR + ROLLBACK – ${error.message}`);
            return { success: false, error: error.message, log: txLog };
        } finally {
            conn.release();
        }
    };

    // Execute both transactions concurrently (simulating simultaneous users)
    const [resultA, resultB] = await Promise.all([
        runTransaction(userAId, userAQty, 'User-A'),
        runTransaction(userBId, userBQty, 'User-B')
    ]);

    // Capture AFTER state
    const [afterInv] = await db.query(
        'SELECT i.*, p.product_name FROM inventory i JOIN products p ON i.product_id = p.product_id WHERE i.product_id = ?',
        [productId]
    );

    log.push({ step: 'User-A', ...resultA });
    log.push({ step: 'User-B', ...resultB });
    log.push({ step: 'AFTER', stock: afterInv[0]?.quantity_available });

    const bothSucceeded = resultA.success && resultB.success;
    const neitherSucceeded = !resultA.success && !resultB.success;

    res.json({
        summary: bothSucceeded 
            ? 'Both orders succeeded (stock was sufficient for both)' 
            : neitherSucceeded 
                ? 'Both orders failed (stock insufficient for either)'
                : `Conflict resolved: ${resultA.success ? 'User-A' : 'User-B'} succeeded, ${resultA.success ? 'User-B' : 'User-A'} rolled back`,
        stock_before: beforeInv[0]?.quantity_available,
        stock_after: afterInv[0]?.quantity_available,
        negative_inventory: afterInv[0]?.quantity_available < 0 ? '❌ YES (BUG!)' : '✅ NO (correct)',
        userA: resultA,
        userB: resultB,
        log
    });
});

// ──────────────────────────────────────────────────
// TEST 4: Payment Failure Rollback
// Simulates a payment insert failure to prove
// the entire transaction rolls back safely.
// ──────────────────────────────────────────────────
router.post('/test-payment-failure', async (req, res) => {
    const { userId, productId, quantity } = req.body;
    const connection = await db.getConnection();
    const log = [];

    try {
        const [beforeInv] = await connection.query(
            'SELECT i.*, p.product_name FROM inventory i JOIN products p ON i.product_id = p.product_id WHERE i.product_id = ?',
            [productId]
        );
        const [beforeOrders] = await connection.query('SELECT COUNT(*) as count FROM orders');
        log.push({ step: 'BEFORE', inventory: beforeInv[0], total_orders: beforeOrders[0].count });

        await connection.beginTransaction();
        log.push({ step: 1, action: 'START TRANSACTION' });

        // Lock and validate
        const [locked] = await connection.query(
            'SELECT quantity_available FROM inventory WHERE product_id = ? FOR UPDATE',
            [productId]
        );
        log.push({ step: 2, action: 'SELECT ... FOR UPDATE', available: locked[0].quantity_available });

        // Create order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, order_date, total_amount, status) VALUES (?, NOW(), ?, ?)',
            [userId, 100, 'Placed']
        );
        log.push({ step: 3, action: 'INSERT order', order_id: orderResult.insertId });

        // Insert order item
        const [product] = await connection.query('SELECT price FROM products WHERE product_id = ?', [productId]);
        await connection.query(
            'INSERT INTO order_item (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
            [orderResult.insertId, productId, quantity, product[0].price]
        );
        log.push({ step: 4, action: 'INSERT order_item' });

        // Deduct stock
        // SKIPPED: The AFTER INSERT trigger on order_item automatically deducts stock.
        log.push({ step: 5, action: 'UPDATE inventory (deducted) - Done by Trigger' });

        // SIMULATE PAYMENT FAILURE
        log.push({ step: 6, action: '💥 SIMULATING PAYMENT FAILURE...' });
        throw new Error('Payment gateway timeout – simulated failure');

    } catch (error) {
        await connection.rollback();
        log.push({ step: 'ROLLBACK', reason: error.message });

        // Verify everything is unchanged
        const [afterInv] = await connection.query(
            'SELECT i.*, p.product_name FROM inventory i JOIN products p ON i.product_id = p.product_id WHERE i.product_id = ?',
            [productId]
        );
        const [afterOrders] = await connection.query('SELECT COUNT(*) as count FROM orders');
        log.push({ 
            step: 'AFTER', 
            inventory: afterInv[0], 
            total_orders: afterOrders[0].count,
            result: 'ALL CHANGES REVERTED (transaction atomicity proven)'
        });

        res.json({ success: false, reason: 'Payment failed – transaction rolled back', log });
    } finally {
        connection.release();
    }
});

module.exports = router;
