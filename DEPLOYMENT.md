# 🚀 Deployment Guide for Tender Management System

## Prerequisites
- MongoDB Atlas account (already configured)
- Git repository
- Node.js application (ready)

## Option 1: Heroku Deployment (Recommended)

### Step 1: Install Heroku CLI
```bash
# Windows (using PowerShell)
winget install --id=Heroku.HerokuCLI
# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login to Heroku
```bash
heroku login
```

### Step 3: Create Heroku App
```bash
heroku create your-tender-management-app
```

### Step 4: Set Environment Variables
```bash
heroku config:set MONGODB_URI="your_mongodb_atlas_connection_string"
heroku config:set JWT_SECRET="your_jwt_secret_key"
```

### Step 5: Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Step 6: Open App
```bash
heroku open
```

## Option 2: Railway Deployment

### Step 1: Visit Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"

### Step 2: Connect Repository
1. Select "Deploy from GitHub repo"
2. Choose your repository
3. Railway will auto-detect Node.js

### Step 3: Set Environment Variables
In Railway dashboard:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Your JWT secret key
- `PORT`: Railway will set this automatically

### Step 4: Deploy
Railway will automatically deploy when you push to your repository.

## Option 3: Render Deployment (Recommended)

### Step 1: Visit Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"

### Step 2: Connect Repository
1. Connect your GitHub repository
2. Render will auto-detect the configuration from `render.yaml`

### Step 3: Configure Service
The `render.yaml` file is already configured with:
- **Name**: tender-management
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Step 4: Set Environment Variables
In the Render dashboard, add these environment variables:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Your JWT secret key (use a strong, random string)
- `NODE_ENV`: production (already set in render.yaml)
- `PORT`: 10000 (already set in render.yaml)

### Step 5: Deploy
Click "Create Web Service" - Render will deploy automatically using the `render.yaml` configuration.

### Step 6: Access Your App
Once deployed, Render will provide you with a URL like: `https://your-app-name.onrender.com`

## Option 4: Vercel Deployment

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Deploy
```bash
vercel
```

### Step 3: Set Environment Variables
In Vercel dashboard, add:
- `MONGODB_URI`
- `JWT_SECRET`

## Environment Variables Required

Make sure to set these in your deployment platform:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_key
NODE_ENV=production
```

## Post-Deployment Checklist

✅ **Test the application**
- Visit your deployed URL
- Test user registration
- Test user login
- Test tender creation
- Test bid submission

✅ **Monitor logs**
- Check for any errors
- Monitor database connections
- Verify all features work

✅ **Security considerations**
- Ensure HTTPS is enabled
- Verify environment variables are secure
- Check MongoDB Atlas network access

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Verify connection string
   - Check IP whitelist in MongoDB Atlas
   - Ensure network access is configured

2. **Port Issues**
   - Most platforms auto-detect port
   - Use `process.env.PORT` (already configured)

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json

## Recommended Platform: Heroku

**Why Heroku?**
- ✅ Free tier available
- ✅ Easy deployment
- ✅ Automatic HTTPS
- ✅ Good documentation
- ✅ Reliable service

**Free Tier Limits:**
- 550-1000 dyno hours/month
- Sleeps after 30 minutes of inactivity
- Perfect for development and small projects

## Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Configure monitoring** (optional)
3. **Set up CI/CD** (optional)
4. **Backup strategy** (recommended)

Your application is now ready for deployment! Choose the platform that best fits your needs. 