# Saskatoon Event Planning Platform

A modern full-stack web application for organizing private events in Saskatoon, built with Next.js, Prisma, and PostgreSQL.

## Project Overview

This application is designed to connect event hosts with local venues and service providers in Saskatoon. Unlike global platforms like Eventbrite, this focuses on private event coordination while offering flexibility to make events public if desired.

### Key Features
- **User Authentication**: Secure registration and login with NextAuth.js
- **Role-Based Access Control**: Support for Guests, Hosts, Providers, and Admins
- **Event Creation**: Plan birthdays, meetings, parties, and private gatherings
- **Venue Discovery**: Find restaurants, venues, and event spaces in Saskatoon
- **Guest Management**: Send invitations, track RSVPs, and manage guest lists
- **Service Providers**: Connect with caterers, entertainers, and event coordinators
- **Calendar Integration**: Automatic sync with default calendar applications (planned)

## Technology Stack

- **Frontend**: Next.js 15 with React 19 (App Router)
- **Styling**: Tailwind CSS 4 with custom components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Credentials Provider
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **Package Manager**: npm
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+ (installed locally)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cmpt370-team-17
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL Database**
   
   Make sure PostgreSQL is running on your machine. Then create the database:
   
   ```bash
   # Connect to PostgreSQL (Windows)
   psql -U postgres
   
   # Create the database
   CREATE DATABASE cmpt370;
   
   # Exit psql
   \q
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/cmpt370?schema=public"
   AUTH_SECRET="your-super-secret-auth-key-change-in-production"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-16-digit-app-password"
   ```
   
   Replace `YOUR_PASSWORD` with your PostgreSQL password.

5. **Set up Gmail for calendar invites**
   
   **Step 1 — Enable 2FA**
   - Go to: https://myaccount.google.com/security
   - Turn on 2-Step Verification
   
   **Step 2 — Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - App: "Mail" 
   - Device: "Other (Custom)" → Enter "Event Platform"
   - Copy the 16-digit password (format: `abcd efgh ijkl mnop`)
   - Use this as your `EMAIL_PASS` in `.env.local`

6. **Set up the database schema**
   ```bash
   npx prisma db push
   ```

7. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

8. **Start the development server**
   ```bash
   npm run dev
   ```

9. **Open your browser**
   - Landing page: http://localhost:3000
   - Login: http://localhost:3000/login
   - Register: http://localhost:3000/register

## Project Structure

```
cmpt370-team-17/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Landing page (public)
│   │   ├── layout.tsx                    # Root layout with SessionProvider
│   │   ├── providers.tsx                 # NextAuth SessionProvider wrapper
│   │   ├── login/
│   │   │   └── page.tsx                  # Login page
│   │   ├── register/
│   │   │   └── page.tsx                  # Registration page
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # User dashboard (protected)
│   │   ├── events/
│   │   │   └── page.tsx                  # Events page (protected)
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts          # NextAuth.js API route
│   │       └── register/
│   │           └── route.ts              # Registration API endpoint
│   ├── components/
│   │   ├── magicui/                      # Custom animation components
│   │   └── ui/                           # Reusable UI components
│   ├── generated/
│   │   └── prisma/                       # Generated Prisma client
│   ├── lib/
│   │   ├── auth.ts                       # NextAuth.js configuration
│   │   └── utils.ts                      # Utility functions
│   ├── modules/
│   │   └── db.ts                         # Prisma database connection
│   └── middleware.ts                     # Route protection middleware
├── prisma/
│   └── schema.prisma                     # Database schema
├── public/                                # Static assets
├── .env                                   # Environment variables (not in git)
└── package.json                          # Dependencies
```

## Database Schema

The application uses a simple Post model for demonstration:

```prisma
model Post {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([createdAt])
  @@map("posts")
}
```

## UI Components

### Custom Components
- **TextAnimate**: Animated text effects with various animations
- **BorderBeam**: Animated border effects
- **AnimatedBeam**: Connecting beam animations between elements
- **Button**: Styled button component with variants
- **Badge**: Badge component for tags and labels
- **Announcement**: Announcement banner component

### Styling
- Uses Tailwind CSS 4 with utility-first approach
- Custom color scheme optimized for event planning theme
- Responsive design that works on all devices
- Dark theme for landing page, light theme for main app

## Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm prisma generate  # Generate Prisma client
pnpm prisma db push   # Push schema changes to database
pnpm prisma studio    # Open database GUI
```

## Docker Setup

The PostgreSQL database runs in Docker:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - 5433:5432
    environment:
      POSTGRES_DB: cmpt370
      POSTGRES_HOST_AUTH_METHOD: trust
```

**Note**: Database runs on port 5433 to avoid conflicts with local PostgreSQL installations.

## Development Workflow

### Making Changes

1. **Database Schema Changes**
   ```bash
   # Edit prisma/schema.prisma
   pnpm prisma db push
   pnpm prisma generate
   ```

2. **Adding Dependencies**
   ```bash
   pnpm add <package-name>
   ```

3. **Creating New Pages**
   ```bash
   # Create new route: src/app/new-page/page.tsx
   ```

### Troubleshooting

**Database Connection Issues**
```bash
# Check if Docker is running
docker ps

# Restart database
docker compose down
docker compose up
```

**Prisma Client Issues**
```bash
# Regenerate client
pnpm prisma generate
```

**Port Conflicts**
- Database: Change port in `docker-compose.yml` if 5433 is occupied
- App: Next.js will automatically use next available port if 3000 is busy

## Current Features

### Landing Page (`/home`)
- Animated hero section with background GIF
- Feature cards showcasing event planning capabilities
- Interactive architecture diagram
- Modern, professional design

### Main App (`/`)
- Event-themed interface (using posts as demo data)
- Generate sample events with Faker.js
- Card-based layout with event metadata
- Responsive grid system

## Future Development

### Planned Features
- User authentication (NextAuth.js)
- Real event management (replace posts with events)
- Venue and service provider registration
- Google Maps integration
- Calendar sync (Google Calendar, iCal)
- Guest invitation system
- Payment processing for bookings

### Database Expansion
- User model with role-based access
- Event model with full event details
- Venue model for service providers
- Booking model for reservations
- Guest model for invitation management

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Notes

- **Package Manager**: Uses pnpm for faster, more efficient package management
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **Styling**: Tailwind CSS 4 with custom components
- **Animations**: Framer Motion for smooth, professional animations
- **Development**: Hot reload enabled for fast development

## Known Issues

- Landing page GIF may not load if `final.gif` is missing from public folder
- Database needs to be running for the app to work properly
- Some animations may be slow on older devices

## Support

For questions or issues, please:
1. Check this README first
2. Look at the terminal output for error messages
3. Ensure Docker and database are running
4. Contact the development team

---

**Built for Saskatoon event planning**