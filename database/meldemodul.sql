-- ============================================================================
-- QHSE Meldemodul - Datenbankstruktur
-- ============================================================================
-- Erstellt: 2025-01-24
-- Beschreibung: Vollständige Datenbankstruktur für das QHSE-Meldemodul
-- ============================================================================

-- Datenbank erstellen (falls noch nicht vorhanden)
CREATE DATABASE IF NOT EXISTS qhse_meldemodul 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE qhse_meldemodul;

-- ============================================================================
-- Tabelle: users (Benutzerverwaltung)
-- ============================================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- ============================================================================
-- Tabelle: incident_reports (Meldungen)
-- ============================================================================
CREATE TABLE incident_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_type ENUM('unfall', 'beinaheunfall') NOT NULL,
    incident_date DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    involved_persons TEXT,
    severity ENUM('niedrig', 'mittel', 'hoch', 'kritisch') DEFAULT 'niedrig',
    immediate_actions TEXT,
    reported_by INT NOT NULL,
    assigned_to INT NULL,
    status ENUM('offen', 'in_bearbeitung', 'abgeschlossen', 'archiviert') DEFAULT 'offen',
    priority ENUM('niedrig', 'normal', 'hoch', 'dringend') DEFAULT 'normal',
    investigation_notes TEXT,
    corrective_actions TEXT,
    preventive_actions TEXT,
    completion_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_report_type (report_type),
    INDEX idx_incident_date (incident_date),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_reported_by (reported_by),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- Tabelle: incident_files (Hochgeladene Dateien)
-- ============================================================================
CREATE TABLE incident_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_id INT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by INT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by INT NULL,
    
    FOREIGN KEY (incident_id) REFERENCES incident_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_incident_id (incident_id),
    INDEX idx_file_type (file_type),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_is_deleted (is_deleted),
    INDEX idx_upload_date (upload_date)
) ENGINE=InnoDB;

-- ============================================================================
-- Tabelle: incident_comments (Kommentare und Notizen)
-- ============================================================================
CREATE TABLE incident_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    incident_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    comment_type ENUM('kommentar', 'status_update', 'system') DEFAULT 'kommentar',
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (incident_id) REFERENCES incident_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_incident_id (incident_id),
    INDEX idx_user_id (user_id),
    INDEX idx_comment_type (comment_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- Tabelle: sessions (Session-Verwaltung)
-- ============================================================================
CREATE TABLE sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_active (is_active),
    INDEX idx_last_activity (last_activity)
) ENGINE=InnoDB;

-- ============================================================================
-- Tabelle: audit_log (Audit-Trail)
-- ============================================================================
CREATE TABLE audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_record_id (record_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================================
-- Tabelle: system_settings (Systemkonfiguration)
-- ============================================================================
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_editable BOOLEAN DEFAULT TRUE,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_editable (is_editable)
) ENGINE=InnoDB;

-- ============================================================================
-- Standard-Benutzer erstellen
-- ============================================================================
-- Admin-Benutzer (Passwort: admin123 - MUSS in Produktion geändert werden!)
INSERT INTO users (username, email, password_hash, full_name, role, department) VALUES
('admin', 'admin@hoffmann-voss.de', '$2y$12$LQv3c1yqBwkXYoEYGZzJxOq8QrW8iqDVhQoGjD3FVZG8KLN9.4qXC', 'System Administrator', 'admin', 'IT'),
('qhse_manager', 'qhse@hoffmann-voss.de', '$2y$12$LQv3c1yqBwkXYoEYGZzJxOq8QrW8iqDVhQoGjD3FVZG8KLN9.4qXC', 'QHSE Manager', 'admin', 'QHSE'),
('testuser', 'test@hoffmann-voss.de', '$2y$12$LQv3c1yqBwkXYoEYGZzJxOq8QrW8iqDVhQoGjD3FVZG8KLN9.4qXC', 'Test Benutzer', 'user', 'Produktion');

-- ============================================================================
-- Systemeinstellungen
-- ============================================================================
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_editable) VALUES
('max_file_size', '10485760', 'integer', 'Maximale Dateigröße in Bytes (10MB)', TRUE),
('allowed_file_types', '["jpg","jpeg","png","gif","pdf","doc","docx","xls","xlsx","txt"]', 'json', 'Erlaubte Dateitypen', TRUE),
('max_files_per_report', '10', 'integer', 'Maximale Anzahl Dateien pro Meldung', TRUE),
('email_notifications', 'true', 'boolean', 'E-Mail-Benachrichtigungen aktiviert', TRUE),
('admin_email', 'admin@hoffmann-voss.de', 'string', 'Administrator E-Mail-Adresse', TRUE),
('company_name', 'Hoffmann & Voss GmbH', 'string', 'Firmenname', TRUE),
('session_lifetime', '3600', 'integer', 'Session-Lebensdauer in Sekunden', TRUE),
('auto_assign_incidents', 'false', 'boolean', 'Automatische Zuweisung von Meldungen', TRUE),
('require_approval', 'false', 'boolean', 'Genehmigung für Meldungen erforderlich', TRUE),
('backup_retention_days', '90', 'integer', 'Backup-Aufbewahrung in Tagen', TRUE);

-- ============================================================================
-- Test-Meldungen erstellen
-- ============================================================================
INSERT INTO incident_reports (report_type, incident_date, location, description, involved_persons, severity, reported_by, status) VALUES
('unfall', '2025-01-20 14:30:00', 'Produktionshalle A, Arbeitsplatz 15', 'Mitarbeiter ist beim Transport von Materialien gestürzt und hat sich am Knie verletzt. Sofortige Erste Hilfe wurde geleistet.', 'Max Mustermann (Verletzte Person), Anna Schmidt (Erste Hilfe)', 'mittel', 3, 'in_bearbeitung'),

