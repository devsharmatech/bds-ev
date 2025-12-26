/**
 * Shared OTP store for password reset
 * In production, replace with Redis or database
 */

const otpStore = new Map();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

/**
 * Store OTP for an email
 */
export function setOTP(email, data) {
  otpStore.set(email.toLowerCase().trim(), {
    ...data,
    createdAt: data.createdAt || Date.now(),
  });
}

/**
 * Get OTP data for an email
 */
export function getOTP(email) {
  return otpStore.get(email.toLowerCase().trim());
}

/**
 * Delete OTP for an email
 */
export function deleteOTP(email) {
  otpStore.delete(email.toLowerCase().trim());
}

/**
 * Check if OTP exists and is valid
 */
export function isValidOTP(email, otp) {
  const data = getOTP(email);
  if (!data) return false;
  if (Date.now() > data.expiresAt) {
    deleteOTP(email);
    return false;
  }
  return data.otp === otp;
}

/**
 * Increment OTP attempts
 */
export function incrementAttempts(email) {
  const data = getOTP(email);
  if (data) {
    data.attempts = (data.attempts || 0) + 1;
    otpStore.set(email.toLowerCase().trim(), data);
  }
  return data?.attempts || 0;
}


