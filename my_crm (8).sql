-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 14, 2025 at 07:06 AM
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

--
-- Dumping data for table `approvals`
--

INSERT INTO `approvals` (`id`, `contract_id`, `approver_id`, `role`, `status`, `approved_at`) VALUES
(1, 1, 3, 'partnership', 'approved', '2025-07-19 02:07:35'),
(2, 1, 4, 'akunting', 'approved', '2025-07-19 02:07:35'),
(3, 2, 3, 'partnership', 'approved', '2025-07-19 02:07:35');

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
(16, 'PT Exatama', 'Jl Hj Liah, Jakarta Timur, DKI Jakarta, 82392', '021-728733', 'Exatama@gmail.com', '2025-08-08 07:03:27');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int NOT NULL,
  `company_id` int DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `position` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `company_id`, `name`, `email`, `phone`, `position`, `created_at`) VALUES
(1, 1, 'Budi Santoso', 'budi@majujaya.com', '08123456789', 'Purchasing', '2025-07-19 02:00:24'),
(2, 2, 'Dewi Lestari', 'dewi@berkahabadi.co.id', '082112345678', 'Owner', '2025-07-19 02:00:24'),
(3, 3, 'Rudi Hartono', 'rudi@sumberrejeki.com', '081298765432', 'Manager Operasional', '2025-07-19 02:00:24'),
(7, 7, 'fazry irawan', 'fazryalgaza267@gmail.com', '0819091792', 'ceo', '2025-08-02 13:50:52'),
(8, 8, 'fazry gaza', 'agusnugraha@gmail.com', '081920821033', 'cto', '2025-08-02 14:02:23'),
(9, 10, 'Zufar Fazry', 'zeerayzan@gmail.com', '081397193345', 'cto', '2025-08-02 14:35:40'),
(11, 12, 'Andi Rahman', 'andi@nusantara.com', '081212345678', 'Logistics Manager', '2025-08-02 15:10:43'),
(12, 13, 'Siti Kartika', 'siti@majujaya.co.id', '082112345678', 'Procurement', '2025-08-02 15:17:22'),
(13, 15, 'fazry kiedrowsky', 'fazryganteng@gmail.com', '081907048347', 'CEO', '2025-08-04 07:56:21');

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

--
-- Dumping data for table `contracts`
--

INSERT INTO `contracts` (`id`, `quotation_id`, `contract_number`, `status`, `start_date`, `end_date`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'CT-2025-0001', 'active', '2025-08-01', '2026-07-31', 2, '2025-07-19 02:07:35', '2025-07-19 02:07:35'),
(2, 2, 'CT-2025-0002', 'pending_approval', '2025-08-01', '2025-10-31', 2, '2025-07-19 02:07:35', '2025-07-19 02:07:35');

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

--
-- Dumping data for table `contract_comments`
--

INSERT INTO `contract_comments` (`id`, `contract_id`, `user_id`, `user_name`, `message`, `created_at`) VALUES
(1, 1, 3, 'Partnership One', 'Sudah review, partnership OK.', '2025-07-19 02:07:35'),
(2, 1, 4, 'Akunting One', 'Harga sudah sesuai budget, disetujui.', '2025-07-19 02:07:35'),
(3, 2, 3, 'Partnership One', 'Kontrak 3 bulan disetujui, tinggal tunggu akunting.', '2025-07-19 02:07:35');

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

--
-- Dumping data for table `contract_items`
--

INSERT INTO `contract_items` (`id`, `contract_id`, `origin`, `destination`, `price`, `remarks`) VALUES
(1, 1, 'Jakarta', 'Surabaya', 5000000.00, 'Kontrak tahunan fix rate'),
(2, 1, 'Jakarta', 'Semarang', 4000000.00, 'Kontrak tahunan rute tambahan'),
(3, 2, 'Jakarta', 'Bekasi', 3000000.00, '3 bulan kontrak');

-- --------------------------------------------------------

--
-- Table structure for table `deals`
--

CREATE TABLE `deals` (
  `id` int NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
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

--
-- Dumping data for table `deals`
--

INSERT INTO `deals` (`id`, `code`, `lead_id`, `id_contact`, `id_company`, `title`, `value`, `stage`, `owner`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'DL-001', 1, NULL, NULL, 'Deal Pengiriman Reguler', 15000000.00, 'won', 0, 2, '2025-07-19 02:07:35', '2025-07-31 03:06:24'),
(2, 'DL-002', 2, NULL, NULL, 'Deal Kontrak Jabodetabek', 9000000.00, 'lost', 0, 2, '2025-07-19 02:07:35', '2025-07-30 08:45:38'),
(29, 'DL-029', 18, 13, 15, 'wish me luck', 60000.00, 'negotiation', 0, 1, '2025-08-04 07:56:21', '2025-08-12 03:14:05');

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
) ;

--
-- Dumping data for table `deal_comments`
--

