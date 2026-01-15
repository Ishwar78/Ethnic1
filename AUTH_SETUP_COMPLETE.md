# Vasstra Authentication - Complete Setup ✅

## What Was Fixed

### 1. **Backend Server Setup** ✅
- **Problem**: Backend server was not running - only frontend was active
- **Solution**: Created `dev-server.js` to run both frontend and backend concurrently
- **Status**: Backend now running on `http://localhost:5000`

### 2. **MongoDB Connection** ✅
- **Problem**: MongoDB URI was not properly configured
- **Solution**: Set `MONGODB_URI` environment variable
- **Value**: `mongodb+srv://sharmaishwar970:ISHWAR123@cluster0.b73q6ph.mongodb.net/Vastra`
- **Status**: Successfully connected

### 3. **Environment Variables** ✅
- **Frontend Development**: `VITE_API_URL=http://localhost:5000/api`
- **Frontend Production**: `VITE_API_URL=https://vasstra-backend.fly.dev/api`
- **Backend**: `MONGODB_URI=mongodb+srv://sharmaishwar970:ISHWAR123@cluster0.b73q6ph.mongodb.net/Vastra`

### 4. **Admin User** ✅
- **Email**: `admin@vasstra.com`
- **Password**: `admin@123`
- **Status**: Auto-created and available

---

## How to Test

### Admin Login
1. Go to: `http://localhost:8080/vastra/admin`
2. Email: `admin@vasstra.com`
3. Password: `admin@123`
4. Click "Sign In to Admin Panel"
5. Should redirect to admin dashboard at `/admin`

### User Signup
1. Go to: `http://localhost:8080/auth`
2. Click "Sign up" to switch to signup mode
3. Enter:
   - Full Name: (any name)
   - Email: (new email)
   - Password: (minimum 6 characters)
4. Click "Create Account"
5. Should redirect to home page

### User Login
1. Go to: `http://localhost:8080/auth`
2. Enter credentials from signup
3. Click "Sign In"
4. Should redirect to home page

---

## Technical Details

### Server Architecture
```
Frontend (Vite React)
    ↓ (HTTP)
Backend (Express)
    ↓ (MongoDB Driver)
MongoDB Atlas
```

### File Structure
```
root/
├── package.json              (Updated with dev scripts)
├── dev-server.js            (NEW - runs both servers)
├── .env.development         (Frontend API URL for dev)
├── .env.production          (Frontend API URL for prod)
├── src/
│   ├── contexts/AuthContext.tsx    (Auth logic)
│   ├── pages/Auth.tsx              (User login/signup)
│   └── pages/AdminLogin.tsx        (Admin login)
└── server/
    ├── package.json
    ├── index.js              (Express server)
    ├── routes/auth.js        (Login/signup endpoints)
    ├── models/User.js        (User schema)
    └── middleware/auth.js    (JWT authentication)
```

### API Endpoints

#### Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Create new user |
| POST | `/api/auth/login` | User/Admin login |
| GET | `/api/auth/me` | Get current user (requires token) |
| PUT | `/api/auth/profile` | Update user profile (requires token) |

#### Data Format

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

---

## Troubleshooting

### Issue: "Cannot connect to backend API"
**Solution:**
- Check if both servers are running
- Run: `npm run dev` (should start both frontend and backend)
- Backend should show: "Server running on http://localhost:5000"

### Issue: "Invalid credentials" on admin login
**Solution:**
- Use exact credentials: `admin@vasstra.com` / `admin@123`
- Credentials are case-sensitive
- Check MongoDB Atlas to verify admin user exists

### Issue: "Network error" during signup/login
**Solution:**
1. Check `.env.development` has: `VITE_API_URL=http://localhost:5000/api`
2. Verify backend is running on port 5000
3. Check browser console for exact error message

### Issue: MongoDB connection fails
**Solution:**
1. Verify MongoDB URI in `server/.env` or environment variables
2. Check MongoDB Atlas cluster is active
3. Verify IP whitelist (should include your IP)
4. Check internet connection

---

## Development Servers

### Start All Servers
```bash
npm run dev
```

This automatically starts:
- **Frontend** on `http://localhost:8080`
- **Backend** on `http://localhost:5000`

### Start Only Frontend
```bash
npm run dev:frontend
```

### Start Only Backend
```bash
npm run dev:backend
```

---

## Environment Variables

### Development (.env.development)
```
VITE_API_URL=http://localhost:5000/api
NODE_ENV=development
```

### Production (.env.production)
```
VITE_API_URL=https://vasstra-backend.fly.dev/api
NODE_ENV=production
```

### Backend (server/.env or env variables)
```
MONGODB_URI=mongodb+srv://sharmaishwar970:ISHWAR123@cluster0.b73q6ph.mongodb.net/Vastra
PORT=5000
JWT_SECRET=vasstra_jwt_secret_key_change_in_production_2024
NODE_ENV=development
```

---

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  password: String (hashed with bcrypt),
  phone: String (optional),
  role: String (default: "user", can be "admin"),
  isActive: Boolean (default: true),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  profileImage: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Checklist

- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ JWT tokens for authentication (7 day expiry)
- ✅ CORS enabled for frontend
- ✅ MongoDB URI in environment variables
- ✅ JWT_SECRET in environment variables
- ⚠️ TODO: Change JWT_SECRET in production
- ⚠️ TODO: Use strong admin password in production
- ⚠️ TODO: Restrict CORS to specific domains in production

---

## Next Steps

1. ✅ Test admin login
2. ✅ Test user signup
3. ✅ Test user login
4. ✅ Deploy to Fly.io
5. 🔄 Change credentials in production
6. 🔄 Update JWT_SECRET in production
7. 🔄 Implement email verification
8. 🔄 Add password reset functionality

---

## Useful Commands

```bash
# Development
npm run dev                 # Start both servers

# Building
npm run build              # Build frontend
npm run build:dev          # Build in dev mode

# Backend-specific
cd server && npm run dev   # Run backend only
cd server && npm run seed  # Create/reset admin user

# Testing
npm run lint               # Check for linting errors
```

---

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the logs in the dev server output
3. Check MongoDB Atlas for data issues
4. Ensure both servers are running: `npm run dev`

All authentication flows should now be working! 🎉
