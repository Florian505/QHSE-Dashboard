<?php
/**
 * QHSE Login System - Sichere PHP-Konfiguration
 * TÜV-konforme Backend-Implementierung
 * 
 * Sicherheitsfeatures:
 * - Sichere Datenbankverbindung
 * - Umgebungsvariablen
 * - Error Handling
 * - Session-Konfiguration
 */

// Sichere Session-Konfiguration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_strict_mode', 1);
ini_set('session.gc_maxlifetime', 3600); // 1 Stunde

// Error Reporting (Produktion: ausschalten)
if (getenv('ENVIRONMENT') === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', '/var/log/qhse/error.log');
}

// Timezone setzen
date_default_timezone_set('Europe/Berlin');

class QHSEConfig {
    private static $instance = null;
    private $config = [];
    
    private function __construct() {
        $this->loadConfiguration();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function loadConfiguration() {
        // Environment-Variablen laden
        $this->config = [
            // Datenbank-Konfiguration
            'database' => [
                'host' => getenv('DB_HOST') ?: 'localhost',
                'port' => getenv('DB_PORT') ?: '3306',
                'name' => getenv('DB_NAME') ?: 'qhse_system',
                'username' => getenv('DB_USERNAME') ?: 'qhse_user',
                'password' => getenv('DB_PASSWORD') ?: '',
                'charset' => 'utf8mb4',
                'options' => [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                ]
            ],
            
            // Sicherheits-Konfiguration
            'security' => [
                'password_min_length' => 8,
                'password_max_length' => 128,
                'max_login_attempts' => 5,
                'lockout_duration' => 900, // 15 Minuten
                'session_timeout' => 3600, // 1 Stunde
                'remember_me_duration' => 2592000, // 30 Tage
                'bcrypt_rounds' => 12,
                'csrf_token_length' => 32,
                'session_regenerate_interval' => 300 // 5 Minuten
            ],
            
            // Anwendungs-Konfiguration
            'app' => [
                'name' => 'QHSE Management System',
                'version' => '1.0.0',
                'environment' => getenv('ENVIRONMENT') ?: 'production',
                'base_url' => getenv('BASE_URL') ?: 'https://qhse.example.com',
                'timezone' => 'Europe/Berlin',
                'language' => 'de_DE',
                'maintenance_mode' => getenv('MAINTENANCE_MODE') === 'true'
            ],
            
            // Logging-Konfiguration
            'logging' => [
                'enabled' => true,
                'level' => getenv('LOG_LEVEL') ?: 'INFO',
                'file' => getenv('LOG_FILE') ?: '/var/log/qhse/application.log',
                'security_log' => '/var/log/qhse/security.log',
                'max_file_size' => '10MB',
                'rotation_days' => 30
            ],
            
            // Email-Konfiguration (für Benachrichtigungen)
            'email' => [
                'smtp_host' => getenv('SMTP_HOST') ?: 'localhost',
                'smtp_port' => getenv('SMTP_PORT') ?: 587,
                'smtp_username' => getenv('SMTP_USERNAME') ?: '',
                'smtp_password' => getenv('SMTP_PASSWORD') ?: '',
                'smtp_encryption' => getenv('SMTP_ENCRYPTION') ?: 'tls',
                'from_email' => getenv('FROM_EMAIL') ?: 'noreply@qhse.example.com',
                'from_name' => 'QHSE System'
            ],
            
            // Rate Limiting
            'rate_limiting' => [
                'enabled' => true,
                'requests_per_minute' => 60,
                'requests_per_hour' => 1000,
                'ban_duration' => 3600 // 1 Stunde
            ]
        ];
    }
    
    public function get($key, $default = null) {
        $keys = explode('.', $key);
        $value = $this->config;
        
        foreach ($keys as $k) {
            if (!isset($value[$k])) {
                return $default;
            }
            $value = $value[$k];
        }
        
        return $value;
    }
    
    public function getDatabaseDSN() {
        $db = $this->config['database'];
        return "mysql:host={$db['host']};port={$db['port']};dbname={$db['name']};charset={$db['charset']}";
    }
    
    public function isProduction() {
        return $this->config['app']['environment'] === 'production';
    }
    
    public function isMaintenanceMode() {
        return $this->config['app']['maintenance_mode'];
    }
}

// Globale Funktionen für einfachen Zugriff
function config($key, $default = null) {
    return QHSEConfig::getInstance()->get($key, $default);
}

// Sichere Header setzen
function setSecurityHeaders() {
    if (!headers_sent()) {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Content-Security-Policy: default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com; img-src \'self\' data:');
        
        if (config('app.environment') === 'production') {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
        }
    }
}

// Environment-Datei laden
function loadEnvironment($file = '.env') {
    if (!file_exists($file)) {
        return;
    }
    
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Environment laden
loadEnvironment(__DIR__ . '/../.env');

// Sicherheits-Headers setzen
setSecurityHeaders();

?>