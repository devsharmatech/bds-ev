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
  const startTime = Date.now();
  
  try {
    console.log('[MYFATOORAH] Creating subscription payment invoice:', {
      invoiceAmount,
      customerEmail,
      referenceId,
      baseUrl: MYFATOORAH_BASE_URL,
      hasApiKey: !!MYFATOORAH_SUBSCRIPTION_API_KEY,
      timestamp: new Date().toISOString()
    });

    if (!MYFATOORAH_SUBSCRIPTION_API_KEY) {
      console.error('[MYFATOORAH] Subscription API Key is not configured');
      return {
        success: false,
        message: 'Payment gateway is not configured. Please contact support.',
        error: 'MYFATOORAH_SUBSCRIPTION_API_KEY is missing'
      };
    }

    // Validate and format request data
    // MyFatoorah may require CustomerMobile to be in a specific format or may not accept empty strings
    const formattedMobile = customerMobile && customerMobile.trim() ? customerMobile.trim() : null;
    
    // Validate InvoiceItems format
    if (!invoiceItems || !Array.isArray(invoiceItems) || invoiceItems.length === 0) {
      console.error('[MYFATOORAH] Invalid InvoiceItems:', { invoiceItems });
      return {
        success: false,
        message: 'Invalid invoice items format',
        error: 'InvoiceItems must be a non-empty array'
      };
    }

    // Validate each invoice item
    for (const item of invoiceItems) {
      if (!item.ItemName || item.Quantity === undefined || item.UnitPrice === undefined) {
        console.error('[MYFATOORAH] Invalid invoice item:', { item, allItems: invoiceItems });
        return {
          success: false,
          message: 'Invalid invoice item format',
          error: 'Each invoice item must have ItemName, Quantity, and UnitPrice'
        };
      }
    }

    const requestBody = {
      InvoiceAmount: invoiceAmount,
      CurrencyIso: 'BHD',
      CustomerName: customerName,
      CustomerEmail: customerEmail,
      ...(formattedMobile && { CustomerMobile: formattedMobile }), // Only include if not null/empty
      CallBackUrl: callbackUrl,
      ErrorUrl: errorUrl,
      InvoiceItems: invoiceItems,
      DisplayCurrencyIso: 'BHD',
      ReferenceId: referenceId
    };

    // Log full InvoiceItems structure
    console.log('[MYFATOORAH] InvoiceItems details:', {
      count: invoiceItems.length,
      items: invoiceItems.map(item => ({
        ItemName: item.ItemName,
        Quantity: item.Quantity,
        UnitPrice: item.UnitPrice,
        ItemValue: item.ItemValue
      }))
    });

    console.log('[MYFATOORAH] Formatted request body:', {
      InvoiceAmount: requestBody.InvoiceAmount,
      CurrencyIso: requestBody.CurrencyIso,
      CustomerName: requestBody.CustomerName,
      CustomerEmail: requestBody.CustomerEmail,
      CustomerMobile: formattedMobile ? '***' : 'NOT_INCLUDED',
      CallBackUrl: requestBody.CallBackUrl,
      ErrorUrl: requestBody.ErrorUrl,
      InvoiceItems: requestBody.InvoiceItems,
      DisplayCurrencyIso: requestBody.DisplayCurrencyIso,
      ReferenceId: requestBody.ReferenceId
    });

    // Check if CallBackUrl is localhost - MyFatoorah might reject it
    if (callbackUrl.includes('localhost') || callbackUrl.includes('127.0.0.1')) {
      console.error('[MYFATOORAH] ERROR: CallBackUrl uses localhost - MyFatoorah typically rejects localhost URLs!', {
        callbackUrl,
        errorUrl,
        note: 'MyFatoorah requires public URLs for callbacks. Use ngrok or a public domain for testing.'
      });
    }

    // Log the exact JSON being sent (for debugging)
    const requestBodyJson = JSON.stringify(requestBody);
    console.log('[MYFATOORAH] Request JSON being sent:', {
      jsonLength: requestBodyJson.length,
      jsonPreview: requestBodyJson.substring(0, 800),
      invoiceItemsJson: JSON.stringify(invoiceItems)
    });

    console.log('[MYFATOORAH] Sending request to MyFatoorah:', {
      url: `${MYFATOORAH_BASE_URL}/v2/SendPayment`,
      method: 'POST',
      hasAuth: !!MYFATOORAH_SUBSCRIPTION_API_KEY,
      apiKeyPrefix: MYFATOORAH_SUBSCRIPTION_API_KEY ? MYFATOORAH_SUBSCRIPTION_API_KEY.substring(0, 10) + '...' : 'MISSING'
    });

    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/SendPayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MYFATOORAH_SUBSCRIPTION_API_KEY}`
      },
      body: requestBodyJson
    });

    const responseStatus = response.status;
    const responseText = await response.text();
    
    console.log('[MYFATOORAH] Response received:', {
      status: responseStatus,
      statusText: response.statusText,
      hasBody: !!responseText,
      bodyLength: responseText.length,
      duration_ms: Date.now() - startTime,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Always log full response for debugging (especially for errors)
    if (responseStatus !== 200 || responseText.includes('error') || responseText.includes('Error')) {
      console.error('[MYFATOORAH] Error response - Full body:', {
        status: responseStatus,
        statusText: response.statusText,
        fullResponseText: responseText,
        responseLength: responseText.length,
        requestBody: {
          ...requestBody,
          CustomerMobile: customerMobile ? '***' : null,
          Authorization: '***'
        }
      });
    } else {
      // Log successful response too (first 500 chars)
      console.log('[MYFATOORAH] Success response preview:', {
        responsePreview: responseText.substring(0, 500)
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[MYFATOORAH] Failed to parse response:', {
        error: parseError,
        responseText: responseText.substring(0, 1000), // Log more of the response
        status: responseStatus,
        responseHeaders: Object.fromEntries(response.headers.entries())
      });
      return {
        success: false,
        message: 'Invalid response from payment gateway',
        error: {
          name: parseError.name,
          message: parseError.message,
          responseStatus,
          responseText: responseText.substring(0, 500)
        }
      };
    }

    console.log('[MYFATOORAH] Parsed response:', {
      IsSuccess: data.IsSuccess,
      Message: data.Message,
      hasData: !!data.Data,
      InvoiceId: data.Data?.InvoiceId,
      InvoiceURL: data.Data?.InvoiceURL ? '***' : null,
      ValidationErrors: data.ValidationErrors,
      Errors: data.Errors
    });

    // Log validation errors if present
    if (data.ValidationErrors && data.ValidationErrors.length > 0) {
      console.error('[MYFATOORAH] Validation errors:', {
        errors: data.ValidationErrors,
        fullResponse: data
      });
    }

    // Log other errors if present
    if (data.Errors && data.Errors.length > 0) {
      console.error('[MYFATOORAH] API errors:', {
        errors: data.Errors,
        fullResponse: data
      });
    }

    if (data.IsSuccess) {
      if (!data.Data || !data.Data.InvoiceId || !data.Data.InvoiceURL) {
        console.error('[MYFATOORAH] Invalid success response structure:', {
          Data: data.Data,
          fullResponse: data
        });
        return {
          success: false,
          message: 'Invalid response from payment gateway',
          error: 'Missing invoice data in response'
        };
      }

      console.log('[MYFATOORAH] Invoice created successfully:', {
        invoiceId: data.Data.InvoiceId,
        referenceId,
        duration_ms: Date.now() - startTime
      });

      return {
        success: true,
        invoiceId: data.Data.InvoiceId,
        invoiceURL: data.Data.InvoiceURL,
        paymentUrl: data.Data.InvoiceURL
      };
    } else {
      // Log full error response for debugging
      console.error('[MYFATOORAH] Invoice creation failed:', {
        IsSuccess: data.IsSuccess,
        Message: data.Message,
        ValidationErrors: data.ValidationErrors,
        Errors: data.Errors,
        Data: data.Data,
        fullResponse: data, // Log entire response for debugging
        referenceId,
        requestBody: {
          ...requestBody,
          CustomerMobile: '***', // Don't log full mobile
          Authorization: '***' // Don't log API key
        }
      });

      // Build detailed error message
      let errorMessage = data.Message || 'Failed to create payment invoice';
      const errorDetails = [];

      if (data.ValidationErrors && data.ValidationErrors.length > 0) {
        errorDetails.push(`Validation Errors: ${JSON.stringify(data.ValidationErrors)}`);
      }

      if (data.Errors && data.Errors.length > 0) {
        errorDetails.push(`API Errors: ${JSON.stringify(data.Errors)}`);
      }

      if (errorDetails.length > 0) {
        errorMessage += ` - ${errorDetails.join('; ')}`;
      }

      return {
        success: false,
        message: errorMessage,
        error: {
          message: data.Message,
          validationErrors: data.ValidationErrors,
          errors: data.Errors,
          fullResponse: data
        }
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[MYFATOORAH] Unexpected error creating invoice:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      },
      referenceId,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      message: 'Payment gateway error',
      error: {
        name: error.name,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      }
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

