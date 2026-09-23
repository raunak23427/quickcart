const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper function to resolve the true cart_id based on the user_id
async function getCartId(userId) {
    try {
        const [rows] = await db.query('SELECT cart_id FROM carts WHERE user_id = ?', [userId]);
        if (rows.length > 0) return rows[0].cart_id;

        // Create a NEW cart with a unique manual ID
        const [maxRows] = await db.query('SELECT MAX(cart_id) as maxId FROM carts');
        const nextCartId = (maxRows[0].maxId || 0) + 1;

        await db.query('INSERT INTO carts (cart_id, user_id, created_at) VALUES (?, ?, NOW())', [nextCartId, userId]);
        return nextCartId;
    } catch (e) {
        console.error("Cart Resolve Error:", e);
        return userId;
    }
}

// GET: Fetch a user's cart with LIVE STOCK STATUS
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const actualCartId = await getCartId(userId);

        const query = `
            SELECT ci.cart_item_id, p.product_id, p.product_name, p.unit_quantity, p.price, 
                   p.discount_percentage, p.sale_start, p.sale_end,
                   CASE 
                       WHEN p.discount_percentage > 0 
                            AND (p.sale_start IS NULL OR p.sale_start <= NOW()) 
                            AND (p.sale_end IS NULL OR p.sale_end >= NOW())
                       THEN p.price * (1 - p.discount_percentage/100)
                       ELSE p.price
                   END AS final_price,
                   ci.quantity, i.quantity_available,
                   CASE 
                       WHEN i.quantity_available <= 0 THEN 'out_of_stock'
                       WHEN i.quantity_available < ci.quantity THEN 'insufficient'
                       WHEN i.quantity_available <= i.low_stock_threshold THEN 'low_stock'
                       ELSE 'in_stock'
                   END AS stock_status
            FROM cart_item ci
            JOIN products p ON ci.product_id = p.product_id
            JOIN inventory i ON p.product_id = i.product_id
            WHERE ci.cart_id = ?
              AND p.is_active = TRUE
        `;
        const [cartItems] = await db.query(query, [actualCartId]);
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error while fetching cart' });
    }
});

// POST: Add an item to the cart (with stock check)
router.post('/add', async (req, res) => {
    const { cart_id: userId, product_id, quantity } = req.body;
    try {
        const actualCartId = await getCartId(userId);

        // Check current stock before adding
        const [stockCheck] = await db.query(
            'SELECT quantity_available FROM inventory WHERE product_id = ?', 
            [product_id]
        );
        if (stockCheck.length === 0) {
            return res.status(404).json({ message: 'Product not found in inventory' });
        }

        const available = stockCheck[0].quantity_available;
        
        // Check current qty already in cart
        const [existing] = await db.query(
            'SELECT cart_item_id, quantity FROM cart_item WHERE cart_id = ? AND product_id = ?', 
            [actualCartId, product_id]
        );
        
        const currentInCart = existing.length > 0 ? existing[0].quantity : 0;
        const totalAfterAdd = currentInCart + quantity;

        if (totalAfterAdd > available) {
            return res.status(400).json({ 
                message: `Only ${available} available. You already have ${currentInCart} in cart.`,
                available: available,
                inCart: currentInCart
            });
        }

        if (existing.length > 0) {
            await db.query('UPDATE cart_item SET quantity = quantity + ? WHERE cart_item_id = ?', [quantity, existing[0].cart_item_id]);
        } else {
            const [maxRows] = await db.query('SELECT MAX(cart_item_id) as maxId FROM cart_item');
            const newId = (maxRows[0].maxId || 0) + 1;
            await db.query('INSERT INTO cart_item (cart_item_id, cart_id, product_id, quantity) VALUES (?, ?, ?, ?)', [newId, actualCartId, product_id, quantity]);
        }
        res.status(201).json({ message: 'Product successfully added to cart!' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Failed to add item to cart' });
    }
});

// PUT: Update the quantity of an existing cart item (with stock check)
router.put('/update', async (req, res) => {
    const { cart_id: userId, product_id, quantity } = req.body;
    try {
        const actualCartId = await getCartId(userId);

        // Check stock before updating
        const [stockCheck] = await db.query(
            'SELECT quantity_available FROM inventory WHERE product_id = ?', 
            [product_id]
        );
        
        if (stockCheck.length > 0 && quantity > stockCheck[0].quantity_available) {
            return res.status(400).json({ 
                message: `Only ${stockCheck[0].quantity_available} available in stock.`,
                available: stockCheck[0].quantity_available
            });
        }

        await db.query('UPDATE cart_item SET quantity = ? WHERE cart_id = ? AND product_id = ?', [quantity, actualCartId, product_id]);
        res.json({ message: 'Quantity updated successfully!' });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ message: 'Failed to update quantity' });
    }
});

// DELETE: Remove an item from the cart
router.delete('/remove/:cartId/:productId', async (req, res) => {
    const { cartId: userId, productId } = req.params;
    try {
        const actualCartId = await getCartId(userId);
        const query = 'DELETE FROM cart_item WHERE cart_id = ? AND product_id = ?';
        await db.query(query, [actualCartId, productId]);
        res.json({ message: 'Item removed successfully!' });
    } catch (error) {
        console.error('Error removing item:', error);
        res.status(500).json({ message: 'Failed to remove item' });
    }
});

module.exports = router;