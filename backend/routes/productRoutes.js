const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import our database connection

// GET: Fetch all products (NOW INCLUDES INVENTORY + SALE DATA!)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT p.product_id, p.product_name, p.unit_quantity, p.price, p.image_url, i.quantity_available, c.category_name,
                   p.discount_percentage, p.sale_start, p.sale_end,
                   COALESCE(AVG(pr.rating), 0) AS avg_rating,
                   COUNT(pr.rating_id) AS total_ratings
            FROM products p
            LEFT JOIN inventory i ON p.product_id = i.product_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN product_ratings pr ON p.product_id = pr.product_id
            WHERE p.is_active = TRUE
            GROUP BY p.product_id, p.product_name, p.unit_quantity, p.price, p.image_url, i.quantity_available, c.category_name,
                     p.discount_percentage, p.sale_start, p.sale_end
        `;
        const [products] = await db.query(query);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error while fetching products' });
    }
});

// GET: Fetch products currently on sale
router.get('/on-sale', async (req, res) => {
    try {
        const query = `
            SELECT p.product_id, p.product_name, p.unit_quantity, p.price, p.image_url, i.quantity_available, c.category_name,
                   p.discount_percentage, p.sale_start, p.sale_end,
                   COALESCE(AVG(pr.rating), 0) AS avg_rating,
                   COUNT(pr.rating_id) AS total_ratings
            FROM products p
            LEFT JOIN inventory i ON p.product_id = i.product_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN product_ratings pr ON p.product_id = pr.product_id
            WHERE p.discount_percentage > 0
              AND p.is_active = TRUE
              AND (p.sale_start IS NULL OR p.sale_start <= NOW())
              AND (p.sale_end IS NULL OR p.sale_end >= NOW())
            GROUP BY p.product_id, p.product_name, p.unit_quantity, p.price, p.image_url, i.quantity_available, c.category_name,
                     p.discount_percentage, p.sale_start, p.sale_end
            ORDER BY p.discount_percentage DESC
        `;
        const [products] = await db.query(query);
        res.json(products);
    } catch (error) {
        console.error('Error fetching sale products:', error);
        res.status(500).json({ message: 'Server error while fetching sale products' });
    }
});

// GET: Fetch trending products (Last 7 days)
router.get('/trending', async (req, res) => {
    try {
        const query = `
            SELECT p.product_id, p.product_name, p.unit_quantity, p.price, p.image_url, i.quantity_available, c.category_name,
                   p.discount_percentage, p.sale_start, p.sale_end,
                   SUM(oi.quantity) AS units_sold_7d,
                   COALESCE(AVG(pr.rating), 0) AS avg_rating,
                   COUNT(pr.rating_id) AS total_ratings
            FROM order_item oi
            JOIN orders o ON oi.order_id = o.order_id
            JOIN products p ON oi.product_id = p.product_id
            LEFT JOIN inventory i ON p.product_id = i.product_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN product_ratings pr ON p.product_id = pr.product_id
            WHERE o.order_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
              AND p.is_active = TRUE
            GROUP BY p.product_id, p.product_name, p.unit_quantity, p.price, p.image_url, i.quantity_available, c.category_name,
                     p.discount_percentage, p.sale_start, p.sale_end
            ORDER BY units_sold_7d DESC
            LIMIT 5
        `;
        const [trending] = await db.query(query);
        res.json(trending);
    } catch (error) {
        console.error('Error fetching trending products:', error);
        res.status(500).json({ message: 'Server error while fetching trending products' });
    }
});

// GET: Fetch product recommendations (Customers also bought)
router.get('/:id/recommendations', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.product_id, p.product_name, p.unit_quantity, p.price, p.image_url, c.category_name, i.quantity_available,
                p.discount_percentage, p.sale_start, p.sale_end,
                COUNT(*) AS co_purchase_count
            FROM order_item oi1
            JOIN order_item oi2 ON oi1.order_id = oi2.order_id 
                AND oi1.product_id != oi2.product_id
            JOIN products p ON oi2.product_id = p.product_id
            LEFT JOIN inventory i ON p.product_id = i.product_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE oi1.product_id = ?
              AND p.is_active = TRUE
            GROUP BY p.product_id, p.product_name, p.unit_quantity, p.price, p.image_url, c.category_name, i.quantity_available,
                     p.discount_percentage, p.sale_start, p.sale_end
            ORDER BY co_purchase_count DESC
            LIMIT 4
        `;
        const [recommendations] = await db.query(query, [req.params.id]);
        res.json(recommendations);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ message: 'Server error while fetching recommendations' });
    }
});

