# BDS Web Application - Integration Specifications

## Document Version
**Version:** 1.0  
**Last Updated:** 2025-01-27

---

## Table of Contents

1. [Payment Gateway Integration (MyFatoorah)](#payment-gateway-integration-myfatoorah)
2. [Firebase Cloud Messaging Integration](#firebase-cloud-messaging-integration)
3. [Supabase Integration](#supabase-integration)
4. [Email Service Integration](#email-service-integration)
5. [Third-Party API Specifications](#third-party-api-specifications)

---

## Payment Gateway Integration (MyFatoorah)

### Overview

The application integrates with MyFatoorah payment gateway for processing both event payments and subscription payments. Two separate MyFatoorah accounts are used to keep event and subscription payments separate.

### Configuration

**Environment Variables:**
```env
NEXT_PUBLIC_MYFATOORAH_BASE_URL=https://apitest.myfatoorah.com  # or production URL
MYFATOORAH_EVENT_API_KEY=your_event_api_key
MYFATOORAH_SUBSCRIPTION_API_KEY=your_subscription_api_key
```

### Integration Flow

#### 1. Event Payment Flow

```
User clicks "Join Event" (paid event)
    ↓
POST /api/payments/event/create-invoice
    ↓
Call MyFatoorah InitiatePayment API
    ↓
Return available payment methods
    ↓
User selects payment method
    ↓
POST /api/payments/event/execute-payment
    ↓
Call MyFatoorah ExecutePayment API
    ↓
Redirect user to MyFatoorah payment page
    ↓
User completes payment
    ↓
MyFatoorah redirects to callback URL
    ↓
GET /api/payments/event/callback
    ↓
Verify payment status
    ↓
Update database
    ↓
Send notifications
```

#### 2. Subscription Payment Flow

```
User registers for paid membership
    ↓
Create payment records
    ↓
POST /api/payments/subscription/create-invoice
    ↓
Call MyFatoorah InitiatePayment API
    ↓
Return available payment methods
    ↓
User selects payment method
    ↓
POST /api/payments/subscription/execute-payment
    ↓
Call MyFatoorah ExecutePayment API
    ↓
Redirect user to MyFatoorah payment page
    ↓
User completes payment
    ↓
MyFatoorah redirects to callback URL
    ↓
GET /api/payments/subscription/callback
    ↓
Verify payment status
    ↓
Activate membership
    ↓
Send notifications
```

### API Endpoints Used

#### InitiatePayment
**Endpoint:** `POST /v2/InitiatePayment`  
**Purpose:** Get available payment methods

**Request:**
```json
{
  "InvoiceAmount": 30.000,
  "CurrencyIso": "BHD",
  "CustomerName": "string",
  "CustomerEmail": "string",
  "CustomerMobile": "string (sanitized)",
  "CallBackUrl": "https://yourdomain.com/api/payments/event/callback",
  "ErrorUrl": "https://yourdomain.com/api/payments/event/callback?error=true",
  "InvoiceItems": [
    {
      "ItemName": "string",
      "Quantity": 1,
      "UnitPrice": 30.000
    }
  ],
  "DisplayCurrencyIso": "BHD",
  "ReferenceId": "uuid"
}
```

**Response:**
```json
{
  "IsSuccess": true,
  "Message": "string",
  "ValidationErrors": null,
  "Data": {
    "InvoiceId": number,
    "InvoiceURL": "string",
    "CustomerReference": "string",
    "UserDefinedField": null,
    "RecurringId": null,
    "PaymentMethods": [
      {
        "PaymentMethodId": number,
        "PaymentMethodCode": "string",
        "PaymentMethodEn": "string",
        "PaymentMethodAr": "string",
        "PaymentMethodIcon": "string",
        "IsDirectPayment": boolean,
        "ServiceCharge": number,
        "TotalAmount": number,
        "CurrencyIso": "BHD",
        "Currency": "string"
      }
    ]
  }
}
```

#### ExecutePayment
**Endpoint:** `POST /v2/ExecutePayment`  
**Purpose:** Create invoice with selected payment method

**Request:**
```json
{
  "InvoiceValue": 30.000,
  "CurrencyIso": "BHD",
  "CustomerName": "string",
  "CustomerEmail": "string",
  "CustomerMobile": "string",
  "CallBackUrl": "string",
  "ErrorUrl": "string",
  "InvoiceItems": [...],
  "DisplayCurrencyIso": "BHD",
  "ReferenceId": "uuid",
  "PaymentMethodId": number
}
```

**Response:**
```json
{
  "IsSuccess": true,
  "Message": "string",
  "ValidationErrors": null,
  "Data": {
    "InvoiceId": number,
    "InvoiceURL": "string",
    "CustomerReference": "string",
    "UserDefinedField": null,
    "RecurringId": null
  }
}
```

#### GetPaymentStatus
**Endpoint:** `GET /v2/GetPaymentStatus`  
**Purpose:** Verify payment status

**Query Parameters:**
- `Key`: Invoice ID or Payment ID
- `KeyType`: "InvoiceId" or "PaymentId"

**Response:**
```json
{
  "IsSuccess": true,
  "Message": "string",
  "ValidationErrors": null,
  "Data": {
    "InvoiceId": number,
    "InvoiceStatus": "Paid|Pending|Failed|Canceled",
    "InvoiceValue": number,
    "Currency": "BHD",
    "InvoiceTransactions": [
      {
        "TransactionDate": "datetime",
        "PaymentGateway": "string",
        "ReferenceId": "string",
        "TrackId": "string",
        "PaymentId": "string",
        "AuthorizationId": "string",
        "TransactionStatus": "string",
        "TransactionValue": number,
        "CustomerServiceCharge": number,
        "DueValue": number,
        "PaidCurrency": "BHD",
        "PaidCurrencyValue": number,
        "IpAddress": "string",
        "Country": "string",
        "Currency": "BHD"
      }
    ],
    "InvoiceRedirectUrl": "string",
    "CustomerName": "string",
    "CustomerMobile": "string",
    "CustomerEmail": "string",
    "UserDefinedField": null,
    "InvoiceDisplayValue": number
  }
}
```

### Mobile Number Sanitization

MyFatoorah requires mobile numbers in a specific format:
- Digits only
- Remove leading country code (973 for Bahrain)
- Maximum 11 digits
- Minimum 6 digits

**Implementation:** `sanitizeMobileForMyFatoorrah()` function in `src/lib/myfatoorah.js`

### Callback URLs

**Event Payments:**
- Success: `/api/payments/event/callback?paymentId={id}&Id={invoiceId}`
- Error: `/api/payments/event/callback?error=true&paymentId={id}`

**Subscription Payments:**
- Success: `/api/payments/subscription/callback?paymentId={id}&Id={invoiceId}`
- Error: `/api/payments/subscription/callback?error=true&paymentId={id}`

### Error Handling

- Network errors: Retry logic (not implemented, consider adding)
- Payment failures: User redirected to error URL
- Invalid responses: Logged and user notified
- Timeout handling: 30-second timeout for API calls

---

## Firebase Cloud Messaging Integration

### Overview

Firebase Cloud Messaging (FCM) is used for browser push notifications to users.

### Configuration

**Environment Variables:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key

# Server-side
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

### Integration Flow

#### 1. Client-Side Token Registration

```
User visits website
    ↓
Request notification permission
    ↓
Get FCM token from Firebase
    ↓
POST /api/notifications/device-token
    ↓
Store token in database (users.device_token)
```

#### 2. Sending Notifications

```
Admin creates notification
    ↓
POST /api/admin/notifications/send
    ↓
Query target users (all/free/paid/event-specific)
    ↓
Get device tokens
    ↓
Send via Firebase Admin SDK
    ↓
Update notification_logs
    ↓
Create notification records for users
```

### API Implementation

#### Client Token Registration

**Endpoint:** `POST /api/notifications/device-token`

**Request:**
```json
{
  "device_token": "fcm_token_string",
  "device_platform": "web"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device token registered"
}
```

#### Send Notification (Admin)

**Endpoint:** `POST /api/admin/notifications/send`

**Request:**
```json
{
  "title": "string",
  "body": "string",
  "target": "all|free|paid|membership_type|event",
  "membership_type": "string (optional)",
  "event_id": "uuid (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "sent_count": number,
  "failed_count": number,
  "total_count": number
}
```

### Notification Types

- `general` - General notifications
- `event` - Event-related notifications
- `certificate` - Certificate available
- `membership` - Membership updates
- `payment` - Payment confirmations

### Notification Targeting

- **All Users:** Send to all users with device tokens
- **Free Members:** `membership_type = 'free'`
- **Paid Members:** `membership_type = 'paid'`
- **Specific Membership:** Filter by `current_subscription_plan_name`
- **Event-Specific:** Filter by `event_members` for specific event

---

## Supabase Integration

### Overview

Supabase provides the database (PostgreSQL) and file storage for the application.

### Database Connection

**Configuration:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Client Library:** `@supabase/supabase-js`

**Implementation:**
- Admin operations use service role key (bypasses RLS)
- Client operations use anon key (respects RLS)

### Storage Integration

#### Bucket Structure

```
profile_pictures/
├── {user_id}/
│   ├── profile.jpg
│   └── verification/
│       ├── id_card_{uuid}.pdf
│       └── personal_photo_{uuid}.jpg

events/
└── {event_id}/
    └── featured_{uuid}.jpg

gallery/
└── {gallery_id}/
    └── {image_uuid}.jpg

research/
├── featured/
│   └── {uuid}.jpg
└── content/
    └── {uuid}.pdf
```

#### File Upload Process

1. Validate file (type, size)
2. Generate unique filename (UUID)
3. Upload to Supabase Storage
4. Get public URL
5. Store URL in database

#### File Access

- **Public Files:** Direct public URL access
- **Private Files:** Signed URLs with expiration (if needed)

### Real-time Subscriptions

Currently not implemented but Supabase supports:
- Real-time database changes
- Presence tracking
- Broadcast messages

**Potential Use Cases:**
- Live event capacity updates
- Real-time notification delivery
- Live chat features

---

## Email Service Integration

### Overview

Nodemailer is configured for sending transactional emails (optional feature).

### Configuration

**Environment Variables:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@bahraindentalsociety.org
```

### Implementation

**Library:** `nodemailer 7.0.12`

**Usage:** Currently not actively used but configured in `src/lib/email.js`

### Email Types (Potential)

1. **Registration Confirmation**
2. **Password Reset**
3. **Payment Receipts**
4. **Event Reminders**
5. **Membership Renewal Notices**

---

## Third-Party API Specifications

### MyFatoorah API

**Base URL:**
- Test: `https://apitest.myfatoorah.com`
- Production: `https://api.myfatoorah.com`

**Authentication:**
- Bearer token in `Authorization` header
- API key from environment variables

**Rate Limits:**
- Not specified in documentation
- Implement retry logic for production

**Webhooks:**
- Not currently implemented
- Consider implementing for better payment tracking

### Firebase Cloud Messaging API

**Base URL:** Managed by Firebase SDK

**Authentication:**
- Client: VAPID key
- Server: Service account JSON

**Rate Limits:**
- Free tier: 10,000 messages/day
- Paid tier: Higher limits

**Message Format:**
```json
{
  "notification": {
    "title": "string",
    "body": "string"
  },
  "data": {
    "type": "string",
    "action_url": "string"
  },
  "token": "fcm_token"
}
```

### Supabase API

**Base URL:** `https://{project}.supabase.co`

**Authentication:**
- Service role key for admin operations
- Anon key for client operations

**Rate Limits:**
- Based on Supabase plan
- Free tier: 500MB database, 1GB storage

**API Features:**
- REST API (auto-generated)
- GraphQL (optional)
- Real-time subscriptions
- Storage API

---

## Integration Testing

### Test Scenarios

1. **Payment Integration**
   - Test successful payment flow
   - Test payment failure handling
   - Test callback processing
   - Test duplicate payment prevention

2. **Notification Integration**
   - Test token registration
   - Test notification sending
   - Test notification delivery
   - Test notification targeting

3. **File Upload Integration**
   - Test file upload to Supabase
   - Test file retrieval
   - Test file deletion
   - Test file size limits

---

## Error Handling

### Payment Gateway Errors

- **Network Errors:** Retry with exponential backoff
- **Invalid Responses:** Log and notify user
- **Payment Failures:** Update database, notify user
- **Timeout:** 30-second timeout, retry once

### Firebase Errors

- **Token Invalid:** Remove token from database
- **Permission Denied:** Request permission again
- **Service Unavailable:** Queue notifications for retry

### Supabase Errors

- **Connection Errors:** Retry with exponential backoff
- **Rate Limit:** Implement rate limiting on client
- **Storage Errors:** Log and notify admin

---

## Security Considerations

### Payment Gateway

- **API Keys:** Stored in environment variables
- **HTTPS:** All communication over HTTPS
- **Callback Verification:** Verify payment status before updating database
- **Idempotency:** Prevent duplicate payment processing

### Firebase

- **VAPID Key:** Public but should be rotated periodically
- **Service Account:** Keep secure, never expose
- **Token Security:** Tokens stored securely in database

### Supabase

- **Service Role Key:** Server-side only, never expose
- **RLS Policies:** Implement Row Level Security for client access
- **Storage Policies:** Restrict file access appropriately

---

## Monitoring & Logging

### Payment Transactions

- Log all payment attempts
- Log payment callbacks
- Monitor payment success rates
- Alert on payment failures

### Notification Delivery

- Track notification send rates
- Monitor delivery failures
- Track token validity
- Alert on high failure rates

### Database Operations

- Monitor query performance
- Track storage usage
- Monitor connection pool
- Alert on errors

---

## Future Integrations

### Potential Additions

1. **SMS Gateway**
   - Two-factor authentication
   - Event reminders
   - Payment confirmations

2. **Analytics**
   - Google Analytics
   - Custom analytics dashboard

3. **Social Media**
   - Share events on social media
   - Social login options

4. **Calendar Integration**
   - Export events to calendar
   - Sync with Google Calendar

---

## Conclusion

All integrations are designed to be:
- **Reliable:** Error handling and retry logic
- **Secure:** Proper authentication and data protection
- **Scalable:** Can handle growth
- **Maintainable:** Clear code structure and documentation

---

**Document End**

