-- OceanEye Database Schema for Supabase
-- This file contains the SQL schema for setting up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('disaster_management', 'city_government', 'environmental_ngo', 'fisherfolk', 'civil_defence', 'general')),
    organization VARCHAR(255),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    alert_channels TEXT[] DEFAULT ARRAY['app'],
    threat_types TEXT[] DEFAULT ARRAY['storm_surge', 'erosion', 'pollution'],
    notification_frequency VARCHAR(20) DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'hourly', 'daily')),
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Threat locations table
CREATE TABLE threat_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    location_type VARCHAR(50) DEFAULT 'coastal' CHECK (location_type IN ('coastal', 'marine', 'estuary', 'island')),
    is_active BOOLEAN DEFAULT true,
    last_monitored TIMESTAMP WITH TIME ZONE,
    current_threat_level VARCHAR(20) DEFAULT 'low',
    monitoring_confidence DECIMAL(3, 2) DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threats table
CREATE TABLE threats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    threat_type VARCHAR(50) NOT NULL CHECK (threat_type IN ('storm_surge', 'erosion', 'pollution', 'coastal_flooding', 'algal_bloom', 'illegal_dumping', 'environmental_stress')),
    location_id UUID REFERENCES threat_locations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    severity_score DECIMAL(3, 1) NOT NULL CHECK (severity_score >= 0 AND severity_score <= 10),
    confidence_level DECIMAL(3, 2) NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 1),
    reported_by VARCHAR(100),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'automated_monitoring', 'user_report', 'external_api', 'simulated_data')),
    resolution_notes TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threat impacts table
