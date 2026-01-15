# 🚀 Quick Start - Admin Login in 3 Steps

## Step 1️⃣: Create Admin User
Open terminal in your project folder and run:
```bash
cd server
npm install
npm run seed
```

**Expected output:**
```
✅ Admin user created successfully!

📋 Admin Credentials:
   Email: admin@vasstra.com
   Password: admin@123

🔗 Access admin panel at: /vastra/admin
```

---

## Step 2️⃣: Start Backend Server
**Keep the same terminal open and run:**
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully!
🚀 Server running on http://localhost:5000
```

---

## Step 3️⃣: Start Frontend Server
**Open a NEW terminal and run:**
```bash
npm run dev
```

You should see:
```
VITE v5.4.19 ready in 415 ms
➜  Local: http://localhost:8080/
```

---

## 4️⃣: Login to Admin Panel

**Open your browser and go to:**
```
http://localhost:8080/vastra/admin
```

**You'll see a login form with pre-filled credentials:**
- Email: `admin@vasstra.com`
- Password: `admin@123`

**Just click "Sign In to Admin Panel"**

---

## 5️⃣: Access Admin Dashboard

After successful login, you'll be redirected to:
```
http://localhost:8080/admin
```

**Here you can:**
- 📊 View dashboard statistics
- 👥 Search and manage users
- 🛍️ View and manage orders
- ⚙️ Access admin settings

---

## 🔑 Admin Credentials (Memorize These)

| Field | Value |
|-------|-------|
| Email | admin@vasstra.com |
| Password | admin@123 |
| Login URL | `/vastra/admin` |
| Dashboard URL | `/admin` |

---

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 8080
- [ ] MongoDB connected (check backend logs)
- [ ] Can access `/vastra/admin`
- [ ] Can login with admin credentials
- [ ] Redirected to `/admin` dashboard
- [ ] Can see dashboard stats
- [ ] Can see user list

---

## 🆘 If Something Goes Wrong

### "MongoDB connection error"
```bash
# Check if MongoDB URI is correct in server/.env
# The URI should be: mongodb+srv://sharmaishwar970:ISHWAR123@cluster0.b73q6ph.mongodb.net/Vastra
```

### "Admin user already exists"
- It's okay! That means the seed worked before
- You can use the existing credentials to login

### "Network error on login page"
```bash
# Make sure backend is running
# Check: http://localhost:5000/api/health
# Should return: {"status":"Server is running"}
```

### "Only admin users can access"
- The user exists but role is not admin
- Go to MongoDB Atlas and set role: "admin" for the user

---

## 📁 Important Files

```
server/.env                    ← MongoDB URI is here
server/scripts/seedAdmin.js    ← Creates admin user
src/pages/AdminLogin.tsx       ← Admin login form
src/pages/AdminDashboard.tsx   ← Admin dashboard
```

---

## 🎯 What's Working Now

✅ MongoDB connected with your credentials
✅ Admin login at `/vastra/admin`
✅ Admin dashboard at `/admin`
✅ JWT-based authentication
✅ User and order management
✅ Dashboard statistics

---

## 📞 Need Help?

Check these files for details:
- `ADMIN_LOGIN_SETUP.md` - Complete setup guide
- `SETUP_GUIDE.md` - Full API documentation
- Backend logs in terminal
- Browser console (F12)

---

**You're all set! 🎉**

Access admin panel now: **http://localhost:8080/vastra/admin**
