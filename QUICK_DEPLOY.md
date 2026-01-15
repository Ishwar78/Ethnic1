# 🚀 Super Simple Deploy Guide (Copy & Paste)

**Goal:** Get admin login working on your deployed Fly.io app

---

## What's Wrong Right Now

- ❌ Frontend is deployed on Fly.io
- ❌ Backend is NOT deployed
- ❌ Frontend tries to reach `http://localhost:5000/api` which doesn't exist
- ❌ Result: "Failed to fetch" error

---

## ✅ Solution in 3 Steps

### Step 1: Install Fly CLI (Do This First!)

**On Mac:**
```bash
brew install flyctl
```

**On Windows (with Chocolatey):**
```bash
choco install flyctl
```

**On Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Verify installation:**
```bash
flyctl version
```

---

### Step 2: Deploy Backend (Copy & Paste These Commands)

**In your terminal, go to server folder:**

```bash
cd server
```

**Login to Fly.io:**
```bash
flyctl auth login
```
*(This opens browser - login with your account)*

**Create backend app on Fly.io:**
```bash
flyctl launch
```

**When asked:**
- App Name: **vasstra-backend** (or anything you want)
- Region: **iad** (or default)
- PostgreSQL: **No**
- Redis: **No**

**Set environment variables:**
```bash
flyctl secrets set MONGODB_URI="mongodb+srv://sharmaishwar970:ISHWAR123@cluster0.b73q6ph.mongodb.net/Vastra"
flyctl secrets set JWT_SECRET="vasstra_jwt_secret_key_change_in_production_2024"
```

**Deploy to Fly.io:**
```bash
flyctl deploy
```

**Wait for deployment... You'll see:**
```
--> v0 released
URL: https://vasstra-backend.fly.dev/
```

**✅ Copy this URL! You need it next!**

---

### Step 3: Update Frontend & Redeploy

**Go back to root folder:**
```bash
cd ..
```

**Edit `.env` file:**
```
VITE_API_URL=https://vasstra-backend.fly.dev/api
```

*(Replace `vasstra-backend` with your actual backend app name if you used a different name)*

**Push to git:**
```bash
git add .env
git commit -m "Update backend URL for production"
git push origin main
```

**Frontend will redeploy automatically!**

---

### Step 4: Test Admin Login

**Access your app:**
```
https://your-frontend-app.fly.dev/vastra/admin
```

**Login credentials:**
- Email: `admin@vasstra.com`
- Password: `admin@123`

✅ **It should work now!**

---

## 🔍 If It Still Doesn't Work

**Check backend is running:**
```bash
curl https://vasstra-backend.fly.dev/api/health
```

Should return:
```json
{"status":"Server is running"}
```

**Check frontend logs:**
```bash
flyctl logs -a your-frontend-app-name
```

**Check if .env was updated:**
```bash
cat .env
# Should show: VITE_API_URL=https://vasstra-backend.fly.dev/api
```

---

## 📋 Important Notes

1. **Fly.io Account Required** - Sign up at https://fly.io (free tier available)
2. **Replace Names** - Change `vasstra-backend` if you used a different app name
3. **Wait for Deployment** - Takes 1-2 minutes per deploy
4. **MongoDB IP Whitelist** - Make sure 0.0.0.0/0 is allowed in MongoDB Atlas (Network Access)

---

## ✅ Success Checklist

- [ ] Fly CLI installed (`flyctl version` works)
- [ ] Logged into Fly.io (`flyctl auth login`)
- [ ] Backend deployed (`flyctl deploy` completed)
- [ ] Backend URL noted (e.g., https://vasstra-backend.fly.dev)
- [ ] `.env` updated with backend URL
- [ ] Changes pushed to git
- [ ] Frontend redeployed
- [ ] Can access: https://your-frontend-app.fly.dev/vastra/admin
- [ ] Admin login works!

---

## 🆘 Common Issues

**"Command not found: flyctl"**
- Solution: Install Fly CLI (see Step 1 above)

**"Not authenticated"**
- Solution: Run `flyctl auth login`

**"Could not reserve ports"**
- Solution: Use different port (but our Dockerfile uses 5000, which is fine)

**"MongoDB connection error"**
- Solution: Go to MongoDB Atlas → Network Access → Allow All IPs (0.0.0.0/0)

**"Still getting 'Failed to fetch'"**
- Check: Is `.env` file updated with correct backend URL?
- Check: Did you push to git? Did frontend redeploy?
- Check: Backend URL accessible at `https://vasstra-backend.fly.dev/api/health`?

---

## 📞 Need Help?

If you get stuck:
1. Share the error message from `flyctl logs`
2. Check what URL is in your `.env` file
3. Make sure MongoDB is accessible from Fly.io

---

**That's it! Follow these 4 steps and admin login will work! 🎉**
