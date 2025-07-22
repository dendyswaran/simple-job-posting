# Job Posting App

This is a [Next.js](https://nextjs.org) project with full-featured authentication and job posting, using Supabase and ShadcnUI.

Use PNPM is recommended, but you can still use yarn or npm.
This project was tested on node version v22.17.0.

## How to Run and Deploy

### 1. Supabase Setup
- Create a project at [supabase.com](https://supabase.com)
- In your Supabase dashboard, go to **Settings > API** and copy your project URL and anon key
- Run this script to allow system to peform existing account validation
```sql
CREATE OR REPLACE VIEW public.user_profiles
WITH (security_invoker = of) AS
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', '') as full_name,
  raw_user_meta_data->>'avatar_url' as avatar_url,
  confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at
FROM auth.users;
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=ANON_KEY
NEXT_SUPABASE_SERVICE_ROLE_KEY=ROLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Redis configuration (optional - falls back to memory if not provided)
REDIS_URL=redis://localhost:6379
```

### 3. Install Dependencies & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Redis Setup (Optional)
The app uses Redis for caching job listings to improve performance. If Redis is not available, the app will work without caching.

- **Local development**: Install Redis locally or use Docker: `docker run -d -p 6379:6379 redis:alpine`
- **Production**: Use Redis Cloud, AWS ElastiCache, or any Redis provider
- **Environment variable**: Set `REDIS_URL` to your Redis connection string

## Authentication Features
- User registration and login (Supabase Auth)
- Email verification
- Secure session management (httpOnly cookies)
- Protected routes with middleware
- ShadcnUI components for all auth and UI
- Server actions for all backend logic
- React hooks for client-side state

## File Structure and Architecture (Key Parts)

The integration between the Supabase platform and Next.js is implemented at the backend layer to enhance security and prevent exposure of sensitive data.

```
app/
  auth/         # Auth pages (login, signup, callback)
  dashboard/    # Protected dashboard
components/
  auth/         # Auth UI components
  layout/       # Header, layout
  ui/           # ShadcnUI components
hooks/          # use-auth, use-job-posts, etc.
lib/
  auth/         # Auth server actions
  jobs/         # Job server actions
  supabase/     # Supabase client/server
middleware.ts   # Route protection
```

## Usage Examples
- **Protect a page:**
  ```ts
  import { getUser } from '@/lib/auth/actions'
  import { redirect } from 'next/navigation'
  export default async function ProtectedPage() {
    const user = await getUser()
    if (!user) redirect('/auth/login')
    return <div>Welcome {user.email}!</div>
  }
  ```
- **Use auth state in client:**
  ```ts
  import { useAuth } from '@/hooks/use-auth'
  const { user, loading } = useAuth()
  ```

## Deployment
- You can deploy on [Vercel](https://vercel.com/) or any platform supporting Next.js and environment variables.
- Make sure to set the same environment variables in your deployment platform.

## What can be improved?
- SEO implementation
- Enable AI to enhance the job creation. (`/lib/jobs/llm.actions.ts`)
- Improve the security (rate limiting, captcha)
- Allow user to apply job

---

For more details, see the code and comments in each file. This README covers the essentials to get started and run the app securely with authentication.
