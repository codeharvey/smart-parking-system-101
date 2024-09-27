import {
  query,
  update,
  text,
  Null,
  Record,
  StableBTreeMap,
  Variant,
  Vec,
  Ok,
  Err,
  ic,
  nat64,
  Result,
  Canister,
} from "azle";
import { v4 as uuidv4 } from "uuid";

// User Role Enum
const UserRole = Variant({
  User: Null,
  Admin: Null,
});

// Parking Slot Status Enum
const ParkingSlotStatus = Variant({
  Available: Null,
  Occupied: Null,
});

// User struct
const User = Record({
  id: text,
  username: text,
  password: text,
  role: UserRole,
  email: text,
  phone_number: text,
  first_name: text,
  last_name: text,
  balance: nat64,
  created_at: nat64,
});

// ParkingSpot struct
const ParkingSpot = Record({
  id: text,
  admin_id: text,
  location: text,
  status: ParkingSlotStatus,
  price_per_hour: text,
  number_of_spots: nat64,
  created_at: nat64,
});

// Reservation struct
const Reservation = Record({
  id: text,
  user_id: text,
  spot_id: text,
  reserved_at: nat64,
  duration_hours: nat64,
  status: text,
  amount_payable: text,
  created_at: nat64,
});

// Payment struct
const Payment = Record({
  id: text,
  reservation_id: text,
  amount: text,
  status: text,
  created_at: nat64,
});

// Transaction struct
const Transaction = Record({
  user_id: text,
  amount: text,
  fee: text,
  timestamp: nat64,
});

// Payload Structs
const UserPayload = Record({
  username: text,
  password: text,
  email: text,
  phone_number: text,
  first_name: text,
  last_name: text,
});

const ParkingSpotPayload = Record({
  admin_id: text,
  number_of_spots: nat64,
  location: text,
  price_per_hour: text,
});

// Reservation Payload
const ReservationPayload = Record({
  user_id: text,
  spot_id: text,
  duration_hours: nat64,
});

const PaymentPayload = Record({
  reservation_id: text,
  amount: text,
});

const WithdrawalPayload = Record({
  user_id: text,
  amount: text,
});

const ChangeUserRolePayload = Record({
  user_id: text,
  role: UserRole,
});

const IsAuthenticatedPayload = Record({
  user_id: text,
  password: text,
});

// Message Enum
const Message = Variant({
  Success: text,
  Error: text,
  NotFound: text,
  InvalidPayload: text,
});

// Storage initialization
const userStorage = StableBTreeMap(0, text, User);
const parkingSpotStorage = StableBTreeMap(1, text, ParkingSpot);
const reservationStorage = StableBTreeMap(2, text, Reservation);
const paymentStorage = StableBTreeMap(3, text, Payment);
const transactionLog = StableBTreeMap(4, text, Transaction);

