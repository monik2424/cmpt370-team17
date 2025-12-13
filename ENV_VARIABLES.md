# Production Environment Variables

Copy these variables to your Vercel project settings.

## Required Variables

### DATABASE_URL
**What:** PostgreSQL database connection string  
**Where to get:** Supabase, Neon, or Vercel Postgres  
**Example:**
```
postgresql://user:password@host.supabase.co:5432/postgres?schema=public
```

### AUTH_SECRET
**What:** Secret key for NextAuth.js session encryption  
**How to generate:**
```bash
openssl rand -base64 32
```
**Example output:**
```
Kx8vQ2mL9pR3nW5tY6uB8cD0eF1gH2iJ3kL4mN5oP6qR
```

### RESEND_API_KEY
**What:** API key for sending password reset emails  
**Where to get:** https://resend.com/api-keys  
**Current value:** (You already have this)
```
re_BYr3dFm4_EDhgoDyS58sBiehYnw4uT529
```

### EMAIL_USER
**What:** Gmail address for sending event invitations  
**Example:**
```
your-email@gmail.com
```

### EMAIL_PASS
**What:** Gmail app-specific password (not your regular password)  
**Where to get:**
1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to: https://myaccount.google.com/apppasswords
4. Generate password for "Mail" app
**Format:** 16 characters like `abcd efgh ijkl mnop`

### NEXT_PUBLIC_BASE_URL
**What:** Your production app URL  
**When:** After Vercel deployment, it will show your URL  
**Example:**
```
https://cmpt370-team-17.vercel.app
```

### NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN (Optional)
**What:** Token for map features  
**Current value:** (You already have this)
```
pk.eyJ1Ijoic3RlcmJlbjI2IiwiYSI6ImNtZ2l3dGRwdjBkdzYybXBwdjV3ZnhjcmwifQ.ndf8OFDUNkQB8TYXgpflqw
```

---

## How to Add in Vercel

1. Go to your Vercel project
2. Click "Settings" → "Environment Variables"
3. For each variable:
   - Click "Add New"
   - Name: Variable name (e.g., `DATABASE_URL`)
   - Value: The actual value
   - Environment: Select "Production" (and optionally "Preview" and "Development")
   - Click "Save"

---

## Quick Reference Table

| Variable Name | Required | Where to Get |
|--------------|----------|--------------|
| `DATABASE_URL` | ✅ Yes | Supabase/Neon |
| `AUTH_SECRET` | ✅ Yes | Generate: `openssl rand -base64 32` |
| `RESEND_API_KEY` | ✅ Yes | Already have it |
| `EMAIL_USER` | ✅ Yes | Your Gmail |
| `EMAIL_PASS` | ✅ Yes | Gmail App Password |
| `NEXT_PUBLIC_BASE_URL` | ✅ Yes | Vercel provides |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | ⚠️ Optional | Already have it |

