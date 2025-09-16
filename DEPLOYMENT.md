# 🚀 Deployment Guide

This guide covers different deployment options for the Quiz Competition Platform.

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ Firebase project set up with Firestore and Authentication
- ✅ Environment variables configured
- ✅ Code committed to GitHub repository

## 🌐 Deployment Options

### 1. Vercel (Recommended) ⚡

**Why Vercel?**
- Built specifically for Next.js applications
- Automatic deployments from GitHub
- Excellent performance with CDN
- Free tier available

**Steps:**

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

2. **Import Project**
   - Click \"New Project\"
   - Import your GitHub repository
   - Select \"quiz-competition-platform\"

3. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Deploy**
   - Click \"Deploy\"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

5. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS settings

### 2. Netlify 🌐

**Steps:**

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Deploy from Git**
   - Click \"New site from Git\"
   - Choose GitHub
   - Select your repository

3. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

4. **Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add all Firebase configuration variables

5. **Deploy**
   - Click \"Deploy Site\"
   - Your app will be available at `https://random-name.netlify.app`

### 3. Railway 🚂

**Steps:**

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy**
   - Click \"New Project\"
   - Select \"Deploy from GitHub repo\"
   - Choose your repository

3. **Environment Variables**
   - Go to Variables tab
   - Add Firebase configuration

4. **Custom Domain**
   - Go to Settings → Domains
   - Add custom domain

### 4. Self-Hosted with Docker 🐳

**Create Dockerfile:**
```dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD [\"node\", \"server.js\"]
```

**Deploy:**
```bash
# Build image
docker build -t quiz-competition .

# Run container
docker run -p 3000:3000 \\n  -e NEXT_PUBLIC_FIREBASE_API_KEY=your_key \\n  -e NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain \\n  quiz-competition
```

## 🔧 Environment Variables

**Required Variables:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**Optional Variables:**
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_ENVIRONMENT=production
```

## 🔒 Security Considerations

### Firebase Security Rules
Update your Firestore rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public read for published quizzes
    match /quizzes/{quizId} {
      allow read: if resource.data.isPublished == true;
      allow write: if request.auth != null && request.auth.uid == resource.data.creatorId;
    }
    
    // Game sessions
    match /games/{gameId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /gameSessions/{sessionId} {
      allow read, write: if true;
    }
  }
}
```

### Environment Security
- ✅ Never commit `.env.local` files
- ✅ Use different Firebase projects for development/production
- ✅ Enable Firebase App Check for production
- ✅ Set up proper CORS policies

## 📊 Performance Optimization

### Build Optimization
```json
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  compress: true,
}
```

### Firebase Optimization
- Enable offline persistence
- Use Firebase indexes for complex queries
- Implement pagination for large datasets
- Use Firebase Functions for server-side operations

## 🚨 Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

**Environment Variables Not Working:**
- Ensure variables start with `NEXT_PUBLIC_`
- Restart development server after changes
- Check for typos in variable names

**Firebase Connection Issues:**
- Verify Firebase configuration
- Check Firebase console for errors
- Ensure proper security rules

**Real-time Features Not Working:**
- Check network connectivity
- Verify Firestore rules allow real-time listeners
- Monitor Firebase console for errors

## 📈 Monitoring

### Production Monitoring
- Set up Firebase Analytics
- Monitor Firestore usage and costs
- Use Vercel Analytics for performance insights
- Set up error tracking (Sentry recommended)

### Performance Metrics
- Core Web Vitals
- Firebase SDK performance
- Real-time listener efficiency
- Build and deployment times

---

**🎉 Congratulations!** Your Quiz Competition Platform is now deployed and ready for real-time multiplayer educational experiences!

**Need help?** Check our [troubleshooting guide](./FIREBASE_SETUP.md#troubleshooting) or open an issue on GitHub.