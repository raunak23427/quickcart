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
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`notification_id`),
  KEY `notifications_ibfk_1` (`user_id`),
  KEY `idx_notifications_isread` (`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,5,'Low stock alert for product ID: 101','2026-03-18 21:56:46',0),(2,5,'Low stock alert for product ID: 101','2026-03-18 22:34:27',0),(3,5,'Low stock alert for product ID: 403','2026-03-19 05:05:23',0),(4,5,'Low stock alert for product ID: 403','2026-03-19 05:05:23',0),(5,NULL,'⚠️ Low stock alert for Bananas! Only -10 left.','2026-03-19 05:05:23',0),(6,5,'Low stock alert for product ID: 101','2026-03-19 05:34:21',0),(7,5,'Low stock alert for product ID: 101','2026-03-19 06:42:33',0),(8,5,'Low stock alert for product ID: 101','2026-03-19 06:42:33',0),(9,NULL,'⚠️ Low stock alert for Milk 1L! Only -2 left.','2026-03-19 06:42:33',0),(10,5,'Low stock alert for product ID: 101','2026-03-19 06:45:02',0),(11,5,'Low stock alert for product ID: 101','2026-03-19 06:45:08',0),(12,5,'Low stock alert for product ID: 101','2026-03-19 06:47:03',0),(13,5,'Low stock alert for product ID: 101','2026-03-19 06:47:16',0),(14,5,'Low stock alert for product ID: 101','2026-03-19 06:47:23',0),(15,5,'Low stock alert for product ID: 403','2026-03-19 06:47:54',0),(16,5,'Low stock alert for product ID: 101','2026-03-19 06:51:29',0),(17,5,'Low stock alert for product ID: 101','2026-03-19 06:52:12',0),(18,5,'Low stock alert for product ID: 101','2026-03-19 06:52:22',0),(19,5,'Low stock alert for product ID: 101','2026-03-19 06:52:29',0),(20,5,'Low stock alert for product ID: 101','2026-03-19 07:18:14',0),(21,5,'Low stock alert for product ID: 101','2026-03-19 07:18:21',0),(22,5,'Low stock alert for product ID: 302','2026-03-19 07:18:54',0),(23,5,'Low stock alert for product ID: 102','2026-03-19 07:19:10',0),(24,5,'Low stock alert for product ID: 201','2026-03-19 07:19:21',0),(25,5,'Low stock alert for product ID: 301','2026-03-19 07:19:35',0),(26,5,'Low stock alert for product ID: 202','2026-03-19 07:19:40',0),(27,5,'Low stock alert for product ID: 101','2026-03-19 08:17:49',0),(28,5,'Low stock alert for product ID: 102','2026-03-19 08:17:49',0),(29,5,'Low stock alert for product ID: 101','2026-03-19 08:17:49',0),(30,5,'Low stock alert for product ID: 102','2026-03-19 08:17:49',0),(31,NULL,'⚠️ Low stock alert for Milk 1L! Only -5 left.','2026-03-19 08:17:49',0),(32,NULL,'⚠️ Low stock alert for Bread! Only 8 left.','2026-03-19 08:17:49',0),(33,5,'Low stock alert for product ID: 102','2026-03-29 06:44:48',0),(34,5,'Low stock alert for product ID: 201','2026-03-29 06:44:48',0),(35,5,'Low stock alert for product ID: 202','2026-03-29 06:44:48',0),(36,5,'Low stock alert for product ID: 102','2026-03-29 06:44:48',0),(37,5,'Low stock alert for product ID: 201','2026-03-29 06:44:48',0),(38,5,'Low stock alert for product ID: 202','2026-03-29 06:44:48',0),(39,NULL,'⚠️ Low stock alert for Bread! Only 4 left.','2026-03-29 06:44:48',0),(40,NULL,'⚠️ Low stock alert for Coca Cola 500ml! Only 9 left.','2026-03-29 06:44:48',0),(41,NULL,'⚠️ Low stock alert for Orange Juice 1L! Only 4 left.','2026-03-29 06:44:48',0),(42,5,'Low stock alert for product ID: 102','2026-03-29 07:27:47',0),(43,5,'Low stock alert for product ID: 102','2026-03-29 07:27:47',0),(44,NULL,'⚠️ Low stock alert for Bread! Only -4 left.','2026-03-29 07:27:47',0),(45,5,'Low stock alert for product ID: 101','2026-03-29 07:57:37',0),(46,5,'Low stock alert for product ID: 102','2026-03-29 07:57:42',0),(54,5,'Low stock alert for product ID: 202','2026-03-29 08:09:56',0),(55,NULL,'⚠️ Low stock alert for Orange Juice 1L! Only 0 left.','2026-03-29 08:09:56',0),(56,5,'Low stock alert for product ID: 101','2026-03-29 08:12:19',0),(57,NULL,'⚠️ Low stock alert for Milk 1L! Only 5 left.','2026-03-29 08:12:19',0),(58,5,'Low stock alert for product ID: 102','2026-03-29 08:13:58',0),(59,NULL,'⚠️ Low stock alert for Bread! Only 0 left.','2026-03-29 08:13:58',0),(60,5,'Low stock alert for product ID: 102','2026-03-29 08:23:48',0),(61,5,'Low stock alert for product ID: 102','2026-03-29 08:23:54',0),(62,5,'Low stock alert for product ID: 102','2026-03-29 08:23:58',0),(63,5,'Low stock alert for product ID: 202','2026-03-29 08:24:05',0),(64,5,'Low stock alert for product ID: 302','2026-03-29 08:24:11',0),(65,5,'Low stock alert for product ID: 102','2026-03-29 08:29:42',0),(66,NULL,'⚠️ Low stock alert for Bread! Only 0 left.','2026-03-29 08:29:42',0),(67,5,'Low stock alert for product ID: 201','2026-03-29 10:29:52',0),(68,NULL,'⚠️ Low stock alert for Coca Cola 500ml! Only 8 left.','2026-03-29 10:29:52',0),(69,5,'Low stock alert for product ID: 101','2026-03-29 10:57:01',0),(70,5,'Low stock alert for product ID: 202','2026-03-29 10:57:01',0),(71,NULL,'⚠️ Low stock alert for Milk 1L! Only 4 left.','2026-03-29 10:57:01',0),(72,NULL,'⚠️ Low stock alert for Orange Juice 1L! Only 5 left.','2026-03-29 10:57:01',0),(73,5,'Low stock alert for product ID: 201','2026-03-29 13:22:28',0),(74,NULL,'⚠️ Low stock alert for Coca Cola 500ml! Only 7 left.','2026-03-29 13:22:28',0),(75,5,'Low stock alert for product ID: 202','2026-04-01 16:39:53',0),(76,NULL,'⚠️ Low stock alert for Orange Juice 1L! Only 3 left.','2026-04-01 16:39:53',0),(77,5,'Low stock alert for product ID: 201','2026-04-01 19:22:10',0),(78,NULL,'⚠️ Low stock alert for Coca Cola 500ml! Only 6 left.','2026-04-01 19:22:10',0),(79,5,'Low stock alert for product ID: 103','2026-04-08 08:56:21',0),(80,5,'Low stock alert for product ID: 102','2026-04-08 08:56:42',0),(81,5,'Low stock alert for product ID: 102','2026-04-08 08:56:48',0),(82,5,'Low stock alert for product ID: 401','2026-04-08 09:04:52',0),(83,5,'Low stock alert for product ID: 103','2026-04-08 09:11:05',0),(84,5,'Low stock alert for product ID: 101','2026-04-08 09:13:39',0),(85,5,'Low stock alert for product ID: 103','2026-04-08 09:13:39',0),(86,5,'Low stock alert for product ID: 401','2026-04-08 09:13:39',0),(87,NULL,'⚠️ Low stock alert for Milk 1L! Only 3 left.','2026-04-08 09:13:39',0),(88,NULL,'⚠️ Low stock alert for Eggs 12-pack! Only 1 left.','2026-04-08 09:13:39',0),(89,NULL,'⚠️ Low stock alert for Shampoo 200ml! Only 3 left.','2026-04-08 09:13:39',0),(90,5,'Low stock alert for product ID: 202','2026-04-08 09:14:43',0),(91,5,'Low stock alert for product ID: 401','2026-04-08 09:14:43',0),(92,NULL,'⚠️ Low stock alert for Orange Juice 1L! Only 1 left.','2026-04-08 09:14:43',0),(93,NULL,'⚠️ Low stock alert for Shampoo 200ml! Only 2 left.','2026-04-08 09:14:43',0),(94,5,'Low stock alert for product ID: 101','2026-04-09 06:28:24',0),(96,5,'Low stock alert for product ID: 201','2026-04-09 06:36:05',0),(97,5,'Low stock alert for product ID: 301','2026-04-09 06:51:26',0),(98,5,'Low stock alert for product ID: 101','2026-04-09 07:00:38',0),(99,5,'Low stock alert for product ID: 201','2026-04-09 07:01:25',0),(100,5,'Low stock alert for product ID: 201','2026-04-09 07:02:02',0),(101,5,'Low stock alert for product ID: 301','2026-04-09 08:04:52',0),(102,5,'Low stock alert for product ID: 101','2026-04-09 08:04:52',0),(103,5,'Low stock alert for product ID: 301','2026-04-09 08:05:30',0),(104,5,'Low stock alert for product ID: 301','2026-04-09 08:05:53',0),(105,5,'Low stock alert for product ID: 103','2026-04-09 08:06:38',0),(106,5,'Low stock alert for product ID: 301','2026-04-09 08:06:38',0),(107,5,'Low stock alert for product ID: 103','2026-04-09 08:06:56',0),(108,5,'Low stock alert for product ID: 301','2026-04-09 08:06:56',0),(109,5,'Low stock alert for product ID: 103','2026-04-09 08:43:27',0),(110,5,'Low stock alert for product ID: 301','2026-04-09 08:43:27',0),(111,5,'Low stock alert for product ID: 101','2026-04-09 08:46:01',0),(112,5,'Low stock alert for product ID: 101','2026-04-09 08:46:38',0),(113,5,'Low stock alert for product ID: 401','2026-04-09 08:48:31',0),(114,NULL,'⚠️ Low stock alert for Shampoo 200ml! Only 0 left.','2026-04-09 08:48:31',0),(116,5,'Low stock alert for product ID: 201','2026-04-09 08:50:49',0);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-17 14:54:38