CREATE TABLE threat_impacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    threat_id UUID REFERENCES threats(id) ON DELETE CASCADE,
    carbon_loss_tons DECIMAL(10, 2),
    economic_loss_usd DECIMAL(15, 2),
    affected_area_km2 DECIMAL(10, 4),
    estimated_recovery_time VARCHAR(50),
    impact_assessment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    threat_id UUID REFERENCES threats(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) DEFAULT 'general' CHECK (alert_type IN ('general', 'emergency', 'warning', 'advisory', 'update')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channels TEXT[] DEFAULT ARRAY['app'],
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blue carbon habitats table
CREATE TABLE blue_carbon_habitats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES threat_locations(id) ON DELETE CASCADE,
    habitat_type VARCHAR(50) NOT NULL CHECK (habitat_type IN ('mangrove', 'seagrass', 'salt_marsh', 'kelp_forest')),
    area_hectares DECIMAL(10, 4) NOT NULL,
    health_status VARCHAR(20) DEFAULT 'unknown' CHECK (health_status IN ('excellent', 'good', 'fair', 'poor', 'critical', 'unknown')),
    carbon_storage_tons DECIMAL(12, 2),
    annual_sequestration_tons DECIMAL(8, 2),
    last_assessment TIMESTAMP WITH TIME ZONE,
    protection_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for testing

-- Sample locations
INSERT INTO threat_locations (id, name, latitude, longitude, description, location_type) VALUES
('00000000-0000-0000-0000-000000000001', 'Manila Bay', 14.5995, 120.9842, 'Major bay in the Philippines', 'coastal'),
('00000000-0000-0000-0000-000000000002', 'Cebu Strait', 10.3157, 123.8854, 'Coastal waters near Cebu City', 'marine'),
('00000000-0000-0000-0000-000000000003', 'Davao Gulf', 7.0731, 125.6128, 'Gulf in Mindanao, Philippines', 'coastal'),
('00000000-0000-0000-0000-000000000004', 'Biscayne Bay', 25.7617, -80.1918, 'Bay near Miami, Florida', 'coastal'),
('00000000-0000-0000-0000-000000000005', 'New York Harbor', 40.7128, -74.0060, 'Harbor in New York', 'coastal');

-- Sample blue carbon habitats
INSERT INTO blue_carbon_habitats (location_id, habitat_type, area_hectares, health_status, carbon_storage_tons, annual_sequestration_tons) VALUES
('00000000-0000-0000-0000-000000000001', 'mangrove', 80.0, 'good', 32000.0, 120.0),
('00000000-0000-0000-0000-000000000001', 'seagrass', 50.0, 'fair', 7500.0, 40.0),
('00000000-0000-0000-0000-000000000002', 'mangrove', 45.0, 'excellent', 18000.0, 67.5),
('00000000-0000-0000-0000-000000000002', 'seagrass', 35.0, 'good', 5250.0, 28.0),
('00000000-0000-0000-0000-000000000003', 'mangrove', 120.0, 'excellent', 48000.0, 180.0);

-- Create indexes for better performance
CREATE INDEX idx_threats_location_id ON threats(location_id);
CREATE INDEX idx_threats_is_active ON threats(is_active);
CREATE INDEX idx_threats_detected_at ON threats(detected_at DESC);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Create database functions for statistics

-- Function to get threat statistics
CREATE OR REPLACE FUNCTION get_threat_statistics(time_filter TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
    active_threats BIGINT,
    resolved_threats BIGINT,
    high_severity_threats BIGINT,
    avg_severity DECIMAL,
    most_common_type TEXT,
    total_carbon_at_risk DECIMAL,
    economic_impact DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(CASE WHEN t.is_active = true THEN 1 END) as active_threats,
        COUNT(CASE WHEN t.is_active = false THEN 1 END) as resolved_threats,
        COUNT(CASE WHEN t.severity_score >= 7 THEN 1 END) as high_severity_threats,
        COALESCE(AVG(t.severity_score), 0) as avg_severity,
        COALESCE(
            (SELECT threat_type FROM threats 
             WHERE detected_at >= time_filter 
             GROUP BY threat_type 
             ORDER BY COUNT(*) DESC 
             LIMIT 1), 
            'storm_surge'
        ) as most_common_type,
        COALESCE(SUM(ti.carbon_loss_tons), 0) as total_carbon_at_risk,
        COALESCE(SUM(ti.economic_loss_usd), 0) as economic_impact
    FROM threats t
    LEFT JOIN threat_impacts ti ON t.id = ti.threat_id
    WHERE t.detected_at >= time_filter;
END;
$$ LANGUAGE plpgsql;

-- Function to get user alert statistics
CREATE OR REPLACE FUNCTION get_user_alert_statistics(p_user_id UUID, time_filter TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
    total_alerts BIGINT,
    unread_alerts BIGINT,
    high_priority_alerts BIGINT,
    alert_types JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_alerts,
        COUNT(CASE WHEN a.status = 'sent' THEN 1 END) as unread_alerts,
        COUNT(CASE WHEN a.priority = 'high' THEN 1 END) as high_priority_alerts,
        COALESCE(
            jsonb_object_agg(
                a.alert_type, 
                COUNT(a.alert_type)
            ) FILTER (WHERE a.alert_type IS NOT NULL),
            '{}'::jsonb
        ) as alert_types
    FROM alerts a
    WHERE a.user_id = p_user_id AND a.created_at >= time_filter;
END;
$$ LANGUAGE plpgsql;

-- Function to get monitoring statistics
CREATE OR REPLACE FUNCTION get_monitoring_statistics()
RETURNS TABLE (
    active_locations BIGINT,
    threats_last_24h BIGINT,
    avg_response_time TEXT,
    system_uptime TEXT,
    last_scan TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(CASE WHEN tl.is_active = true THEN 1 END) as active_locations,
        COUNT(CASE WHEN t.detected_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as threats_last_24h,
        '12 minutes'::TEXT as avg_response_time,
        '99.5%'::TEXT as system_uptime,
        COALESCE(MAX(tl.last_monitored), NOW()) as last_scan
    FROM threat_locations tl
    LEFT JOIN threats t ON tl.id = t.location_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Alerts policies
CREATE POLICY "Users can view own alerts" ON alerts
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Public read access for threat-related tables (for dashboard)
CREATE POLICY "Public read threats" ON threats FOR SELECT USING (true);
CREATE POLICY "Public read locations" ON threat_locations FOR SELECT USING (true);
CREATE POLICY "Public read impacts" ON threat_impacts FOR SELECT USING (true);
CREATE POLICY "Public read habitats" ON blue_carbon_habitats FOR SELECT USING (true);
