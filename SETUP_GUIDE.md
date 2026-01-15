# Vasstra Admin Panel & MongoDB Setup Guide

## Overview
This guide will help you set up the complete admin panel and MongoDB integration for the Vasstra e-commerce platform.

## Project Structure

```
├── code/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/AdminDashboard.tsx  # Admin panel
│   │   ├── contexts/AuthContext.tsx  # Updated with API integration
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
└── server/               # Backend (Node.js + Express)
    ├── models/
    │   ├── User.js
    │   ├── Order.js
    │   └── Product.js
    ├── routes/
    │   ├── auth.js       # Authentication endpoints
    │   └── admin.js      # Admin management endpoints
    ├── middleware/
    │   └── auth.js       # JWT authentication middleware
    ├── index.js          # Express server
    └── package.json
```

## MongoDB Connection

Your MongoDB database is already configured with:
- **Connection String**: `mongodb+srv://sharmaishwar970:ISHWAR123@cluster0.b73q6ph.mongodb.net/Vastra`
- **Database Name**: `Vastra`

The backend automatically connects to this database on startup.

## Running the Application

### Option 1: Run Both Frontend and Backend

#### Terminal 1 - Start Backend Server:
```bash
cd server
npm install  # Install dependencies
npm run dev  # Start development server (runs on port 5000)
```

#### Terminal 2 - Start Frontend Server:
```bash
npm install  # Install dependencies (from root)
npm run dev  # Start frontend (runs on port 8080)
```

### Option 2: Production Build
```bash
# Build frontend
npm run build

# Build and run backend
cd server
npm install
npm start
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Sign Up
```
POST /api/auth/signup
Body: {
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
Response: {
  "success": true,
  "token": "jwt_token",
  "user": { ... }
}
```

#### Login
```
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
Response: {
  "success": true,
  "token": "jwt_token",
  "user": { ... }
}
```

#### Get Current User
```
GET /api/auth/me
Headers: {
  "Authorization": "Bearer jwt_token"
}
```

#### Update Profile
```
PUT /api/auth/profile
Headers: {
  "Authorization": "Bearer jwt_token"
}
Body: {
  "name": "Jane Doe",
  "phone": "+91-9876543210",
  "address": { ... }
}
```

### Admin Routes (`/api/admin`)

All admin routes require admin authentication:
```
Headers: {
  "Authorization": "Bearer admin_jwt_token"
}
```

#### Get Users (Paginated & Searchable)
```
GET /api/admin/users?page=1&limit=10&search="keyword"
Response: {
  "success": true,
  "users": [ ... ],
  "pagination": { ... }
}
```

#### Get Single User
```
GET /api/admin/users/:userId
```

#### Update User
```
PUT /api/admin/users/:userId
Body: {
  "name": "New Name",
  "email": "newemail@example.com",
  "phone": "+91-1234567890",
  "role": "admin" | "user",
  "isActive": true | false
}
```

#### Delete User
```
DELETE /api/admin/users/:userId
```

#### Reset User Password
```
POST /api/admin/users/:userId/reset-password
Body: {
  "newPassword": "newpassword123"
}
```

#### Get Dashboard Stats
```
GET /api/admin/stats
Response: {
  "success": true,
  "stats": {
    "totalUsers": 100,
    "adminUsers": 2,
    "activeUsers": 95,
    "totalOrders": 500,
    "totalRevenue": 1500000
  }
}
```

#### Get Orders
```
GET /api/admin/orders?page=1&limit=10&status="pending"
```

#### Update Order Status
```
PUT /api/admin/orders/:orderId
Body: {
  "status": "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
}
```

## User Roles

### Regular User
- Can create account
- Can view products
- Can place orders
- Can manage wishlist
- Can view their own profile

### Admin User
- All user permissions plus:
- Access to `/admin` dashboard
- View all users and their details
- Edit/delete users
- Reset user passwords
- View all orders and update status
- View dashboard statistics

## Database Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  role: 'user' | 'admin',
  profileImage: String,
  isActive: Boolean,
  wishlist: [ProductId],
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  userId: UserId,
  items: [{
    productId: ProductId,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalAmount: Number,
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  shippingAddress: { ... },
  paymentMethod: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema
```javascript
{
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  category: String,
  image: String,
  images: [String],
  sizes: [String],
  colors: [String],
  stock: Number,
  rating: Number,
  reviews: [{...}],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Creating Your First Admin User

1. Sign up through the app with any email
2. Connect to MongoDB and run:
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```
3. Log out and log back in
4. You'll see the Admin Dashboard link in your profile menu

## Frontend Configuration

Create a `.env` file in the root directory (if needed):
```
REACT_APP_API_URL=http://localhost:5000/api
```

By default, the frontend looks for the API at `http://localhost:5000/api`

## Testing the Integration

1. **Start both servers** (frontend and backend)
2. **Sign up** at `/auth`
3. **Make yourself admin** (via MongoDB or request admin access)
4. **Access admin panel** at `/admin`
5. **Test features**:
   - View user list
   - Search for users
   - Edit user details
   - Delete users
   - View dashboard statistics
   - Manage orders

## Troubleshooting

### Backend Connection Issues
- Ensure MongoDB URI is correct
- Check internet connection to MongoDB Atlas
- Verify firewall settings allow connection to cluster0.b73q6ph.mongodb.net

### API Not Found Errors
- Ensure backend is running on port 5000
- Check browser console for the actual error
- Verify CORS is enabled (it is by default)

### Authentication Issues
- Clear localStorage: Open DevTools → Application → Clear all data
- Log in again
- Token expires after 7 days (automatic refresh needed)

### Admin Access Issues
- Verify user has `role: "admin"` in MongoDB
- Try logging out and back in
- Check user's `isActive` status is true

## Support

For issues or questions, check:
1. Backend logs in terminal running `npm run dev`
2. Browser console in DevTools
3. MongoDB Atlas dashboard for database status

## Security Notes

⚠️ **Important for Production:**
1. Change JWT_SECRET in `server/middleware/auth.js`
2. Use environment variables for sensitive data
3. Implement rate limiting
4. Add HTTPS
5. Implement proper password reset flow
6. Add email verification
7. Implement audit logging

---

Happy coding! 🎉
