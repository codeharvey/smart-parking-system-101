# Smart Parking Management System

## Overview

This smart parking management system is designed to allow users to reserve parking spots, handle payments, and manage parking slots efficiently. The system also includes user roles, such as Admin and User, and provides functionalities for both users and administrators.

## Features

1. **User Role Management**: Supports both `User` and `Admin` roles.
2. **Parking Spot Management**: Allows admins to create parking spots and manage their availability.
3. **Reservation System**: Users can reserve available parking spots for a specified duration.
4. **Payments**: Secure payment processing for parking reservations, with options to deposit and withdraw funds.
5. **Transaction Logs**: Comprehensive logging of all transactions made by users.
6. **User Authentication**: Basic authentication features for users and admins.

## Data Structures

### Enums

- **UserRole**: Represents the role of a user (`User` or `Admin`).
- **ParkingSlotStatus**: Represents the status of a parking slot (`Available` or `Occupied`).
- **Message**: Enum for handling messages (`Success`, `Error`, `NotFound`, `InvalidPayload`).

### User Structure

- **User**: Holds the details of users including `id`, `username`, `password`, `role`, `email`, `phone_number`, `first_name`, `last_name`, `balance`, and `created_at`.

### ParkingSpot Structure

- **ParkingSpot**: Stores information about parking spots including `id`, `admin_id`, `location`, `status`, `price_per_hour`, `number_of_spots`, and `created_at`.

### Reservation Structure

- **Reservation**: Manages reservation details including `id`, `user_id`, `spot_id`, `reserved_at`, `duration_hours`, `status`, `amount_payable`, and `created_at`.

### Payment Structure

- **Payment**: Stores payment details for reservations including `id`, `reservation_id`, `amount`, `status`, and `created_at`.

### Transaction Structure

- **Transaction**: Logs transaction details including `user_id`, `amount`, `fee`, and `timestamp`.

### Payloads

- **UserPayload**: Represents the payload required for creating a user.
- **ParkingSpotPayload**: Represents the payload for creating a parking spot.
- **ReservationPayload**: Represents the payload for making a reservation.
- **PaymentPayload**: Represents the payload for processing payments.
- **WithdrawalPayload**: Represents the payload for depositing and withdrawing funds.
- **ChangeUserRolePayload**: Represents the payload for changing user roles.
- **IsAuthenticatedPayload**: Used for authentication purposes.

## Functions

### User Management

- **createAdmin**: Creates an admin user.
- **createUser**: Creates a regular user.
- **getAdmins**: Retrieves all admin users.
- **getUsers**: Retrieves all users.
- **getUserById**: Fetches a user by ID.

### Parking Spot Management

- **createParkingSpot**: Allows admins to create parking spots.
- **getParkingSpots**: Retrieves all parking spots.
- **getParkingSpotByLocation**: Fetches a parking spot by its location.
- **getAvailableParkingSpots**: Retrieves all available parking spots.

### Reservation Management

- **createReservation**: Allows users to reserve parking spots.
- **getReservations**: Retrieves all reservations.

### Payment Processing

- **createPayment**: Processes a payment for a reservation.
- **getPayments**: Retrieves all payments.

### Funds Management

- **depositFunds**: Allows users to deposit funds into their account.
- **withdrawFunds**: Allows users to withdraw funds from their account.

### Transaction Logs

- **getTransactions**: Retrieves all transactions.
- **getTransactionByTimestamp**: Fetches a transaction by its timestamp.
- **getUserTransactions**: Retrieves all transactions for a specific user.

## Installation

1. Clone this repository.
2. Install required dependencies for Azle.
3. Deploy the canister using the Azle framework.

## Usage

- Admins can create parking spots and manage users.
- Users can reserve parking spots and manage payments.
- Payments can be processed and logged securely.

## Things to be explained in the course:

1. What is Ledger? More details here: https://internetcomputer.org/docs/current/developer-docs/integrations/ledger/
2. What is Internet Identity? More details here: https://internetcomputer.org/internet-identity
3. What is Principal, Identity, Address? https://internetcomputer.org/internet-identity | https://yumimarketplace.medium.com/whats-the-difference-between-principal-id-and-account-id-3c908afdc1f9
4. Canister-to-canister communication and how multi-canister development is done? https://medium.com/icp-league/explore-backend-multi-canister-development-on-ic-680064b06320