// Canister Declaration
export default Canister({
  // Create Admin User
  createAdmin: update([UserPayload], Result(User, Message), (payload) => {
    // Validate payload fields
    if (!payload.username || !payload.password || !payload.email) {
      return Err({ InvalidPayload: "Required fields missing" });
    }

    const userId = uuidv4();
    const user = {
      id: userId,
      ...payload,
      role: { Admin: null },
      balance: BigInt(0),
      created_at: ic.time(),
    };

    userStorage.insert(userId, user);
    return Ok(user);
  }),

  // Create User
  createUser: update([UserPayload], Result(User, Message), (payload) => {
    // Validate payload fields
    if (!payload.username || !payload.password || !payload.email) {
      return Err({ InvalidPayload: "Required fields missing" });
    }

    const userId = uuidv4();
    const user = {
      id: userId,
      ...payload,
      role: { User: null },
      balance: BigInt(0),
      created_at: ic.time(),
    };

    userStorage.insert(userId, user);
    return Ok(user);
  }),

  // Get Admin Users
  getAdmins: query([], Result(Vec(User), Message), () => {
    const admins = userStorage.values().filter((user) => user.role.Admin);
    if (admins.length === 0) {
      return Err({ NotFound: "No admins found" });
    }
    return Ok(admins);
  }),

  // Get Users
  getUsers: query([], Result(Vec(User), Message), () => {
    const users = userStorage.values();
    if (users.length === 0) {
      return Err({ NotFound: "No users found" });
    }
    return Ok(users);
  }),

  // Get User by ID
  getUserById: query([text], Result(User, Message), (id) => {
    const userOpt = userStorage.get(id);
    if ("None" in userOpt) {
      return Err({ NotFound: "User not found" });
    }
    return Ok(userOpt.Some);
  }),

  // Create Parking Spot
  createParkingSpot: update(
    [ParkingSpotPayload],
    Result(ParkingSpot, Message),
    (payload) => {
      if (!payload.admin_id || !payload.location) {
        return Err({ InvalidPayload: "Missing required fields" });
      }

      const spotId = uuidv4();
      const parkingSpot = {
        id: spotId,
        ...payload,
        status: { Available: null },
        created_at: ic.time(),
      };

      parkingSpotStorage.insert(spotId, parkingSpot);
      return Ok(parkingSpot);
    }
  ),

  // Get Parking Spots
  getParkingSpots: query([], Result(Vec(ParkingSpot), Message), () => {
    const spots = parkingSpotStorage.values();
    if (spots.length === 0) {
      return Err({ NotFound: "No parking spots found" });
    }
    return Ok(spots);
  }),

  // Get Parking Spot by Location
  getParkingSpotByLocation: query(
    [text],
    Result(ParkingSpot, Message),
    (location) => {
      const spot = parkingSpotStorage
        .values()
        .find((spot) => spot.location === location);
      if (!spot) {
        return Err({ NotFound: "Parking spot not found" });
      }
      return Ok(spot);
    }
  ),

  //n Get Available Parking Spots
  getAvailableParkingSpots: query([], Result(Vec(ParkingSpot), Message), () => {
    const spots = parkingSpotStorage
      .values()
      .filter((spot) => spot.status.Available);
    if (spots.length === 0) {
      return Err({ NotFound: "No available parking spots found" });
    }
    return Ok(spots);
  }),

  // Create Reservation
  createReservation: update(
    [ReservationPayload],
    Result(Reservation, Message),
    (payload) => {
      const userOpt = userStorage.get(payload.user_id);
      if ("None" in userOpt) {
        return Err({ NotFound: "User not found" });
      }

      const spotOpt = parkingSpotStorage.get(payload.spot_id);
      if ("None" in spotOpt) {
        return Err({ NotFound: "Parking spot not found" });
      }

      const spot = spotOpt.Some;
      if (BigInt(spot.number_of_spots) === 0n) {
        return Err({ InvalidPayload: "No available parking spots" });
      }

      const reservationId = uuidv4();
      const amountPayable = `${
        parseFloat(spot.price_per_hour) * Number(payload.duration_hours)
      }`;

      // Create reservation and include amount payable
      const reservation = {
        id: reservationId,
        ...payload,
        reserved_at: ic.time(),
        amount_payable: amountPayable,
        status: "reserved",
        created_at: ic.time(),
      };

      reservationStorage.insert(reservationId, reservation);
      return Ok(reservation);
    }
  ),

  // Get Reservations
  getReservations: query([], Result(Vec(Reservation), Message), () => {
    const reservations = reservationStorage.values();
    if (reservations.length === 0) {
      return Err({ NotFound: "No reservations found" });
    }
    return Ok(reservations);
  }),

  // Create Payment
  createPayment: update(
    [PaymentPayload],
    Result(Payment, Message),
    (payload) => {
      if (parseFloat(payload.amount) <= 0) {
        return Err({ InvalidPayload: "Amount must be greater than zero" });
      }

      const reservationOpt = reservationStorage.get(payload.reservation_id);
      if ("None" in reservationOpt) {
        return Err({ NotFound: "Reservation not found" });
      }

      // Ensure the amount is equal to the amount payable
      const reservation = reservationOpt.Some;

      if (
        parseFloat(reservation.amount_payable) !== parseFloat(payload.amount)
      ) {
        return Err({
          InvalidPayload: "Amount does not match the amount payable",
        });
      }

      // Ensure the user has enough balance
      const userOpt = userStorage.get(reservation.user_id);

      if ("None" in userOpt) {
        return Err({ NotFound: "User not found" });
      }

      const user = userOpt.Some;

      if (BigInt(user.balance) < BigInt(payload.amount)) {
        return Err({ Error: "Insufficient balance" });
      }

      // Subtract the amount from the user's balance
      user.balance -= BigInt(payload.amount);

      const paymentId = uuidv4();
      const payment = {
        id: paymentId,
        reservation_id: payload.reservation_id,
        amount: payload.amount,
        status: "completed",
        created_at: ic.time(),
      };

      userStorage.insert(reservation.user_id, user);

      paymentStorage.insert(paymentId, payment);
      return Ok(payment);
    }
  ),

  // Get Payments
  getPayments: query([], Result(Vec(Payment), Message), () => {
    const payments = paymentStorage.values();
    if (payments.length === 0) {
      return Err({ NotFound: "No payments found" });
    }
    return Ok(payments);
  }),

  // Deposit Funds
  depositFunds: update(
    [WithdrawalPayload],
    Result(Message, Message),
    (payload) => {
      const userOpt = userStorage.get(payload.user_id);
      if ("None" in userOpt) {
        return Err({ NotFound: "User not found" });
      }

      let user = userOpt.Some;
      user.balance += BigInt(payload.amount);

      userStorage.insert(payload.user_id, user);

      // Log the transaction
      const transaction = {
        user_id: payload.user_id,
        amount: `${payload.amount}`,
        fee: "0",
        timestamp: ic.time(),
      };
      transactionLog.insert(ic.time().toString(), transaction);

      return Ok({ Success: "Deposit successful" });
    }
  ),

  // Withdraw Funds
  withdrawFunds: update(
    [WithdrawalPayload],
    Result(Message, Message),
    (payload) => {
      const userOpt = userStorage.get(payload.user_id);
      if ("None" in userOpt) {
        return Err({ NotFound: "User not found" });
      }

      let user = userOpt.Some;

      if (BigInt(user.balance) < BigInt(payload.amount)) {
        return Err({ Error: "Insufficient balance" });
      }

      // Adjusted logic for fee calculation using bigint
      const fee = (BigInt(payload.amount) * 1n) / 100n;
      const amountAfterFee = BigInt(payload.amount) - fee;

      user.balance -= amountAfterFee;

      userStorage.insert(payload.user_id, user);

      // Log the transaction
      const transaction = {
        user_id: payload.user_id,
        amount: `${payload.amount}`,
        fee: `${fee}`,
        timestamp: ic.time(),
      };
      transactionLog.insert(ic.time().toString(), transaction);

      return Ok({ Success: `Withdrawal successful. Fee applied: ${fee}` });
    }
  ),

  // Change User Role
  changeUserRole: update(
    [ChangeUserRolePayload],
    Result(User, Message),
    (payload) => {
      const userOpt = userStorage.get(payload.user_id);
      if ("None" in userOpt) {
        return Err({ NotFound: "User not found" });
      }

      let user = userOpt.Some;
      user.role = payload.role;

      userStorage.insert(payload.user_id, user);
      return Ok(user);
    }
  ),

  // Get Transactions
  getTransactions: query([], Result(Vec(Transaction), Message), () => {
    const transactions = transactionLog.values();
    if (transactions.length === 0) {
      return Err({ NotFound: "No transactions found" });
    }
    return Ok(transactions);
  }),

  // Get Transaction by Timestamp
  getTransactionByTimestamp: query(
    [text],
    Result(Transaction, Message),
    (timestamp) => {
      const transactionOpt = transactionLog.get(timestamp);
      if ("None" in transactionOpt) {
        return Err({ NotFound: "Transaction not found" });
      }
      return Ok(transactionOpt.Some);
    }
  ),

  // Get Transactions by User ID
  getUserTransactions: query(
    [text],
    Result(Vec(Transaction), Message),
    (userId) => {
      const transactions = transactionLog
        .values()
        .filter((transaction) => transaction.user_id === userId);
      if (transactions.length === 0) {
        return Err({ NotFound: "No transactions found for this user" });
      }
      return Ok(transactions);
    }
  ),
});
