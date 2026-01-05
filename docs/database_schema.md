-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    shop_id VARCHAR(50) NOT NULL,
    allowed_reports TEXT, -- JSON array string
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- 2. sys_email_schedules
CREATE TABLE IF NOT EXISTS sys_email_schedules (
    schedule_id TEXT PRIMARY KEY,
    schedule_name TEXT,
    shop_id TEXT,
    schedule_pattern TEXT,
    next_run_at TIMESTAMPTZ,
    interval_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    -- Additional columns added via ALTER TABLE
    report_id TEXT,
    report_name TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    days_of_week INTEGER[],
    times TEXT[],
    timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
    recipients TEXT[],
    cc_recipients TEXT[],
    condition_guid TEXT,
    email_subject TEXT,
    include_pdf BOOLEAN DEFAULT TRUE
);

-- 3. sys_email_settings
CREATE TABLE IF NOT EXISTS sys_email_settings (
    shop_id TEXT PRIMARY KEY,
    email_list JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. sys_scheduler_logs
CREATE TABLE IF NOT EXISTS sys_scheduler_logs (
    log_id SERIAL PRIMARY KEY,
    schedule_id TEXT,
    status TEXT,
    message TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. sys_application_logs
CREATE TABLE IF NOT EXISTS sys_application_logs (
    log_id SERIAL PRIMARY KEY,
    shop_id TEXT,
    username TEXT,
    activity_type TEXT,
    target TEXT,
    details TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. user_logs
CREATE TABLE IF NOT EXISTS user_logs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    success BOOLEAN NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. sml_process_time
CREATE TABLE IF NOT EXISTS sml_process_time (
    id SERIAL PRIMARY KEY,
    shop_id VARCHAR(50) NOT NULL,
    report_id VARCHAR(50) NOT NULL,
    condition_guid VARCHAR(255) NOT NULL,
    report_name TEXT,
    condition_name TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_seconds INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    row_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shop_id, report_id, condition_guid)
);
