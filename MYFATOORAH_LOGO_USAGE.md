# MyFatoorah Payment Gateway Branding

## Overview
The MyFatoorah payment gateway integration now includes:
- ✅ **Company Name**: "Bahrain Dental Society" displayed on all payment pages
- ✅ **Custom Logo**: Your logo displayed on the payment page (optional)
- ✅ **Language**: English interface
- ✅ **Country**: Configured for Bahrain (+973)

## How to Use

### Option 1: Simple Setup (Recommended)

Just add the logo URL to your `.env.local` file and it will automatically be used in all payment flows:

```bash
NEXT_PUBLIC_SITE_LOGO_URL=https://yourdomain.com/logo.png
```

The payment gateway functions are already configured to read from this variable.

### Option 2: Manual Setup

If you want to pass a custom logo URL to specific payment calls, you can do so in your code:
- **Format**: PNG, JPG, or SVG
- **Recommended Size**: 200x200px or similar square/rectangular ratio
- **File Size**: Keep under 100KB for faster loading
- **Location**: Upload to your public folder or Supabase storage

### 2. Get Logo URL
You need a **publicly accessible URL** for your logo:

**Option A: Using public folder**
```
https://yourdomain.com/logo.png
```

**Option B: Using Supabase Storage**
```javascript
// Upload to Supabase Storage and get public URL
const { data, error } = await supabase.storage
  .from('public-assets')
  .upload('logo.png', logoFile, { upsert: true });

const logoUrl = supabase.storage
  .from('public-assets')
  .getPublicUrl('logo.png').data.publicUrl;
```

### 3. Use Logo in Payment Functions

#### For Event Payments

```javascript
import { initiateEventPayment, executeEventPayment } from '@/lib/myfatoorah';

// Step 1: Initiate payment with logo
const result = await initiateEventPayment({
  invoiceAmount: 10.000,
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerMobile: '33445566',
  invoiceItems: [
    {
      ItemName: 'Event Registration',
      Quantity: 1,
      UnitPrice: 10.000
    }
  ],
  callbackUrl: 'https://yourdomain.com/api/payments/callback',
  errorUrl: 'https://yourdomain.com/payment-error',
  referenceId: 'EVENT_12345',
  logoUrl: 'https://yourdomain.com/logo.png' // Add your logo URL here
});

// Step 2: Execute payment with selected method
const payment = await executeEventPayment({
  invoiceAmount: 10.000,
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerMobile: '33445566',
  invoiceItems: [...],
  callbackUrl: '...',
  errorUrl: '...',
  referenceId: 'EVENT_12345',
  paymentMethodId: selectedMethodId,
  logoUrl: 'https://yourdomain.com/logo.png' // Add your logo URL here
});
```

#### For Subscription Payments

```javascript
import { 
  createSubscriptionPaymentInvoice,
  initiateSubscriptionPayment,
  executeSubscriptionPayment 
} from '@/lib/myfatoorah';

// Using SendPayment (legacy method)
const result = await createSubscriptionPaymentInvoice({
  invoiceAmount: 50.000,
  customerName: 'Jane Smith',
  customerEmail: 'jane@example.com',
  customerMobile: '33445566',
  invoiceItems: [
    {
      ItemName: 'Annual Membership',
      Quantity: 1,
      UnitPrice: 50.000
    }
  ],
  callbackUrl: 'https://yourdomain.com/api/payments/subscription-callback',
  errorUrl: 'https://yourdomain.com/payment-error',
  referenceId: 'SUB_12345',
  logoUrl: 'https://yourdomain.com/logo.png' // Add your logo URL here
});

// Or using InitiatePayment + ExecutePayment flow
const initiated = await initiateSubscriptionPayment({
  // ... same parameters
  logoUrl: 'https://yourdomain.com/logo.png'
});

const executed = await executeSubscriptionPayment({
  // ... same parameters
  paymentMethodId: selectedMethodId,
  logoUrl: 'https://yourdomain.com/logo.png'
});
```

### 4. Update Your API Routes

Update your payment API routes to pass the logo URL:

