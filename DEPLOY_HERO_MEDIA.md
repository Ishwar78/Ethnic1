# Deploying Hero Media to Production

## Status
- ✅ **Local Development**: Working perfectly
- ⏳ **Production (Fly.io)**: Need to deploy the new code

## What Changed
We added:
- **Backend**: HeroMedia model and API routes
- **Frontend**: Video/GIF support in HeroSlider
- **Admin**: Hero media management interface

## How to Deploy

### Step 1: Push Code to Git
```bash
# The system will create a git commit automatically
# Click the "Push to Origin" button in the top right of the UI
```

Or manually:
```bash
git add .
git commit -m "Add hero media video/GIF support"
git push origin main
```

### Step 2: Deploy Frontend to Fly.io
If you have automatic deployments enabled:
- Just push to main branch
- Fly.io will auto-deploy in a few minutes

If manual deployment:
```bash
flyctl deploy
```

### Step 3: Deploy Backend to Fly.io
```bash
cd server
flyctl deploy
```

Or if using a single Fly.io app:
```bash
flyctl deploy --config fly.toml  # frontend
cd server && flyctl deploy       # backend
```

## Verification

After deployment, verify it works:

1. **Check Frontend**: Go to https://your-deployed-app.fly.dev
2. **Check Backend API**: Go to https://vasstra-backend.fly.dev/api/hero-media
   - Should return: `{"success":true,"media":[]}`
3. **Check Hero Slider**: Should show default slides (no errors)

## If You Get Errors

### Error: "Failed to fetch"
**Cause**: Backend not deployed yet
**Solution**: Deploy backend with `flyctl deploy` in the server folder

### Error: "Backend might not be running"
**Cause**: Backend deployment failed
**Solution**: 
1. Check Fly.io dashboard for errors
2. Run logs: `flyctl logs -a vasstra-backend`
3. Redeploy: `cd server && flyctl deploy`

### Hero Media Not Saving
**Cause**: MongoDB connection issue on Fly.io
**Solution**:
1. Verify `MONGODB_URI` env variable is set on Fly.io
2. Go to Fly.io app settings
3. Check secrets are properly set

## Environment Variables on Fly.io

Make sure these are set in Fly.io:

**Frontend (fly.toml):**
```
VITE_API_URL = "https://vasstra-backend.fly.dev/api"
```

**Backend (server/fly.toml):**
```
MONGODB_URI = "mongodb+srv://sharmaishwar970:ISHWAR123@cluster0.b73q6ph.mongodb.net/Vastra"
JWT_SECRET = "vasstra_jwt_secret_key_change_in_production_2024"
PORT = "5000"
NODE_ENV = "production"
```

## Testing Locally First

Before deploying to production, test locally:

```bash
# Start servers
npm run dev

# Test the API
curl http://localhost:5000/api/hero-media

# Should return:
# {"success":true,"media":[]}

# Test uploading media via admin
# 1. Go to http://localhost:8080/vastra/admin
# 2. Login
# 3. Go to Hero Slider tab
# 4. Add a test media entry
# 5. Refresh homepage - should see your media
```

## Deployment Checklist

- [ ] Code changes pushed to git
- [ ] Frontend deployed to Fly.io
- [ ] Backend deployed to Fly.io
- [ ] Environment variables verified on Fly.io
- [ ] API endpoint working: https://vasstra-backend.fly.dev/api/hero-media
- [ ] Hero slider showing on homepage (no errors)
- [ ] Can access admin panel at /vastra/admin
- [ ] Can add/edit/delete hero media in admin
- [ ] Videos/GIFs play on homepage

## Troubleshooting Deployment

### Check Backend Status
```bash
flyctl status -a vasstra-backend
```

### View Backend Logs
```bash
flyctl logs -a vasstra-backend --follow
```

### View Frontend Logs
```bash
flyctl logs -a vasstra-frontend --follow
```

### Force Restart
```bash
flyctl restart -a vasstra-backend
```

### Rebuild and Deploy
```bash
cd server
flyctl deploy --build-only
flyctl deploy
```

## Next Steps After Deployment

1. ✅ Push code changes
2. ✅ Deploy to Fly.io
3. ✅ Verify endpoints work
4. ✅ Test hero media upload in admin
5. ✅ Add real videos/GIFs
6. ✅ Monitor in production

---

## Quick Commands

```bash
# Deploy everything
cd ..
git push origin main
cd server && flyctl deploy
cd ..
flyctl deploy

# Check if working
curl https://vasstra-backend.fly.dev/api/health
curl https://vasstra-backend.fly.dev/api/hero-media

# View logs
flyctl logs -a vasstra-backend
flyctl logs -a vasstra-frontend
```

---

Once deployed, your hero slider will support videos and GIFs in production! 🎉
