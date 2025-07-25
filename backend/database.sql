-- QHSE Login System - Sichere Datenbankstruktur
-- TÜV-konforme Datenbank für Benutzer und Session-Verwaltung
-- MySQL/MariaDB Schema

-- Datenbank erstellen
CREATE DATABASE IF NOT EXISTS qhse_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE qhse_system;

-- Benutzer-Tabelle
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    role ENUM('admin', 'manager', 'user', 'readonly') DEFAULT 'user' NOT NULL,
    permissions JSON NULL,
    
    -- Status und Sicherheit
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    failed_login_attempts INT UNSIGNED DEFAULT 0 NOT NULL,
    locked_until TIMESTAMP NULL,
    
    -- Audit-Felder
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45) NULL,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Compliance-Felder
    data_retention_until DATE NULL,
    consent_given_at TIMESTAMP NULL,
    privacy_version VARCHAR(10) DEFAULT '1.0' NOT NULL,
    
    INDEX idx_company_name (company_name),
    INDEX idx_email (email),
    INDEX idx_is_active (is_active),
    INDEX idx_locked_until (locked_until),
    INDEX idx_last_login_at (last_login_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions-Tabelle für sichere Session-Verwaltung
CREATE TABLE user_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    csrf_token VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NOT NULL,
    
    -- Session-Daten
    session_data JSON NULL,
    remember_me BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Zeitstempel
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_last_activity (last_activity_at),
    INDEX idx_ip_address (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Login-Versuche für Brute-Force-Schutz
CREATE TABLE login_attempts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(100) NOT NULL, -- Company name oder IP
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NULL,
    success BOOLEAN DEFAULT FALSE NOT NULL,
    failure_reason VARCHAR(100) NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    INDEX idx_identifier (identifier),
    INDEX idx_ip_address (ip_address),
    INDEX idx_attempted_at (attempted_at),
    INDEX idx_success (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Security-Log für TÜV-Compliance
CREATE TABLE security_log (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NULL,
    session_id VARCHAR(64) NULL,
    event_type VARCHAR(50) NOT NULL,
    event_category ENUM('authentication', 'authorization', 'data_access', 'system', 'error') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' NOT NULL,
    
    -- Event-Details
    message TEXT NOT NULL,
    details JSON NULL,
    
    -- Request-Informationen
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NULL,
    request_uri VARCHAR(500) NULL,
    request_method VARCHAR(10) NULL,
    
    -- Zeitstempel
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_event_category (event_category),
    INDEX idx_severity (severity),
    INDEX idx_occurred_at (occurred_at),
    INDEX idx_ip_address (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password-Reset-Tokens
CREATE TABLE password_reset_tokens (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rate Limiting für API-Schutz
CREATE TABLE rate_limits (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(100) NOT NULL, -- IP oder User-ID
    endpoint VARCHAR(100) NOT NULL,
    requests_count INT UNSIGNED DEFAULT 1 NOT NULL,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    blocked_until TIMESTAMP NULL,
    
    UNIQUE KEY unique_identifier_endpoint (identifier, endpoint),
    INDEX idx_identifier (identifier),
    INDEX idx_blocked_until (blocked_until),
    INDEX idx_window_start (window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System-Konfiguration
CREATE TABLE system_config (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    config_type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string' NOT NULL,
    description TEXT NULL,
    is_sensitive BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Standard-Benutzer einfügen
INSERT INTO users (
    company_name, 
    password_hash, 
    salt, 
    role, 
    permissions,
    is_active,
    is_verified
) VALUES 
(
    'QHSE GFT',
    '$2y$12$LQv3c1yqBWVHxkd0LQ4lqeF4DpRDdyWz0YrqZaEq9NQc8.4LQv3c1y', -- SecureQHSE2024!
    'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    'admin',
    '["read", "write", "admin", "audit"]',
    TRUE,
    TRUE
),
(
    'Demo Company',
    '$2y$12$9TgKpR7F8YvQ2Lm3Xz6Wa5B4C9D8E7F6G5H4I3J2K1L0M9N8O7P6', -- Demo123!
    'p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1',
    'user',
    '["read"]',
    TRUE,
    TRUE
);

-- System-Konfiguration einfügen
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
('system_name', 'QHSE Management System', 'string', 'Name des Systems'),
('maintenance_mode', 'false', 'boolean', 'Wartungsmodus aktiviert'),
('max_login_attempts', '5', 'integer', 'Maximale Login-Versuche'),
('session_timeout', '3600', 'integer', 'Session-Timeout in Sekunden'),
('password_policy', '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_special": false}', 'json', 'Passwort-Richtlinien');

-- Views für bessere Performance und Sicherheit
CREATE VIEW active_users AS
SELECT 
    id,
    company_name,
    email,
    role,
    permissions,
    created_at,
    last_login_at,
    last_login_ip
FROM users 
WHERE is_active = TRUE;

CREATE VIEW security_events AS
SELECT 
    sl.id,
    sl.event_type,
    sl.event_category,
    sl.severity,
    sl.message,
    sl.ip_address,
    sl.occurred_at,
    u.company_name
FROM security_log sl
LEFT JOIN users u ON sl.user_id = u.id
ORDER BY sl.occurred_at DESC;

-- Stored Procedures für häufige Operationen
DELIMITER //

-- Benutzer authentifizieren
CREATE PROCEDURE AuthenticateUser(
    IN p_company_name VARCHAR(100),
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT
)
BEGIN
    DECLARE v_user_id INT UNSIGNED;
    DECLARE v_password_hash VARCHAR(255);
    DECLARE v_is_active BOOLEAN;
    DECLARE v_failed_attempts INT;
    DECLARE v_locked_until TIMESTAMP;
    
    -- Benutzer-Daten abrufen
    SELECT id, password_hash, is_active, failed_login_attempts, locked_until
    INTO v_user_id, v_password_hash, v_is_active, v_failed_attempts, v_locked_until
    FROM users 
    WHERE company_name = p_company_name;
    
    -- Ergebnis zurückgeben
    SELECT 
        v_user_id as user_id,
        v_password_hash as password_hash,
        v_is_active as is_active,
        v_failed_attempts as failed_attempts,
        v_locked_until as locked_until;
        
    -- Login-Versuch protokollieren
    INSERT INTO login_attempts (identifier, ip_address, user_agent, attempted_at)
    VALUES (p_company_name, p_ip_address, p_user_agent, NOW());
END //

-- Session erstellen
CREATE PROCEDURE CreateSession(
    IN p_session_id VARCHAR(64),
    IN p_user_id INT UNSIGNED,
    IN p_csrf_token VARCHAR(64),
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT,
    IN p_expires_at TIMESTAMP,
    IN p_remember_me BOOLEAN
)
BEGIN
    INSERT INTO user_sessions (
        id, user_id, csrf_token, ip_address, user_agent, 
        expires_at, remember_me, session_data
    ) VALUES (
        p_session_id, p_user_id, p_csrf_token, p_ip_address, p_user_agent,
        p_expires_at, p_remember_me, JSON_OBJECT()
    );
    
    -- Letzten Login aktualisieren
    UPDATE users 
    SET last_login_at = NOW(), 
        last_login_ip = p_ip_address,
        failed_login_attempts = 0,
        locked_until = NULL
    WHERE id = p_user_id;
END //

-- Alte Sessions bereinigen
CREATE PROCEDURE CleanupExpiredSessions()
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    DELETE FROM password_reset_tokens WHERE expires_at < NOW();
    DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
    DELETE FROM rate_limits WHERE window_start < DATE_SUB(NOW(), INTERVAL 1 HOUR);
END //

DELIMITER ;

-- Event Scheduler für automatische Bereinigung
SET GLOBAL event_scheduler = ON;

CREATE EVENT cleanup_expired_data
ON SCHEDULE EVERY 1 HOUR
DO
  CALL CleanupExpiredSessions();

-- Trigger für Audit-Logging
DELIMITER //

CREATE TRIGGER users_audit_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO security_log (event_type, event_category, severity, message, ip_address, occurred_at)
    VALUES ('user_created', 'system', 'medium', 
            CONCAT('New user created: ', NEW.company_name), 
            COALESCE(@client_ip, '127.0.0.1'), NOW());
END //

CREATE TRIGGER users_audit_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.password_hash != NEW.password_hash THEN
        INSERT INTO security_log (user_id, event_type, event_category, severity, message, ip_address, occurred_at)
        VALUES (NEW.id, 'password_changed', 'authentication', 'high',
                'Password changed for user', 
                COALESCE(@client_ip, '127.0.0.1'), NOW());
    END IF;
    
    IF OLD.is_active != NEW.is_active THEN
        INSERT INTO security_log (user_id, event_type, event_category, severity, message, ip_address, occurred_at)
        VALUES (NEW.id, 'user_status_changed', 'authorization', 'medium',
                CONCAT('User status changed from ', OLD.is_active, ' to ', NEW.is_active),
                COALESCE(@client_ip, '127.0.0.1'), NOW());
    END IF;
END //

DELIMITER ;

-- Berechtigungen für QHSE-Benutzer
CREATE USER IF NOT EXISTS 'qhse_app'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON qhse_system.* TO 'qhse_app'@'localhost';
GRANT EXECUTE ON qhse_system.* TO 'qhse_app'@'localhost';
FLUSH PRIVILEGES;