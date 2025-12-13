# Deployment Guide - Jenkins CI + Vercel CD

This guide will help you set up automated deployment using Jenkins for testing and Vercel for hosting.

## Architecture Overview

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   GitLab    │──────▶│   Jenkins    │──────▶│   Vercel    │
│ (Code Repo) │       │  (CI Tests)  │       │ (Deployment)│
└─────────────┘       └──────────────┘       └─────────────┘
     Push                Run checks            Auto-deploy
     Code                (if pass)             to production
```

**How it works:**
1. You push code to GitLab
2. Jenkins automatically runs quality checks (linting, build test, TypeScript)
3. If all checks pass, Vercel automatically deploys your app
4. If checks fail, deployment is blocked

---

## Step 1: Create Vercel Account (5 minutes)

### 1.1 Sign up for Vercel

1. Go to: https://vercel.com/signup
2. Click "Continue with GitLab"
3. Authorize Vercel to access your GitLab account
4. Complete the registration

### 1.2 Import your project

1. After login, click "Add New..." → "Project"
2. Select your GitLab repository: `cmpt370-team-17`
3. Vercel will auto-detect it's a Next.js project
4. **DON'T DEPLOY YET** - click "Configure Project"

### 1.3 Configure environment variables

In the "Environment Variables" section, add these:

**Required variables:**

```env
DATABASE_URL
  Value: (we'll add this in Step 2 - Database Setup)

AUTH_SECRET
  Value: (generate with: openssl rand -base64 32)
  
RESEND_API_KEY
  Value: re_BYr3dFm4_EDhgoDyS58sBiehYnw4uT529

EMAIL_USER
  Value: your-email@gmail.com

EMAIL_PASS
  Value: your-gmail-app-password

NEXT_PUBLIC_BASE_URL
  Value: https://your-project-name.vercel.app (Vercel will show this URL)

NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  Value: pk.eyJ1Ijoic3RlcmJlbjI2IiwiYSI6ImNtZ2l3dGRwdjBkdzYybXBwdjV3ZnhjcmwifQ.ndf8OFDUNkQB8TYXgpflqw
```

4. Click "Deploy" (first deployment will fail - that's OK! We need to set up the database first)

---

## Step 2: Set up Production Database (10 minutes)

### Option A: Supabase (Recommended - Free)

1. Go to: https://supabase.com
2. Sign up/login with GitLab
3. Click "New Project"
4. Fill in:
   - Name: `cmpt370-production`
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to you
5. Wait for database to be created (~2 minutes)
6. Go to: Settings → Database → Connection String → URI
7. Copy the connection string
8. In Vercel: Settings → Environment Variables → Edit `DATABASE_URL`
9. Paste the Supabase connection string

### Option B: Vercel Postgres (Paid after trial)

1. In Vercel project, go to Storage tab
2. Click "Create Database" → "Postgres"
3. Name it: `cmpt370-db`
4. Vercel automatically adds `DATABASE_URL` to your project

### Option C: Neon (Free tier)

1. Go to: https://neon.tech
2. Sign up and create a new project
3. Copy the connection string
4. Add to Vercel as `DATABASE_URL`

### 2.2 Run database migrations

After setting up the database:

```bash
# In your local project directory
# Update DATABASE_URL in .env to point to production database
npx prisma migrate deploy
```

Or use Vercel's build settings:
- Settings → General → Build & Development Settings
- Build Command: `npx prisma generate && npx prisma migrate deploy && npm run build`

---

## Step 3: Set up Jenkins (20-30 minutes)

### Option A: Use University Jenkins Server

If your university provides a Jenkins server:

1. Contact your TA/professor for Jenkins access
2. Get your credentials
3. Skip to Step 3.3 (Create Jenkins Job)

### Option B: Install Jenkins Locally (Windows)

1. **Install Java (required for Jenkins)**
   - Download Java 17 or 21: https://adoptium.net/
   - Install and verify:
     ```powershell
     java -version
     ```

2. **Download Jenkins**
   - Go to: https://www.jenkins.io/download/
   - Download "Windows" installer (`.msi` file)
   - Run the installer

3. **Initial Setup**
   - Jenkins will open in browser: http://localhost:8080
   - Get initial admin password:
     ```powershell
     Get-Content "C:\Program Files\Jenkins\secrets\initialAdminPassword"
     ```
   - Paste the password
   - Click "Install suggested plugins"
   - Create admin user

4. **Install Node.js Plugin**
   - Dashboard → Manage Jenkins → Plugins
   - Click "Available plugins"
   - Search for "NodeJS"
   - Install "NodeJS Plugin"
   - Restart Jenkins

5. **Configure Node.js**
   - Manage Jenkins → Tools
   - Scroll to "NodeJS installations"
   - Click "Add NodeJS"
   - Name: `Node-20`
   - Version: Select Node.js 20.x
   - Save

### 3.3 Create Jenkins Job

1. **Create new pipeline job**
   - Jenkins Dashboard → "New Item"
   - Name: `cmpt370-team-17-ci`
   - Type: "Pipeline"
   - Click OK

2. **Configure Git repository**
   - Under "Pipeline" section
   - Definition: "Pipeline script from SCM"
   - SCM: "Git"
   - Repository URL: Your GitLab repo URL
     ```
     https://git.cs.usask.ca/your-username/cmpt370-team-17.git
     ```
   - Credentials: Click "Add" → "Jenkins"
     - Kind: "Username with password"
     - Username: Your GitLab username
     - Password: Your GitLab personal access token
       (Get token from: GitLab → Settings → Access Tokens)
     - ID: `gitlab-credentials`
     - Add

3. **Configure build triggers**
   - Under "Build Triggers"
   - Check "Poll SCM"
   - Schedule: `H/5 * * * *` (check every 5 minutes)
   
   Or for immediate webhook (advanced):
   - Check "Build when a change is pushed to GitLab"
   - Copy webhook URL
   - Go to GitLab → Settings → Webhooks
   - Add the Jenkins webhook URL

4. **Set script path**
   - Script Path: `Jenkinsfile`
   - Uncheck "Lightweight checkout"

5. **Save**

### 3.4 Test the pipeline

1. Click "Build Now"
2. Watch the console output
3. All stages should pass

---

## Step 4: Test the Complete Pipeline

### 4.1 Make a test change

```bash
# In your project directory
echo "// Test deployment pipeline" >> README.md
git add README.md
git commit -m "test: verify deployment pipeline"
git push origin main
```

### 4.2 Watch the pipeline

1. **Jenkins** (within 5 minutes):
   - Go to Jenkins job
   - New build should appear
   - Watch it run through all stages
   - Should see: ✅ Pipeline completed successfully!

2. **Vercel** (after Jenkins passes):
   - Go to Vercel dashboard
   - See new deployment starting
   - Wait ~2 minutes for deployment
   - Click "Visit" to see your live site!

---

## Step 5: Seed Production Database

After successful deployment:

1. Visit: `https://your-app.vercel.app/api/provider/seed`
2. This creates 10 Saskatoon providers
3. You can now test the full application

---

## Environment Variables Summary

Here's what you need to set in Vercel:

| Variable | Where to get it | Required? |
|----------|----------------|-----------|
| `DATABASE_URL` | Supabase/Neon/Vercel Postgres | ✅ Yes |
| `AUTH_SECRET` | Generate: `openssl rand -base64 32` | ✅ Yes |
| `RESEND_API_KEY` | Already have it | ✅ Yes |
| `EMAIL_USER` | Your Gmail | ✅ Yes |
| `EMAIL_PASS` | Gmail App Password | ✅ Yes |
| `NEXT_PUBLIC_BASE_URL` | Vercel provides this | ✅ Yes |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Already have it | ⚠️ Optional |

---

## Testing Checklist

After deployment, test these features:

- [ ] Visit homepage
- [ ] Register new user
- [ ] Login
- [ ] Create event
- [ ] Password reset (check email)
- [ ] Login as provider
- [ ] View provider bookings
- [ ] Book a provider

---

## Troubleshooting

### Jenkins build fails at "Install Dependencies"

**Error:** `npm ci` fails
**Fix:** Make sure `package-lock.json` is committed to git

### Jenkins build fails at "Prisma Generate"

**Error:** Can't generate Prisma client
**Fix:** Make sure `prisma/schema.prisma` is in your repository

### Vercel deployment fails

**Error:** "Internal Server Error"
**Fix:** Check environment variables are set correctly in Vercel

### Database connection error on Vercel

**Error:** "Can't reach database server"
**Fix:** 
1. Check `DATABASE_URL` is correct
2. Make sure database allows connections from Vercel IPs
3. For Supabase: Check if connection pooling is enabled

### Emails not sending

**Error:** OTP/invites not delivered
**Fix:**
1. Verify `RESEND_API_KEY` is correct
2. Check Resend dashboard for delivery logs
3. For Gmail: Verify `EMAIL_USER` and `EMAIL_PASS`

---

## Quick Commands Reference

```bash
# Generate AUTH_SECRET
openssl rand -base64 32

# Test build locally
npm run build

# Deploy database migrations
npx prisma migrate deploy

# Check Vercel logs
vercel logs production

# Redeploy on Vercel
git commit --allow-empty -m "trigger: redeploy"
git push
```

---

## What Happens on Each Push

1. **You push code** → GitLab receives code
2. **Jenkins detects change** → Runs quality checks (5-10 min)
   - ✅ Dependencies installed
   - ✅ Prisma schema valid
   - ✅ Linting passed
   - ✅ TypeScript checks passed
   - ✅ Build test successful
3. **Vercel detects change** → Deploys to production (2-3 min)
   - Builds app
   - Runs database migrations
   - Deploys to edge network
   - Your app is live! 🎉

---

## Next Steps

1. Share your Vercel URL with your team
2. Set up preview deployments for branches
3. Add monitoring (Vercel Analytics)
4. Configure custom domain (optional)

---

## Support

If you need help:
1. Check Jenkins console output for errors
2. Check Vercel deployment logs
3. Review this guide
4. Ask your TA/professor for assistance

**Your deployment URL will be:**
`https://cmpt370-team-17.vercel.app` (or similar)

Good luck! 🚀

