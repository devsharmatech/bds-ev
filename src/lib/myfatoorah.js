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
 * Sanitize mobile for MyFatoorah:
 * - Digits only
 * - Remove leading country code (e.g., 973) when present
 * - Max 11 digits (keep last 11 if longer)
 * - Return '' if invalid/too short to avoid validation error
 */
function sanitizeMobileForMyFatoorrah(mobile) {
  if (!mobile) return '';
  let digits = String(mobile).replace(/\D/g, '');
  if (!digits) return '';
  // Remove leading Bahrain country code if present
  if (digits.startsWith('973') && digits.length > 8) {
    digits = digits.slice(3);
  }
  if (digits.length > 11) digits = digits.slice(-11);
  if (digits.length < 6) return '';
  return digits;
}

/**
 * Initiate payment for events - Get available payment methods
 */
export async function initiateEventPayment({
  invoiceAmount,
  customerName,
  customerEmail,
  customerMobile,
  invoiceItems,
  callbackUrl,
  errorUrl,
  referenceId,
  logoUrl // Optional: URL to your logo image
}) {
  try {
    if (!MYFATOORAH_EVENT_API_KEY) {
      console.error('[MYFATOORAH] Event API Key is not configured');
      return {
        success: false,
        message: 'Payment gateway is not configured. Please contact support.',
        error: 'MYFATOORAH_EVENT_API_KEY is missing'
      };
    }

    const requestBody = {
      InvoiceAmount: invoiceAmount,
      CurrencyIso: 'BHD',
      CustomerName: customerName,
      CustomerEmail: customerEmail,
      CustomerMobile: sanitizeMobileForMyFatoorrah(customerMobile),
      CallBackUrl: callbackUrl,
      ErrorUrl: errorUrl,
      InvoiceItems: invoiceItems,
      DisplayCurrencyIso: 'BHD',
      ReferenceId: referenceId,
      MobileCountryCode: '+973'
    };

    // Add logo URL if provided
    if (logoUrl) {
      requestBody.UserDefinedField = logoUrl;
    }

    console.log('[MYFATOORAH] InitiatePayment Request (Events):', {
      url: `${MYFATOORAH_BASE_URL}/v2/InitiatePayment`,
      method: 'POST',
      requestBody: {
        ...requestBody,
        CustomerMobile: customerMobile ? '***' : 'EMPTY',
        Authorization: '***'
      }
    });

    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/InitiatePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MYFATOORAH_EVENT_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseStatus = response.status;
    const responseText = await response.text();
    
    console.log('[MYFATOORAH] InitiatePayment Response (Events):', {
      status: responseStatus,
      statusText: response.statusText,
      responseLength: responseText.length
    });

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[MYFATOORAH] Failed to parse InitiatePayment response:', {
        error: parseError,
        responseText: responseText.substring(0, 500),
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
      const paymentMethods = data.Data?.PaymentMethods || [];
      
      console.log('[MYFATOORAH] InitiatePayment success (Events):', {
        paymentMethodsCount: paymentMethods.length
      });

      return {
        success: true,
        paymentMethods: paymentMethods
      };
    } else {
      console.error('[MYFATOORAH] InitiatePayment failed (Events):', {
        IsSuccess: data.IsSuccess,
        Message: data.Message,
        ValidationErrors: data.ValidationErrors,
        Errors: data.Errors
      });
      
      let errorMessage = data.Message || 'Failed to initiate payment';
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
          fullResponse: data
        }
      };
    }
  } catch (error) {
    console.error('[MYFATOORAH] InitiatePayment error (Events):', error);
    return {
      success: false,
      message: 'Payment gateway error',
      error: error.message
    };
  }
}

/**
 * Execute payment for events - Create invoice with selected payment method
 */
