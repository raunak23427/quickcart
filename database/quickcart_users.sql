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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `role` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT '',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Rahul Sharma','9876543210','customer','rahul@gmail.com','$2b$10$BQ2ESH1ae42XuJ.xLcWnd.nMZeorAkGoQ7JJb4PoDYNB0ftvhv5MG','',NULL,NULL),(2,'Ananya Verma','9876543211','customer','ananya@gmail.com','$2b$10$J23QcrpeTv./1vyHGZJy2OnmM6.ywvGTQhzP.M72YI5l8uTJY95ka','',NULL,NULL),(3,'Karan Mehta','9876543212','customer','karan@gmail.com','$2b$10$fRpfCcXLQURhQtGAIyJ.cu.TrHqKF01nuRtvPwIz.O3PKNW7J2SbG','',NULL,NULL),(4,'Neha Gupta','9876543213','customer','neha@gmail.com','$2b$10$.TvV1Di8nIO2lZV9SG03.uGBt3W0zZlit1hhObLwg9BdWLr10WSL2','',NULL,NULL),(5,'Admin User','9999999999','admin','admin@gmail.com','$2b$10$vLa/90LvT1asoq.NoNVni.9eNBSWn6cPfSAXPJWJlC3eNiYFheKEq','IIITD',NULL,NULL),(6,'Deepanshu Singh','9354871404','customer','99depanshusingh@gmail.com','$2b$10$DiLpCBFPCNEaVzhMgeQnp.0k4VuOiEdkYR48kccic.zySwAMWducK','',NULL,NULL),(8,'ADitya Giri','2515115116','customer','Aditya@gmail.com','$2b$10$snXVY4SaxSoQgPAd9sa3mu3sSRfS7EbxpKuHK07bmvG7dJps0ojBa','',NULL,NULL),(9,'Abhay','5959229824','customer','Abhay@gmail.com','$2b$10$4/.aKAF1AF5PukvtX4fOuujTZ8.KXdJZ2zzSnVHzb4N15f6KZ6wwu','',NULL,NULL),(10,'vishal','2020022222','customer','vishal@gmail.com','$2b$10$HlQs1/fmypRZl0icLhS1qucNohxnb54n/DlF7M53ek2sqciG5bvC6','',NULL,NULL),(11,'Admin User','9998887776','admin','admin@quickcart.com','$2b$10$IsDorNLIMm2QByNVoVVUquNCRCfsulmx.YxoTMYbhI4befHJ7j1By','',NULL,NULL),(16,'Test UserTest User Final','9000000000','customer','final@test.com','$2b$10$OzLm7p1Wqwp0y0K4uzwGl.ptHp.ZjSvRyD3xcAcwJkOuWyu4EZhCC','',NULL,NULL),(24,'Admin2','9999888888','admin','admin2@gmail.com','$2b$10$4I6twBRnDTOW9sY0jZ5fu.xZHp5bfkUzqpyYb/O8MfzIDa90jPOaG','',NULL,NULL),(35,'Paaji','2020202020','customer','paaji@gmail.com','$2b$10$fHMeF6OEKs/.e5Y4uLucsutF0Hh9ClPUWFT7qYEkyVaXHOaFi0lGi','',NULL,NULL),(36,'Test Customer','1234567890','customer','testcustomer@example.com','$2b$10$wQ7SrXhJP8ojlDQSiGMNpesVg96AqEEeC/jOwVP00E27DVAfJERny','',NULL,NULL),(37,'Support User','1122334455','customer','test@test.com','$2b$10$NdG56JE8X0.pu8by7yaC7u.6JRqBimkAW2/FCVuZTsTV/FvD8Asd.','',NULL,NULL),(38,'anmol','2020110205','customer','anmol@gmail.com','$2b$10$ZjnC4guBZdgRe29znMni7O./3SU5Fd0wW3mui/b88I7E9c43cHLTq','',NULL,NULL),(39,'rahul','2021202020','customer','rahul1@gmail.com','$2b$10$QZ6lAplsCYGSRAUhohrH5.iV.GLZsCUPIpKuw5K7Dh8oMO5gfa.g6','',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_user_insert` AFTER INSERT ON `users` FOR EACH ROW BEGIN INSERT INTO carts (user_id) VALUES (NEW.user_id); END */;;
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