('beinaheunfall', '2025-01-22 09:15:00', 'Lager B, Gang 7', 'Palette war instabil gestapelt und drohte umzufallen. Rechtzeitig bemerkt und gesichert. Keine Verletzungen.', 'Peter Weber (Entdecker)', 'niedrig', 3, 'offen'),

('unfall', '2025-01-18 16:45:00', 'Bürogebäude, 2. Stock, Küche', 'Heißes Wasser aus Kaffeemaschine auf Hand verschüttet. Leichte Verbrennung ersten Grades.', 'Lisa Müller (Verletzte Person)', 'niedrig', 3, 'abgeschlossen');

-- ============================================================================
-- Test-Kommentare
-- ============================================================================
INSERT INTO incident_comments (incident_id, user_id, comment, comment_type) VALUES
(1, 2, 'Meldung erhalten und Untersuchung eingeleitet. Arbeitsplatz wird überprüft.', 'status_update'),
(1, 2, 'Erste Hilfe Maßnahmen waren korrekt. Mitarbeiter wurde ins Krankenhaus gebracht.', 'kommentar'),
(2, 2, 'Lagerbereich wird heute noch inspiziert. Schulung für sicheres Stapeln geplant.', 'status_update'),
(3, 2, 'Kaffeemaschine wurde überprüft und als sicher eingestuft. Unfall durch Unachtsamkeit.', 'kommentar');

-- ============================================================================
-- Views für Reporting
-- ============================================================================

-- View: Vollständige Meldungsübersicht
CREATE VIEW v_incident_overview AS
SELECT 
    ir.id,
    ir.report_type,
    ir.incident_date,
    ir.location,
    ir.description,
    ir.severity,
    ir.status,
    ir.priority,
    u_reported.full_name AS reported_by_name,
    u_assigned.full_name AS assigned_to_name,
    ir.created_at,
    ir.updated_at,
    COUNT(if_files.id) AS file_count,
    COUNT(ic_comments.id) AS comment_count
FROM incident_reports ir
LEFT JOIN users u_reported ON ir.reported_by = u_reported.id
LEFT JOIN users u_assigned ON ir.assigned_to = u_assigned.id
LEFT JOIN incident_files if_files ON ir.id = if_files.incident_id AND if_files.is_deleted = FALSE
LEFT JOIN incident_comments ic_comments ON ir.id = ic_comments.incident_id
GROUP BY ir.id;

-- View: Aktuelle offene Meldungen
CREATE VIEW v_open_incidents AS
SELECT * FROM v_incident_overview 
WHERE status IN ('offen', 'in_bearbeitung')
ORDER BY priority DESC, incident_date DESC;

-- View: Statistiken nach Monat
CREATE VIEW v_monthly_stats AS
SELECT 
    YEAR(incident_date) AS jahr,
    MONTH(incident_date) AS monat,
    report_type,
    COUNT(*) AS anzahl_meldungen,
    COUNT(CASE WHEN severity = 'kritisch' THEN 1 END) AS kritische_meldungen,
    COUNT(CASE WHEN severity = 'hoch' THEN 1 END) AS hohe_meldungen,
    COUNT(CASE WHEN status = 'abgeschlossen' THEN 1 END) AS abgeschlossene_meldungen
FROM incident_reports 
GROUP BY YEAR(incident_date), MONTH(incident_date), report_type
ORDER BY jahr DESC, monat DESC;

-- ============================================================================
-- Trigger für Audit-Log
-- ============================================================================

DELIMITER //

-- Trigger für INSERT auf incident_reports
CREATE TRIGGER tr_incident_reports_insert 
AFTER INSERT ON incident_reports
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, action, table_name, record_id, new_values, ip_address)
    VALUES (NEW.reported_by, 'INSERT', 'incident_reports', NEW.id, 
            JSON_OBJECT('report_type', NEW.report_type, 'location', NEW.location, 'status', NEW.status),
            @user_ip);
END //

-- Trigger für UPDATE auf incident_reports
CREATE TRIGGER tr_incident_reports_update 
AFTER UPDATE ON incident_reports
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values, ip_address)
    VALUES (@current_user_id, 'UPDATE', 'incident_reports', NEW.id,
            JSON_OBJECT('status', OLD.status, 'assigned_to', OLD.assigned_to),
            JSON_OBJECT('status', NEW.status, 'assigned_to', NEW.assigned_to),
            @user_ip);
END //

DELIMITER ;

-- ============================================================================
-- Berechtigungen und Sicherheit
-- ============================================================================

-- Benutzer für die Anwendung erstellen (in Produktion verwenden)
-- CREATE USER 'qhse_app'@'localhost' IDENTIFIED BY 'your_secure_password_here';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON qhse_meldemodul.* TO 'qhse_app'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================================================
-- Wartungsroutinen
-- ============================================================================

-- Alte Sessions löschen (täglich ausführen)
-- DELETE FROM sessions WHERE expires_at < NOW() OR last_activity < DATE_SUB(NOW(), INTERVAL 1 DAY);

-- Alte Audit-Logs archivieren (monatlich ausführen)
-- DELETE FROM audit_log WHERE created_at < DATE_SUB(NOW(), INTERVAL 12 MONTH);

-- ============================================================================
-- Indizes für Performance
-- ============================================================================

-- Zusammengesetzte Indizes für häufige Queries
CREATE INDEX idx_incident_status_date ON incident_reports(status, incident_date);
CREATE INDEX idx_incident_type_severity ON incident_reports(report_type, severity);
CREATE INDEX idx_files_incident_type ON incident_files(incident_id, file_type);

-- ============================================================================
-- Ende der Datenbankstruktur
-- ============================================================================