export async function executeEventPayment({
  invoiceAmount,
  customerName,
  customerEmail,
  customerMobile,
  invoiceItems,
  callbackUrl,
  errorUrl,
  referenceId,
  paymentMethodId,
  logoUrl // Optional: URL to your logo image
}) {
  try {
    if (!MYFATOORAH_EVENT_API_KEY) {
      console.error('[MYFATOORAH] Event API Key is not configured');
      return {
        success: false,
        message: 'Payment gateway is not configured. Please contact support.',
        error: 'MYFATOORAH_EVENT_API_KEY is missing'
      };
    }

    if (!paymentMethodId) {
      return {
        success: false,
        message: 'Payment method ID is required'
      };
    }

    const requestBody = {
      InvoiceValue: invoiceAmount,
      CurrencyIso: 'BHD',
      CustomerName: customerName,
      CustomerEmail: customerEmail,
      CustomerMobile: sanitizeMobileForMyFatoorrah(customerMobile),
      CallBackUrl: callbackUrl,
      ErrorUrl: errorUrl,
      InvoiceItems: invoiceItems,
      DisplayCurrencyIso: 'BHD',
      ReferenceId: referenceId,
      PaymentMethodId: paymentMethodId,
      MobileCountryCode: '+973',
      Language: 'en',
      SupplierName: 'Bahrain Dental Society'
    };

    // Add logo URL if provided
    if (logoUrl) {
      requestBody.UserDefinedField = logoUrl;
    }

    console.log('[MYFATOORAH] ExecutePayment Request (Events):', {
      url: `${MYFATOORAH_BASE_URL}/v2/ExecutePayment`,
      method: 'POST',
      requestBody: {
        ...requestBody,
        CustomerMobile: customerMobile ? '***' : 'EMPTY',
        Authorization: '***'
      }
    });

    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/ExecutePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MYFATOORAH_EVENT_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseStatus = response.status;
    const responseText = await response.text();
    
    console.log('[MYFATOORAH] ExecutePayment Response (Events):', {
      status: responseStatus,
      statusText: response.statusText,
      responseLength: responseText.length,
      responsePreview: responseText.substring(0, 500)
    });

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[MYFATOORAH] Failed to parse ExecutePayment response:', {
        error: parseError,
        responseText: responseText.substring(0, 500),
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
      const paymentUrl = data.Data?.PaymentURL || data.Data?.InvoiceURL || data.Data?.PaymentLink;
      const invoiceId = data.Data?.InvoiceId;
      const isDirectPayment = data.Data?.IsDirectPayment || false;
      
      if (!paymentUrl) {
        console.error('[MYFATOORAH] ExecutePayment response missing PaymentURL:', {
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

      console.log('[MYFATOORAH] ExecutePayment success (Events):', {
        invoiceId: invoiceId,
        isDirectPayment: isDirectPayment,
        paymentUrl: paymentUrl ? '***' : null
      });

      return {
        success: true,
        invoiceId: invoiceId,
        paymentUrl: paymentUrl,
        invoiceURL: paymentUrl,
        isDirectPayment: isDirectPayment
      };
    } else {
      console.error('[MYFATOORAH] ExecutePayment failed (Events):', {
        IsSuccess: data.IsSuccess,
        Message: data.Message,
        ValidationErrors: data.ValidationErrors,
        Errors: data.Errors
      });
      
      let errorMessage = data.Message || 'Failed to execute payment';
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
          fullResponse: data
        }
      };
    }
  } catch (error) {
    console.error('[MYFATOORAH] ExecutePayment error (Events):', error);
    return {
      success: false,
      message: 'Payment gateway error',
      error: error.message
    };
  }
}

/**
 * Create payment invoice for events (legacy - kept for backward compatibility)
 * @deprecated Use initiateEventPayment and executeEventPayment instead
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
        CustomerMobile: sanitizeMobileForMyFatoorrah(customerMobile),
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
  referenceId,
  logoUrl // Optional: URL to your logo image
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
      CustomerMobile: sanitizeMobileForMyFatoorrah(customerMobile), // API accepts empty string
      CallBackUrl: callbackUrl,
      ErrorUrl: errorUrl,
      InvoiceItems: invoiceItems,
      DisplayCurrencyIso: 'BHD',
      ReferenceId: referenceId,
      MobileCountryCode: '+973',
      Language: 'en',
      SupplierName: 'Bahrain Dental Society'
    };

    // Add logo URL if provided
    if (logoUrl) {
      requestBody.UserDefinedField = logoUrl;
    }

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
 * Initiate payment - Get available payment methods
 * This is the first step in the payment flow
 */
