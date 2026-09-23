-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: quickcart
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `image_url` varchar(255) DEFAULT '',
  `discount_percentage` decimal(5,2) DEFAULT '0.00',
  `sale_start` datetime DEFAULT NULL,
  `sale_end` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `pack_size` varchar(50) DEFAULT '',
  `unit_quantity` varchar(50) DEFAULT '1 unit',
  PRIMARY KEY (`product_id`),
  KEY `idx_products_category` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (101,'Milk 1L',55.00,1,'https://images.unsplash.com/photo-1563636619-e910009355bb?q=80&w=400&auto=format&fit=crop',0.00,NULL,NULL,1,'','1 unit'),(102,'Bread',40.00,1,'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop',0.00,NULL,NULL,1,'','1 unit'),(103,'Eggs 12-pack',75.00,1,'https://images.unsplash.com/photo-1582722872445-44c59ebc41dd?q=80&w=400&auto=format&fit=crop',0.00,NULL,NULL,1,'','1 unit'),(201,'Coca Cola 500ml',45.00,2,'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop',0.00,NULL,NULL,1,'','1 unit'),(202,'Orange Juice 1L',90.00,2,'https://images.unsplash.com/photo-1547514701-42782101795e?q=80&w=400&auto=format&fit=crop',0.00,NULL,NULL,1,'','1 unit'),(301,'Potato Chips',30.00,3,'https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=400&auto=format&fit=crop',0.00,NULL,NULL,1,'','1 unit'),(302,'Chocolate Bar',50.00,3,'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=400&auto=format&fit=crop',0.00,NULL,NULL,1,'','1 unit'),(401,'Shampoo 200ml',120.00,4,'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400&auto=format&fit=crop',10.00,'2026-04-08 14:35:00','2026-04-16 14:35:00',1,'','1 unit'),(402,'Toothpaste',85.00,4,'https://images.unsplash.com/photo-1559594882-6150a4d13ec3?q=80&w=400&auto=format&fit=crop',25.00,'2026-04-01 20:58:00','2026-04-29 20:58:00',1,'','1 unit'),(403,'Bananas',10.00,1,'https://images.unsplash.com/photo-1603833665858-e81b1c7e4660?q=80&w=400&auto=format&fit=crop',0.00,NULL,NULL,1,'','1 unit'),(404,'Nescafe Coffee 100g',320.00,2,'https://images.unsplash.com/photo-1559056191-7239f1ca2951?q=80&w=400',0.00,NULL,NULL,1,'','1 unit'),(405,'Lay\'s Classic Salted',50.00,3,'https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=400',0.00,NULL,NULL,1,'','1 unit'),(406,'Oreo Biscuits',40.00,3,'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400',0.00,NULL,NULL,1,'','1 unit'),(407,'Dark Chocolate 100g',180.00,3,'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=400',0.00,NULL,NULL,1,'','1 unit'),(408,'Fresh Strawberries 250g',150.00,5,'https://images.unsplash.com/photo-1464960351841-936a1c180eb9?q=80&w=400',0.00,NULL,NULL,1,'','1 unit'),(409,'Alphonso Mango 1kg',450.00,5,'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=400',0.00,NULL,NULL,1,'','1 unit'),(410,'Green Broccoli 500g',95.00,6,'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=400',0.00,NULL,NULL,1,'','1 unit'),(411,'Dove Shampoo 180ml',210.00,4,'https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?q=80&w=400',0.00,NULL,NULL,0,'','1 unit'),(412,'Liquid Handwash 250ml',99.00,4,'https://images.unsplash.com/photo-1610484729352-7f7cd42666da?q=80&w=400',0.00,NULL,NULL,1,'','1 unit'),(413,'Floor Cleaner 1L',160.00,7,'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?q=80&w=400',0.00,NULL,NULL,1,'','1 unit'),(414,'Multi-grain Bread 400g',55.00,8,'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400',0.00,NULL,NULL,1,'','1 unit'),(415,'Butter Croissant x2',140.00,8,'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=400',0.00,NULL,NULL,1,'','1 unit'),(416,'Gourmet Peanut Butter',290.00,8,'https://images.unsplash.com/photo-1568224522432-8495098de7e5?q=80&w=400',0.00,NULL,NULL,1,'','1 unit'),(417,'Paneer',120.00,9,'https://placehold.co/400x400/e2e8f0/64748b?text=Paneer',0.00,NULL,NULL,1,'','1 unit'),(418,'Cheese',80.00,9,'https://placehold.co/400x400/e2e8f0/64748b?text=Cheese',0.00,NULL,NULL,1,'','100gm');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-17 14:54:37
