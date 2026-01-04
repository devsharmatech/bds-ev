# BDS Web Application - Technology Stack

## Document Version
**Version:** 1.0  
**Last Updated:** 2025-01-27

---

## Table of Contents

1. [Frontend Technologies](#frontend-technologies)
2. [Backend Technologies](#backend-technologies)
3. [Database & Storage](#database--storage)
4. [Third-Party Services](#third-party-services)
5. [Development Tools](#development-tools)
6. [Package Dependencies](#package-dependencies)

---

## Frontend Technologies

### Core Framework

#### **Next.js 16.0.10**
- **Purpose:** React framework with server-side rendering
- **Features Used:**
  - App Router architecture
  - Server Components
  - API Routes
  - File-based routing
  - Image optimization
  - Static generation
- **Why:** Provides excellent performance, SEO, and developer experience

#### **React 19.2.0**
- **Purpose:** UI library for building user interfaces
- **Features Used:**
  - Functional components with hooks
  - Client components (`'use client'`)
  - Server components (default)
  - Context API (implicit)
- **Why:** Industry standard, excellent ecosystem

### Styling & UI

#### **Tailwind CSS 4.1.18**
- **Purpose:** Utility-first CSS framework
- **Features Used:**
  - Utility classes
  - Responsive design
  - Custom color palette
  - Dark mode support (disabled)
- **Configuration:** `tailwind.config.js`
- **Why:** Rapid development, consistent design system

#### **Framer Motion 12.23.25**
- **Purpose:** Animation library for React
- **Features Used:**
  - Page transitions
  - Component animations
  - Modal animations
  - Hover effects
- **Why:** Smooth, performant animations

#### **Lucide React 0.556.0**
- **Purpose:** Icon library
- **Usage:** Throughout the application for icons
- **Why:** Consistent, modern icon set

### UI Components

#### **React Hot Toast 2.6.0**
- **Purpose:** Toast notifications
- **Usage:** Success/error messages
- **Why:** Lightweight, customizable

#### **Sonner 2.0.7**
- **Purpose:** Alternative toast system
- **Usage:** Registration and authentication flows
- **Why:** Enhanced UX for critical flows

### Form Handling

#### **Custom Form Components**
- **PhoneInput:** Custom phone number input with country codes
- **VerificationFileUpload:** File upload component with preview
- **Rich Text Editor:** SunEditor for content management

---

## Backend Technologies

### Server Framework

#### **Next.js API Routes**
- **Purpose:** Server-side API endpoints
- **Pattern:** RESTful API design
- **Authentication:** JWT-based
- **File Handling:** Multipart form data

### Authentication & Security

#### **jsonwebtoken 9.0.3**
- **Purpose:** JWT token generation and verification
- **Usage:**
  - Login: Generate tokens
  - API routes: Verify tokens
  - Cookie-based storage
- **Algorithm:** HS256 (default)

#### **bcryptjs 3.0.3**
- **Purpose:** Password hashing
- **Usage:** User registration and password updates
- **Salt Rounds:** 10
- **Why:** Industry standard for password security

### Data Validation

#### **Server-side Validation**
- Custom validation in API routes
- Input sanitization
- Type checking
- Business rule validation

---

## Database & Storage

### Database

#### **Supabase (PostgreSQL)**
- **Purpose:** Primary database
- **Features:**
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - RESTful API
- **Client Library:** `@supabase/supabase-js 2.86.2`
- **Connection:** Service role key for admin operations

### Storage

#### **Supabase Storage**
- **Purpose:** File storage
- **Buckets:**
  - `profile_pictures` - User photos, verification documents
  - `events` - Event images
  - `gallery` - Gallery images
  - `research` - Research files
  - `committee_member_profile` - Committee member photos
- **Access:** Public buckets for public assets

---

## Third-Party Services

### Payment Gateway

#### **MyFatoorah**
- **Purpose:** Payment processing
- **Integration Type:** REST API
- **Features:**
  - Multiple payment methods
  - Invoice creation
  - Payment callbacks
  - Two separate accounts (events & subscriptions)
- **Library:** Custom implementation (`src/lib/myfatoorah.js`)
- **Endpoints:**
  - `/v2/InitiatePayment` - Get payment methods
  - `/v2/ExecutePayment` - Create invoice
  - `/v2/GetPaymentStatus` - Check payment status

### Push Notifications

#### **Firebase Cloud Messaging (FCM)**
- **Purpose:** Browser push notifications
- **Libraries:**
  - `firebase 12.7.0` - Client SDK
  - `firebase-admin 13.6.0` - Server SDK
- **Features:**
  - Web push notifications
  - Token management
  - Notification targeting
  - Background notifications

### Email Service

#### **Nodemailer 7.0.12**
- **Purpose:** Email sending
- **Usage:** Transactional emails (if configured)
- **Configuration:** SMTP settings

---

## Development Tools

### Build Tools

#### **Next.js Build System**
- **Purpose:** Compilation and bundling
- **Features:**
  - Automatic code splitting
  - Tree shaking
  - Minification
  - Source maps (dev mode)

#### **PostCSS 8.5.6**
- **Purpose:** CSS processing
- **Plugins:** Autoprefixer, Tailwind

#### **Autoprefixer 10.4.22**
- **Purpose:** Automatic vendor prefixes
- **Usage:** CSS compilation

### Code Quality

#### **ESLint 9**
- **Purpose:** Code linting
- **Config:** `eslint-config-next 16.0.7`
- **Usage:** Code quality checks

### Type Checking

- **Runtime validation** in API routes
- **PropTypes** (if used in components)

---

## Package Dependencies

### Core Dependencies

```json
{
  "@supabase/supabase-js": "^2.86.2",      // Database client
  "next": "^16.0.10",                      // Framework
  "react": "19.2.0",                       // UI library
  "react-dom": "19.2.0",                   // React DOM
  "framer-motion": "^12.23.25",            // Animations
  "lucide-react": "^0.556.0",              // Icons
  "jsonwebtoken": "^9.0.3",                // JWT
  "bcryptjs": "^3.0.3",                    // Password hashing
  "uuid": "^13.0.0"                        // UUID generation
}
```

### UI & UX

```json
{
  "react-hot-toast": "^2.6.0",             // Toast notifications
  "sonner": "^2.0.7",                       // Enhanced toasts
  "react-icons": "^5.5.0",                 // Additional icons
  "next-themes": "^0.4.6"                  // Theme management
}
```

### File Processing

```json
{
  "pdfkit": "^0.17.2",                     // PDF generation
  "jspdf": "^3.0.4",                       // PDF creation
  "html2canvas": "^1.4.1"                  // HTML to image
}
```

### QR Codes

```json
{
  "qrcode.react": "^4.2.0",                // QR code generation
  "react-qr-code": "^2.0.18",              // Alternative QR library
  "qr-scanner": "^1.4.2"                   // QR scanning
}
```

### Charts & Visualization

```json
{
  "recharts": "^3.5.1"                     // Chart library
}
```

### Rich Text Editing

```json
{
  "suneditor": "^2.45.1",                  // Rich text editor
  "suneditor-react": "^3.6.1"              // React wrapper
}
```

### Firebase

```json
{
  "firebase": "^12.7.0",                   // Client SDK
  "firebase-admin": "^13.6.0"              // Server SDK
}
```

### HTTP Client

```json
{
  "axios": "^1.13.2"                       // HTTP requests
}
```

### Utilities

```json
{
  "jwt-decode": "^4.0.0",                  // JWT decoding
  "react-confetti-explosion": "^3.0.3"     // Celebrations
}
```

### Dev Dependencies

```json
{
  "tailwindcss": "^4.1.18",                // CSS framework
  "@tailwindcss/postcss": "^4.1.18",       // PostCSS plugin
  "autoprefixer": "^10.4.22",              // CSS prefixes
  "postcss": "^8.5.6",                     // CSS processor
  "eslint": "^9",                          // Linter
  "eslint-config-next": "16.0.7"           // ESLint config
}
```

---

## Technology Choices Rationale

### Why Next.js?

1. **Server-Side Rendering:** Better SEO and initial load times
2. **API Routes:** Unified codebase for frontend and backend
3. **File-based Routing:** Intuitive route organization
4. **Image Optimization:** Built-in image optimization
5. **Deployment:** Easy deployment on Vercel

### Why Supabase?

1. **PostgreSQL:** Robust, feature-rich database
2. **Storage:** Integrated file storage solution
3. **Real-time:** Built-in real-time capabilities
4. **Row Level Security:** Database-level security
5. **REST API:** Auto-generated REST endpoints

### Why Firebase for Notifications?

1. **Web Push:** Native browser push notifications
2. **Reliability:** Google's infrastructure
3. **Cross-platform:** Works on all browsers
4. **Free Tier:** Generous free tier for notifications

### Why MyFatoorah?

1. **Regional Support:** Strong presence in Middle East
2. **Multiple Methods:** Supports various payment methods
3. **Separate Accounts:** Can use different accounts for different purposes
4. **Callback System:** Reliable payment verification

---

## Browser Support

### Supported Browsers

- **Chrome:** Latest 2 versions
- **Firefox:** Latest 2 versions
- **Safari:** Latest 2 versions
- **Edge:** Latest 2 versions

### Features Requiring Support

- **Push Notifications:** Requires HTTPS and browser support
- **File Upload:** Modern File API
- **QR Scanning:** Camera API support

---

## Performance Considerations

### Optimization Strategies

1. **Code Splitting:** Automatic with Next.js
2. **Image Optimization:** Next.js Image component
3. **Lazy Loading:** Components and images
4. **Pagination:** All list endpoints
5. **Debouncing:** Search inputs
6. **Memoization:** React hooks (useMemo, useCallback)

### Bundle Size

- **Initial Load:** Optimized for < 200KB
- **Code Splitting:** Routes loaded on demand
- **Tree Shaking:** Unused code removed

---

## Security Considerations

### Implemented Security Measures

1. **Password Hashing:** bcryptjs with salt
2. **JWT Tokens:** Signed and verified
3. **HTTP-only Cookies:** XSS protection
4. **Input Validation:** Server-side validation
5. **SQL Injection Prevention:** Parameterized queries
6. **File Upload Validation:** Type and size checks
7. **CORS:** Configured for specific origins

---

## Migration & Updates

### Version Management

- **Node.js:** Recommended 18.x or higher
- **Package Updates:** Regular security updates
- **Breaking Changes:** Documented in migration guides

### Upgrade Path

1. Test in development environment
2. Review changelogs
3. Update dependencies incrementally
4. Test thoroughly
5. Deploy to production

---

## Conclusion

The technology stack is carefully chosen to provide:

- **Performance:** Fast load times and smooth interactions
- **Scalability:** Can handle growth
- **Security:** Multiple layers of protection
- **Developer Experience:** Modern tools and practices
- **Maintainability:** Clear structure and documentation

All technologies are actively maintained and widely adopted in the industry.

---

**Document End**

