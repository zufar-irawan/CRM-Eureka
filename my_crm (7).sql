-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 10, 2025 at 07:22 AM
-- Server version: 8.0.30
-- PHP Version: 8.2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `my_crm`
--

-- --------------------------------------------------------

--
-- Table structure for table `approvals`
--

CREATE TABLE `approvals` (
  `id` int NOT NULL,
  `contract_id` int DEFAULT NULL,
  `approver_id` int DEFAULT NULL,
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ci_sessions`
--

CREATE TABLE `ci_sessions` (
  `id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `timestamp` int UNSIGNED NOT NULL DEFAULT '0',
  `data` blob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ci_sessions`
--

INSERT INTO `ci_sessions` (`id`, `ip_address`, `timestamp`, `data`) VALUES
('0dnei52e1c05a7q7ctgomgm0u7rckgi7', '103.79.155.146', 1753146560, 0x757365725f69647c733a313a2231223b757365726e616d657c4e3b6e616d657c733a31303a2241646d696e2055736572223b726f6c657c4e3b6c6f676765645f696e7c623a313b),
('0lo4oot96o3c8u2cp9usj64kr6e1pu4d', '110.138.93.51', 1753056585, 0x757365725f69647c733a313a2231223b757365726e616d657c4e3b6e616d657c733a31303a2241646d696e2055736572223b726f6c657c4e3b6c6f676765645f696e7c623a313b),
('0s20pf0n8ij05tunuhcirjml78tsqook', '103.19.110.35', 1753107604, ''),
('1kclnm68r56c11m4sl4jkesn7loi4ie0', '103.19.110.35', 1753081922, ''),
('36qvh9488f5m0ei88i0tg68hnmkuaf5e', '103.79.155.146', 1753079494, 0x757365725f69647c733a313a2231223b757365726e616d657c4e3b6e616d657c733a31303a2241646d696e2055736572223b726f6c657c4e3b6c6f676765645f696e7c623a313b),
('4vjq1c7aceilds7135bm0fjtqothk4jc', '103.19.110.35', 1753107614, ''),
('5gs81vob1r9qhd1a081tt8kqbfd8bo3e', '157.15.46.190', 1753116506, 0x757365725f69647c733a313a2231223b757365726e616d657c4e3b6e616d657c733a31303a2241646d696e2055736572223b726f6c657c4e3b6c6f676765645f696e7c623a313b),
('5tvng8me5me28s5eqo5km7gpj5r2f7ec', '103.19.110.35', 1753107697, ''),
('9m06hcefv1c43rbdsr87j3a99nq81j9e', '71.6.134.231', 1753040271, ''),
('bhn2dp3eu3l87d8fhacdpa0flbpjcuhp', '103.19.110.35', 1753107573, ''),
('eoeuprae5oude1aki5r89r65927gtbkh', '198.235.24.122', 1753133390, ''),
('frg3r5ttucguot9i71ps3fbh2bi69vps', '103.19.110.35', 1753077921, ''),
('i7hc9spojelqe7k1gee9213lghu1bgql', '206.168.34.67', 1753027096, ''),
('i93bq37t0hcjl1ekfeoak399tdv0qa4o', '20.171.207.204', 1753138352, ''),
('l6lqtq76mof3oc5lf4hgvb8tp4fl444h', '64.227.138.242', 1753096552, ''),
('qsa2d165jjtjm67eq15cljiot1ab68k8', '103.19.110.35', 1753106509, ''),
('s59nb2lhi248860m05lfgusl7cojar5r', '205.210.31.30', 1753088240, ''),
('t0r5na335vcnbnb6ehfedj3omd6krvuo', '103.19.110.35', 1753107712, '');

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `name`, `address`, `phone`, `email`, `created_at`) VALUES
(1, 'PT Maju Jaya', 'Jl. Raya No. 1', '021-12345678', 'info@majujaya.com', '2025-07-19 02:00:24'),
(2, 'CV Berkah Abadi', 'Jl. Melati No. 15', '021-88887777', 'halo@berkahabadi.co.id', '2025-07-19 02:00:24'),
(3, 'UD Sumber Rejeki', 'Jl. Merdeka No. 99', '021-99998888', 'sumber@rejeki.com', '2025-07-19 02:00:24'),
(7, 'PT Sayang Bunda', 'jl baping, jakarta timur, DKI Jakarta 82392', '022-938313', 'smkprestasiprima@smk.sch.id', '2025-08-02 13:50:51'),
(8, 'PT Anak Bunda', 'Jl. Bambu Apus, Jakarta Timur, Dki Jakarta, 1890', '022-939133', 'AnakBunda@gmail.com', '2025-08-02 14:02:23'),
(9, 'PT Alhamdulillah', 'Jl. Bambu Wulung, Jakarta Timur, Dki Jakarta, 1888', '021-99999', 'smk01@gmail.com', '2025-08-02 14:26:27'),
(10, 'PT Sayang Emak', 'Jl Mabes Hankam, Jakarta Timur, Dki Jakarta, 1899', '021-77777', 'smkprestasiprima@gmail.com', '2025-08-02 14:35:40'),
(12, 'PT Nusantara Ekspres', 'Jl. Merdeka No.1, Jakarta, DKI Jakarta, 10110', '0211234567', NULL, '2025-08-02 15:10:43'),
(13, 'CV Maju Jaya', 'Jl. Sudirman No.88, Bandung, Jawa Barat, 40212', '0217654321', NULL, '2025-08-02 15:17:22'),
(14, 'PT Anak Siapa', 'Jl.Bekasi, Bekasi, Jawa, 1790', '021-4444', 'sman1bekasi@gmail.com', '2025-08-02 15:35:58'),
(15, 'PT Berkah Bunda', 'Jl.Pinang Ranti, Jakarta Timur, Dki Jakarta, 1799', '021-222222', 'berkahbunda@gmail.com', '2025-08-04 07:56:21'),
(16, 'PT Exatama', 'Jl Hj Liah, Jakarta Timur, DKI Jakarta, 82392', '021-728733', 'Exatama@gmail.com', '2025-08-08 07:03:27'),
(17, 'PT Insan Abadi', 'Jl.Bambu Petung, Jakarta Timur, DKI Jakarta, 1874', '021-879379', 'InsanAbadi@gmail.com', '2025-08-15 01:31:58'),
(18, 'PT Irsyad', 'Jl. Bambu Hitam, Jakarta Timur, DKI Jakarta, 1835', '021-55555', 'irsyadjaya@gmail.com', '2025-08-15 03:14:20'),
(19, 'PT Gaming Irsyad', 'Jl. Prestasi Prima, Jakarta Timur, DKI Jakarta, 18377', '021-22222', 'gamingirsyad@gmail.com', '2025-08-15 07:16:53'),
(20, 'PT Gaza', 'Jl. Yaman, Jakarta Timur, DKI Jakarta, 18383', '021-97593', 'gaza@gmail.com', '2025-08-27 06:39:04'),
(21, 'PT Susano', 'Jl.Bambu Ungu, Jakarta Timur, DKI Jakarta, 18012', '021-81979', 'susanooh@gmail.com', '2025-08-28 03:23:36');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int NOT NULL,
  `company_id` int DEFAULT NULL,
  `lead_id` int DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `position` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `company_id`, `lead_id`, `name`, `email`, `phone`, `position`, `created_at`) VALUES
(1, 1, NULL, 'Budi Santoso', 'budi@majujaya.com', '08123456789', 'Purchasing', '2025-07-19 02:00:24'),
(2, 2, NULL, 'Dewi Lestari', 'dewi@berkahabadi.co.id', '082112345678', 'Owner', '2025-07-19 02:00:24'),
(3, 3, NULL, 'Rudi Hartono', 'rudi@sumberrejeki.com', '081298765432', 'Manager Operasional', '2025-07-19 02:00:24'),
(7, 7, NULL, 'fazry irawan', 'fazryalgaza267@gmail.com', '0819091792', 'ceo', '2025-08-02 13:50:52'),
(8, 8, NULL, 'fazry gaza', 'agusnugraha@gmail.com', '081920821033', 'cto', '2025-08-02 14:02:23'),
(9, 10, NULL, 'Zufar Fazry', 'zeerayzan@gmail.com', '081397193345', 'cto', '2025-08-02 14:35:40'),
(11, 12, NULL, 'Andi Rahman', 'andi@nusantara.com', '081212345678', 'Logistics Manager', '2025-08-02 15:10:43'),
(12, 13, NULL, 'Siti Kartika', 'siti@majujaya.co.id', '082112345678', 'Procurement', '2025-08-02 15:17:22'),
(13, 15, NULL, 'fazry kiedrowsky', 'fazryganteng@gmail.com', '081907048347', 'CEO', '2025-08-04 07:56:21'),
(14, 17, NULL, 'Irsyad Gaza', 'Irsyad@gmail.com', '081979317913', 'CMO', '2025-08-15 01:31:58'),
(15, 18, NULL, 'irsyad zufar', 'irsyadzufar@gmail.com', '081374372727', 'Manager', '2025-08-15 03:14:20'),
(16, 19, NULL, 'irsyad gaming', 'gamingirsyad@gmail.com', '081727979127', 'Ceo', '2025-08-15 07:16:53'),
(17, 20, 25, 'Raya Gaza', 'raya@gmail.com', '081465473456', 'Marketing', '2025-08-27 06:39:04'),
(18, 21, 24, 'zufarr susano', 'susanooo@gmail.com', '081879137910', 'CTO', '2025-08-28 03:23:36'),
(19, NULL, 27, 'arhan pratama', NULL, NULL, NULL, '2025-09-09 01:12:10');

-- --------------------------------------------------------

--
-- Table structure for table `contracts`
--

CREATE TABLE `contracts` (
  `id` int NOT NULL,
  `quotation_id` int DEFAULT NULL,
  `contract_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contract_comments`
--

CREATE TABLE `contract_comments` (
  `id` int NOT NULL,
  `contract_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `user_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contract_items`
--

CREATE TABLE `contract_items` (
  `id` int NOT NULL,
  `contract_id` int DEFAULT NULL,
  `origin` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `destination` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `price` decimal(18,2) DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deals`
--

CREATE TABLE `deals` (
  `id` int NOT NULL,
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lead_id` int DEFAULT NULL,
  `id_contact` int DEFAULT NULL,
  `id_company` int DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `value` decimal(18,2) DEFAULT NULL,
  `stage` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `owner` int NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deal_comments`
--

CREATE TABLE `deal_comments` (
  `id` int NOT NULL,
  `deal_id` int DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `reply_level` int NOT NULL DEFAULT '0',
  `user_id` int DEFAULT NULL,
  `user_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kpi_targets`
--

CREATE TABLE `kpi_targets` (
  `id` int NOT NULL,
  `type` enum('daily','monthly') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `kanvasing_target` int DEFAULT '0',
  `followup_target` int DEFAULT '0',
  `penawaran_target` int DEFAULT '0',
  `kesepakatan_tarif_target` int DEFAULT '0',
  `deal_do_target` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kpi_targets`
--

INSERT INTO `kpi_targets` (`id`, `type`, `kanvasing_target`, `followup_target`, `penawaran_target`, `kesepakatan_tarif_target`, `deal_do_target`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'daily', 5, 5, 1, 0, 0, 1, '2025-08-14 11:58:27', '2025-08-18 15:37:03'),
(2, 'monthly', 130, 130, 26, 4, 1, 1, '2025-08-14 11:58:27', '2025-08-15 16:03:07');

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` int NOT NULL,
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `owner` int DEFAULT NULL,
  `company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `title` enum('Mr','Ms','Mrs') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Mr',
  `first_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fullname` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `job_position` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `work_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fax` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `website` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `industry` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `number_of_employees` int DEFAULT NULL,
  `lead_source` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `stage` enum('New','Contacted','Qualification','Converted','Unqualified') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rating` enum('Hot','Warm','Cold') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `street` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `postal_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 = belum diconvert, 1 = sudah diconvert'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `code`, `owner`, `company`, `title`, `first_name`, `last_name`, `fullname`, `job_position`, `email`, `work_email`, `phone`, `mobile`, `fax`, `website`, `industry`, `number_of_employees`, `lead_source`, `stage`, `rating`, `street`, `city`, `state`, `postal_code`, `country`, `description`, `created_at`, `updated_at`, `status`) VALUES
(1, 'LD-001', 1, 'PT Nusantara Ekspres', 'Mr', 'Andi', 'Rahman', 'Andi Rahman', 'Logistics Manager', 'andi@nusantara.com', NULL, '0211234567', '081212345678', '-', 'www.nusantara.com', 'Transportation', 100, 'Website', 'Converted', 'Warm', 'Jl. Merdeka No.1', 'Jakarta', 'DKI Jakarta', '10110', 'Indonesia', 'Tertarik kirim paket antar kota', '2025-07-20 16:31:01', '2025-08-15 02:03:01', 1),
(2, 'LD-002', 2, 'CV Maju Jaya', 'Mr', 'Siti', 'Kartika', 'Siti Kartika', 'Procurement', 'siti@majujaya.co.id', NULL, '0217654321', '082112345678', '-', 'www.majujaya.co.id', 'Retail', 50, 'Referral', 'Converted', 'Hot', 'Jl. Sudirman No.88', 'Bandung', 'Jawa Barat', '40212', 'Indonesia', 'Request penawaran rutin mingguan', '2025-07-20 16:31:01', '2025-08-13 11:20:32', 1),
(18, 'LD-018', NULL, 'PT Berkah Bunda', 'Mr', 'fazry', 'kiedrowsky', 'fazry kiedrowsky', 'CEO', 'fazryganteng@gmail.com', 'berkahbunda@gmail.com', '021-222222', '081907048347', '-', 'https://sman2bekasi.sch.id/', 'Sports', 10000, 'Email Campaign', 'Converted', 'Hot', 'Jl.Pinang Ranti', 'Jakarta Timur', 'Dki Jakarta', '1799', 'Indonesia', NULL, '2025-08-04 07:55:16', '2025-08-13 11:20:32', 1),
(20, 'LD-019', 2, 'PT Insan Abadi', 'Mr', 'Irsyad', 'Gaza', 'Irsyad Gaza', 'CMO', 'Irsyad@gmail.com', 'InsanAbadi@gmail.com', '021-879379', '081979317913', '-', 'https://sman9bekasi.sch.id/', 'Service', 1000, 'Website', 'Converted', 'Hot', 'Jl.Bambu Petung', 'Jakarta Timur', 'DKI Jakarta', '1874', 'Indonesia', NULL, '2025-08-13 04:43:33', '2025-08-15 04:19:59', 1),
(21, 'LD-020', 2, 'PT Irsyad', 'Mr', 'irsyad', 'zufar', 'irsyad zufar', 'Manager', 'irsyadzufar@gmail.com', 'irsyadjaya@gmail.com', '021-55555', '081374372727', '-', 'https://sman9bekasi.sch.id/', 'Soap & Detergent', 1000, 'Website', 'New', 'Hot', 'Jl. Bambu Hitam', 'Jakarta Timur', 'DKI Jakarta', '1835', 'Indonesia', NULL, '2025-08-15 03:08:36', '2025-08-25 05:41:54', 0),
(22, 'LD-021', 5, 'PT Gaming Irsyad', 'Mr', 'irsyad', 'gaming', 'irsyad gaming', 'Ceo', 'gamingirsyad@gmail.com', 'gamingirsyad@gmail.com', '021-22222', '081727979127', '-', 'https://smk19.sch.id/', 'Technology', 40, 'Advertisement', 'Converted', 'Hot', 'Jl. Prestasi Prima', 'Jakarta Timur', 'DKI Jakarta', '18377', 'Indonesia', NULL, '2025-08-15 07:13:49', '2025-08-15 07:28:44', 1),
(23, 'LD-022', 2, 'PT Halilintar', 'Mr', 'thoriqq', 'hanjay', 'thoriqq hanjay', 'Manager', 'thoriq@gmail.com', 'Halilintar@gmail.com', '021-839189', '08190839933', '-', 'https://sman19bekasi.sch.id/', 'Software', 1000, 'Email Campaign', 'Qualification', 'Warm', 'Jl.Bambu Hitam', 'Jakarta Timur', 'DKI Jakarta', '1879', 'Indonesia', NULL, '2025-08-25 02:44:49', '2025-08-29 03:50:14', 0),
(24, 'LD-023', 5, 'PT Susano', 'Mr', 'zufarr', 'susano', 'zufarr susano', 'CTO', 'susano@gmail.com', 'susanooh@gmail.com', '021-81979', '081879137910', NULL, 'https://sman25bekasi.sch.id/', 'Service', 1000, 'Advertisement', 'Converted', 'Hot', 'Jl.Bambu Ungu', 'Jakarta Timur', 'DKI Jakarta', '18012', 'Indonesia', 'nyoh', '2025-08-27 01:13:57', '2025-08-28 03:23:36', 1),
(25, 'LD-024', 2, 'PT Gaza', 'Mr', 'Raya', 'Gaza', 'Raya Gaza', 'Marketing', 'raya@gmail.com', 'gaza@gmail.com', '021-97593', '081465473456', NULL, 'https://maven-ai-webpage.vercel.app', 'Technology', 8095, 'Email Campaign', 'Converted', 'Hot', 'Jl. Yaman', 'Jakarta Timur', 'DKI Jakarta', '18383', 'Indonesia', 'ini dari gede', '2025-08-27 06:29:22', '2025-08-27 06:39:04', 1),
(26, 'LD-025', NULL, NULL, 'Mr', 'Rayzaf', 'Gaza', 'Rayzaf Gaza', NULL, 'rayzan@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-08 04:37:50', '2025-09-08 07:34:52', 0),
(27, 'LD-026', 2, NULL, 'Mr', 'arhan', 'pratama', 'arhan pratama', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Converted', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-09 01:11:40', '2025-09-09 01:12:10', 1),
(28, 'LD-027', 2, NULL, 'Mr', 'irham', 'qodralullah', 'irham qodralullah', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'New', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-09 01:21:41', '2025-09-09 01:21:41', 0);

-- --------------------------------------------------------

--
-- Table structure for table `leads_stage`
--

CREATE TABLE `leads_stage` (
  `id` int NOT NULL,
  `stage_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `remark` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leads_stage`
--

INSERT INTO `leads_stage` (`id`, `stage_name`, `remark`, `status`) VALUES
(1, 'New', 'Baru diinput', 1),
(2, 'Contacted', 'Telah dihubungi', 1),
(3, 'Qualification', 'Memenuhi SOP', 1),
(4, 'Converted', 'Diubah menjadi deals', 1),
(5, 'Unqualified', 'Junk', 1),
(6, 'Proposal', 'Penawaran harga terkirim', 1),
(7, 'Negotiation', 'Negosiasi harga', 1),
(8, 'Won', 'Sepakat', 1),
(9, 'Lost', 'Tidak sepakat', 1);

-- --------------------------------------------------------

--
-- Table structure for table `lead_comments`
--

CREATE TABLE `lead_comments` (
  `id` int NOT NULL,
  `lead_id` int DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `reply_level` int DEFAULT '0',
  `user_id` int DEFAULT NULL,
  `user_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lead_comments`
--

INSERT INTO `lead_comments` (`id`, `lead_id`, `parent_id`, `reply_level`, `user_id`, `user_name`, `message`, `created_at`) VALUES
(2, 2, NULL, 0, 2, 'Sales One', 'Mereka minta quotation 3 bulan untuk Jabodetabek.', '2025-07-19 02:07:23'),
(3, 3, NULL, 0, 2, 'Sales One', 'Masih tahap tanya-tanya, belum minta penawaran.', '2025-07-19 02:07:23'),
(29, 1, NULL, 0, 1, 'Admin User', '@Admin User bismillah ya Allah aku mohon', '2025-08-06 03:56:48'),
(39, 1, 29, 1, 1, 'Admin User', 'angjay', '2025-08-07 04:40:04'),
(44, 1, 29, 1, 1, 'Admin User', 'anjay', '2025-08-07 06:26:58'),
(45, 1, NULL, 0, 1, 'Admin User', 'yo y\'all respect guyss', '2025-08-07 06:27:13'),
(46, 1, 45, 1, 1, 'Admin User', 'crawlll', '2025-08-07 06:27:21'),
(47, 1, 45, 1, 1, 'Admin User', 'data', '2025-08-07 06:59:13'),
(48, 23, NULL, 0, 1, 'Admin User', 'Stage changed from New to Contacted', '2025-08-25 05:45:07'),
(49, 23, NULL, 0, 1, 'Admin User', 'Stage changed from Contacted to New', '2025-08-25 05:45:19'),
(50, 23, NULL, 0, 1, 'Admin User', 'Stage changed from Contacted to New', '2025-08-25 06:57:42'),
(51, 23, NULL, 0, 1, 'Admin User', 'Lead details updated', '2025-08-25 07:20:32'),
(55, 23, NULL, 0, 1, 'Admin User', 'Stage changed from Contacted to New', '2025-08-25 07:31:08'),
(57, 23, NULL, 0, 1, 'Admin User', 'Stage changed from - first_name from \"toriq\" to \"thoriq\"', '2025-08-25 07:37:03'),
(58, 23, NULL, 0, 1, 'Admin User', 'Stage changed from Contacted to Qualification', '2025-08-26 02:41:44'),
(59, 23, NULL, 0, 1, 'Admin User', 'Stage changed from Qualification to New', '2025-08-26 02:42:51'),
(64, 24, NULL, 0, 2, 'Sales One', 'nyoh', '2025-08-27 02:43:15'),
(65, 24, NULL, 0, 2, 'Sales One', 'Lead details updated:\n- Stage changed from \"New\" to \"Contacted\"', '2025-08-27 03:58:10'),
(66, 24, NULL, 0, 2, 'Sales One', 'nsifa', '2025-08-27 04:02:32'),
(67, 24, NULL, 0, 2, 'Sales One', 'Stage changed from Contacted to New', '2025-08-27 04:03:55'),
(69, 24, NULL, 0, 2, 'Sales One', 'Stage changed from New to Contacted', '2025-08-27 06:20:14'),
(77, 24, NULL, 0, 2, 'Sales One', 'Stage changed from Contacted to New', '2025-08-28 01:31:55'),
(78, 24, NULL, 0, 2, 'Sales One', 'Lead details updated:\nStage changed from New to Contacted', '2025-08-28 02:40:25'),
(79, 24, NULL, 0, 2, 'Sales One', 'Lead details updated:\n- first_name has been updated', '2025-08-28 02:42:06'),
(80, 24, NULL, 0, 2, 'Sales One', 'Lead details updated:\nStage changed from Contacted to Qualification', '2025-08-28 03:23:24'),
(81, 23, NULL, 0, 2, 'Sales One', 'Lead details updated:\n- first_name has been updated', '2025-08-28 03:27:26'),
(82, 23, NULL, 0, 2, 'Sales One', 'Stage changed from New to Contacted', '2025-08-28 03:33:06'),
(83, 23, NULL, 0, 2, 'Sales One', 'Stage changed from Contacted to Qualification', '2025-08-29 03:50:14'),
(86, 26, NULL, 0, 2, 'Sales One', 'Lead details updated:\n- first_name has been updated', '2025-09-08 06:56:09'),
(87, 26, NULL, 0, 2, 'Sales One', 'Lead details updated:\n- email has been updated', '2025-09-08 07:34:52');

-- --------------------------------------------------------

--
-- Table structure for table `quotations`
--

CREATE TABLE `quotations` (
  `id` int NOT NULL,
  `deal_id` int DEFAULT NULL,
  `quotation_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quotation_comments`
--

CREATE TABLE `quotation_comments` (
  `id` int NOT NULL,
  `quotation_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `user_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quotation_items`
--

CREATE TABLE `quotation_items` (
  `id` int NOT NULL,
  `quotation_id` int DEFAULT NULL,
  `origin` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `destination` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `price` decimal(18,2) DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quotation_items`
--

INSERT INTO `quotation_items` (`id`, `quotation_id`, `origin`, `destination`, `price`, `remarks`) VALUES
(1, 1, 'Jakarta', 'Surabaya', 5000000.00, '3 kali pengiriman per minggu'),
(2, 1, 'Jakarta', 'Semarang', 4000000.00, 'Tambahan rute seminggu sekali'),
(3, 2, 'Jakarta', 'Bekasi', 3000000.00, '2x per minggu dengan tarif flat');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'admin'),
(3, 'asmen'),
(4, 'gl'),
(2, 'manager'),
(5, 'sales');

-- --------------------------------------------------------

--
-- Table structure for table `sales_kpi_daily`
--

CREATE TABLE `sales_kpi_daily` (
  `id` int NOT NULL,
  `sales_id` int NOT NULL,
  `sales_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `date` date NOT NULL,
  `kanvasing_count` int DEFAULT '0',
  `followup_count` int DEFAULT '0',
  `penawaran_count` int DEFAULT '0',
  `kesepakatan_tarif_count` int DEFAULT '0',
  `deal_do_count` int DEFAULT '0',
  `status_kpi` enum('Terpenuhi','Tidak Terpenuhi') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Tidak Terpenuhi',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_kpi_monthly`
--

CREATE TABLE `sales_kpi_monthly` (
  `id` int NOT NULL,
  `sales_id` int NOT NULL,
  `sales_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `kanvasing_count` int DEFAULT '0',
  `followup_count` int DEFAULT '0',
  `penawaran_count` int DEFAULT '0',
  `kesepakatan_tarif_count` int DEFAULT '0',
  `deal_do_count` int DEFAULT '0',
  `status_kpi` enum('Terpenuhi','Tidak Terpenuhi') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Tidak Terpenuhi',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int NOT NULL,
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lead_id` int NOT NULL,
  `assigned_to` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `category` enum('Kanvasing','Followup','Penawaran','Kesepakatan Tarif','Deal DO','Lainnya') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Kanvasing',
  `due_date` datetime DEFAULT NULL,
  `status` enum('new','pending','completed','overdue','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'new',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `priority` enum('low','medium','high') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'low',
  `created_by` int DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_attachments`
--

CREATE TABLE `task_attachments` (
  `id` int NOT NULL,
  `task_result_id` int NOT NULL,
  `original_filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `stored_filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `file_size` int NOT NULL COMMENT 'Size in bytes',
  `file_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `compressed_size` int DEFAULT NULL COMMENT 'Size after compression in bytes',
  `compression_ratio` decimal(5,2) DEFAULT NULL COMMENT 'Compression percentage',
  `upload_by` int DEFAULT NULL,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task_attachments`
--

INSERT INTO `task_attachments` (`id`, `task_result_id`, `original_filename`, `stored_filename`, `file_path`, `file_size`, `file_type`, `mime_type`, `compressed_size`, `compression_ratio`, `upload_by`, `uploaded_at`) VALUES
(9, 42, '100_7303.JPG', '100_7303_1755747727225_ab904af1c671d9da.JPG', 'uploads\\task-attachments\\100_7303_1755747727225_ab904af1c671d9da.JPG', 219875, 'image', 'image/jpeg', 219875, 1.00, NULL, '2025-08-21 03:42:07');

-- --------------------------------------------------------

--
-- Table structure for table `task_comments`
--

CREATE TABLE `task_comments` (
  `id` int NOT NULL,
  `task_id` int NOT NULL,
  `comment_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `commented_by` int DEFAULT NULL,
  `commented_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task_comments`
--

INSERT INTO `task_comments` (`id`, `task_id`, `comment_text`, `commented_by`, `commented_at`) VALUES
(1, 1, 'Sudah saya follow up, tinggal kirim penawaran.', 2, '2025-07-22 01:20:57'),
(13, 41, 'Task status changed from \"cancelled\" to \"pending\" by Sales One', 2, '2025-08-28 01:45:43'),
(14, 41, 'Task status changed from \"pending\" to \"cancelled\" by Sales One', 2, '2025-08-28 01:46:05'),
(15, 41, 'Task status changed from \"cancelled\" to \"completed\" by Sales One', 2, '2025-08-28 02:40:44'),
(16, 41, 'Task result added with attachments by Sales One: nyoh', 2, '2025-08-28 02:40:54'),
(17, 41, 'Task details updated by Sales One:\n- lead_id changed from \"zufarr susano\" to \"thoriqq hanjay\"\n- title changed from \"tolong euy\" to \"tolong bang\"\n- due_date changed from \"Thu Aug 28 2025 13:50:00 GMT+0700 (Western Indonesia Time)\" to \"2025-08-28T06:50\"', 2, '2025-08-29 06:49:00'),
(18, 42, 'Task details updated by Sales One:\n- category changed from \"Kanvasing\" to \"Followup\"\n- due_date changed from \"Sat Aug 30 2025 13:48:00 GMT+0700 (Western Indonesia Time)\" to \"2025-08-30T06:48\"', 2, '2025-08-29 06:49:24'),
(19, 41, 'Task status changed from \"completed\" to \"pending\" by Sales One', 2, '2025-08-29 07:03:01'),
(20, 41, 'Task result added with attachments by Sales One: nj', 2, '2025-09-08 02:54:17');

-- --------------------------------------------------------

--
-- Table structure for table `task_results`
--

CREATE TABLE `task_results` (
  `id` int NOT NULL,
  `task_id` int NOT NULL,
  `result_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `result_type` enum('meeting','call','email','visit','note') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'note',
  `result_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task_results`
--

INSERT INTO `task_results` (`id`, `task_id`, `result_text`, `result_type`, `result_date`, `created_by`) VALUES
(1, 1, 'Client is interested and asked for a quotation.', 'call', '2025-07-22 01:20:52', 2),
(2, 2, 'apa kek', 'call', '2025-08-12 01:06:47', 1),
(4, 8, 'sudah yah', 'call', '2025-08-15 01:29:18', 1),
(5, 9, 'sudah pak', 'call', '2025-08-15 01:44:45', 1),
(6, 10, 'sudah yah', 'visit', '2025-08-15 02:57:18', 1),
(7, 11, 'sudah ya', 'meeting', '2025-08-15 03:13:06', 1),
(8, 12, 'sudah pak', 'meeting', '2025-08-15 04:03:12', 1),
(9, 13, 'sudah pak', 'email', '2025-08-15 04:13:43', 1),
(10, 14, 'sudah pak laksanakan', 'meeting', '2025-08-15 04:19:31', 1),
(11, 13, 'tolongin', 'call', '2025-08-15 05:53:16', 1),
(12, 15, 'boy', 'call', '2025-08-15 05:53:27', 1),
(13, 16, 'tolong ya', 'note', '2025-08-15 05:53:37', 1),
(14, 17, 'tolong ya', 'note', '2025-08-15 05:53:49', 1),
(15, 18, 'boy tolong', 'note', '2025-08-15 05:53:58', 1),
(16, 19, 'boy tolong', 'note', '2025-08-15 05:54:07', 1),
(17, 20, 'boy tolong', 'call', '2025-08-15 05:54:19', 1),
(18, 21, 'boy udah', 'call', '2025-08-15 05:54:36', 1),
(19, 22, 'udah', 'note', '2025-08-15 05:54:45', 1),
(20, 23, 'udah', 'note', '2025-08-15 05:54:55', 1),
(21, 24, 'udah dah', 'call', '2025-08-15 05:55:06', 1),
(22, 25, 'sudah', 'call', '2025-08-15 06:09:21', 1),
(23, 26, 'bos tolong', 'note', '2025-08-15 06:27:27', 1),
(24, 27, 'bos tolong', 'note', '2025-08-15 06:27:36', 1),
(25, 28, 'bos tolong', 'note', '2025-08-15 06:27:45', 1),
(26, 29, 'bos sudah', 'note', '2025-08-15 06:27:54', 1),
(27, 30, 'sudah bos', 'note', '2025-08-15 06:28:48', 1),
(28, 31, 'sudah mas aman aja', 'note', '2025-08-15 07:16:27', 1),
(29, 32, 'sudah', 'call', '2025-08-15 08:51:10', 1),
(30, 33, 'sudah mas', 'note', '2025-08-18 04:05:46', 1),
(31, 34, 'sudah mas', 'call', '2025-08-18 06:24:07', 1),
(42, 35, 'nyoh', 'call', '2025-08-21 03:42:07', NULL),
(44, 35, 'sayang', 'meeting', '2025-08-21 05:53:02', 2),
(48, 39, 'nyoh', 'note', '2025-08-25 08:40:09', 2),
(49, 39, 'nyoh', 'note', '2025-08-25 08:43:11', 2),
(50, 39, 'noyh', 'note', '2025-08-25 08:45:03', 2),
(51, 39, 'nyoh', 'meeting', '2025-08-25 08:49:36', 2),
(52, 39, 'nyoh', 'meeting', '2025-08-25 08:55:08', 2),
(53, 39, 'nyoh', 'meeting', '2025-08-26 04:32:47', 2),
(54, 39, 'ko', 'note', '2025-08-26 04:34:48', 2),
(55, 40, 'sudah', 'call', '2025-08-27 06:31:17', 2),
(59, 41, 'nj', 'note', '2025-09-08 02:54:17', 2);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `manager_id` int DEFAULT NULL,
  `asmen_id` int DEFAULT NULL,
  `gl_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `manager_id`, `asmen_id`, `gl_id`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'admin@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', NULL, NULL, NULL, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(2, 'Manager Jakarta', 'manager.jakarta@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', NULL, NULL, NULL, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(3, 'Manager Bandung', 'manager.bandung@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', NULL, NULL, NULL, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(4, 'Asmen Jakarta A', 'asmen.jkt.a@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 2, NULL, NULL, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(5, 'Asmen Jakarta B', 'asmen.jkt.b@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 2, NULL, NULL, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(6, 'Asmen Bandung A', 'asmen.bdg.a@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 3, NULL, NULL, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(7, 'GL Jakarta A1', 'gl.jkt.a1@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 2, 4, NULL, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(8, 'GL Jakarta A2', 'gl.jkt.a2@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 2, 4, NULL, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(9, 'GL Jakarta B1', 'gl.jkt.b1@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 2, 5, NULL, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(10, 'GL Bandung A1', 'gl.bdg.a1@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 3, 6, NULL, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(11, 'Sales Jakarta A1-1', 'sales.jkt.a1.1@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 2, 4, 7, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(12, 'Sales Jakarta A1-2', 'sales.jkt.a1.2@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 2, 4, 7, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(13, 'Sales Jakarta A1-3', 'sales.jkt.a1.3@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 2, 4, 7, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(14, 'Sales Jakarta A2-1', 'sales.jkt.a2.1@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 2, 4, 8, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(15, 'Sales Jakarta A2-2', 'sales.jkt.a2.2@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 2, 4, 8, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(16, 'Sales Jakarta B1-1', 'sales.jkt.b1.1@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 2, 5, 9, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(17, 'Sales Jakarta B1-2', 'sales.jkt.b1.2@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 2, 5, 9, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(18, 'Sales Bandung A1-1', 'sales.bdg.a1.1@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 3, 6, 10, '2025-09-10 13:32:00', '2025-09-10 13:32:00'),
(19, 'Sales Bandung A1-2', 'sales.bdg.a1.2@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', 3, 6, 10, '2025-09-10 13:32:00', '2025-09-10 13:32:00');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1),
(2, 2),
(3, 2),
(4, 3),
(5, 3),
(6, 3),
(7, 4),
(8, 4),
(9, 4),
(10, 4),
(11, 5),
(12, 5),
(13, 5),
(14, 5),
(15, 5),
(16, 5),
(17, 5),
(18, 5),
(19, 5);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `approvals`
--
ALTER TABLE `approvals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contract_id` (`contract_id`),
  ADD KEY `approver_id` (`approver_id`);

--
-- Indexes for table `ci_sessions`
--
ALTER TABLE `ci_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ci_sessions_timestamp` (`timestamp`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `idx_lead_id` (`lead_id`);

--
-- Indexes for table `contracts`
--
ALTER TABLE `contracts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quotation_id` (`quotation_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `contract_comments`
--
ALTER TABLE `contract_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contract_id` (`contract_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `contract_items`
--
ALTER TABLE `contract_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contract_id` (`contract_id`);

--
-- Indexes for table `deals`
--
ALTER TABLE `deals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `lead_id` (`lead_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `deals_ibfk_company` (`id_company`),
  ADD KEY `deals_ibfk_contact` (`id_contact`),
  ADD KEY `idx_deals_code` (`code`);

--
-- Indexes for table `deal_comments`
--
ALTER TABLE `deal_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `deal_id` (`deal_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_deal_comments_parent_id` (`parent_id`),
  ADD KEY `idx_deal_comments_deal_parent` (`deal_id`,`parent_id`),
  ADD KEY `deal_comments_deal_id` (`deal_id`),
  ADD KEY `deal_comments_parent_id` (`parent_id`),
  ADD KEY `deal_comments_user_id` (`user_id`),
  ADD KEY `deal_comments_deal_id_parent_id` (`deal_id`,`parent_id`);

--
-- Indexes for table `kpi_targets`
--
ALTER TABLE `kpi_targets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_leads_status` (`status`),
  ADD KEY `idx_leads_code` (`code`);

--
-- Indexes for table `leads_stage`
--
ALTER TABLE `leads_stage`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lead_comments`
--
ALTER TABLE `lead_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_id` (`lead_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_parent_id` (`parent_id`),
  ADD KEY `lead_comments_lead_id` (`lead_id`),
  ADD KEY `lead_comments_parent_id` (`parent_id`),
  ADD KEY `lead_comments_user_id` (`user_id`),
  ADD KEY `lead_comments_lead_id_parent_id` (`lead_id`,`parent_id`);

--
-- Indexes for table `quotations`
--
ALTER TABLE `quotations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `deal_id` (`deal_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `quotation_comments`
--
ALTER TABLE `quotation_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quotation_id` (`quotation_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `quotation_items`
--
ALTER TABLE `quotation_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quotation_id` (`quotation_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `sales_kpi_daily`
--
ALTER TABLE `sales_kpi_daily`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_sales_date` (`sales_id`,`date`),
  ADD KEY `idx_sales_kpi_daily_date` (`date`),
  ADD KEY `idx_sales_kpi_daily_sales` (`sales_id`);

--
-- Indexes for table `sales_kpi_monthly`
--
ALTER TABLE `sales_kpi_monthly`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_sales_month` (`sales_id`,`year`,`month`),
  ADD KEY `idx_sales_kpi_monthly_period` (`year`,`month`),
  ADD KEY `idx_sales_kpi_monthly_sales` (`sales_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_tasks_code` (`code`),
  ADD KEY `idx_tasks_created_by` (`created_by`);

--
-- Indexes for table `task_attachments`
--
ALTER TABLE `task_attachments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `task_attachments_stored_filename` (`stored_filename`),
  ADD KEY `task_result_id` (`task_result_id`),
  ADD KEY `upload_by` (`upload_by`),
  ADD KEY `idx_task_attachments_filename` (`stored_filename`),
  ADD KEY `task_attachments_task_result_id` (`task_result_id`),
  ADD KEY `task_attachments_file_type` (`file_type`),
  ADD KEY `task_attachments_uploaded_at` (`uploaded_at`);

--
-- Indexes for table `task_comments`
--
ALTER TABLE `task_comments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `task_results`
--
ALTER TABLE `task_results`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `manager_id` (`manager_id`),
  ADD KEY `asmen_id` (`asmen_id`),
  ADD KEY `gl_id` (`gl_id`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `approvals`
--
ALTER TABLE `approvals`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `contracts`
--
ALTER TABLE `contracts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `contract_comments`
--
ALTER TABLE `contract_comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `contract_items`
--
ALTER TABLE `contract_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `deals`
--
ALTER TABLE `deals`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `deal_comments`
--
ALTER TABLE `deal_comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `kpi_targets`
--
ALTER TABLE `kpi_targets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `leads_stage`
--
ALTER TABLE `leads_stage`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `lead_comments`
--
ALTER TABLE `lead_comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `quotations`
--
ALTER TABLE `quotations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `quotation_comments`
--
ALTER TABLE `quotation_comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `quotation_items`
--
ALTER TABLE `quotation_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sales_kpi_daily`
--
ALTER TABLE `sales_kpi_daily`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT for table `sales_kpi_monthly`
--
ALTER TABLE `sales_kpi_monthly`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `task_attachments`
--
ALTER TABLE `task_attachments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `task_comments`
--
ALTER TABLE `task_comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `task_results`
--
ALTER TABLE `task_results`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `approvals`
--
ALTER TABLE `approvals`
  ADD CONSTRAINT `approvals_ibfk_1` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `approvals_ibfk_2` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contacts_ibfk_2` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contracts`
--
ALTER TABLE `contracts`
  ADD CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contracts_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contract_comments`
--
ALTER TABLE `contract_comments`
  ADD CONSTRAINT `contract_comments_ibfk_1` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contract_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contract_items`
--
ALTER TABLE `contract_items`
  ADD CONSTRAINT `contract_items_ibfk_1` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `deals`
--
ALTER TABLE `deals`
  ADD CONSTRAINT `deals_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `deals_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `deal_comments`
--
ALTER TABLE `deal_comments`
  ADD CONSTRAINT `deal_comments_ibfk_1` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `deal_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `deal_comments_parent_fk` FOREIGN KEY (`parent_id`) REFERENCES `deal_comments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lead_comments`
--
ALTER TABLE `lead_comments`
  ADD CONSTRAINT `lead_comments_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `lead_comments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quotations`
--
ALTER TABLE `quotations`
  ADD CONSTRAINT `quotations_ibfk_1` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quotations_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quotation_comments`
--
ALTER TABLE `quotation_comments`
  ADD CONSTRAINT `quotation_comments_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sales_kpi_daily`
--
ALTER TABLE `sales_kpi_daily`
  ADD CONSTRAINT `sales_kpi_daily_ibfk_1` FOREIGN KEY (`sales_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sales_kpi_monthly`
--
ALTER TABLE `sales_kpi_monthly`
  ADD CONSTRAINT `sales_kpi_monthly_ibfk_1` FOREIGN KEY (`sales_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `task_attachments`
--
ALTER TABLE `task_attachments`
  ADD CONSTRAINT `task_attachments_ibfk_2` FOREIGN KEY (`upload_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`asmen_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `users_ibfk_3` FOREIGN KEY (`gl_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
