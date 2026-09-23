<p align="center">
  <img src="frontend/public/favicon.svg" alt="QuickCart Logo" width="80" />
</p>

<h1 align="center">QuickCart – Quick Commerce Platform</h1>

<p align="center">
  <strong>A full-stack e-commerce web application built with React, Node.js, Express, and MySQL</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express%205-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

---

##  Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Demo Credentials](#-demo-credentials)
- [Project Structure](#-project-structure)
- [Advanced DBMS Features](#-advanced-dbms-features)
- [Future Improvements](#-future-improvements)
- [License](#-license)

---

##  Overview

**QuickCart** is a production-grade quick-commerce platform that simulates a real-world online grocery delivery system. It features a customer-facing storefront with product browsing, cart management, wishlist, order tracking, and payment simulation — alongside a full-featured admin dashboard for inventory, user, and order management.

Built as a comprehensive **DBMS course project**, it demonstrates advanced database concepts including ACID-compliant transactions, triggers, stored procedures, views, indexing, and complex multi-table queries — all integrated into a polished full-stack application.

---

##  Features

### Customer Features
| Feature | Description |
|---------|-------------|
| **Product Catalog** | Browse products with category filtering, search, and sorting |
| **Shopping Cart** | Add, update quantities, remove items with real-time price calculation |
| **Wishlist** | Save products for later with one-click add-to-cart |
| **Order Management** | Place orders with coupon support and view order history |
| **Payment Gateway** | Simulated payment processing with order confirmation |
| **Order Tracking** | Real-time order status tracking (Processing → Shipped → Delivered) |
| **Product Ratings** | Rate and review purchased products |
| **User Profile** | View and manage personal information and order history |
| **Help & Support** | Submit and track support tickets |

###  Admin Features
| Feature | Description |
|---------|-------------|
| **Dashboard Analytics** | Revenue, orders, users, and inventory overview with charts |
| **Product Management** | CRUD operations with inline editing for price and stock |
| **User Management** | View all users, update roles, delete accounts |
| **Order Management** | View, filter, and update order statuses |
| **Inventory Control** | Low-stock alerts and bulk inventory management |
| **Support Tickets** | View and respond to customer support requests |
| **Universal Search** | Debounced search across products, users, orders, and more |
| **Category Management** | Organize products by categories |

###  Authentication & Security
- Secure password hashing with **bcrypt**
- Role-based access control (Customer / Admin)
- Protected API routes
- Password reset flow with token-based verification

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router 7, Axios, Tailwind CSS 4 |
| **Build Tool** | Vite 8 |
| **Backend** | Node.js, Express 5 |
| **Database** | MySQL 8.x |
| **Auth** | bcryptjs |
| **Fonts** | Google Fonts (Sora, Outfit) |
| **Dev Tools** | Nodemon, ESLint |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                   │
│              React + Tailwind CSS + Vite              │
└──────────────────┬───────────────────────────────────┘
                   │  HTTP/REST (Axios)
                   ▼
┌──────────────────────────────────────────────────────┐
│                 API SERVER (Backend)                   │
│           Node.js + Express 5 (Port 5000)             │
│                                                       │
│  Routes: auth, products, cart, orders, wishlist,      │
│  analytics, ratings, support, notifications,          │
│  coupons, categories, admin search, transactions      │
└──────────────────┬───────────────────────────────────┘
                   │  mysql2 (Connection Pool)
                   ▼
┌──────────────────────────────────────────────────────┐
│              DATABASE (MySQL 8.x)                     │
│                                                       │
│  Tables: users, products, categories, inventory,      │
│  carts, cart_item, orders, order_item, payments,      │
│  wishlist, coupons, notifications, product_ratings,   │
│  product_suggestions, support_tickets, audit_log      │
│                                                       │
│  + Triggers, Stored Procedures, Views, Indexes        │
└──────────────────────────────────────────────────────┘
```

---

##  Screenshots


>
> | Screen | Description |
> |--------|-------------|
> | Login Page | Authentication with role-based redirect |
> <img width="1097" height="665" alt="image" src="https://github.com/user-attachments/assets/d7c74408-c8ff-40df-8c7d-1a98260c4fa8" />

> | Product Catalog | Grid view with search, filters, and categories |
> <img width="1425" height="723" alt="image" src="https://github.com/user-attachments/assets/89c8e14a-f0f6-4a4b-9751-fa0a5b5410cb" />

> | Shopping Cart | Cart with quantity controls and price breakdown |
> <img width="1345" height="683" alt="image" src="https://github.com/user-attachments/assets/121109aa-f7d1-4ad1-b58c-7a5636545813" />


> | Admin Dashboard | Analytics overview with charts |
> <img width="1405" height="713" alt="image" src="https://github.com/user-attachments/assets/130603b2-fa98-4ace-a661-54f43e66b0f7" />

> | Order Tracking | Real-time order status timeline |
> <img width="1421" height="727" alt="image" src="https://github.com/user-attachments/assets/95da2ea3-7c57-489e-afe0-7775821c4ac2" />


<!-- Uncomment and replace with your actual screenshot paths:
![Login Page](screenshots/login.png)
![Product Catalog](screenshots/products.png)
![Shopping Cart](screenshots/cart.png)
![Admin Dashboard](screenshots/admin.png)
![Order Tracking](screenshots/tracking.png)
-->

---

##  Getting Started

### Prerequisites

- **Node.js** ≥ 18.x — [Download](https://nodejs.org/)
- **MySQL** ≥ 8.0 — [Download](https://dev.mysql.com/downloads/)
- **Git** — [Download](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/quickcart.git
cd quickcart
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment Variables

```bash
# In the backend directory, create .env from the template
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=quickcart
```

---

##  Database Setup

### Option A: Import the Full Database Dump (Recommended)

1. Open MySQL Workbench or terminal
2. Create the database:

```sql
CREATE DATABASE quickcart;
USE quickcart;
```

3. Import all SQL files from the `database/` directory **in this order**:

```bash
# From the project root
mysql -u root -p quickcart < database/quickcart_users.sql
mysql -u root -p quickcart < database/quickcart_categories.sql
mysql -u root -p quickcart < database/quickcart_products.sql
mysql -u root -p quickcart < database/quickcart_inventory.sql
mysql -u root -p quickcart < database/quickcart_carts.sql
mysql -u root -p quickcart < database/quickcart_cart_item.sql
mysql -u root -p quickcart < database/quickcart_orders.sql
mysql -u root -p quickcart < database/quickcart_order_item.sql
mysql -u root -p quickcart < database/quickcart_payments.sql
mysql -u root -p quickcart < database/quickcart_wishlist.sql
mysql -u root -p quickcart < database/quickcart_coupons.sql
mysql -u root -p quickcart < database/quickcart_notifications.sql
mysql -u root -p quickcart < database/quickcart_product_ratings.sql
mysql -u root -p quickcart < database/quickcart_product_suggestions.sql
mysql -u root -p quickcart < database/quickcart_support_tickets.sql
mysql -u root -p quickcart < database/quickcart_audit_log.sql
mysql -u root -p quickcart < database/quickcart_routines.sql
```

### Option B: Using MySQL Workbench

1. Open MySQL Workbench → **Server** → **Data Import**
2. Select **Import from Self-Contained File** or **Import from Dump Project Folder**
3. Point to the `database/` directory
4. Click **Start Import**

---

##  Running the Application

### Start the Backend

```bash
cd backend
npm run dev
```

The API server will start at `http://localhost:5000`

### Start the Frontend

```bash
cd frontend
npm run dev
```

The app will open at `http://localhost:5173`

---

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset password with token |
| `GET` | `/api/products` | Get all products |
| `GET` | `/api/products/:id` | Get product by ID |
| `POST` | `/api/products` | Create product (Admin) |
| `PUT` | `/api/products/:id` | Update product (Admin) |
| `DELETE` | `/api/products/:id` | Delete product (Admin) |
| `GET` | `/api/carts/:userId` | Get user's cart |
| `POST` | `/api/carts/add` | Add item to cart |
| `PUT` | `/api/carts/update` | Update cart item quantity |
| `DELETE` | `/api/carts/remove` | Remove item from cart |
| `POST` | `/api/orders/place` | Place a new order |
| `GET` | `/api/orders/user/:userId` | Get user's orders |
| `PUT` | `/api/orders/:orderId/status` | Update order status (Admin) |
| `GET` | `/api/wishlist/:userId` | Get user's wishlist |
| `POST` | `/api/wishlist/add` | Add to wishlist |
| `DELETE` | `/api/wishlist/remove` | Remove from wishlist |
| `GET` | `/api/analytics/dashboard` | Admin dashboard data |
| `GET` | `/api/support/:userId` | Get user's support tickets |
| `POST` | `/api/support` | Submit support ticket |
| `POST` | `/api/ratings` | Submit product rating |
| `GET` | `/api/categories` | Get all categories |

---

##  Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@quickcart.com` | `admin123` |
| **Customer** | `rahul@gmail.com` | `123456` |

>  **Note:** Passwords are bcrypt-hashed in the database. The above are the plaintext versions for demo login.

---

##  Project Structure

```
quickcart/
├── backend/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── migrations/
│   │   └── create_support_table.js
│   ├── routes/
│   │   ├── adminSearchRoutes.js   # Universal admin search
│   │   ├── analyticsRoutes.js     # Dashboard analytics
│   │   ├── authRoutes.js          # Authentication & registration
│   │   ├── cartRoutes.js          # Shopping cart operations
│   │   ├── categoryRoutes.js      # Category management
│   │   ├── couponRoutes.js        # Coupon validation
│   │   ├── notificationRoutes.js  # User notifications
│   │   ├── orderRoutes.js         # Order placement & management
│   │   ├── productRoutes.js       # Product CRUD
│   │   ├── ratingRoutes.js        # Product ratings
│   │   ├── suggestionRoutes.js    # Product suggestions
│   │   ├── supportRoutes.js       # Help & support tickets
│   │   ├── transactionTestRoutes.js # Transaction demos
│   │   ├── userRoutes.js          # User management
│   │   └── wishlistRoutes.js      # Wishlist operations
│   ├── .env.example               # Environment template
│   ├── package.json
│   └── server.js                  # Express app entry point
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Admin.jsx          # Admin dashboard
│   │   │   ├── AdminLayout.jsx    # Admin layout wrapper
│   │   │   ├── AdminNavbar.jsx    # Admin navigation
│   │   │   ├── AdminProfile.jsx   # Admin profile page
│   │   │   ├── AdminSearch.jsx    # Universal search component
│   │   │   ├── Cart.jsx           # Shopping cart
│   │   │   ├── Login.jsx          # Login & registration
│   │   │   ├── Navbar.jsx         # Customer navigation
│   │   │   ├── OrderTracking.jsx  # Order status tracking
│   │   │   ├── PaymentGateway.jsx # Payment simulation
│   │   │   ├── PaymentSuccess.jsx # Order confirmation
│   │   │   ├── ProductList.jsx    # Product catalog
│   │   │   ├── Profile.jsx        # Customer profile
│   │   │   ├── Receipt.jsx        # Order receipt
│   │   │   ├── Support.jsx        # Help & support
│   │   │   └── Wishlist.jsx       # Product wishlist
│   │   ├── App.css
│   │   ├── App.jsx                # Route configuration
│   │   ├── index.css              # Global styles
│   │   └── main.jsx               # React entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── database/                       # MySQL schema & data dumps
│   ├── quickcart_users.sql
│   ├── quickcart_products.sql
│   ├── quickcart_categories.sql
│   ├── quickcart_inventory.sql
│   ├── quickcart_orders.sql
│   ├── quickcart_order_item.sql
│   ├── quickcart_carts.sql
│   ├── quickcart_cart_item.sql
│   ├── quickcart_payments.sql
│   ├── quickcart_wishlist.sql
│   ├── quickcart_coupons.sql
│   ├── quickcart_notifications.sql
│   ├── quickcart_product_ratings.sql
│   ├── quickcart_product_suggestions.sql
│   ├── quickcart_support_tickets.sql
│   ├── quickcart_audit_log.sql
│   └── quickcart_routines.sql
│
├── docs/
│   └── Final_Demo_Report.pdf       # Project report
│
├── .gitignore
└── README.md
```

---

##  Advanced DBMS Features

This project demonstrates the following advanced database concepts:

### Triggers
- **`trg_after_order_insert`** — Automatically creates payment record on order placement
- **`trg_after_order_item_insert`** — Decrements inventory stock after order item insertion
- **`trg_update_inventory_status`** — Updates stock status (In Stock / Low Stock / Out of Stock)
- **`trg_audit_order_status`** — Logs order status changes to the audit table

### Stored Procedures
- **`sp_place_order`** — Atomic order placement with stock validation and inventory update
- **`sp_get_dashboard_stats`** — Aggregated analytics for admin dashboard

### Transactions (ACID Compliance)
- **Concurrent order handling** with row-level locking (`SELECT ... FOR UPDATE`)
- **Atomic checkout** — Cart → Order → Payment → Inventory update in a single transaction
- **Rollback on failure** — Ensures data consistency on errors
- **Isolation** — Prevents dirty reads and race conditions

### Views & Indexes
- Optimized queries with proper indexing on foreign keys and frequently queried columns
- Database views for common aggregation patterns

---

##  Future Improvements

- [ ] **JWT Authentication** — Replace localStorage-based auth with JWT tokens
- [ ] **Image Upload** — Allow admins to upload product images (Cloudinary/S3)
- [ ] **Real-time Notifications** — WebSocket integration for live order updates
- [ ] **Payment Integration** — Razorpay / Stripe integration
- [ ] **Email Notifications** — Order confirmation and password reset emails
- [ ] **Docker Support** — Containerize the app with Docker Compose
- [ ] **Unit & Integration Tests** — Jest + Supertest for API testing
- [ ] **CI/CD Pipeline** — GitHub Actions for automated testing and deployment
- [ ] **PWA Support** — Progressive Web App for mobile experience
- [ ] **Redis Caching** — Cache frequently accessed product data

---

##  License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <strong>Deepanshu Singh and Aditya Giri</strong>
</p>
