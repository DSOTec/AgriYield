# AgriYield Frontend-Backend Integration Guide

## 🎯 Overview

This guide documents the complete integration between the AgriYield Next.js frontend and Node.js backend API.

## 🔧 Backend Configuration

**Base URL:** `http://localhost:8000/api`  
**Port:** 8000  
**Auth Type:** JWT (Bearer Token)  
**Swagger Docs:** `http://localhost:8000/api-docs/#/`

## 📁 Project Structure

```
AgriYield/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── controllers/       # Auth, Farm, Investment controllers
│   │   ├── middleware/        # JWT authentication middleware
│   │   └── routes/           # API routes
│   ├── .env                   # Backend environment variables
│   └── package.json
│
├── frontend/                  # Next.js 15 + TypeScript
│   ├── app/                   # App router pages
│   │   ├── signup/           # User registration
│   │   ├── signin/           # User login
│   │   ├── dashboard/        # Role-based dashboards
│   │   ├── farm-listings/    # Public farm listings
│   │   └── about/            # About page with mission/vision
│   ├── components/           # Reusable components
│   │   ├── auth/             # Protected routes, modals
│   │   ├── wallet/           # Wallet connection
│   │   └── navigation.tsx    # Main navigation with theme toggle
│   ├── lib/
│   │   ├── api/              # API client & services
│   │   │   ├── client.ts     # Axios instance with interceptors
│   │   │   └── auth.service.ts # Auth API methods
│   │   └── auth-context.tsx  # Auth state management
│   ├── .env.local            # Frontend environment variables
│   └── package.json
│
└── shared/                    # Shared TypeScript types
```

## 🔐 Authentication Flow

### 1. Sign Up (`POST /auth/signup`)

**Frontend:** `app/signup/page.tsx`

```typescript
// Request
{
  fullName: string
  email: string
  password: string
  role: "farmer" | "investor"
}

// Response
{
  token: string
  user: {
    id: string
    fullName: string
    email: string
    role: "farmer" | "investor"
    isVerified: boolean
    walletAddress?: string
  }
}
```

**Flow:**
1. User fills signup form with full name, email, password, and role
2. Frontend calls `authService.signUp()`
3. Backend creates user and returns JWT token
4. Token stored in `localStorage` as `agriyield_token`
5. User data stored in `localStorage` as `agriyield_user`
6. User redirected to role-specific dashboard

### 2. Sign In (`POST /auth/signin`)

**Frontend:** `app/signin/page.tsx`

```typescript
// Request
{
  email: string
  password: string
}

// Response (same as signup)
```

**Flow:**
1. User enters email and password
2. Frontend calls `authService.signIn()`
3. Backend validates credentials and returns JWT
4. Token and user data stored in localStorage
5. User redirected based on role:
   - Farmer → `/dashboard/farmer`
   - Investor → `/dashboard/investor`

### 3. Connect Wallet (`POST /auth/connect-wallet`)

**Frontend:** `components/wallet/wallet-connect-modal.tsx`

```typescript
// Request
{
  walletAddress: string
}

// Response
{
  id: string
  fullName: string
  email: string
  role: string
  walletAddress: string
  isVerified: boolean
}
```

**Flow:**
1. User clicks "Connect Wallet" in navigation
2. MetaMask popup requests account access
3. Frontend calls `authService.connectWallet(walletAddress)`
4. Backend updates user profile with wallet address
5. Navigation shows AGT balance and wallet status

### 4. Get Profile (`GET /auth/profile`)

**Frontend:** `lib/auth-context.tsx`

```typescript
// Headers
Authorization: Bearer <jwt_token>

// Response
{
  id: string
  fullName: string
  email: string
  role: "farmer" | "investor"
  walletAddress?: string
  isVerified: boolean
}
```

**Flow:**
- Called on app initialization to validate token
- Called after wallet connection to refresh user data
- Used by protected routes to verify authentication

## 🛡️ Protected Routes

**Component:** `components/auth/protected-route.tsx`

**Features:**
- Checks for JWT token in localStorage
- Validates token by calling `/auth/profile`
- Redirects unauthenticated users to `/signin`
- Enforces role-based access control
- Shows loading state during authentication check

**Usage:**
```tsx
<ProtectedRoute requiredRole="farmer">
  <FarmerDashboard />
</ProtectedRoute>
```

## 🔄 API Client Configuration

**File:** `lib/api/client.ts`

**Features:**
- Axios instance with base URL from environment
- Request interceptor: Auto-attaches JWT to headers
- Response interceptor: Handles 401 errors and token expiration
- Automatic redirect to `/signin` on auth failure

```typescript
// Request Interceptor
config.headers.Authorization = `Bearer ${localStorage.getItem('agriyield_token')}`

// Response Interceptor
if (error.response?.status === 401) {
  localStorage.clear()
  window.location.href = '/signin'
}
```

## 🎨 UI Features

### Theme Toggle
- **Component:** `components/theme-toggle.tsx`
- **Library:** `next-themes`
- **Persistence:** Automatic via next-themes
- **Location:** Navigation bar (desktop & mobile)

### Wallet Connection
- **Provider:** MetaMask (primary)
- **Token:** AGT (AgriYield Token)
- **Display:** Balance shown in navigation after connection
- **Integration:** Real MetaMask via `window.ethereum`

