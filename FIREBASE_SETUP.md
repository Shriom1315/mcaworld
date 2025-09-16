# Firebase Database Setup Guide

This guide will help you set up Firebase as the database for your Kahoot! clone with real-time features.

## 🔥 **Step 1: Create Firebase Project**

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   ```
   Project Name: kahoot-clone
   ✅ Enable Google Analytics (optional)
   Choose Analytics account or create new
   ```

3. **Wait for Project Creation**
   - This takes 1-2 minutes

## 🔧 **Step 2: Configure Firebase Services**

### **Authentication Setup**
1. Go to **Authentication** → **Get started**
2. **Sign-in Method** tab:
   - Enable **Email/Password**
   - Enable **Google** (optional but recommended)
3. **Settings** tab:
   - Authorized domains: Add `localhost` for development

### **Firestore Database Setup**
1. Go to **Firestore Database** → **Create database**
2. **Security Rules**: Start in **test mode** (for development)
3. **Location**: Choose closest to your users
4. Wait for database creation

### **Storage Setup** (Optional)
1. Go to **Storage** → **Get started**
2. Start in **test mode**
3. Choose same location as Firestore

## 📱 **Step 3: Get Firebase Configuration**

1. **Project Settings** (gear icon)
2. **Your apps** section → **Add app** → **Web** (</>) 
3. **App Configuration**:
   ```
   App nickname: kahoot-clone-web
   ✅ Also set up Firebase Hosting (optional)
   ```
4. **Copy Configuration Object**:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

## 🔑 **Step 4: Configure Environment Variables**

1. **Update `.env.local`**:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Firebase Admin (for server-side operations)
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PROJECT_ID=your_project_id
   ```

2. **Get Admin SDK Credentials**:
   - **Project Settings** → **Service accounts**
   - **Generate new private key**
   - Download JSON file
   - Copy `private_key`, `client_email`, and `project_id` to `.env.local`

## 🗄️ **Step 5: Install Dependencies**

```bash
npm install firebase firebase-admin
```

The dependencies have already been added to your `package.json`.

## 🏗️ **Step 6: Database Structure Setup**

### **Firestore Collections Structure**:

```
📂 users/
  📄 {userId}
    - email: string
    - username: string
    - role: "teacher" | "student" | "admin"
    - avatarUrl?: string
    - createdAt: timestamp
    - updatedAt: timestamp

📂 quizzes/
  📄 {quizId}
    - title: string
    - description?: string
    - coverImage?: string
    - creatorId: string
    - questions: Question[]
    - settings: QuizSettings
    - isPublished: boolean
    - createdAt: timestamp
    - updatedAt: timestamp

📂 games/
  📄 {gameId}
    - pin: string (6-digit)
    - quizId: string
    - hostId: string
    - status: "waiting" | "active" | "finished"
    - currentQuestionIndex: number
    - players: Player[]
    - startedAt?: timestamp
    - finishedAt?: timestamp
    - createdAt: timestamp
    - updatedAt: timestamp

📂 gameSessions/
  📄 {sessionId}
    - gameId: string
    - playerId: string
    - nickname: string
    - score: number
    - answers: PlayerAnswer[]
    - joinedAt: timestamp
    - isActive: boolean
```

### **Firestore Security Rules**:

1. **Go to Firestore** → **Rules**
2. **Replace default rules** with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Quizzes rules
    match /quizzes/{quizId} {
      // Anyone can read published quizzes
      allow read: if resource.data.isPublished == true;
      // Users can read their own quizzes
      allow read: if request.auth != null && request.auth.uid == resource.data.creatorId;
      // Users can create/update/delete their own quizzes
      allow create, update, delete: if request.auth != null && request.auth.uid == resource.data.creatorId;
    }
    
    // Games rules
    match /games/{gameId} {
      // Anyone can read active games (for joining)
      allow read: if resource.data.status in ['waiting', 'active'];
      // Hosts can manage their games
      allow write: if request.auth != null && request.auth.uid == resource.data.hostId;
    }
    
    // Game sessions rules
    match /gameSessions/{sessionId} {
      // Anyone can read game sessions (for leaderboards)
      allow read: if true;
      // Anyone can create game sessions (for joining games)
      allow create: if true;
      // Players can update their own sessions
      allow update: if request.auth != null && request.auth.uid == resource.data.playerId;
    }
  }
}
```

3. **Publish Rules**

## 🚀 **Step 7: Test the Setup**

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Test Authentication**:
   - Go to signup page
   - Create a new account
   - Check Firebase Console → Authentication

4. **Test Firestore**:
   - Create a quiz
   - Check Firebase Console → Firestore

## 🔄 **Step 8: Real-time Features**

Firebase automatically provides real-time updates through:
- **onSnapshot()** listeners for live data
- **Real-time Authentication** state changes
- **Automatic synchronization** across devices

## 📊 **Step 9: Database Indexes (Optional)**

For better performance, create these indexes in **Firestore** → **Indexes**:

```
Collection: quizzes
Fields: creatorId (Ascending), createdAt (Descending)

Collection: games  
Fields: pin (Ascending), status (Ascending)

Collection: gameSessions
Fields: gameId (Ascending), score (Descending)
```

## 🔍 **Step 10: Monitoring & Analytics**

1. **Firestore Usage**: Monitor reads/writes in Console
2. **Authentication**: Track user sign-ups and activity
3. **Performance**: Use Firebase Performance Monitoring (optional)

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **"Firebase not initialized"**
   - Check environment variables are set correctly
   - Restart development server after updating `.env.local`

2. **Authentication errors**
   - Verify authorized domains include `localhost`
   - Check API key permissions

3. **Firestore permission denied**
   - Review security rules
   - Ensure user is authenticated for protected operations

4. **Real-time not working**
   - Check browser console for errors
   - Verify Firestore security rules allow reads

### **Debug Tools:**
- **Firebase Console**: Real-time monitoring
- **Browser DevTools**: Network and console errors
- **Firebase Emulator**: Local testing environment

## 🎯 **Next Steps**

After setup:
1. Create your first user account
2. Build a quiz in the dashboard
3. Start a game and test multiplayer features
4. Invite friends to join with game PINs!

## 📚 **Additional Resources**

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth/web/start)
- [Real-time Listeners](https://firebase.google.com/docs/firestore/query-data/listen)

---

Your Kahoot! clone is now ready with Firebase power! 🔥