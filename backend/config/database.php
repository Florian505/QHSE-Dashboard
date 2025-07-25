<?php
/**
 * QHSE Meldemodul - Datenbank Konfiguration
 * 
 * @author QHSE System
 * @version 1.0
 * @date 2025-01-24
 * 
 * SICHERHEITSHINWEIS: Diese Datei sollte außerhalb des Web-Roots gespeichert werden!
 */

// Verhindere direkten Zugriff
if (!defined('QHSE_SYSTEM')) {
    die('Direkter Zugriff nicht erlaubt');
}

/**
 * Datenbank-Konfiguration
 */
class DatabaseConfig {
    
    // Produktions-Einstellungen (für Live-Server)
    const PROD_HOST = 'localhost';
    const PROD_DATABASE = 'qhse_meldemodul';
    const PROD_USERNAME = 'qhse_app';
    const PROD_PASSWORD = 'your_secure_password_here'; // ÄNDERN SIE DIES!
    const PROD_CHARSET = 'utf8mb4';
    const PROD_PORT = 3306;
    
    // Entwicklungs-Einstellungen (für Entwicklung/Test)
    const DEV_HOST = 'localhost';
    const DEV_DATABASE = 'qhse_meldemodul';
    const DEV_USERNAME = 'root';
    const DEV_PASSWORD = '';
    const DEV_CHARSET = 'utf8mb4';
    const DEV_PORT = 3306;
    
    // Aktuelle Umgebung ('development' oder 'production')
    const ENVIRONMENT = 'development'; // ÄNDERN SIE DIES FÜR PRODUKTION!
    
    /**
     * Gibt die Datenbank-Konfiguration basierend auf der Umgebung zurück
     *
     * @return array Datenbank-Konfiguration
     */
    public static function getConfig(): array {
        if (self::ENVIRONMENT === 'production') {
            return [
                'host' => self::PROD_HOST,
                'database' => self::PROD_DATABASE,
                'username' => self::PROD_USERNAME,
                'password' => self::PROD_PASSWORD,
                'charset' => self::PROD_CHARSET,
                'port' => self::PROD_PORT,
                'options' => [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
                    PDO::ATTR_TIMEOUT => 30,
                    PDO::ATTR_PERSISTENT => false
                ]
            ];
        } else {
            return [
                'host' => self::DEV_HOST,
                'database' => self::DEV_DATABASE,
                'username' => self::DEV_USERNAME,
                'password' => self::DEV_PASSWORD,
                'charset' => self::DEV_CHARSET,
                'port' => self::DEV_PORT,
                'options' => [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
                    PDO::ATTR_TIMEOUT => 30,
                    PDO::ATTR_PERSISTENT => false
                ]
            ];
        }
    }
    
    /**
     * Erstellt eine PDO-Verbindung zur Datenbank
     *
     * @return PDO Datenbankverbindung
     * @throws PDOException Bei Verbindungsfehlern
     */
    public static function getConnection(): PDO {
        $config = self::getConfig();
        
        $dsn = sprintf(
            "mysql:host=%s;port=%d;dbname=%s;charset=%s",
            $config['host'],
            $config['port'],
            $config['database'],
            $config['charset']
        );
        
        try {
            $pdo = new PDO($dsn, $config['username'], $config['password'], $config['options']);
            
            // Sichere SQL-Modi setzen
            $pdo->exec("SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'");
            
            return $pdo;
            
        } catch (PDOException $e) {
            // In Produktion: Fehler nicht preisgeben
            if (self::ENVIRONMENT === 'production') {
                error_log("Database connection failed: " . $e->getMessage());
                throw new PDOException("Datenbankverbindung fehlgeschlagen");
            } else {
                throw $e;
            }
        }
    }
    
    /**
     * Testet die Datenbankverbindung
     *
     * @return bool True wenn Verbindung erfolgreich
     */
    public static function testConnection(): bool {
        try {
            $pdo = self::getConnection();
            $stmt = $pdo->query("SELECT 1");
            return $stmt !== false;
        } catch (Exception $e) {
            return false;
        }
    }
}

/**
 * Anwendungs-Konfiguration
 */
class AppConfig {
    
    // Upload-Einstellungen
    const MAX_FILE_SIZE = 10485760; // 10MB in Bytes
    const ALLOWED_FILE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
    const MAX_FILES_PER_REPORT = 10;
    const UPLOAD_DIR = __DIR__ . '/../../uploads/'; // Außerhalb des Web-Roots!
    
    // Session-Einstellungen
    const SESSION_LIFETIME = 3600; // 1 Stunde in Sekunden
    const SESSION_NAME = 'QHSE_SESS';
    const SESSION_COOKIE_SECURE = true; // Nur über HTTPS (in Produktion)
    const SESSION_COOKIE_HTTPONLY = true;
    const SESSION_COOKIE_SAMESITE = 'Strict';
    
    // Sicherheits-Einstellungen
    const CSRF_TOKEN_LENGTH = 32;
    const PASSWORD_MIN_LENGTH = 8;
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCKOUT_TIME = 900; // 15 Minuten
    
