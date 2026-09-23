const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const productRoutes = require('./routes/productRoutes'); // NEW: Import the routes
const userRoutes = require('./routes/userRoutes'); // NEW
const cartRoutes = require('./routes/cartRoutes'); // NEW
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const authRoutes = require('./routes/authRoutes');
const couponRoutes = require('./routes/couponRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');
const transactionTestRoutes = require('./routes/transactionTestRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supportRoutes = require('./routes/supportRoutes');
const adminSearchRoutes = require('./routes/adminSearchRoutes');

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('QuickCart API is running!');
});

// NEW: Use the product routes
// Any request that starts with '/api/products' will be sent to productRoutes.js
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes); // NEW
app.use('/api/carts', cartRoutes); // NEW
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/transactions', transactionTestRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin/search', adminSearchRoutes);

db.query('SELECT 1')
    .then(() => console.log('Successfully connected to the QuickCart MySQL database.'))
    .catch(err => console.error('Database connection failed:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});