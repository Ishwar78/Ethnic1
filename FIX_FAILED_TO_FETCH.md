# 🔧 Fix "Failed to Fetch" Error - Complete Troubleshooting

## The Problem

You're getting **"TypeError: Failed to fetch"** when trying to login to the admin panel. This means:

**The frontend can't connect to the backend API**

This happens because:
1. ❌ Backend server is not running
2. ❌ API URL is wrong
3. ❌ CORS issues
4. ❌ Network connectivity problems

---

## ✅ Solution - Start the Backend Server

### For Local Development

**Terminal 1 - Start Backend:**
```bash
cd server
npm install
npm run dev
```

**Expected Output:**
```
✅ MongoDB connected successfully!
🚀 Server running on http://localhost:5000
📚 API routes available at http://localhost:5000/api
```

**Terminal 2 - Start Frontend (keep backend running):**
```bash
npm run dev
```

**Expected Output:**
```
VITE v5.4.19  ready in 415 ms
➜  Local:   http://localhost:8080/
```

**Then access:** `http://localhost:8080/vastra/admin`

---

## 🔍 Verify Backend is Running

### Check 1: Is Backend Process Running?
```bash
# This should work and return {"status":"Server is running"}
curl http://localhost:5000/api/health
```

### Check 2: Is MongoDB Connected?
Look for this in backend logs:
```
✅ MongoDB connected successfully!
```

If you see a MongoDB error, check:
1. Internet connection
2. MongoDB URI in `server/.env`
3. MongoDB cluster is active in Atlas

### Check 3: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for the failed request to `/api/auth/login`
5. Check:
   - URL being called
   - Response status
   - Response body

---

## 🛠️ Common Issues & Fixes

### Issue 1: "Cannot connect to backend API at: http://localhost:5000/api"

**Cause:** Backend is not running

**Fix:**
```bash
cd server
npm run dev
```

**Verify:** The backend logs should show:
```
✅ MongoDB connected successfully!
🚀 Server running on http://localhost:5000
```

---

### Issue 2: Backend Running but Still Getting Error

**Possible Causes:**
1. Wrong API URL in frontend
2. CORS not enabled
3. Wrong port number

**Check:**
```bash
# 1. Verify backend is on port 5000
netstat -tlnp | grep 5000

# 2. Test API directly
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vasstra.com","password":"admin@123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

---

### Issue 3: MongoDB Connection Error

**Symptoms:**
```
❌ MongoDB connection error: ...
```

**Fixes:**

```bash
# 1. Check MongoDB URI in server/.env
cat server/.env

# 2. Verify the URI is correct
# Should be: mongodb+srv://sharmaishwar970:ISHWAR123@cluster0.b73q6ph.mongodb.net/Vastra
```

**If URI is wrong:**
```bash
# Edit server/.env and add:
MONGODB_URI=mongodb+srv://sharmaishwar970:ISHWAR123@cluster0.b73q6ph.mongodb.net/Vastra
```

**If MongoDB connection still fails:**
1. Go to MongoDB Atlas
2. Click "Clusters" → "Cluster0"
3. Check if cluster is running (should show "ACTIVE")
4. Check IP whitelist (Network Access)
5. Add your current IP or allow all IPs during development

---

### Issue 4: Admin User Not Created

**Symptoms:**
```
Login failed with: "No account found with this email"
```

**Fix:**
```bash
cd server
npm run seed
```

**Expected Output:**
```
✅ Admin user created successfully!

📋 Admin Credentials:
   Email: admin@vasstra.com
   Password: admin@123
```

---

### Issue 5: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE :::5000
```

**Fix:**
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

---

## 🔄 Complete Restart Procedure

If nothing works, try a complete restart:

```bash
# 1. Stop all servers (Ctrl+C in both terminals)

# 2. Clear node_modules and reinstall
cd server
rm -rf node_modules package-lock.json
npm install

# 3. Go back to root
cd ..

# 4. Start backend
cd server
npm run seed
npm run dev

# 5. In new terminal, start frontend
npm run dev

# 6. Access http://localhost:8080/vastra/admin
```

---

## 📋 Checklist Before Testing

- [ ] MongoDB URI is correct in `server/.env`
- [ ] Backend is running (`npm run dev` in `/server` folder)
- [ ] Backend shows "✅ MongoDB connected successfully!"
- [ ] Frontend is running (`npm run dev` in root folder)
- [ ] Backend API health check works: `curl http://localhost:5000/api/health`
- [ ] Admin user created: `npm run seed`
- [ ] Browser not showing cached error (do Ctrl+Shift+Delete to clear cache)
- [ ] Using correct credentials:
  - Email: `admin@vasstra.com`
  - Password: `admin@123`

---

## 🚀 For Production Deployment

If you're seeing this error on a deployed URL (e.g., Fly.io), you also need to deploy the backend:

**Current Setup:**
- Frontend: Deployed ✅
- Backend: **Not Deployed** ❌

**Options:**

### Option A: Deploy Backend Separately
1. Deploy `server/` folder to Fly.io, Heroku, or similar
2. Update `VITE_API_URL` in `.env` to point to deployed backend
3. Re-deploy frontend with new API URL

### Option B: Use Different Backend Service
Set up a dedicated backend server and update the API URL

### Option C: Test Locally First
For now, keep everything local (localhost) and test before deploying

---

## 🧪 Test API Endpoints Directly

Test these commands to verify backend is working:

```bash
# 1. Health check
curl http://localhost:5000/api/health

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vasstra.com","password":"admin@123"}'

# 3. Get current user (use token from login response)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 4. Get stats (admin only)
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

---

## 📞 Still Having Issues?

1. **Check backend logs** - Look for error messages
2. **Check browser console** (F12) - Look for error details
3. **Check Network tab** (F12) - See actual HTTP requests
4. **Verify API URL** - Should be `http://localhost:5000/api`
5. **Test with curl** - See if API is actually running

---

## 🎯 Quick Summary

| What | Where | Expected |
|------|-------|----------|
| **Backend** | Terminal 1 | Running on port 5000 |
| **Frontend** | Terminal 2 | Running on port 8080 |
| **MongoDB** | Atlas Cloud | Connected |
| **Admin** | `http://localhost:8080/vastra/admin` | Login works |
| **Dashboard** | `http://localhost:8080/admin` | Shows stats |

---

**Once both servers are running, the login should work! 🎉**