### Navigation
- **Public Links:** Farm Listing, Marketplace, About
- **Authenticated:** Dashboard (role-specific)
- **Auth State:** Sign In/Sign Up OR Connect Wallet OR User Menu
- **Responsive:** Mobile hamburger menu

## 📄 Key Pages

### Sign Up (`/signup`)
- Full name, email, password, confirm password
- Role selector: Farmer or Investor
- Password validation with visual feedback
- Error handling with toast notifications
- Direct redirect to dashboard after signup

### Sign In (`/signin`)
- Email and password inputs
- "Forgot Password" modal
- Role-based redirect after login
- Error handling with descriptive messages

### Farm Listings (`/farm-listings`)
- **Public Access:** Visible to all visitors
- **Search & Filters:** Crop type, region, ROI range
- **Investment Action:** Requires authentication
- **Farm Cards:** Image, ROI, funding progress, location
- **Nigeria-focused:** All locations in Nigeria

### About (`/about`)
- **Who We Are:** Mission statement
- **Our Vision:** Empowering African agriculture via blockchain
- **How It Works:** 3-step flow (Fund → Farm → Earn)
- **Our Values:** Trust, transparency, innovation
- **Impact Metrics:** Animated counters
- **Smooth Animations:** Framer Motion throughout

### Dashboards
- **Farmer:** `/dashboard/farmer` - Create listings, track farms
- **Investor:** `/dashboard/investor` - Browse farms, manage portfolio
- **Protected:** Role-based access control
- **Real-time Data:** Fetched from backend API

## 🚀 Running the Application

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure .env with your settings
npm run dev
# Server runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
pnpm install
cp .env.local.example .env.local
# .env.local is already configured
pnpm dev
# App runs on http://localhost:3000
```

## 🔑 Environment Variables

### Backend (`.env`)
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/agriyield
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRY=7d
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=AgriYield
NEXT_PUBLIC_TOKEN_SYMBOL=AGT
NODE_ENV=development
```

## 📦 Key Dependencies

### Frontend
- **Framework:** Next.js 15.2.4 (App Router)
- **UI:** TailwindCSS + Shadcn/ui
- **Animations:** Framer Motion
- **HTTP Client:** Axios 1.12.2
- **Forms:** React Hook Form + Zod
- **Theme:** next-themes
- **Notifications:** Sonner
- **Maps:** Leaflet
- **Charts:** Recharts

### Backend
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Validation:** Express Validator
- **Docs:** Swagger

## 🎯 Integration Checklist

- ✅ Axios client with JWT interceptors
- ✅ Auth service layer (signup, signin, connect-wallet, profile)
- ✅ Auth context with backend integration
- ✅ Signup page with full name field
- ✅ Signin page with role-based redirect
- ✅ Protected route middleware
- ✅ MetaMask wallet connection
- ✅ Role-based dashboard access
- ✅ Theme toggle with persistence
- ✅ Public farm listings
- ✅ Enhanced About page
- ✅ Environment configuration
- ✅ Error handling & toast notifications
- ✅ Responsive design (mobile, tablet, desktop)

## 🐛 Error Handling

### Frontend
- **API Errors:** Displayed via toast notifications (Sonner)
- **Token Expiration:** Auto-redirect to `/signin`
- **Network Errors:** User-friendly error messages
- **Form Validation:** Real-time with visual feedback

### Backend
- **Validation Errors:** Returned with 400 status
- **Auth Errors:** 401 for invalid/expired tokens
- **Server Errors:** 500 with error message

## 🔒 Security Features

1. **JWT Authentication:** Secure token-based auth
2. **Password Hashing:** bcrypt for password storage
3. **CORS:** Configured for frontend origin
4. **Protected Routes:** Server-side validation
5. **Input Validation:** Both client and server-side
6. **XSS Protection:** React's built-in escaping
7. **Secure Headers:** Helmet.js middleware

## 📱 Responsive Design

All pages are fully responsive:
- **Mobile:** < 768px (hamburger menu)
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## 🎨 Design System

- **Colors:** Emerald (primary), Amber (secondary)
- **Token Symbol:** AGT
- **Typography:** Geist font family
- **Icons:** Lucide React
- **Animations:** Framer Motion (page transitions, hover effects)

## 📚 API Endpoints Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | No | Register new user |
| POST | `/auth/signin` | No | Login user |
| POST | `/auth/connect-wallet` | Yes | Link wallet address |
| GET | `/auth/profile` | Yes | Get user profile |

## 🎉 Next Steps

1. **Start Backend:** `cd backend && npm run dev`
2. **Start Frontend:** `cd frontend && pnpm dev`
3. **Test Authentication:** Sign up → Sign in → Connect wallet
4. **Explore Features:** Browse farms, view dashboards
5. **Check Swagger Docs:** `http://localhost:8000/api-docs`

## 💡 Tips

- Use different browsers/incognito for testing multiple roles
- Check browser console for detailed error logs
- Monitor backend terminal for API request logs
- Use Redux DevTools or React DevTools for debugging
- Test MetaMask connection in Chrome/Brave/Firefox

---

**Built with ❤️ for African Agriculture**
