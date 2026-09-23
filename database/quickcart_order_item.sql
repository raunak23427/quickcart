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
-- Table structure for table `order_item`
--

DROP TABLE IF EXISTS `order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_item` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price_at_purchase` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`order_item_id`),
  UNIQUE KEY `order_id` (`order_id`,`product_id`),
  KEY `idx_order_item_order` (`order_id`),
  KEY `idx_order_item_product` (`product_id`),
  CONSTRAINT `order_item_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `order_item_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_item`
--

LOCK TABLES `order_item` WRITE;
/*!40000 ALTER TABLE `order_item` DISABLE KEYS */;
INSERT INTO `order_item` VALUES (1,5001,101,2,55.00),(2,5001,301,3,30.00),(3,5002,102,1,40.00),(4,5002,302,2,50.00),(5,5003,201,4,45.00),(6,5004,401,1,120.00),(7,5007,101,3,55.00),(8,5007,102,2,40.00),(10,5012,101,3,55.00),(11,5012,102,2,40.00),(13,5013,101,2,55.00),(14,5013,102,2,40.00),(15,5014,101,2,55.00),(16,5014,102,1,40.00),(17,5014,103,1,75.00),(18,5015,101,2,55.00),(19,5015,102,1,40.00),(20,5015,103,1,75.00),(21,5016,101,2,55.00),(22,5016,102,1,40.00),(24,5017,102,2,40.00),(25,5017,103,2,75.00),(26,5017,202,3,90.00),(27,5018,401,1,120.00),(28,5019,201,1,45.00),(29,5020,102,1,40.00),(30,5020,302,1,50.00),(31,5020,401,1,120.00),(32,5021,103,8,75.00),(33,5021,301,2,30.00),(34,5021,403,10,10.00),(35,5024,411,1,210.00),(36,5024,412,1,99.00),(37,5024,415,1,140.00),(38,5024,416,1,290.00),(42,5025,101,2,55.00),(43,5025,103,1,75.00),(44,5025,201,2,45.00),(45,5025,202,1,90.00),(46,5025,302,1,50.00),(47,5025,401,1,120.00),(48,5025,402,1,85.00),(49,5025,403,2,10.00),(57,5026,201,2,45.00),(58,5026,202,1,90.00),(59,5026,407,2,180.00),(60,5027,101,5,55.00),(61,5027,102,1,40.00),(62,5028,102,2,40.00),(63,5028,103,2,75.00),(64,5028,201,1,45.00),(65,5028,202,1,90.00),(69,5029,102,4,40.00),(77,5037,202,4,90.00),(78,5038,101,1,55.00),(79,5038,414,1,55.00),(80,5038,415,1,140.00),(81,5039,102,4,40.00),(82,5040,103,1,75.00),(83,5041,103,1,75.00),(84,5042,102,4,40.00),(85,5043,103,1,75.00),(86,5043,201,1,45.00),(87,5043,401,1,120.00),(88,5043,407,1,180.00),(89,5043,411,1,210.00),(90,5044,101,1,55.00),(91,5044,103,1,75.00),(92,5044,202,1,90.00),(93,5044,416,1,290.00),(94,5045,103,1,75.00),(95,5045,409,1,450.00),(96,5046,201,1,45.00),(97,5046,401,1,120.00),(98,5046,402,1,85.00),(99,5047,202,2,90.00),(100,5048,103,1,75.00),(101,5049,103,1,75.00),(102,5049,201,1,45.00),(103,5050,103,2,71.25),(104,5051,101,1,55.00),(105,5051,103,1,71.25),(106,5051,401,6,108.00),(107,5051,402,1,63.75),(108,5052,202,2,90.00),(109,5052,401,1,108.00),(110,5054,101,3,55.00),(112,5057,201,2,45.00),(113,5058,103,2,75.00),(114,5058,301,1,30.00),(115,5059,103,2,75.00),(116,5059,301,1,30.00),(117,5060,101,3,55.00),(118,5062,103,2,75.00),(119,5062,301,1,30.00),(120,5064,103,2,75.00),(121,5064,301,1,30.00),(122,5066,103,2,75.00),(123,5066,301,1,30.00),(124,5068,103,2,75.00),(125,5068,301,1,30.00),(126,5070,103,2,75.00),(127,5070,301,1,30.00),(128,5071,401,2,108.00),(129,5071,402,2,63.75),(131,5073,201,2,45.00);
/*!40000 ALTER TABLE `order_item` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `prevent_insufficient_stock` BEFORE INSERT ON `order_item` FOR EACH ROW BEGIN
    DECLARE available_qty INT;

    -- Fetch the current available stock for the product
    SELECT quantity_available INTO available_qty
    FROM inventory
    WHERE product_id = NEW.product_id;

    -- Block the insert if the requested quantity exceeds available stock
    IF NEW.quantity > available_qty THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient stock';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `update_inventory_after_order` AFTER INSERT ON `order_item` FOR EACH ROW BEGIN
    -- Deduct the ordered quantity from the inventory
    UPDATE inventory
    SET quantity_available = quantity_available - NEW.quantity
    WHERE product_id = NEW.product_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-17 14:54:38
