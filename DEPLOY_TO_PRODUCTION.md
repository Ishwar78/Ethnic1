# 🚀 Deploying Vasstra to Fly.io (Production)

## Overview

Your app has:
- ✅ **Frontend** - Already deployed on Fly.io
- ❌ **Backend** - NOT deployed (needs to be deployed to Fly.io)

The "Failed to fetch" error occurs because the frontend is trying to reach `http://localhost:5000/api` which doesn't exist on the deployed server.

---

## 📋 Prerequisites

Before deploying, make sure you have:

1. **Fly.io Account** - Sign up at https://fly.io if you haven't already
2. **Fly CLI Installed** - https://fly.io/docs/hands-on/install-flyctl/
3. **Git Repository** - Your code should be in a git repository

Verify installation:
```bash
flyctl version
```

---

## 🔧 Step 1: Deploy Backend to Fly.io

### 1.1 Login to Fly.io

```bash
flyctl auth login
```

This will open your browser to authenticate.

### 1.2 Create Backend App on Fly.io

```bash
cd server
flyctl launch
```

**When prompted:**
- **App Name**: Enter `vasstra-backend` (or your preferred name)
- **Region**: Choose closest to your users (default is fine)
- **PostgreSQL**: No
- **Redis**: No

This creates the app and generates `fly.toml` (which we already have).

### 1.3 Set Environment Variables

```bash
flyctl secrets set MONGODB_URI="mongodb+srv://sharmaishwar970:ISHWAR123@cluster0.b73q6ph.mongodb.net/Vastra"
flyctl secrets set JWT_SECRET="vasstra_jwt_secret_key_change_in_production_2024"
```

### 1.4 Deploy Backend

```bash
flyctl deploy
```

**Expected Output:**
```
--> v0 released
URL: https://vasstra-backend.fly.dev/
```

### 1.5 Verify Backend is Running

```bash
curl https://vasstra-backend.fly.dev/api/health
```

**Expected Response:**
```json
{"status":"Server is running"}
```

### ✅ Note Down Your Backend URL

Copy this URL - you'll need it next:
```
https://vasstra-backend.fly.dev
```

---

## 🎨 Step 2: Update Frontend with Backend URL

### 2.1 Update Environment Variable

Edit `.env` in your root directory:

**Before:**
```
VITE_API_URL=http://localhost:5000/api
```

**After:**
```
VITE_API_URL=https://vasstra-backend.fly.dev/api
```

Replace `vasstra-backend` with your actual backend app name if you used a different name.

### 2.2 Commit Changes

```bash
git add .env
git commit -m "Update API URL to deployed backend"
git push origin main
```

### 2.3 Redeploy Frontend

The frontend should automatically redeploy when you push, but if not:

```bash
# If frontend is also on Fly.io
cd ..
flyctl deploy
```

Or use [Open Preview](#open-preview) to test locally with the new backend URL.

---

## 🧪 Step 3: Test Everything

### 3.1 Access Your Deployed App

```
https://your-frontend-app.fly.dev/vastra/admin
```

### 3.2 Try Admin Login

**Credentials:**
- Email: `admin@vasstra.com`
- Password: `admin@123`

### 3.3 Check Browser Console

If login still fails:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab to see what API URL is being called

---

## 🔍 Troubleshooting

### Issue 1: Backend won't deploy

**Check logs:**
```bash
flyctl logs
```

**Solution:**
```bash
# Rebuild and redeploy
flyctl deploy --force
```

### Issue 2: "Cannot reach API" error

**Check frontend environment variable:**
```bash
cat .env
# Should show: VITE_API_URL=https://vasstra-backend.fly.dev/api
```

**If wrong, update and redeploy:**
```bash
# Edit .env with correct URL
git add .env
git commit -m "Fix API URL"
git push
```

### Issue 3: Login works locally but not in production

**Common causes:**
1. Frontend still using `localhost:5000` (update `.env`)
2. Backend hasn't redeployed (run `flyctl deploy` in server folder)
3. MongoDB not accessible from Fly.io (check IP whitelist in MongoDB Atlas)

### Issue 4: MongoDB Connection Error

Check MongoDB Atlas:
1. Go to https://cloud.mongodb.com
2. Click Clusters → Cluster0
3. Click "Network Access"
4. Make sure `0.0.0.0/0` is whitelisted (allows all IPs)
5. Or add Fly.io IP range (check deployment logs for IP)

---

## 📊 After Deployment Checklist

- [ ] Backend deployed to Fly.io (`vasstra-backend.fly.dev`)
- [ ] Backend health check works (`/api/health`)
- [ ] Frontend `.env` updated with new API URL
- [ ] Frontend redeployed
- [ ] Admin login works on deployed URL
- [ ] Admin dashboard loads and shows stats
- [ ] Users can login/signup
- [ ] No console errors in browser

---

## 📝 Summary of Changes

### Files Changed:
- ✅ `server/fly.toml` - Fly.io configuration (created)
- ✅ `server/Dockerfile` - Docker build instructions (created)
- ✅ `.env` - Update `VITE_API_URL` to deployed backend URL

### Environment Variables Set:
- **Backend**: `MONGODB_URI`, `JWT_SECRET`
- **Frontend**: `VITE_API_URL`

---

## 🚀 Quick Deploy Summary

```bash
# 1. Deploy Backend
cd server
flyctl launch
flyctl secrets set MONGODB_URI="mongodb+srv://sharmaishwar970:ISHWAR123@cluster0.b73q6ph.mongodb.net/Vastra"
flyctl secrets set JWT_SECRET="vasstra_jwt_secret_key_change_in_production_2024"
flyctl deploy

# 2. Update Frontend
cd ..
# Edit .env - change VITE_API_URL to https://vasstra-backend.fly.dev/api
git add .env
git commit -m "Update API URL to deployed backend"
git push

# 3. Test
# Access: https://your-frontend-app.fly.dev/vastra/admin
# Login with: admin@vasstra.com / admin@123
```

---

## 📞 Support

If you encounter issues:
1. Check `flyctl logs` for backend errors
2. Check browser Console (F12) for frontend errors
3. Verify `VITE_API_URL` matches your deployed backend URL
4. Ensure MongoDB is accessible from Fly.io

---

**You're now ready to go live! 🎉**