    // E-Mail-Einstellungen
    const SMTP_HOST = 'smtp.hoffmann-voss.de';
    const SMTP_PORT = 587;
    const SMTP_USERNAME = 'qhse@hoffmann-voss.de';
    const SMTP_PASSWORD = 'your_email_password'; // ÄNDERN SIE DIES!
    const FROM_EMAIL = 'qhse@hoffmann-voss.de';
    const FROM_NAME = 'QHSE System';
    
    // Logging
    const LOG_DIR = __DIR__ . '/../../logs/';
    const LOG_LEVEL = 'INFO'; // DEBUG, INFO, WARNING, ERROR
    const LOG_MAX_SIZE = 10485760; // 10MB
    
    /**
     * Erstellt notwendige Verzeichnisse
     */
    public static function createDirectories(): void {
        $dirs = [
            self::UPLOAD_DIR,
            self::LOG_DIR,
            self::UPLOAD_DIR . 'incidents/',
            self::UPLOAD_DIR . 'temp/',
            self::UPLOAD_DIR . 'thumbnails/'
        ];
        
        foreach ($dirs as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0750, true);
                
                // .htaccess für Upload-Schutz
                if (strpos($dir, 'uploads') !== false) {
                    file_put_contents($dir . '.htaccess', "Order Deny,Allow\nDeny from all");
                }
            }
        }
    }
    
    /**
     * Validiert die Konfiguration
     *
     * @return array Array mit Validierungsresultaten
     */
    public static function validateConfig(): array {
        $results = [];
        
        // PHP-Version prüfen
        $results['php_version'] = version_compare(PHP_VERSION, '7.4.0') >= 0;
        
        // Erforderliche Extensions prüfen
        $required_extensions = ['pdo', 'pdo_mysql', 'gd', 'fileinfo', 'mbstring', 'openssl'];
        foreach ($required_extensions as $ext) {
            $results["ext_{$ext}"] = extension_loaded($ext);
        }
        
        // Verzeichnisse prüfen
        $results['upload_dir_writable'] = is_writable(dirname(self::UPLOAD_DIR));
        $results['log_dir_writable'] = is_writable(dirname(self::LOG_DIR));
        
        // Datenbankverbindung prüfen
        $results['database_connection'] = DatabaseConfig::testConnection();
        
        return $results;
    }
}

/**
 * Sicherheits-Hilfsfunktionen
 */
class SecurityConfig {
    
    /**
     * Generiert einen sicheren CSRF-Token
     *
     * @return string CSRF-Token
     */
    public static function generateCSRFToken(): string {
        return bin2hex(random_bytes(AppConfig::CSRF_TOKEN_LENGTH));
    }
    
    /**
     * Validiert einen CSRF-Token
     *
     * @param string $token Zu validierender Token
     * @return bool True wenn Token gültig
     */
    public static function validateCSRFToken(string $token): bool {
        return isset($_SESSION['csrf_token']) && 
               hash_equals($_SESSION['csrf_token'], $token);
    }
    
    /**
     * Hasht ein Passwort sicher
     *
     * @param string $password Klartextpasswort
     * @return string Gehashtes Passwort
     */
    public static function hashPassword(string $password): string {
        return password_hash($password, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536, // 64 MB
            'time_cost' => 4,       // 4 Iterationen
            'threads' => 3,         // 3 Threads
        ]);
    }
    
    /**
     * Verifiziert ein Passwort
     *
     * @param string $password Klartextpasswort
     * @param string $hash Gehashtes Passwort
     * @return bool True wenn Passwort korrekt
     */
    public static function verifyPassword(string $password, string $hash): bool {
        return password_verify($password, $hash);
    }
    
    /**
     * Sanitiert Eingabedaten
     *
     * @param mixed $data Zu sanitisierende Daten
     * @return mixed Sanitisierte Daten
     */
    public static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeInput'], $data);
        }
        
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Validiert eine E-Mail-Adresse
     *
     * @param string $email E-Mail-Adresse
     * @return bool True wenn gültig
     */
    public static function validateEmail(string $email): bool {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Erstellt eine sichere Session
     */
    public static function startSecureSession(): void {
        // Session-Konfiguration
        ini_set('session.cookie_httponly', AppConfig::SESSION_COOKIE_HTTPONLY);
        ini_set('session.cookie_secure', AppConfig::SESSION_COOKIE_SECURE);
        ini_set('session.cookie_samesite', AppConfig::SESSION_COOKIE_SAMESITE);
        ini_set('session.use_strict_mode', 1);
        ini_set('session.gc_maxlifetime', AppConfig::SESSION_LIFETIME);
        
        session_name(AppConfig::SESSION_NAME);
        
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Session-Sicherheit
        if (!isset($_SESSION['created'])) {
            $_SESSION['created'] = time();
        } else if (time() - $_SESSION['created'] > AppConfig::SESSION_LIFETIME) {
            session_regenerate_id(true);
            $_SESSION['created'] = time();
        }
    }
}

// Konstante für Systemzugriff definieren
define('QHSE_SYSTEM', true);

// Verzeichnisse beim ersten Laden erstellen
AppConfig::createDirectories();
?>