// Helper: Fetch image URL from Unsplash
async function fetchProductImage(productName) {
    try {
        const searchQuery = encodeURIComponent(productName + ' food grocery');
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=1&orientation=squarish`,
            {
                headers: {
                    'Authorization': 'Client-ID 0_sTMVxPjJRVY4GTpSxqiKVsSq8NWUV9N2dFhE-78Ew'
                }
            }
        );
        if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                return data.results[0].urls.small;
            }
        }
    } catch (err) {
        console.error('Unsplash fetch failed, using fallback:', err.message);
    }
    // Fallback placeholder
    return `https://placehold.co/400x400/e2e8f0/64748b?text=${encodeURIComponent(productName)}`;
}

// POST: Add a new product (AND auto-gen inventory/category if needed + auto image)
router.post('/', async (req, res) => {
    const { product_name, unit_quantity, price, quantity_available, category_name, image_url } = req.body;
    try {
        // 1. Resolve category_id
        let categoryId = 1; // Default to Groceries
        if (category_name) {
            const [cats] = await db.query('SELECT category_id FROM categories WHERE category_name = ?', [category_name]);
            if (cats.length > 0) {
                categoryId = cats[0].category_id;
            } else {
                const [insCat] = await db.query('INSERT INTO categories (category_name) VALUES (?)', [category_name]);
                categoryId = insCat.insertId;
            }
        }

        // 2. Get next product_id (manual max+1 since it's not auto_increment in some versions of this DB)
        const [maxP] = await db.query('SELECT MAX(product_id) as maxId FROM products');
        const nextId = (maxP[0].maxId || 0) + 1;

        // 3. Fetch image from Unsplash if no image_url provided
        let finalImageUrl = image_url || '';
        if (!finalImageUrl && product_name) {
            finalImageUrl = await fetchProductImage(product_name);
        }

        // 4. Insert Product
        await db.query('INSERT INTO products (product_id, product_name, unit_quantity, price, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)', 
            [nextId, product_name, unit_quantity || '1 unit', price, categoryId, finalImageUrl]);

        // 5. Insert Inventory
        await db.query('INSERT INTO inventory (product_id, quantity_available, low_stock_threshold) VALUES (?, ?, ?)', 
            [nextId, quantity_available || 0, 5]);

        res.status(201).json({ message: 'Product added successfully!', productId: nextId, image_url: finalImageUrl });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Server error while adding product' });
    }
});

// DELETE: Soft delete a product (keeps references in older orders intact)
router.delete('/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        await db.query('UPDATE products SET is_active = FALSE WHERE product_id = ?', [productId]);
        res.json({ message: 'Product deleted successfully!' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error while deleting product.' });
    }
});

// UPDATE: Product price, stock, and sale data
router.put('/:id', async (req, res) => {
    const productId = req.params.id;
    const { product_name, unit_quantity, price, quantity_available, discount_percentage, sale_start, sale_end } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        if (product_name !== undefined) {
            await connection.query('UPDATE products SET product_name = ? WHERE product_id = ?', [product_name, productId]);
        }
        if (unit_quantity !== undefined) {
            await connection.query('UPDATE products SET unit_quantity = ? WHERE product_id = ?', [unit_quantity, productId]);
        }
        if (price !== undefined) {
            await connection.query('UPDATE products SET price = ? WHERE product_id = ?', [price, productId]);
        }
        if (quantity_available !== undefined) {
            await connection.query('UPDATE inventory SET quantity_available = ? WHERE product_id = ?', [quantity_available, productId]);
        }
        if (discount_percentage !== undefined) {
            await connection.query('UPDATE products SET discount_percentage = ? WHERE product_id = ?', [discount_percentage, productId]);
        }
        if (sale_start !== undefined) {
            await connection.query('UPDATE products SET sale_start = ? WHERE product_id = ?', [sale_start || null, productId]);
        }
        if (sale_end !== undefined) {
            await connection.query('UPDATE products SET sale_end = ? WHERE product_id = ?', [sale_end || null, productId]);
        }

        await connection.commit();
        res.json({ message: 'Product updated' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ message: 'Update failed' });
    } finally {
        connection.release();
    }
});

module.exports = router;