export async function initiateSubscriptionPayment({
  invoiceAmount,
  customerName,
  customerEmail,
  customerMobile,
  invoiceItems,
  callbackUrl,
  errorUrl,
  referenceId,
  logoUrl // Optional: URL to your logo image
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

    const requestBody = {
      InvoiceAmount: invoiceAmount,
      CurrencyIso: 'BHD',
      CustomerName: customerName,
      CustomerEmail: customerEmail,
      CustomerMobile: sanitizeMobileForMyFatoorrah(customerMobile),
      CallBackUrl: callbackUrl,
      ErrorUrl: errorUrl,
      InvoiceItems: invoiceItems,
      DisplayCurrencyIso: 'BHD',
      ReferenceId: referenceId,
      MobileCountryCode: '+973',
      Language: 'en',
      SupplierName: 'Bahrain Dental Society'
    };

    // Add logo URL if provided
    if (logoUrl) {
      requestBody.UserDefinedField = logoUrl;
    }

    console.log('[MYFATOORAH] InitiatePayment Request:', {
      url: `${MYFATOORAH_BASE_URL}/v2/InitiatePayment`,
      method: 'POST',
      requestBody: {
        ...requestBody,
        CustomerMobile: customerMobile ? '***' : 'EMPTY',
        Authorization: '***'
      }
    });

    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/InitiatePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MYFATOORAH_SUBSCRIPTION_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseStatus = response.status;
    const responseText = await response.text();
    
    console.log('[MYFATOORAH] InitiatePayment Response:', {
      status: responseStatus,
      statusText: response.statusText,
      responseLength: responseText.length
    });

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[MYFATOORAH] Failed to parse InitiatePayment response:', {
        error: parseError,
        responseText: responseText.substring(0, 500),
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
      const paymentMethods = data.Data?.PaymentMethods || [];
      
      console.log('[MYFATOORAH] InitiatePayment success:', {
        paymentMethodsCount: paymentMethods.length,
        paymentMethods: paymentMethods.map(pm => ({
          id: pm.PaymentMethodId,
          name: pm.PaymentMethodEn,
          code: pm.PaymentMethodCode
        }))
      });

      return {
        success: true,
        paymentMethods: paymentMethods
      };
    } else {
      console.error('[MYFATOORAH] InitiatePayment failed:', {
        IsSuccess: data.IsSuccess,
        Message: data.Message,
        ValidationErrors: data.ValidationErrors,
        Errors: data.Errors,
        fullResponse: data
      });
      
      let errorMessage = data.Message || 'Failed to initiate payment';
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
          fullResponse: data
        }
      };
    }
  } catch (error) {
    console.error('[MYFATOORAH] InitiatePayment error:', error);
    return {
      success: false,
      message: 'Payment gateway error',
      error: error.message
    };
  }
}

/**
 * Execute payment - Create invoice with selected payment method
 * This is called after user selects a payment method
 */
