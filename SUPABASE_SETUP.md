# Supabase Database Setup Guide

This guide will help you set up Supabase as the database for your Kahoot! clone.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `kahoot-clone`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your location
5. Click "Create new project"

## 2. Get Your Project Credentials

After your project is created:

1. Go to Settings → API
2. Copy the following values:
   - Project URL
   - Project API keys (anon public key and service_role key)

## 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 4. Set Up Database Schema

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the contents of `database/schema.sql`
4. Paste it into the SQL Editor and click "Run"

This will create:
- `users` table for user profiles
- `quizzes` table for quiz data
- `games` table for active games
- `game_sessions` table for player sessions
- Row Level Security (RLS) policies
- Database functions for game PIN generation

## 5. Configure Authentication

1. Go to Authentication → Settings
2. Configure your authentication settings:
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: `http://localhost:3000/auth/callback`

## 6. Enable Real-time (Optional)

1. Go to Database → Replication
2. Enable replication for the tables you want real-time updates:
   - `games`
   - `game_sessions`

## 7. Test the Setup

1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Try creating an account and logging in
4. Create a quiz and start a game

## Database Schema Overview

### Users Table
- Stores user profiles linked to Supabase Auth
- Includes role-based access (teacher/student)

### Quizzes Table
- Stores quiz content and metadata
- Links to creator via foreign key
- Uses JSONB for flexible question storage

### Games Table
- Stores active game sessions
- Links to quizzes and hosts
- Uses JSONB for player data and real-time updates

### Game Sessions Table
- Tracks individual player participation
- Stores scores and answers
- Enables detailed analytics

## Real-time Features

The setup includes real-time subscriptions for:
- Players joining/leaving games
- Game status updates
- Live score updates
- Question transitions

## Security

Row Level Security (RLS) is enabled with policies that ensure:
- Users can only see their own data
- Teachers can manage their own quizzes
- Game data is accessible to participants
- Proper isolation between different games

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Loaded**
   - Restart your development server after updating `.env.local`

2. **RLS Policies Blocking Access**
   - Check that your policies match your authentication flow
   - Ensure you're passing the correct user IDs

3. **Real-time Not Working**
   - Enable replication for the tables you need
   - Check browser console for connection errors

4. **Database Functions Not Found**
   - Make sure you ran the complete schema.sql file
   - Check the Functions tab in Supabase dashboard

For more help, check the [Supabase documentation](https://supabase.com/docs) or the [Next.js guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs).