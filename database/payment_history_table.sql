CREATE TABLE payment_history (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    payment_id TEXT,
    invoice_id TEXT,
    amount DECIMAL(10, 3) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BHD',
    status VARCHAR(50) NOT NULL, -- e.g., 'pending', 'completed', 'failed'
    payment_for VARCHAR(100), -- e.g., 'membership_renewal', 'event_registration'
    details JSONB, -- To store event_id, membership_plan, etc.
    error_message TEXT
);

COMMENT ON COLUMN payment_history.user_id IS 'Reference to the user who made the payment';
COMMENT ON COLUMN payment_history.payment_id IS 'Transaction ID from the payment gateway (e.g., MyFatoorah PaymentId)';
COMMENT ON COLUMN payment_history.invoice_id IS 'Invoice ID from the payment gateway';
COMMENT ON COLUMN payment_history.amount IS 'The amount that was paid';
COMMENT ON COLUMN payment_history.status IS 'The status of the payment (e.g., pending, completed, failed)';
COMMENT ON COLUMN payment_history.payment_for IS 'A descriptor for what the payment was for (e.g., membership_renewal, event_registration)';
COMMENT ON COLUMN payment_history.details IS 'A JSON object containing context, like event_id, membership_plan_id, etc.';
COMMENT ON COLUMN payment_history.error_message IS 'Stores any error message if the payment failed';