export async function executeSubscriptionPayment({
  invoiceAmount,
  customerName,
  customerEmail,
  customerMobile,
  invoiceItems,
  callbackUrl,
  errorUrl,
  referenceId,
  paymentMethodId,
  logoUrl // Optional: URL to your logo image
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

    if (!paymentMethodId) {
      return {
        success: false,
        message: 'Payment method ID is required'
      };
    }

    const requestBody = {
      InvoiceValue: invoiceAmount,
      CurrencyIso: 'BHD',
      CustomerName: customerName,
      CustomerEmail: customerEmail,
      CustomerMobile: sanitizeMobileForMyFatoorrah(customerMobile),
      CallBackUrl: callbackUrl,
      ErrorUrl: errorUrl,
      InvoiceItems: invoiceItems,
      DisplayCurrencyIso: 'BHD',
      ReferenceId: referenceId,
      PaymentMethodId: paymentMethodId,
      MobileCountryCode: '+973',
      Language: 'en',
      SupplierName: 'Bahrain Dental Society'
    };

    // Add logo URL if provided
    if (logoUrl) {
      requestBody.UserDefinedField = logoUrl;
    }

    console.log('[MYFATOORAH] ExecutePayment Request:', {
      url: `${MYFATOORAH_BASE_URL}/v2/ExecutePayment`,
      method: 'POST',
      requestBody: {
        ...requestBody,
        CustomerMobile: customerMobile ? '***' : 'EMPTY',
        Authorization: '***'
      }
    });

    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/ExecutePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MYFATOORAH_SUBSCRIPTION_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseStatus = response.status;
    const responseText = await response.text();
    
    console.log('[MYFATOORAH] ExecutePayment Response:', {
      status: responseStatus,
      statusText: response.statusText,
      responseLength: responseText.length,
      responsePreview: responseText.substring(0, 500)
    });

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[MYFATOORAH] Failed to parse ExecutePayment response:', {
        error: parseError,
        responseText: responseText.substring(0, 500),
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
      const paymentUrl = data.Data?.PaymentURL || data.Data?.InvoiceURL || data.Data?.PaymentLink;
      const invoiceId = data.Data?.InvoiceId;
      const isDirectPayment = data.Data?.IsDirectPayment || false;
      
      if (!paymentUrl) {
        console.error('[MYFATOORAH] ExecutePayment response missing PaymentURL:', {
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

      console.log('[MYFATOORAH] ExecutePayment success:', {
        invoiceId: invoiceId,
        isDirectPayment: isDirectPayment,
        paymentUrl: paymentUrl ? '***' : null
      });

      return {
        success: true,
        invoiceId: invoiceId,
        paymentUrl: paymentUrl,
        invoiceURL: paymentUrl,
        isDirectPayment: isDirectPayment
      };
    } else {
      console.error('[MYFATOORAH] ExecutePayment failed:', {
        IsSuccess: data.IsSuccess,
        Message: data.Message,
        ValidationErrors: data.ValidationErrors,
        Errors: data.Errors,
        fullResponse: data
      });
      
      let errorMessage = data.Message || 'Failed to execute payment';
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
          fullResponse: data
        }
      };
    }
  } catch (error) {
    console.error('[MYFATOORAH] ExecutePayment error:', error);
    return {
      success: false,
      message: 'Payment gateway error',
      error: error.message
    };
  }
}

/**
 * Get payment status
 * @param {string|number} paymentId - InvoiceId or PaymentId
 * @param {boolean} isSubscription - Whether this is a subscription payment
 * @param {string} keyType - 'InvoiceId' or 'PaymentId' (defaults to 'InvoiceId')
 */
export async function getPaymentStatus(paymentId, isSubscription = false, keyType = 'InvoiceId') {
  try {
    const apiKey = isSubscription ? MYFATOORAH_SUBSCRIPTION_API_KEY : MYFATOORAH_EVENT_API_KEY;
    
    if (!apiKey) {
      console.error(`MyFatoorah ${isSubscription ? 'Subscription' : 'Event'} API Key is not configured`);
      return {
        success: false,
        message: 'Payment gateway is not configured'
      };
    }
    
    console.log('[MYFATOORAH] GetPaymentStatus Request:', {
      Key: paymentId,
      KeyType: keyType,
      isSubscription
    });
    
    const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/GetPaymentStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        Key: String(paymentId),
        KeyType: keyType
      })
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[MYFATOORAH] Failed to parse GetPaymentStatus response:', {
        error: parseError,
        responseText: responseText.substring(0, 500),
        status: response.status
      });
      return {
        success: false,
        message: 'Invalid response from payment gateway'
      };
    }

    console.log('[MYFATOORAH] GetPaymentStatus Response:', {
      IsSuccess: data.IsSuccess,
      Message: data.Message,
      Status: data.Data?.InvoiceStatus,
      Key: paymentId,
      KeyType: keyType
    });

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
        message: data.Message || 'Failed to get payment status',
        validationErrors: data.ValidationErrors
      };
    }
  } catch (error) {
    console.error('[MYFATOORAH] GetPaymentStatus Error:', error);
    return {
      success: false,
      message: 'Payment gateway error',
      error: error.message
    };
  }
}

