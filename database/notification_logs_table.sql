-- Notification Logs Table
-- Used to track sent notifications and prevent duplicate emails

CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    notification_key VARCHAR(255) UNIQUE, -- Unique key to prevent duplicates
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_key ON notification_logs(notification_key);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);

-- Add comment
COMMENT ON TABLE notification_logs IS 'Tracks sent notifications to prevent duplicate emails';
COMMENT ON COLUMN notification_logs.notification_key IS 'Unique key to prevent sending same notification twice (e.g., expiry_reminder_<subscription_id>_<days>)';
