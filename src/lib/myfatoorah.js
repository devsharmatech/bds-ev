/**
 * MyFatoorah Payment Gateway Integration
 * Supports two separate accounts:
 * 1. Event payments account
 * 2. Subscription payments account
 */

const MYFATOORAH_BASE_URL = process.env.NEXT_PUBLIC_MYFATOORAH_BASE_URL || 'https://apitest.myfatoorah.com';
const MYFATOORAH_EVENT_API_KEY = process.env.MYFATOORAH_EVENT_API_KEY;
const MYFATOORAH_SUBSCRIPTION_API_KEY = process.env.MYFATOORAH_SUBSCRIPTION_API_KEY;

/**
 * Create payment invoice for events
 */
export async function createEventPaymentInvoice({
  invoiceAmount,
  customerName,
  customerEmail,
  customerMobile,
  invoiceItems,
  callbackUrl,
  errorUrl,
  referenceId
}) {
  try {
    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/SendPayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MYFATOORAH_EVENT_API_KEY}`
      },
      body: JSON.stringify({
        InvoiceAmount: invoiceAmount,
        CurrencyIso: 'BHD',
        CustomerName: customerName,
        CustomerEmail: customerEmail,
        CustomerMobile: customerMobile,
        CallBackUrl: callbackUrl,
        ErrorUrl: errorUrl,
        InvoiceItems: invoiceItems,
        DisplayCurrencyIso: 'BHD',
        ReferenceId: referenceId
      })
    });

    const data = await response.json();

    if (data.IsSuccess) {
      return {
        success: true,
        invoiceId: data.Data.InvoiceId,
        invoiceURL: data.Data.InvoiceURL,
        paymentUrl: data.Data.InvoiceURL
      };
    } else {
      return {
        success: false,
        message: data.Message || 'Failed to create payment invoice'
      };
    }
  } catch (error) {
    console.error('MyFatoorah Event Payment Error:', error);
    return {
      success: false,
      message: 'Payment gateway error'
    };
  }
}

/**
 * Create payment invoice for subscriptions
 */
export async function createSubscriptionPaymentInvoice({
  invoiceAmount,
  customerName,
  customerEmail,
  customerMobile,
  invoiceItems,
  callbackUrl,
  errorUrl,
  referenceId
}) {
  try {
    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/SendPayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MYFATOORAH_SUBSCRIPTION_API_KEY}`
      },
      body: JSON.stringify({
        InvoiceAmount: invoiceAmount,
        CurrencyIso: 'BHD',
        CustomerName: customerName,
        CustomerEmail: customerEmail,
        CustomerMobile: customerMobile,
        CallBackUrl: callbackUrl,
        ErrorUrl: errorUrl,
        InvoiceItems: invoiceItems,
        DisplayCurrencyIso: 'BHD',
        ReferenceId: referenceId
      })
    });

    const data = await response.json();

    if (data.IsSuccess) {
      return {
        success: true,
        invoiceId: data.Data.InvoiceId,
        invoiceURL: data.Data.InvoiceURL,
        paymentUrl: data.Data.InvoiceURL
      };
    } else {
      return {
        success: false,
        message: data.Message || 'Failed to create payment invoice'
      };
    }
  } catch (error) {
    console.error('MyFatoorah Subscription Payment Error:', error);
    return {
      success: false,
      message: 'Payment gateway error'
    };
  }
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentId, isSubscription = false) {
  try {
    const apiKey = isSubscription ? MYFATOORAH_SUBSCRIPTION_API_KEY : MYFATOORAH_EVENT_API_KEY;
    
    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/GetPaymentStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        Key: paymentId,
        KeyType: 'InvoiceId'
      })
    });

    const data = await response.json();

    if (data.IsSuccess) {
      return {
        success: true,
        status: data.Data.InvoiceStatus,
        invoiceValue: data.Data.InvoiceValue,
        invoiceTransactions: data.Data.InvoiceTransactions || []
      };
    } else {
      return {
        success: false,
        message: data.Message || 'Failed to get payment status'
      };
    }
  } catch (error) {
    console.error('MyFatoorah Payment Status Error:', error);
    return {
      success: false,
      message: 'Payment gateway error'
    };
  }
}

