-- ================================================================
--  QuickCart — Task-6: Database Transactions
--  Ready-to-Execute SQL for MySQL Workbench
--  Database: quickcart | Server: MySQL 8.0
-- ================================================================

USE quickcart;

-- ╔══════════════════════════════════════════════════════════════╗
-- ║  TRANSACTION 1: PLACE ORDER (Multi-Step Atomic Commit)      ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ── BEFORE ──────────────────────────────────────────────────────
SELECT '── BEFORE TRANSACTION 1 ──' AS step;

SELECT p.product_name, i.quantity_available, i.low_stock_threshold
FROM inventory i
JOIN products p ON i.product_id = p.product_id
WHERE i.product_id IN (103, 301);

SELECT MAX(order_id) AS last_order_id FROM orders;

-- ── EXECUTE ─────────────────────────────────────────────────────
START TRANSACTION;

INSERT INTO orders (user_id, order_date, total_amount, status)
VALUES (1, NOW(), 180.00, 'Placed');

SET @new_order_id = LAST_INSERT_ID();
SELECT @new_order_id AS new_order_id;

INSERT INTO order_item (order_id, product_id, quantity, price_at_purchase)
VALUES (@new_order_id, 103, 2, 75.00);

INSERT INTO order_item (order_id, product_id, quantity, price_at_purchase)
VALUES (@new_order_id, 301, 1, 30.00);

DELETE FROM cart_item WHERE cart_id = 1
  AND product_id IN (103, 301);

INSERT INTO payments (order_id, amount, status)
VALUES (@new_order_id, 180.00, 'success');

COMMIT;

-- ── AFTER ───────────────────────────────────────────────────────
SELECT '── AFTER TRANSACTION 1 ──' AS step;

SELECT order_id, user_id, total_amount, status, order_date
FROM orders WHERE order_id = @new_order_id;

SELECT oi.order_item_id, oi.product_id, p.product_name, oi.quantity, oi.price_at_purchase
FROM order_item oi
JOIN products p ON oi.product_id = p.product_id
WHERE oi.order_id = @new_order_id;

SELECT p.product_name, i.quantity_available, i.low_stock_threshold
FROM inventory i
JOIN products p ON i.product_id = p.product_id
WHERE i.product_id IN (103, 301);

SELECT * FROM payments WHERE order_id = @new_order_id;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  TRANSACTION 2: PAYMENT PROCESSING                          ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ── SETUP (Create Payment Pending Case) ─────────────────────────
SELECT '── SETUP: Creating Payment Pending Case ──' AS step;

UPDATE orders 
SET status = 'Placed'
WHERE order_id = 5005;

DELETE FROM payments 
WHERE order_id = 5005;

INSERT INTO payments (order_id, amount, status)
SELECT order_id, total_amount, 'pending'
FROM orders
WHERE order_id = 5005;


-- ── BEFORE ──────────────────────────────────────────────────────
SELECT '── BEFORE TRANSACTION 2 ──' AS step;

SELECT o.order_id, o.total_amount, o.status AS order_status,
       p.payment_id, p.status AS payment_status
FROM orders o
LEFT JOIN payments p ON o.order_id = p.order_id
WHERE o.order_id = 5005;


-- ── EXECUTE ─────────────────────────────────────────────────────
START TRANSACTION;

UPDATE payments 
SET status = 'success' 
WHERE order_id = 5005;

UPDATE orders 
SET status = 'paid' 
WHERE order_id = 5005;

COMMIT;


-- ── AFTER ───────────────────────────────────────────────────────
SELECT '── AFTER TRANSACTION 2 ──' AS step;

SELECT o.order_id, o.total_amount, o.status AS order_status,
       p.payment_id, p.status AS payment_status
FROM orders o
LEFT JOIN payments p ON o.order_id = p.order_id
WHERE o.order_id = 5005;

-- ╔══════════════════════════════════════════════════════════════╗
-- ║  TRANSACTION 3: CONFLICTING TRANSACTIONS (TWO SESSIONS)     ║
-- ║  ⚠️  Requires TWO separate MySQL Workbench Query Tabs       ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ── CHECK INITIAL STATE (run in either session) ─────────────────
SELECT p.product_name, i.quantity_available
FROM inventory i
JOIN products p ON i.product_id = p.product_id
WHERE i.product_id = 101;

-- ────────────────────────────────────────────────────────────────
-- SESSION 1 (Tab 1): Run these lines FIRST
-- ────────────────────────────────────────────────────────────────
START TRANSACTION;

SELECT quantity_available
FROM inventory
WHERE product_id = 101
FOR UPDATE;
-- Result: returns current stock (e.g., 4)
-- ✅ Lock acquired. DO NOT type anything else yet. Go to Session 2.

-- ────────────────────────────────────────────────────────────────
-- SESSION 2 (Tab 2): Run these lines WHILE Session 1 is waiting
-- ────────────────────────────────────────────────────────────────
START TRANSACTION;

SELECT quantity_available
FROM inventory
WHERE product_id = 101
FOR UPDATE;
-- ⏳ This will HANG / WAIT because Session 1 holds the lock.
-- Go back to Session 1 and run the next block.

