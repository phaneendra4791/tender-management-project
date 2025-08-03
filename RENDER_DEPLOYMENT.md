# 🚀 Render Deployment Guide

## Quick Steps to Deploy on Render

### 1. Prepare Your Repository
Make sure your code is pushed to GitHub with these files:
- ✅ `package.json` (already exists)
- ✅ `server.js` (already exists)
- ✅ `render.yaml` (already configured)

### 2. Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster (free tier is fine)
3. Get your connection string
4. Add your IP to the whitelist (or use 0.0.0.0/0 for all IPs)

### 3. Deploy to Render

#### Step 1: Sign Up
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account

#### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your tender-management repository

#### Step 3: Configure Environment Variables
In the Render dashboard, add these variables:

**MONGODB_URI**
```
mongodb+srv://username:password@cluster.mongodb.net/tender-management?retryWrites=true&w=majority
```
*Replace with your actual MongoDB Atlas connection string*

**JWT_SECRET**
```
your-super-secret-jwt-key-here-make-it-long-and-random
```
*Use a strong, random string (at least 32 characters)*

#### Step 4: Deploy
1. Click "Create Web Service"
2. Render will automatically:
   - Install dependencies (`npm install`)
   - Start your application (`npm start`)
   - Provide you with a URL

### 4. Test Your Deployment
Once deployed, visit your Render URL and test:
- ✅ User registration
- ✅ User login
- ✅ Creating tenders
- ✅ Submitting bids

### 5. Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `my-super-secret-key-123` |
| `NODE_ENV` | Environment (set automatically) | `production` |
| `PORT` | Port number (set automatically) | `10000` |

### 6. Troubleshooting

**If deployment fails:**
1. Check the build logs in Render dashboard
2. Verify all dependencies are in `package.json`
3. Ensure MongoDB connection string is correct
4. Check that JWT_SECRET is set

**If app doesn't work:**
1. Check the runtime logs in Render dashboard
2. Verify environment variables are set correctly
3. Test MongoDB connection
4. Check if all routes are working

### 7. Your App URL
After successful deployment, your app will be available at:
```
https://your-app-name.onrender.com
```

### 8. Next Steps
- Set up a custom domain (optional)
- Configure monitoring
- Set up automatic deployments from GitHub

## Need Help?
- Check Render documentation: https://render.com/docs
- Check MongoDB Atlas documentation: https://docs.atlas.mongodb.com
- Review your application logs in Render dashboard 