INSERT INTO `deal_comments` (`id`, `deal_id`, `parent_id`, `reply_level`, `user_id`, `user_name`, `message`, `created_at`) VALUES
(2, 2, NULL, 0, 2, 'Sales One', 'Quotation sudah dikirim, nunggu approval owner.', '2025-07-19 02:07:35'),
(3, 29, NULL, 0, 1, 'Admin User', 'nyoh', '2025-08-07 08:28:17'),
(4, 2, 2, 1, 1, 'Admin User', 'aman bg', '2025-08-12 01:57:16');

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
(1, 'daily', 5, 5, 1, 1, 1, 1, '2025-08-14 11:58:27', '2025-08-14 11:58:27'),
(2, 'monthly', 150, 150, 30, 30, 30, 1, '2025-08-14 11:58:27', '2025-08-14 11:58:27');

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` int NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `owner` int DEFAULT NULL,
  `company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `title` enum('Mr','Ms','Mrs') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Mr',
  `first_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fullname` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `job_position` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `work_email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
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
(1, 'LD-001', 1, 'PT Nusantara Ekspres', 'Mr', 'Andi', 'Rahman', 'Andi Rahman', 'Logistics Manager', 'andi@nusantara.com', NULL, '0211234567', '081212345678', '-', 'www.nusantara.com', 'Transportation', 100, 'Website', 'Converted', 'Warm', 'Jl. Merdeka No.1', 'Jakarta', 'DKI Jakarta', '10110', 'Indonesia', 'Tertarik kirim paket antar kota', '2025-07-20 16:31:01', '2025-08-13 11:20:32', 0),
(2, 'LD-002', 2, 'CV Maju Jaya', 'Mr', 'Siti', 'Kartika', 'Siti Kartika', 'Procurement', 'siti@majujaya.co.id', NULL, '0217654321', '082112345678', '-', 'www.majujaya.co.id', 'Retail', 50, 'Referral', 'Converted', 'Hot', 'Jl. Sudirman No.88', 'Bandung', 'Jawa Barat', '40212', 'Indonesia', 'Request penawaran rutin mingguan', '2025-07-20 16:31:01', '2025-08-13 11:20:32', 1),
(18, 'LD-018', NULL, 'PT Berkah Bunda', 'Mr', 'fazry', 'kiedrowsky', 'fazry kiedrowsky', 'CEO', 'fazryganteng@gmail.com', 'berkahbunda@gmail.com', '021-222222', '081907048347', '-', 'https://sman2bekasi.sch.id/', 'Sports', 10000, 'Email Campaign', 'Converted', 'Hot', 'Jl.Pinang Ranti', 'Jakarta Timur', 'Dki Jakarta', '1799', 'Indonesia', NULL, '2025-08-04 07:55:16', '2025-08-13 11:20:32', 1),
(20, 'LD-019', NULL, 'PT Insan Abadi', 'Mr', 'Irsyad', 'Gaza', 'Irsyad Gaza', 'CMO', 'Irsyad@gmail.com', 'InsanAbadi@gmail.com', '021-879379', '081979317913', '-', 'https://sman9bekasi.sch.id/', 'Service', 1000, 'Website', 'New', 'Hot', 'Jl.Bambu Petung', 'Jakarta Timur', 'DKI Jakarta', '1874', 'Indonesia', NULL, '2025-08-13 04:43:33', '2025-08-13 04:43:33', 0);

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
(47, 1, 45, 1, 1, 'Admin User', 'data', '2025-08-07 06:59:13');

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

--
-- Dumping data for table `quotations`
--

INSERT INTO `quotations` (`id`, `deal_id`, `quotation_number`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'QO-2025-0001', 'sent', 2, '2025-07-19 02:07:35', '2025-07-19 02:07:35'),
(2, 2, 'QO-2025-0002', 'sent', 2, '2025-07-19 02:07:35', '2025-07-19 02:07:35');

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

--
-- Dumping data for table `quotation_comments`
--

INSERT INTO `quotation_comments` (`id`, `quotation_id`, `user_id`, `user_name`, `message`, `created_at`) VALUES
(1, 1, 2, 'Sales One', 'Quotation dikirim via email.', '2025-07-19 02:07:35'),
(2, 2, 2, 'Sales One', 'Quotation ditandatangani owner, akan dibuat kontrak.', '2025-07-19 02:07:35');

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
(4, 'akunting'),
(3, 'partnership'),
(2, 'sales');

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
  `code` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lead_id` int NOT NULL,
  `assigned_to` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `category` enum('Kanvasing','Followup','Penawaran','Lainnya') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Kanvasing',
  `due_date` datetime DEFAULT NULL,
  `status` enum('new','pending','completed','overdue','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'new',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `priority` enum('low','medium','high') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'low',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `code`, `lead_id`, `assigned_to`, `title`, `description`, `category`, `due_date`, `status`, `created_at`, `priority`, `updated_at`) VALUES
(1, 'TK-001', 1, 2, 'Follow up call', 'Call the client to confirm interest.', 'Kanvasing', '2025-07-25 14:00:00', 'completed', '2025-07-22 01:20:50', 'low', '2025-08-13 11:20:32'),
(2, 'TK-002', 1, 3, 'tolong dong perbaikin tv aing', 'anjayyyy', 'Lainnya', '2025-08-06 08:02:00', 'completed', '2025-08-06 08:02:40', 'high', '2025-08-13 11:20:32'),
(3, 'TK-003', 1, 2, 'anjay', 'tolong hubungi', 'Followup', '2025-08-12 01:10:00', 'completed', '2025-08-12 01:10:37', 'high', '2025-08-13 11:20:32'),
(8, 'TK-004', 20, 6, 'tolong dong', 'tolong ya', 'Followup', '2025-08-13 04:49:00', 'completed', '2025-08-13 04:49:28', 'medium', '2025-08-13 07:58:39');

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
(1, 1, 'Sudah saya follow up, tinggal kirim penawaran.', 2, '2025-07-22 01:20:57');

-- --------------------------------------------------------

--
-- Table structure for table `task_kpi_logs`
--

CREATE TABLE `task_kpi_logs` (
  `id` int NOT NULL,
  `task_id` int NOT NULL,
  `user_id` int NOT NULL,
  `category` enum('Kanvasing','Followup','Penawaran','Lainnya') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `kpi_category` enum('kanvasing','followup','penawaran','kesepakatan_tarif','deal_do') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `action_date` date NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(2, 2, 'apa kek', 'call', '2025-08-12 01:06:47', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'admin@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', '2025-07-19 02:03:29', '2025-07-19 02:03:29'),
(2, 'Sales One', 'sales1@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', '2025-07-19 02:03:29', '2025-07-19 02:03:29'),
(3, 'Partnership One', 'partner1@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', '2025-07-19 02:03:29', '2025-07-19 02:03:29'),
(4, 'Akunting One', 'finance1@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', '2025-07-19 02:03:29', '2025-07-19 02:03:29'),
(5, 'Sales Two', 'sales2@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', '2025-07-19 02:03:29', '2025-07-19 02:03:29'),
(6, 'GL One', 'gl1@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', '2025-07-19 02:03:29', '2025-07-19 02:03:29'),
(7, 'ASM One', 'asm1@eureka.com', '0ad80eb119d9bf7775aa23786b05b391', '2025-07-19 02:03:29', '2025-07-19 02:03:29');

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
(3, 3),
(4, 4);

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
  ADD KEY `company_id` (`company_id`);

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
  ADD KEY `idx_deal_comments_deal_parent` (`deal_id`,`parent_id`);

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
  ADD KEY `idx_parent_id` (`parent_id`);

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
  ADD KEY `idx_tasks_code` (`code`);

--
-- Indexes for table `task_comments`
--
ALTER TABLE `task_comments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `task_kpi_logs`
--
ALTER TABLE `task_kpi_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_task_kpi_logs_date` (`action_date`),
  ADD KEY `idx_task_kpi_logs_user` (`user_id`),
  ADD KEY `idx_task_kpi_logs_task` (`task_id`);

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
  ADD UNIQUE KEY `email` (`email`);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `deal_comments`
--
ALTER TABLE `deal_comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kpi_targets`
--
ALTER TABLE `kpi_targets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `leads_stage`
--
ALTER TABLE `leads_stage`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `lead_comments`
--
ALTER TABLE `lead_comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sales_kpi_daily`
--
ALTER TABLE `sales_kpi_daily`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_kpi_monthly`
--
ALTER TABLE `sales_kpi_monthly`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `task_comments`
--
ALTER TABLE `task_comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `task_kpi_logs`
--
ALTER TABLE `task_kpi_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `task_results`
--
ALTER TABLE `task_results`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `approvals`
--
ALTER TABLE `approvals`
  ADD CONSTRAINT `approvals_ibfk_1` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`),
  ADD CONSTRAINT `approvals_ibfk_2` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Constraints for table `contracts`
--
ALTER TABLE `contracts`
  ADD CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`),
  ADD CONSTRAINT `contracts_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `contract_comments`
--
ALTER TABLE `contract_comments`
  ADD CONSTRAINT `contract_comments_ibfk_1` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`),
  ADD CONSTRAINT `contract_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `contract_items`
--
ALTER TABLE `contract_items`
  ADD CONSTRAINT `contract_items_ibfk_1` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`);

--
-- Constraints for table `deals`
--
ALTER TABLE `deals`
  ADD CONSTRAINT `deals_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`),
  ADD CONSTRAINT `deals_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `deals_ibfk_company` FOREIGN KEY (`id_company`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `deals_ibfk_contact` FOREIGN KEY (`id_contact`) REFERENCES `contacts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `deal_comments`
--
ALTER TABLE `deal_comments`
  ADD CONSTRAINT `deal_comments_ibfk_1` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`),
  ADD CONSTRAINT `deal_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
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
  ADD CONSTRAINT `quotations_ibfk_1` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`),
  ADD CONSTRAINT `quotations_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

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
-- Constraints for table `task_kpi_logs`
--
ALTER TABLE `task_kpi_logs`
  ADD CONSTRAINT `task_kpi_logs_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_kpi_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
