# 💸 Spendly - Personal Finance & Expense Tracker

Spendly is a full-stack web application that helps you track your income and expenses in one place. It's built for students and young professionals who want a simple, free, and effective way to manage their personal finances.

---

## 📸 Preview

> Login → Dashboard → Manage Income & Expenses → View Charts & Insights → Export Data

---

## ✨ Features

- **User Authentication** — Secure registration, login, and logout using JWT tokens
- **Transaction Management** — Add, edit, and delete income and expense records
- **Categories** — Organize transactions by Food, Travel, Bills, and more
- **Dashboard** — View total income, total expenses, and current balance at a glance
- **Charts & Analytics** — Visual bar and pie charts to understand your spending patterns
- **Receipt Upload** — Attach receipt images to your transactions
- **Export to Excel** — Download your financial data as an `.xlsx` file
- **Responsive UI** — Works on both desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite) + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (via Mongoose) |
| Auth | JWT (JSON Web Tokens) |
| Security | BcryptJS (password hashing) |
| File Upload | Multer |
| Data Export | XLSX |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
spendly-project/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   └── uploadMiddleware.js # Multer file upload config
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Income.js           # Income schema
│   │   └── Expense.js          # Expense schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── incomeRoutes.js
│   │   ├── expenseRoutes.js
│   │   └── dashboardRoutes.js
│   ├── controllers/            # Business logic for each route
│   ├── uploads/                # Uploaded receipt images (auto-created)
│   └── server.js               # App entry point
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Auth/           # Login & SignUp pages
    │   │   └── Dashboard/      # Home, Income, Expense pages
    │   ├── components/
    │   │   ├── Cards/          # TransactionInfoCard
    │   │   ├── Charts/         # Bar chart, Pie chart
    │   │   └── Forms/          # AddIncomeForm, AddExpenseForm
    │   ├── context/
    │   │   └── userContext.jsx # Global user state
    │   ├── utils/
    │   │   └── helper.js       # Chart data prep utilities
    │   ├── App.jsx             # Routes setup
    │   └── main.jsx            # React entry point
    └── index.html
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm

### 1. Clone the repository

```bash
git clone https://github.com/arjyanashutosh/spendly-project.git
cd spendly-project
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

The backend runs on `http://localhost:3000`

### 3. Set up the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and get JWT token |
| GET | `/api/v1/auth/getUser` | Get logged-in user info |
| POST | `/api/v1/income/add` | Add income record |
| GET | `/api/v1/income/get` | Get all income records |
| DELETE | `/api/v1/income/:id` | Delete income record |
| GET | `/api/v1/income/downloadexcel` | Export income as Excel |
| POST | `/api/v1/expense/add` | Add expense record |
| GET | `/api/v1/expense/get` | Get all expense records |
| DELETE | `/api/v1/expense/:id` | Delete expense record |
| GET | `/api/v1/expense/downloadexcel` | Export expenses as Excel |
| GET | `/api/v1/dashboard/get` | Get dashboard summary data |

> All routes except register/login are protected and require a Bearer token in the `Authorization` header.

---

## 🗃️ Database Models

**User** — `fullName`, `email`, `password` (hashed), `profileImageUrl`

**Income** — `userId`, `source`, `amount`, `date`, `icon`

**Expense** — `userId`, `category`, `amount`, `date`, `icon`

---

## 📦 Backend Dependencies

```json
"bcryptjs", "cors", "dotenv", "express",
"jsonwebtoken", "mongoose", "multer", "xlsx"
```

---

## 🚧 Known Limitations

- No bank/UPI integration — transactions must be entered manually
- No offline mode — requires internet connection
- No multi-user or family account support
- Basic rule-based insights (no AI/ML predictions yet)

---

## 🔮 Planned Improvements

- Bank API integration for automatic transaction import
- AI-powered spending predictions and budget recommendations
- Real-time notifications for overspending
- Mobile app (React Native)
- Multi-user / shared account support

---

## 📄 License

This project is for educational purposes.