-- ────────────────────────────────────────────────────────────────
-- SESSION 1 (Tab 1): Complete order and COMMIT (releases lock)
-- ────────────────────────────────────────────────────────────────
INSERT INTO orders (user_id, order_date, total_amount, status)
VALUES (6, NOW(), 165.00, 'Placed');

SET @order_a = LAST_INSERT_ID();

INSERT INTO order_item (order_id, product_id, quantity, price_at_purchase)
VALUES (@order_a, 101, 3, 55.00);
-- Trigger deducts stock: 4 → 1

COMMIT;
-- ✅ Session 1 done. Session 2 is now unblocked.

-- ────────────────────────────────────────────────────────────────
-- SESSION 2 (Tab 2): Now unblocked — sees stock = 1
-- ────────────────────────────────────────────────────────────────
-- The SELECT FOR UPDATE now returns: quantity_available = 1

INSERT INTO orders (user_id, order_date, total_amount, status)
VALUES (1, NOW(), 165.00, 'Placed');

SET @order_b = LAST_INSERT_ID();

INSERT INTO order_item (order_id, product_id, quantity, price_at_purchase)
VALUES (@order_b, 101, 3, 55.00);
-- ❌ ERROR 1644 (45000): Insufficient stock
-- The BEFORE INSERT trigger blocks this because 3 > 1

ROLLBACK;

-- ── VERIFY FINAL STATE ──────────────────────────────────────────
SELECT p.product_name, i.quantity_available
FROM inventory i
JOIN products p ON i.product_id = p.product_id
WHERE i.product_id = 101;
-- Result: Milk 1L | 1 (only User A's order went through)


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  TRANSACTION 4: ROLLBACK DEMONSTRATION                      ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ── BEFORE ──────────────────────────────────────────────────────
SELECT '── BEFORE TRANSACTION 4 (ROLLBACK) ──' AS step;

SELECT p.product_name, i.quantity_available
FROM inventory i
JOIN products p ON i.product_id = p.product_id
WHERE i.product_id IN (201, 402);

SELECT COUNT(*) AS total_orders_before FROM orders;

-- ── EXECUTE (with simulated failure) ────────────────────────────
START TRANSACTION;

INSERT INTO orders (user_id, order_date, total_amount, status)
VALUES (2, NOW(), 205.00, 'Placed');

SET @failed_order_id = LAST_INSERT_ID();

INSERT INTO order_item (order_id, product_id, quantity, price_at_purchase)
VALUES (@failed_order_id, 201, 1, 45.00);
-- Trigger fires and reduces stock temporarily (within this transaction)

-- Simulating a failure — we ROLLBACK
SELECT 'ERROR: Network timeout — rolling back!' AS error_message;

ROLLBACK;

-- ── AFTER ROLLBACK ──────────────────────────────────────────────
SELECT '── AFTER ROLLBACK (Transaction 4) ──' AS step;

SELECT p.product_name, i.quantity_available
FROM inventory i
JOIN products p ON i.product_id = p.product_id
WHERE i.product_id IN (201, 402);
-- ✅ Unchanged: Coca Cola = 6, Toothpaste = 87

SELECT COUNT(*) AS total_orders_after FROM orders;
-- ✅ Same count as before

SELECT * FROM orders WHERE order_id = @failed_order_id;
-- ✅ Empty result set — order was rolled back


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  TRANSACTION 5: TRIGGER CHAIN (Low Stock Notification)      ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ── BEFORE ──────────────────────────────────────────────────────
SELECT '── BEFORE TRANSACTION 5 (TRIGGER) ──' AS step;

SELECT p.product_name, i.quantity_available, i.low_stock_threshold
FROM inventory i
JOIN products p ON i.product_id = p.product_id
WHERE i.product_id = 201;

SELECT COUNT(*) AS notification_count_before FROM notifications;

-- ── EXECUTE ─────────────────────────────────────────────────────
START TRANSACTION;

INSERT INTO orders (user_id, order_date, total_amount, status)
VALUES (3, NOW(), 90.00, 'Placed');

SET @trigger_order_id = LAST_INSERT_ID();

-- This INSERT fires the trigger chain:
-- 1. prevent_insufficient_stock (BEFORE INSERT) → validates
-- 2. Row inserted into order_item
-- 3. update_inventory_after_order (AFTER INSERT) → deducts stock
-- 4. low_stock_notification (AFTER UPDATE on inventory) → inserts notification
INSERT INTO order_item (order_id, product_id, quantity, price_at_purchase)
VALUES (@trigger_order_id, 201, 2, 45.00);

COMMIT;

-- ── AFTER ───────────────────────────────────────────────────────
SELECT '── AFTER TRANSACTION 5 ──' AS step;

SELECT p.product_name, i.quantity_available, i.low_stock_threshold
FROM inventory i
JOIN products p ON i.product_id = p.product_id
WHERE i.product_id = 201;
-- ✅ Stock: 6 → 4

SELECT COUNT(*) AS notification_count_after FROM notifications;

-- Show the latest notifications (including the trigger-generated one)
SELECT notification_id, user_id, message, created_at
FROM notifications
ORDER BY notification_id DESC
LIMIT 5;


-- ================================================================
--  END OF TASK-6 TRANSACTION QUERIES
-- ================================================================
