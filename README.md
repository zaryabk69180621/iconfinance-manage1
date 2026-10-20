# Imperial College of Nursing Swat - Finance Management API

A Node.js, Express, and MongoDB backend application for managing student fee slips and financial tracking for **Imperial College of Nursing Swat**.

---

## 📁 Project Architecture

```text
iconfinance/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── controllers/
│   └── feeSlipController.js  # Business logic & CRUD for fee slips (with file cleanup)
├── middleware/
│   └── upload.js             # Multer middleware for photo uploads
├── models/
│   └── FeeSlip.js            # Mongoose schema for Fee Slip (with photo)
├── routes/
│   └── feeSlipRoutes.js      # Express routes mapping with file upload middleware
├── uploads/                  # Local folder storing attached image files
├── .env                      # Local environment variables
├── .env.example              # Environment variables template
├── package.json              # Project metadata & dependencies
├── server.js                 # Express server entry point (serves /uploads statically)
└── README.md                 # Project documentation
```

---

## 📋 Fee Slip Schema

The `FeeSlip` model includes the following fields:

| Field Name   | Type   | Required | Description / Allowed Values                                |
|--------------|--------|----------|-------------------------------------------------------------|
| `name`       | String | Yes      | Student Name                                                |
| `fname`      | String | Yes      | Father Name                                                 |
| `batch`      | String | Yes      | Batch identifier (e.g. `"2023-2027"`)                       |
| `semester`   | String | Yes      | Semester (e.g. `"1st"`, `"2nd"`, `"Semester 3"`)            |
| `amount`     | Number | Yes      | Amount paid by student                                      |
| `creditedTo` | String | Yes      | Enum values: `['owner', 'bank', 'utilized in college']`    |
| `photo`      | String | No       | Relative URL path to uploaded image file (e.g. `/uploads/fee-slip-1723...png`) |
| `createdAt`  | Date   | Auto     | Timestamp when slip was recorded                            |
| `updatedAt`  | Date   | Auto     | Timestamp when slip was last updated                        |

---

## 📸 File Upload Functionality

- **Storage Location:** `./uploads/`
- **Supported Formats:** JPEG, JPG, PNG, GIF, WEBP
- **Max File Size:** 5 MB
- **Static File Access:** Images are served statically under `http://localhost:5000/uploads/<filename>`

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas connection string.

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Make sure your `.env` file contains your configuration:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/icon_finance_db
NODE_ENV=development
```

### 4. Running the Server

- **Development Mode (with Nodemon):**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```

---

## 🔌 API Endpoints

### Fee Slips (`/api/fee-slips`)

| Method | Endpoint              | Content-Type           | Description                                                      |
|--------|-----------------------|------------------------|------------------------------------------------------------------|
| `POST` | `/api/fee-slips`       | `multipart/form-data`  | Create a new Fee Slip with attached photo file                   |
| `GET`  | `/api/fee-slips`       | `application/json`     | Get all fee slips (supports `batch`, `semester`, `creditedTo`, `search` query params) |
| `GET`  | `/api/fee-slips/summary` | `application/json`     | Get summary of totals aggregated by `creditedTo`                 |
| `GET`  | `/api/fee-slips/:id`   | `application/json`     | Get single fee slip by ID                                        |
| `PUT`  | `/api/fee-slips/:id`   | `multipart/form-data`  | Update fee slip and optional replacement photo by ID             |
| `DELETE`| `/api/fee-slips/:id`  | `application/json`     | Delete fee slip by ID (and removes photo file from disk)         |

---

### 📝 Example `multipart/form-data` Request (Postman / cURL)

#### Form Data Fields:
- `name`: `"Muhammad Ali"`
- `fname`: `"Tariq Khan"`
- `batch`: `"2023-2027"`
- `semester`: `"1st"`
- `amount`: `45000`
- `creditedTo`: `"bank"`
- `photo`: `[File Attachment]`

#### cURL Example:
```bash
curl -X POST http://localhost:5000/api/fee-slips \
  -F "name=Muhammad Ali" \
  -F "fname=Tariq Khan" \
  -F "batch=2023-2027" \
  -F "semester=1st" \
  -F "amount=45000" \
  -F "creditedTo=bank" \
  -F "photo=@/path/to/receipt.jpg"
```
