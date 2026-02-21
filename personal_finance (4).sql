-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 21, 2026 at 09:42 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `personal_finance`
--

-- --------------------------------------------------------

--
-- Table structure for table `AllocationTemplates`
--

CREATE TABLE `AllocationTemplates` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL DEFAULT 1,
  `name` varchar(60) DEFAULT 'default',
  `essentials_pct` decimal(5,2) NOT NULL DEFAULT 50.00,
  `emergency_pct` decimal(5,2) NOT NULL DEFAULT 15.00,
  `invest_pct` decimal(5,2) NOT NULL DEFAULT 25.00,
  `discretionary_pct` decimal(5,2) NOT NULL DEFAULT 10.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `AllocationTemplates`
--

INSERT INTO `AllocationTemplates` (`id`, `user_id`, `name`, `essentials_pct`, `emergency_pct`, `invest_pct`, `discretionary_pct`, `created_at`, `updated_at`) VALUES
(1, 1, 'default', 50.00, 15.00, 25.00, 10.00, '2026-02-16 09:59:52', '2026-02-19 09:04:57');

-- --------------------------------------------------------

--
-- Table structure for table `DailyExpense`
--

CREATE TABLE `DailyExpense` (
  `id` int(11) NOT NULL,
  `expenseDate` date NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `amount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DailyGratitude`
--

CREATE TABLE `DailyGratitude` (
  `id` int(11) NOT NULL,
  `reflection` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `DailyGratitude`
--

INSERT INTO `DailyGratitude` (`id`, `reflection`, `created_at`) VALUES
(1, 'Having not drunk booze\n', '2026-02-01 09:44:59'),
(2, 'Being alive\n', '2026-02-02 15:54:01'),
(3, '@ow', '2026-02-16 21:43:08');

-- --------------------------------------------------------

--
-- Table structure for table `EmergencyFund`
--

CREATE TABLE `EmergencyFund` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL DEFAULT 1,
  `target_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `current_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `recommended_pct` decimal(5,2) DEFAULT 15.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `EmergencyFund`
--

INSERT INTO `EmergencyFund` (`id`, `user_id`, `target_amount`, `current_amount`, `recommended_pct`, `updated_at`) VALUES
(1, 1, 0.00, 165040.00, 15.00, '2026-02-16 11:17:14');

-- --------------------------------------------------------

--
-- Table structure for table `MonthlyBudget`
--

CREATE TABLE `MonthlyBudget` (
  `id` int(11) NOT NULL,
  `salary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `otherIncome` decimal(12,2) NOT NULL DEFAULT 0.00,
  `rent` decimal(12,2) NOT NULL DEFAULT 0.00,
  `schoolSaving` decimal(12,2) NOT NULL DEFAULT 0.00,
  `phoneInternet` decimal(12,2) NOT NULL DEFAULT 0.00,
  `electricityWater` decimal(12,2) NOT NULL DEFAULT 0.00,
  `food` decimal(12,2) NOT NULL DEFAULT 0.00,
  `miscellaneous` decimal(15,2) DEFAULT 0.00,
  `medical` decimal(12,2) NOT NULL DEFAULT 0.00,
  `familySupport` decimal(12,2) NOT NULL DEFAULT 0.00,
  `emergencyFund` decimal(12,2) NOT NULL DEFAULT 0.00,
  `investment` decimal(12,2) NOT NULL DEFAULT 0.00,
  `balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `translatedLetters` int(11) DEFAULT 0,
  `recommendedEssentials` decimal(15,2) DEFAULT 0.00,
  `recommendedEmergency` decimal(15,2) DEFAULT 0.00,
  `recommendedInvest` decimal(15,2) DEFAULT 0.00,
  `recommendedDiscretionary` decimal(15,2) DEFAULT 0.00,
  `shiftLetters` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `MonthlyBudget`
--

INSERT INTO `MonthlyBudget` (`id`, `salary`, `otherIncome`, `rent`, `schoolSaving`, `phoneInternet`, `electricityWater`, `food`, `miscellaneous`, `medical`, `familySupport`, `emergencyFund`, `investment`, `balance`, `month`, `year`, `translatedLetters`, `recommendedEssentials`, `recommendedEmergency`, `recommendedInvest`, `recommendedDiscretionary`, `shiftLetters`) VALUES
(1, 33350.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 26000.00, 0.00, 7350.00, 1, 2026, 145, 115000.00, 34500.00, 57500.00, 23000.00, 145);

-- --------------------------------------------------------

--
-- Table structure for table `SavingsGoal`
--

CREATE TABLE `SavingsGoal` (
  `id` int(11) NOT NULL,
  `goalName` varchar(100) NOT NULL,
  `targetAmount` int(11) NOT NULL,
  `currentSaved` int(11) DEFAULT 0,
  `remaining` int(11) DEFAULT 0,
  `progress` float DEFAULT 0,
  `status` varchar(20) DEFAULT 'In progress'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `SavingsGoal`
--

INSERT INTO `SavingsGoal` (`id`, `goalName`, `targetAmount`, `currentSaved`, `remaining`, `progress`, `status`) VALUES
(1, 'Emergency Fund', 500000, 0, 500000, 0, 'In progress'),
(2, 'School Fees Buffer', 250000, 0, 250000, 0, 'In progress'),
(3, 'Business Capital', 1000000, 0, 1000000, 0, 'In progress');

-- --------------------------------------------------------

--
-- Table structure for table `SchoolFees`
--

CREATE TABLE `SchoolFees` (
  `id` int(11) NOT NULL,
  `month` varchar(10) NOT NULL,
  `amountSaved` int(11) DEFAULT 0,
  `cumulative` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `AllocationTemplates`
--
ALTER TABLE `AllocationTemplates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_unique` (`user_id`);

--
-- Indexes for table `DailyExpense`
--
ALTER TABLE `DailyExpense`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `DailyGratitude`
--
ALTER TABLE `DailyGratitude`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `EmergencyFund`
--
ALTER TABLE `EmergencyFund`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `MonthlyBudget`
--
ALTER TABLE `MonthlyBudget`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_month_year` (`month`,`year`);

--
-- Indexes for table `SavingsGoal`
--
ALTER TABLE `SavingsGoal`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `SchoolFees`
--
ALTER TABLE `SchoolFees`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `AllocationTemplates`
--
ALTER TABLE `AllocationTemplates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `DailyExpense`
--
ALTER TABLE `DailyExpense`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `DailyGratitude`
--
ALTER TABLE `DailyGratitude`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `EmergencyFund`
--
ALTER TABLE `EmergencyFund`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `MonthlyBudget`
--
ALTER TABLE `MonthlyBudget`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `SavingsGoal`
--
ALTER TABLE `SavingsGoal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `SchoolFees`
--
ALTER TABLE `SchoolFees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
