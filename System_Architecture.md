# BDS Web Application - System Architecture

## Document Version
**Version:** 1.0  
**Last Updated:** 2025-01-27  
**Project:** Bahrain Dental Society (BDS) Web Platform

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Patterns](#architecture-patterns)
4. [System Components](#system-components)
5. [Data Flow](#data-flow)
6. [Security Architecture](#security-architecture)
7. [Deployment Architecture](#deployment-architecture)
8. [Scalability & Performance](#scalability--performance)

---

## Executive Summary

The BDS Web Application is a comprehensive membership management and event management platform built for the Bahrain Dental Society. The system provides:

- **Public-facing website** for event browsing, membership information, and research publications
- **Member dashboard** for managing membership, viewing certificates, and attending events
- **Admin dashboard** for complete system management including events, members, payments, and content

The application follows a modern **Next.js 16** architecture with **React 19**, utilizing **Supabase** as the backend database and storage solution, and **Firebase** for push notifications.

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Public Pages  │  │ Member Dash  │  │ Admin Dash   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Application Server                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │           API Routes (Route Handlers)              │     │
│  │  /api/auth/*  /api/admin/*  /api/dashboard/*      │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Server Components & Pages                  │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Supabase    │   │  Firebase    │   │  MyFatoorah  │
│  Database    │   │  Cloud       │   │  Payment     │
│  & Storage   │   │  Messaging   │   │  Gateway     │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Technology Stack

- **Frontend Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Authentication:** JWT (jsonwebtoken)
- **Payment Gateway:** MyFatoorah
- **Push Notifications:** Firebase Cloud Messaging
- **File Processing:** PDFKit, jsPDF, html2canvas
- **QR Codes:** qrcode.react, react-qr-code

---

## Architecture Patterns

### 1. **Next.js App Router Architecture**

The application uses Next.js 16 App Router with the following structure:

```
src/app/
├── (public routes)
│   ├── page.js              # Homepage
│   ├── events/              # Public events
│   ├── research/           # Research publications
│   ├── gallery/            # Photo gallery
│   └── committees/         # Committee pages
│
├── admin/
│   ├── (auth)/
│   │   └── login/          # Admin login
│   └── (dashboard)/        # Admin dashboard routes
│       ├── dashboard/      # Admin dashboard
│       ├── events/         # Event management
│       ├── members/        # Member management
│       └── research/        # Research management
│
├── member/
│   └── dashboard/           # Member dashboard routes
│       ├── membership/     # Membership card
│       ├── events/         # Member events
│       └── certificates/   # Certificates
│
└── api/                     # API routes
    ├── auth/               # Authentication APIs
    ├── admin/              # Admin APIs
    ├── dashboard/         # Member APIs
    └── payments/          # Payment APIs
```

### 2. **API Route Pattern**

All API routes follow RESTful conventions:

- **GET** `/api/resource` - List resources
- **GET** `/api/resource/[id]` - Get single resource
- **POST** `/api/resource` - Create resource
- **PUT** `/api/resource/[id]` - Update resource
- **DELETE** `/api/resource/[id]` - Delete resource

### 3. **Authentication Pattern**

- **JWT-based authentication** using `jsonwebtoken`
- Tokens stored in HTTP-only cookies (`bds_token`)
- Role-based access control (admin, member)
- Server-side token verification in API routes

### 4. **File Upload Pattern**

- **Multipart form data** for file uploads
- Files stored in Supabase Storage buckets
- Organized by type: `profile_pictures/`, `events/`, `gallery/`, `research/`
- Public URLs generated for access

---

## System Components

### 1. **Public Website**

**Purpose:** Public-facing website for non-authenticated users

**Key Features:**
- Event browsing and search
- Membership information
- Research publications
- Gallery viewing
- Committee pages
- Contact forms

**Components:**
- `src/app/page.js` - Homepage
- `src/app/events/page.js` - Events listing
- `src/app/research/page.js` - Research publications
- `src/components/Navbar.js` - Navigation
- `src/components/Footer.js` - Footer

### 2. **Member Dashboard**

**Purpose:** Authenticated member portal

**Key Features:**
- Digital membership card with QR code
- Event registration and check-in
- Certificate downloads
- Payment history
- Profile management
- Verification document upload

**Components:**
- `src/app/member/dashboard/membership/page.js` - Membership card
- `src/app/member/dashboard/events/page.js` - Member events
- `src/app/member/dashboard/certificates/page.js` - Certificates
- `src/components/dashboard/MembershipCard.js` - QR code card

### 3. **Admin Dashboard**

**Purpose:** Administrative control panel

**Key Features:**
- Event management (CRUD)
- Member management and verification
- Payment processing
- Content management (committees, gallery, research)
- Analytics and reporting
- Notification management

**Components:**
- `src/app/admin/(dashboard)/dashboard/page.js` - Admin dashboard
- `src/app/admin/(dashboard)/events/` - Event management
- `src/app/admin/(dashboard)/members/` - Member management
- `src/components/dashboard/Sidebar.js` - Admin navigation

### 4. **API Layer**

**Purpose:** Server-side business logic and data access

**Structure:**
```
/api/
├── auth/              # Authentication & authorization
├── admin/             # Admin-only operations
├── dashboard/         # Member operations
├── payments/          # Payment processing
├── event/             # Event operations
└── research/          # Research operations
```

**Key APIs:**
- Authentication: `/api/auth/login`, `/api/auth/register`
- Events: `/api/event/public`, `/api/admin/events`
- Members: `/api/admin/members`, `/api/dashboard/membership-info`
- Payments: `/api/payments/event/create-invoice`, `/api/payments/subscription/create-invoice`
- Research: `/api/research`, `/api/admin/research`

### 5. **Database Layer (Supabase)**

**Purpose:** Data persistence and storage

**Key Tables:**
- `users` - User accounts (admin and members)
- `member_profiles` - Extended member information
- `events` - Event data
- `event_members` - Event registrations
- `attendance_logs` - Check-in records
- `membership_payments` - Payment records
- `subscription_plans` - Membership plans
- `user_subscriptions` - User subscription records
- `research` - Research publications
- `committees` - Committee information
- `notifications` - User notifications

**Storage Buckets:**
- `profile_pictures` - User photos, verification documents
- `events` - Event images
- `gallery` - Gallery images
- `research` - Research files

### 6. **Payment Integration (MyFatoorah)**

**Purpose:** Process payments for events and subscriptions

**Flow:**
1. User initiates payment
2. System creates invoice via MyFatoorah API
3. User selects payment method
4. Redirects to payment gateway
5. Callback URL processes payment result
6. Updates database and sends notifications

**Two Separate Accounts:**
- Event payments: `MYFATOORAH_EVENT_API_KEY`
- Subscription payments: `MYFATOORAH_SUBSCRIPTION_API_KEY`

### 7. **Notification System (Firebase)**

**Purpose:** Push notifications to users

**Features:**
- Browser push notifications
- In-app notification center
- Notification targeting (all, free, paid, event-specific)
- Notification history and read status

---

## Data Flow

### 1. **User Registration Flow**

```
User fills form → POST /api/auth/register
    ↓
Validate data → Check duplicates
    ↓
Hash password → Create user record
    ↓
Create member_profile → Upload documents (if provided)
    ↓
Create subscription record → Create payment records (if paid)
    ↓
Return success → Redirect to payment/login
```

### 2. **Event Registration Flow**

```
Member browses events → Clicks "Join Event"
    ↓
POST /api/event/join → Check membership status
    ↓
Calculate price (member discount) → Create event_member record
    ↓
If paid event → Create payment record → Redirect to payment
    ↓
If free event → Confirm registration → Show success
```

### 3. **Payment Flow**

```
User initiates payment → POST /api/payments/*/create-invoice
    ↓
Create MyFatoorah invoice → Get payment methods
    ↓
User selects method → POST /api/payments/*/execute-payment
    ↓
Redirect to MyFatoorah → User completes payment
    ↓
MyFatoorah callback → POST /api/payments/*/callback
    ↓
Verify payment → Update database → Send notifications
```

### 4. **Check-In Flow**

```
Admin scans QR code → POST /api/check-in/validate
    ↓
Verify token → Check event membership
    ↓
Create attendance_log → Update event_member.checked_in
    ↓
Return success → Show member details
```

---

## Security Architecture

### 1. **Authentication**

- **JWT Tokens:** Signed with `JWT_SECRET`
- **HTTP-only Cookies:** Prevents XSS attacks
- **Token Expiration:** Configurable expiration
- **Role-based Access:** Admin vs Member roles

### 2. **Authorization**

- **API Route Guards:** All admin APIs verify JWT
- **Role Checks:** Verify user role before operations
- **Resource Ownership:** Members can only access their own data

### 3. **Data Protection**

- **Password Hashing:** bcryptjs with salt rounds (10)
- **Input Validation:** Server-side validation for all inputs
- **SQL Injection Prevention:** Supabase parameterized queries
- **File Upload Validation:** Type and size checks

### 4. **Storage Security**

- **Bucket Policies:** Public buckets for public assets, private for sensitive
- **File Access Control:** Verification documents in private paths
- **URL Signing:** Time-limited signed URLs for private files

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│         Vercel / Hosting Platform        │
│  ┌──────────────────────────────────┐  │
│  │      Next.js Application          │  │
│  │  - Server-side rendering          │  │
│  │  - API routes                      │  │
│  │  - Static assets                   │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Supabase │  │ Firebase │  │MyFatoorah│
│  Cloud    │  │  Cloud   │  │   API    │
└──────────┘  └──────────┘  └──────────┘
```

### Environment Variables

- **Database:** `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **Firebase:** `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT`
- **Payment:** `MYFATOORAH_EVENT_API_KEY`, `MYFATOORAH_SUBSCRIPTION_API_KEY`
- **Security:** `JWT_SECRET`
- **Email:** `SMTP_*` (if using email)

---

## Scalability & Performance

### 1. **Database Optimization**

- **Indexes:** Strategic indexes on frequently queried columns
- **Pagination:** All list endpoints support pagination
- **Query Optimization:** Efficient joins and selects
- **Connection Pooling:** Supabase handles connection pooling

### 2. **Caching Strategy**

- **Static Generation:** Next.js static generation for public pages
- **ISR (Incremental Static Regeneration):** For dynamic content
- **CDN:** Vercel CDN for static assets
- **Browser Caching:** Cache headers for images and assets

### 3. **File Storage**

- **Supabase Storage:** Scalable object storage
- **Image Optimization:** Next.js Image component
- **Lazy Loading:** Images loaded on demand

### 4. **API Performance**

- **Pagination:** Limits data transfer
- **Selective Fields:** Only fetch required fields
- **Debouncing:** Search inputs debounced
- **Error Handling:** Graceful error handling prevents crashes

---

## System Boundaries

### External Integrations

1. **Supabase**
   - Database operations
   - File storage
   - Real-time subscriptions (if used)

2. **Firebase**
   - Push notifications
   - FCM token management

3. **MyFatoorah**
   - Payment processing
   - Invoice management
   - Payment callbacks

4. **Email Service (Optional)**
   - Transactional emails
   - Notifications

---

## Future Enhancements

### Potential Improvements

1. **Real-time Features**
   - WebSocket connections for live updates
   - Real-time event capacity updates

2. **Advanced Analytics**
   - User behavior tracking
   - Event performance metrics
   - Revenue analytics

3. **Mobile App**
   - React Native application
   - Native push notifications
   - Offline support

4. **Advanced Search**
   - Full-text search with Elasticsearch
   - Advanced filtering options

---

## Conclusion

The BDS Web Application is built on modern, scalable technologies with a clear separation of concerns. The architecture supports:

- **Scalability:** Can handle growing user base
- **Maintainability:** Clear code organization
- **Security:** Multiple layers of protection
- **Performance:** Optimized for speed
- **Extensibility:** Easy to add new features

The system is production-ready and follows industry best practices for web application development.

---

**Document End**

