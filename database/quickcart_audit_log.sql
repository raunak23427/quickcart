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
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `table_name` varchar(50) DEFAULT NULL,
  `action_type` enum('INSERT','UPDATE','DELETE') DEFAULT NULL,
  `record_id` int DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
INSERT INTO `audit_log` VALUES (1,'inventory','UPDATE',103,'{\"quantity_available\": 26}','{\"quantity_available\": 25}','2026-03-29 10:29:52'),(2,'inventory','UPDATE',201,'{\"quantity_available\": 9}','{\"quantity_available\": 8}','2026-03-29 10:29:52'),(3,'inventory','UPDATE',401,'{\"quantity_available\": 34}','{\"quantity_available\": 33}','2026-03-29 10:29:52'),(4,'inventory','UPDATE',407,'{\"quantity_available\": 44}','{\"quantity_available\": 43}','2026-03-29 10:29:52'),(5,'inventory','UPDATE',411,'{\"quantity_available\": 31}','{\"quantity_available\": 30}','2026-03-29 10:29:52'),(6,'inventory','UPDATE',413,'{\"quantity_available\": 72}','{\"quantity_available\": 43}','2026-03-29 10:31:12'),(7,'inventory','UPDATE',101,'{\"quantity_available\": 5}','{\"quantity_available\": 4}','2026-03-29 10:57:01'),(8,'inventory','UPDATE',103,'{\"quantity_available\": 25}','{\"quantity_available\": 24}','2026-03-29 10:57:01'),(9,'inventory','UPDATE',202,'{\"quantity_available\": 6}','{\"quantity_available\": 5}','2026-03-29 10:57:01'),(10,'inventory','UPDATE',416,'{\"quantity_available\": 43}','{\"quantity_available\": 42}','2026-03-29 10:57:01'),(11,'inventory','UPDATE',103,'{\"quantity_available\": 24}','{\"quantity_available\": 23}','2026-03-29 11:24:22'),(12,'inventory','UPDATE',409,'{\"quantity_available\": 75}','{\"quantity_available\": 74}','2026-03-29 11:24:22'),(13,'inventory','UPDATE',201,'{\"quantity_available\": 8}','{\"quantity_available\": 7}','2026-03-29 13:22:28'),(14,'inventory','UPDATE',401,'{\"quantity_available\": 33}','{\"quantity_available\": 32}','2026-03-29 13:22:28'),(15,'inventory','UPDATE',402,'{\"quantity_available\": 88}','{\"quantity_available\": 87}','2026-03-29 13:22:28'),(16,'inventory','UPDATE',202,'{\"quantity_available\": 5}','{\"quantity_available\": 3}','2026-04-01 16:39:53'),(17,'inventory','UPDATE',103,'{\"quantity_available\": 23}','{\"quantity_available\": 22}','2026-04-01 17:21:42'),(18,'inventory','UPDATE',103,'{\"quantity_available\": 22}','{\"quantity_available\": 21}','2026-04-01 19:22:10'),(19,'inventory','UPDATE',201,'{\"quantity_available\": 7}','{\"quantity_available\": 6}','2026-04-01 19:22:10'),(20,'inventory','UPDATE',103,'{\"quantity_available\": 21}','{\"quantity_available\": 19}','2026-04-01 19:46:50'),(21,'inventory','UPDATE',103,'{\"quantity_available\": 19}','{\"quantity_available\": 0}','2026-04-08 08:56:21'),(22,'inventory','UPDATE',102,'{\"quantity_available\": 0}','{\"quantity_available\": 10}','2026-04-08 08:56:42'),(23,'inventory','UPDATE',102,'{\"quantity_available\": 10}','{\"quantity_available\": 0}','2026-04-08 08:56:48'),(24,'inventory','UPDATE',103,'{\"quantity_available\": 0}','{\"quantity_available\": 10}','2026-04-08 08:56:50'),(25,'inventory','UPDATE',401,'{\"quantity_available\": 32}','{\"quantity_available\": 15}','2026-04-08 09:04:30'),(26,'inventory','UPDATE',401,'{\"quantity_available\": 15}','{\"quantity_available\": 9}','2026-04-08 09:04:52'),(27,'inventory','UPDATE',103,'{\"quantity_available\": 10}','{\"quantity_available\": 2}','2026-04-08 09:11:05'),(28,'inventory','UPDATE',101,'{\"quantity_available\": 4}','{\"quantity_available\": 3}','2026-04-08 09:13:39'),(29,'inventory','UPDATE',103,'{\"quantity_available\": 2}','{\"quantity_available\": 1}','2026-04-08 09:13:39'),(30,'inventory','UPDATE',401,'{\"quantity_available\": 9}','{\"quantity_available\": 3}','2026-04-08 09:13:39'),(31,'inventory','UPDATE',402,'{\"quantity_available\": 87}','{\"quantity_available\": 86}','2026-04-08 09:13:39'),(32,'inventory','UPDATE',202,'{\"quantity_available\": 3}','{\"quantity_available\": 1}','2026-04-08 09:14:43'),(33,'inventory','UPDATE',401,'{\"quantity_available\": 3}','{\"quantity_available\": 2}','2026-04-08 09:14:43'),(34,'inventory','UPDATE',101,'{\"quantity_available\": 3}','{\"quantity_available\": 0}','2026-04-09 06:28:24'),(36,'inventory','UPDATE',201,'{\"quantity_available\": 6}','{\"quantity_available\": 4}','2026-04-09 06:36:05'),(37,'inventory','UPDATE',103,'{\"quantity_available\": 1}','{\"quantity_available\": 19}','2026-04-09 06:50:08'),(38,'inventory','UPDATE',103,'{\"quantity_available\": 19}','{\"quantity_available\": 17}','2026-04-09 06:51:26'),(39,'inventory','UPDATE',301,'{\"quantity_available\": 19}','{\"quantity_available\": 18}','2026-04-09 06:51:26'),(40,'inventory','UPDATE',101,'{\"quantity_available\": 0}','{\"quantity_available\": 4}','2026-04-09 07:00:38'),(41,'inventory','UPDATE',201,'{\"quantity_available\": 4}','{\"quantity_available\": 6}','2026-04-09 07:01:25'),(42,'inventory','UPDATE',201,'{\"quantity_available\": 6}','{\"quantity_available\": 6}','2026-04-09 07:02:02'),(43,'inventory','UPDATE',402,'{\"quantity_available\": 86}','{\"quantity_available\": 87}','2026-04-09 07:02:04'),(44,'inventory','UPDATE',103,'{\"quantity_available\": 17}','{\"quantity_available\": 15}','2026-04-09 08:04:52'),(45,'inventory','UPDATE',301,'{\"quantity_available\": 18}','{\"quantity_available\": 17}','2026-04-09 08:04:52'),(46,'inventory','UPDATE',101,'{\"quantity_available\": 4}','{\"quantity_available\": 1}','2026-04-09 08:04:52'),(47,'inventory','UPDATE',103,'{\"quantity_available\": 15}','{\"quantity_available\": 13}','2026-04-09 08:05:30'),(48,'inventory','UPDATE',301,'{\"quantity_available\": 17}','{\"quantity_available\": 16}','2026-04-09 08:05:30'),(49,'inventory','UPDATE',103,'{\"quantity_available\": 13}','{\"quantity_available\": 11}','2026-04-09 08:05:53'),(50,'inventory','UPDATE',301,'{\"quantity_available\": 16}','{\"quantity_available\": 15}','2026-04-09 08:05:53'),(51,'inventory','UPDATE',103,'{\"quantity_available\": 11}','{\"quantity_available\": 9}','2026-04-09 08:06:38'),(52,'inventory','UPDATE',301,'{\"quantity_available\": 15}','{\"quantity_available\": 14}','2026-04-09 08:06:38'),(53,'inventory','UPDATE',103,'{\"quantity_available\": 9}','{\"quantity_available\": 7}','2026-04-09 08:06:56'),(54,'inventory','UPDATE',301,'{\"quantity_available\": 14}','{\"quantity_available\": 13}','2026-04-09 08:06:56'),(55,'inventory','UPDATE',103,'{\"quantity_available\": 7}','{\"quantity_available\": 5}','2026-04-09 08:43:27'),(56,'inventory','UPDATE',301,'{\"quantity_available\": 13}','{\"quantity_available\": 12}','2026-04-09 08:43:27'),(57,'inventory','UPDATE',101,'{\"quantity_available\": 1}','{\"quantity_available\": 4}','2026-04-09 08:46:01'),(58,'inventory','UPDATE',101,'{\"quantity_available\": 4}','{\"quantity_available\": 4}','2026-04-09 08:46:38'),(59,'inventory','UPDATE',401,'{\"quantity_available\": 2}','{\"quantity_available\": 0}','2026-04-09 08:48:31'),(60,'inventory','UPDATE',402,'{\"quantity_available\": 87}','{\"quantity_available\": 85}','2026-04-09 08:48:31'),(62,'inventory','UPDATE',201,'{\"quantity_available\": 6}','{\"quantity_available\": 4}','2026-04-09 08:50:49');
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-17 14:54:39
