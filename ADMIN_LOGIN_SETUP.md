# Vasstra Admin Login Setup Guide

## Quick Start

### Step 1: Start Backend Server with Seed Admin

```bash
# Navigate to server folder
cd server

# Install dependencies (if not already done)
npm install

# Create the admin user in MongoDB
npm run seed

# Start the backend server
npm run dev
```

You should see output like:
```
✅ Admin user created successfully!

📋 Admin Credentials:
   Email: admin@vasstra.com
   Password: admin@123

🔗 Access admin panel at: /vastra/admin
```

### Step 2: Start Frontend Server

In a new terminal (from project root):
```bash
npm install  # if not already done
npm run dev
```

### Step 3: Access Admin Login

Open your browser and go to:
```
http://localhost:8080/vastra/admin
```

You'll see the admin login form with pre-filled credentials:
- **Email**: admin@vasstra.com
- **Password**: admin@123

### Step 4: Login

Click "Sign In to Admin Panel" and you'll be redirected to the admin dashboard.

---

## What Gets Created

### Admin User in MongoDB
- **Name**: Vasstra Admin
- **Email**: admin@vasstra.com
- **Password**: admin@123 (hashed with bcrypt)
- **Role**: admin
- **Status**: Active

### Routes

| Route | Purpose |
|-------|---------|
| `/vastra/admin` | Admin login page |
| `/admin` | Admin dashboard (after login) |
| `/api/auth/login` | Backend login API |
| `/api/admin/*` | Admin management APIs |

---

## File Structure

```
server/
├── .env                          # MongoDB URI & JWT secret
├── scripts/
│   └── seedAdmin.js             # Script to create admin user
├── models/User.js               # User model with role field
├── middleware/auth.js           # JWT authentication
├── routes/
│   ├── auth.js                  # Login/signup endpoints
│   └── admin.js                 # Admin management endpoints
└── index.js                      # Express server

src/
├── .env                         # Frontend API URL
├── pages/
│   ├── AdminLogin.tsx          # Admin login form (NEW)
│   ├── AdminDashboard.tsx       # Admin dashboard
│   └── Auth.tsx                 # Regular user login
├── contexts/AuthContext.tsx     # Updated for API
└── App.tsx                      # Routes including /vastra/admin
```

---

## Environment Variables

### Backend (server/.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://sharmaishwar970:ISHWAR123@cluster0.b73q6ph.mongodb.net/Vastra
JWT_SECRET=vasstra_jwt_secret_key_change_in_production_2024
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

---

## API Endpoints

### Login (used by admin form)
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@vasstra.com",
  "password": "admin@123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "admin@vasstra.com",
    "name": "Vasstra Admin",
    "role": "admin"
  }
}
```

---

## Features

✅ **Admin Login Page** (`/vastra/admin`)
- Email and password input
- Show/hide password toggle
- Demo credentials displayed
- Error handling and validation
- Responsive design

✅ **Admin Dashboard** (`/admin`)
- View all users with search
- Edit user details
- Delete users
- View orders
- Dashboard statistics
- Admin settings

✅ **MongoDB Integration**
- MongoDB URI configured with your credentials
- Automatic connection on backend start
- Seed script to create admin user
- User model with admin role support

✅ **JWT Authentication**
- Secure token-based authentication
- 7-day token expiry
- Token stored in localStorage
- Protected admin routes

---

## Troubleshooting

### Issue: "Admin user already exists" when running seed

**Solution**: The seed script checks if admin@vasstra.com exists. If you want to recreate it:
1. Go to MongoDB Atlas
2. Delete the user with email: admin@vasstra.com
3. Run `npm run seed` again

### Issue: "Network error" on admin login page

**Solution**: 
1. Ensure backend is running (`npm run dev` in server folder)
2. Check if backend is on port 5000
3. Verify `.env` file has correct `VITE_API_URL`

### Issue: Login succeeds but "Only admin users can access this panel"

**Solution**:
1. The user exists but doesn't have admin role
2. In MongoDB Atlas, find the user and set `role: "admin"`
3. Try logging in again

### Issue: MongoDB connection error

**Solution**:
1. Verify MongoDB URI in `server/.env`
2. Check internet connection
3. Verify MongoDB cluster is active in Atlas
4. Check IP whitelist in MongoDB Atlas (allow all IPs during development)

---

## Changing Admin Password

### Via MongoDB Atlas
1. Go to MongoDB Atlas
2. Find the user with email: admin@vasstra.com
3. You can't directly change password (it's hashed)
4. Delete the user and run `npm run seed` again

### Via Node Script
Create a new file `server/scripts/updateAdminPassword.js`:
```javascript
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function updatePassword(newPassword) {
  await mongoose.connect(process.env.MONGODB_URI);
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(newPassword, salt);
  
  await User.updateOne(
    { email: 'admin@vasstra.com' },
    { password: hashed }
  );
  
  console.log('✅ Password updated!');
  await mongoose.disconnect();
}

updatePassword('your_new_password');
```

---

## Security Checklist for Production

- [ ] Change JWT_SECRET in `server/.env`
- [ ] Use strong admin password
- [ ] Set MongoDB IP whitelist to specific IPs
- [ ] Enable HTTPS
- [ ] Add rate limiting to login endpoint
- [ ] Implement email verification
- [ ] Add password reset functionality
- [ ] Enable CORS for specific domains only
- [ ] Use environment variables for all secrets
- [ ] Add request logging/monitoring
- [ ] Set up backup and recovery procedures

---

## Next Steps

1. ✅ Seed admin user
2. ✅ Login at `/vastra/admin`
3. ✅ Access admin dashboard at `/admin`
4. ✅ Manage users and orders
5. 🔄 Create additional admin users as needed
6. 🔄 Customize admin dashboard features
7. 🔄 Add product management
8. 🔄 Set up email notifications

---

For more details, see:
- `SETUP_GUIDE.md` - Complete API documentation
- `server/routes/auth.js` - Authentication implementation
- `server/routes/admin.js` - Admin features
- `src/pages/AdminLogin.tsx` - Login form code
