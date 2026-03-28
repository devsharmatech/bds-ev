import { NextResponse } from 'next/server';

/**
 * GET /api/mobile/payments/subscription/payment-complete
 * 
 * MyFatoorah redirects here after payment. Returns a simple page
 * that the mobile app can detect in the WebView to close it.
 * 
 * Query params: payment_id, status (success/failed), paymentId (from MyFatoorah)
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const paymentIdParam = searchParams.get('payment_id');
  const status = searchParams.get('status') || 'unknown';
  const mfPaymentId = searchParams.get('paymentId') || searchParams.get('Id') || '';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Payment ${status === 'success' ? 'Complete' : 'Failed'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
    .card { background: white; border-radius: 16px; padding: 32px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; width: 90%; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 20px; color: #333; margin: 0 0 8px; }
    p { font-size: 14px; color: #666; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${status === 'success' ? '✅' : '❌'}</div>
    <h1>${status === 'success' ? 'Payment Successful' : 'Payment Failed'}</h1>
    <p>${status === 'success' ? 'You can close this window and return to the app.' : 'Payment was not completed. Please try again.'}</p>
  </div>
  <!-- Mobile app data -->
  <script>
    window.PAYMENT_RESULT = {
      status: "${status}",
      payment_id: "${paymentIdParam || ''}",
      paymentId: "${mfPaymentId}",
      type: "subscription"
    };
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