**Example: Event Payment API**
```javascript
// src/app/api/payments/event/create-invoice/route.js

export async function POST(request) {
  // ... your existing code ...
  
  const LOGO_URL = process.env.NEXT_PUBLIC_SITE_LOGO_URL || 
                   'https://yourdomain.com/logo.png';
  
  const result = await initiateEventPayment({
    invoiceAmount,
    customerName,
    customerEmail,
    customerMobile,
    invoiceItems,
    callbackUrl,
    errorUrl,
    referenceId,
    logoUrl: LOGO_URL // Add this
  });
  
  // ... rest of your code ...
}
```

**Example: Subscription Payment API**
```javascript
// src/app/api/payments/subscription/create-invoice/route.js

export async function POST(request) {
  // ... your existing code ...
  
  const LOGO_URL = process.env.NEXT_PUBLIC_SITE_LOGO_URL || 
                   'https://yourdomain.com/logo.png';
  
  const result = await createSubscriptionPaymentInvoice({
    invoiceAmount,
    customerName,
    customerEmail,
    customerMobile,
    invoiceItems,
    callbackUrl,
    errorUrl,
    referenceId,
    logoUrl: LOGO_URL // Add this
  });
  
  // ... rest of your code ...
}
```

## Quick Setup

### 1. Add Logo URL to Environment Variables

Add to your `.env.local` file:

```bash
# MyFatoorah Payment Branding
NEXT_PUBLIC_SITE_LOGO_URL=https://yourdomain.com/logo.png
```

### 2. No Additional Code Changes Needed

The API routes have been **automatically configured** to use the logo from environment variables:
- ✅ Event payment routes (create-invoice & execute-payment)
- ✅ Subscription payment routes (create-invoice & execute-payment)
- ✅ Company name "Bahrain Dental Society" automatically included
- ✅ Language set to English
- ✅ Country code set to Bahrain (+973)

### 3. That's It!

When users make payments, they will see:
- 🏢 **Company Name**: "Bahrain Dental Society"
- 🖼️ **Logo**: Your custom logo from the environment variable
- 🌍 **Language**: English
- 📱 **Country**: Bahrain

## Technical Details

### MyFatoorah API Fields
The integration automatically includes:

1. **Logo**: Passed via the `UserDefinedField` parameter - accepts a URL to an image that will be displayed on the payment page.
2. **Company Name**: Set via `SupplierName` parameter - displays "Bahrain Dental Society" on the payment page.
3. **Language**: Set to `'en'` for English interface.
4. **Mobile Country Code**: Set to `'+973'` for Bahrain.

### Requirements
- ✅ Must be a public URL (accessible without authentication)
- ✅ Should use HTTPS
- ✅ Common image formats (PNG, JPG, SVG)
- ✅ Recommended max size: 100KB

### Browser Compatibility
The logo will be displayed on all MyFatoorah payment pages across all devices and browsers.

## Example Implementation

Complete example with logo configuration:

```javascript
// lib/payment-config.js
export const PAYMENT_CONFIG = {
  logoUrl: process.env.NEXT_PUBLIC_SITE_LOGO_URL || 
           'https://bahraindentalsociety.com/logo.png',
  currency: 'BHD',
  mobileCountryCode: '+973'
};

// api/payments/event/create-invoice/route.js
import { initiateEventPayment } from '@/lib/myfatoorah';
import { PAYMENT_CONFIG } from '@/lib/payment-config';

export async function POST(request) {
  const { amount, customerInfo, eventDetails } = await request.json();
  
  const result = await initiateEventPayment({
    invoiceAmount: amount,
    customerName: customerInfo.name,
    customerEmail: customerInfo.email,
    customerMobile: customerInfo.mobile,
    invoiceItems: [{
      ItemName: eventDetails.title,
      Quantity: 1,
      UnitPrice: amount
    }],
    callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/callback`,
    errorUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-error`,
    referenceId: `EVENT_${eventDetails.id}`,
    logoUrl: PAYMENT_CONFIG.logoUrl // Use centralized config
  });
  
  return Response.json(result);
}
```

## Testing

1. Upload your logo to a public location
2. Add the logo URL to environment variables
3. Make a test payment
4. Verify the logo appears on the MyFatoorah payment page

## Notes

- The `logoUrl` parameter is **optional**. If not provided, MyFatoorah will use their default branding.
- The logo will appear at the top of the payment page
- Make sure the logo URL is accessible from MyFatoorah's servers
- If using a development environment, use a publicly accessible staging logo
