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
 * Uses SendPayment endpoint (same as events) - proven to work reliably
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
    if (!MYFATOORAH_SUBSCRIPTION_API_KEY) {
      console.error('[MYFATOORAH] Subscription API Key is not configured');
      return {
        success: false,
        message: 'Payment gateway is not configured. Please contact support.',
        error: 'MYFATOORAH_SUBSCRIPTION_API_KEY is missing'
      };
    }

    // Use SendPayment - same endpoint and format as event payments (proven to work)
    const requestBody = {
      InvoiceAmount: invoiceAmount,
      CurrencyIso: 'BHD',
      CustomerName: customerName,
      CustomerEmail: customerEmail,
      CustomerMobile: customerMobile || '', // SendPayment accepts empty string
      CallBackUrl: callbackUrl,
      ErrorUrl: errorUrl,
      InvoiceItems: invoiceItems,
      DisplayCurrencyIso: 'BHD',
      ReferenceId: referenceId
    };

    // Log full request details
    console.log('[MYFATOORAH] SendPayment Request (Subscriptions):', {
      url: `${MYFATOORAH_BASE_URL}/v2/SendPayment`,
      method: 'POST',
      hasApiKey: !!MYFATOORAH_SUBSCRIPTION_API_KEY,
      apiKeyPrefix: MYFATOORAH_SUBSCRIPTION_API_KEY ? MYFATOORAH_SUBSCRIPTION_API_KEY.substring(0, 15) + '...' : 'MISSING',
      requestBody: {
        ...requestBody,
        CustomerMobile: customerMobile ? '***' : 'EMPTY',
        Authorization: '***'
      },
      invoiceItemsDetails: invoiceItems.map(item => ({
        ItemName: item.ItemName,
        Quantity: item.Quantity,
        UnitPrice: item.UnitPrice
      }))
    });

    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/SendPayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MYFATOORAH_SUBSCRIPTION_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseStatus = response.status;
    const responseText = await response.text();
    
    console.log('[MYFATOORAH] SendPayment Response (Subscriptions):', {
      status: responseStatus,
      statusText: response.statusText,
      responseLength: responseText.length,
      responsePreview: responseText.substring(0, 500),
      headers: Object.fromEntries(response.headers.entries())
    });

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[MYFATOORAH] Failed to parse response:', {
        error: parseError,
        responseText: responseText,
        status: responseStatus
      });
      return {
        success: false,
        message: 'Invalid response from payment gateway',
        error: {
          parseError: parseError.message,
          responseText: responseText.substring(0, 500),
          status: responseStatus
        }
      };
    }

    if (data.IsSuccess) {
      // SendPayment returns InvoiceURL
      const paymentUrl = data.Data?.InvoiceURL || data.Data?.PaymentURL || data.Data?.PaymentLink;
      const invoiceId = data.Data?.InvoiceId || data.InvoiceId || referenceId;
      
      if (!paymentUrl) {
        console.error('[MYFATOORAH] SendPayment response missing InvoiceURL:', {
          Data: data.Data,
          fullResponse: data
        });
        return {
          success: false,
          message: 'Invalid response from payment gateway',
          error: 'Missing payment URL in response',
          fullResponse: data
        };
      }

      console.log('[MYFATOORAH] SendPayment success:', {
        invoiceId: invoiceId,
        paymentUrl: paymentUrl ? '***' : null
      });

      return {
        success: true,
        invoiceId: invoiceId,
        invoiceURL: paymentUrl,
        paymentUrl: paymentUrl
      };
    } else {
      // Log comprehensive error details for debugging
      console.error('[MYFATOORAH] SendPayment failed - Full details:', {
        IsSuccess: data.IsSuccess,
        Message: data.Message,
        ValidationErrors: data.ValidationErrors,
        Errors: data.Errors,
        Data: data.Data,
        fullResponse: data,
        requestBody: {
          ...requestBody,
          CustomerMobile: customerMobile ? '***' : 'EMPTY',
          Authorization: '***'
        },
        responseStatus: responseStatus,
        responseText: responseText
      });
      
      // Build detailed error message
      let errorMessage = data.Message || 'Failed to create payment invoice';
      const errorDetails = [];
      
      if (data.ValidationErrors && Array.isArray(data.ValidationErrors) && data.ValidationErrors.length > 0) {
        errorDetails.push(`Validation Errors: ${JSON.stringify(data.ValidationErrors)}`);
      }
      
      if (data.Errors && Array.isArray(data.Errors) && data.Errors.length > 0) {
        errorDetails.push(`API Errors: ${JSON.stringify(data.Errors)}`);
      }
      
      if (errorDetails.length > 0) {
        errorMessage += ` - ${errorDetails.join('; ')}`;
      }
      
      return {
        success: false,
        message: errorMessage,
        error: {
          validationErrors: data.ValidationErrors,
          errors: data.Errors,
          fullResponse: data,
          requestBody: requestBody,
          responseStatus: responseStatus
        }
      };
    }
  } catch (error) {
    console.error('[MYFATOORAH] Subscription payment error:', error);
    return {
      success: false,
      message: 'Payment gateway error',
      error: error.message
    };
  }
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentId, isSubscription = false) {
  try {
    const apiKey = isSubscription ? MYFATOORAH_SUBSCRIPTION_API_KEY : MYFATOORAH_EVENT_API_KEY;
    
    if (!apiKey) {
      console.error(`MyFatoorah ${isSubscription ? 'Subscription' : 'Event'} API Key is not configured`);
      return {
        success: false,
        message: 'Payment gateway is not configured'
      };
    }
    
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

