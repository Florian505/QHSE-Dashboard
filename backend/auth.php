<?php
/**
 * QHSE Authentication System - Backend Implementation
 * TÜV-konforme Authentifizierung mit PHP
 * 
 * Sicherheitsfeatures:
 * - bcrypt Password Hashing
 * - Rate Limiting & Brute Force Protection
 * - Secure Session Management
 * - CSRF Protection
 * - Input Validation & Sanitization
 */

require_once 'config.php';

class QHSEAuth {
    private $db;
    private $config;
    private $logger;
    
    public function __construct() {
        $this->config = QHSEConfig::getInstance();
        $this->initDatabase();
        $this->initSession();
        $this->logger = new SecurityLogger();
    }
    
    /**
     * Sichere Datenbankverbindung initialisieren
     */
    private function initDatabase() {
        try {
            $dsn = $this->config->getDatabaseDSN();
            $username = $this->config->get('database.username');
            $password = $this->config->get('database.password');
            $options = $this->config->get('database.options');
            
            $this->db = new PDO($dsn, $username, $password, $options);
            
        } catch (PDOException $e) {
            $this->logger->logError('Database connection failed', [
                'error' => $e->getMessage()
            ]);
            throw new Exception('Database connection failed');
        }
    }
    
    /**
     * Sichere Session initialisieren
     */
    private function initSession() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Session-Sicherheit
        if (!isset($_SESSION['initiated'])) {
            session_regenerate_id(true);
            $_SESSION['initiated'] = true;
            $_SESSION['created_at'] = time();
            $_SESSION['csrf_token'] = $this->generateSecureToken(32);
        }
        
        // Session-Timeout prüfen
        $timeout = $this->config->get('security.session_timeout');
        if (isset($_SESSION['last_activity']) && 
            (time() - $_SESSION['last_activity']) > $timeout) {
            $this->destroySession();
        }
        
        $_SESSION['last_activity'] = time();
        
        // Session-Regeneration
        $regenerateInterval = $this->config->get('security.session_regenerate_interval');
        if (isset($_SESSION['last_regeneration']) &&
            (time() - $_SESSION['last_regeneration']) > $regenerateInterval) {
            session_regenerate_id(true);
            $_SESSION['last_regeneration'] = time();
        }
    }
    
    /**
     * Sicheres Token generieren
     */
    private function generateSecureToken($length = 32) {
        return bin2hex(random_bytes($length));
    }
    
    /**
     * Input sanitization
     */
    private function sanitizeInput($input) {
        if (!is_string($input)) {
            return '';
        }
        
        return htmlspecialchars(trim($input), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    
    /**
     * Input-Validierung
     */
    private function validateInput($companyName, $password) {
        $errors = [];
        
        // Firmenname-Validierung
        if (empty($companyName)) {
            $errors['companyName'] = 'Firmenname ist erforderlich';
        } elseif (strlen($companyName) < 2) {
            $errors['companyName'] = 'Firmenname muss mindestens 2 Zeichen lang sein';
        } elseif (strlen($companyName) > 100) {
            $errors['companyName'] = 'Firmenname darf maximal 100 Zeichen lang sein';
        } elseif (!preg_match('/^[a-zA-ZÄÖÜäöüß0-9\s\-&.]+$/', $companyName)) {
            $errors['companyName'] = 'Firmenname enthält ungültige Zeichen';
        }
        
        // Passwort-Validierung
        if (empty($password)) {
            $errors['password'] = 'Passwort ist erforderlich';
        } elseif (strlen($password) < $this->config->get('security.password_min_length')) {
            $errors['password'] = 'Passwort ist zu kurz';
        } elseif (strlen($password) > $this->config->get('security.password_max_length')) {
            $errors['password'] = 'Passwort ist zu lang';
        }
        
        return [
            'isValid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Rate Limiting prüfen
     */
    private function checkRateLimit($identifier, $endpoint = 'login') {
        $stmt = $this->db->prepare("
            SELECT requests_count, window_start, blocked_until 
            FROM rate_limits 
            WHERE identifier = ? AND endpoint = ?
        ");
        $stmt->execute([$identifier, $endpoint]);
        $limit = $stmt->fetch();
        
        $maxRequests = $this->config->get('rate_limiting.requests_per_minute');
        $windowDuration = 60; // 1 Minute
        
        if (!$limit) {
            // Ersten Eintrag erstellen
            $stmt = $this->db->prepare("
                INSERT INTO rate_limits (identifier, endpoint, requests_count, window_start) 
                VALUES (?, ?, 1, NOW())
            ");
            $stmt->execute([$identifier, $endpoint]);
            return ['allowed' => true];
        }
        
        // Prüfen ob gesperrt
        if ($limit['blocked_until'] && strtotime($limit['blocked_until']) > time()) {
            return [
                'allowed' => false,
                'reason' => 'Rate limit exceeded',
                'retry_after' => strtotime($limit['blocked_until']) - time()
            ];
        }
        
        // Prüfen ob Window abgelaufen
        if (strtotime($limit['window_start']) + $windowDuration < time()) {
            // Neues Window starten
            $stmt = $this->db->prepare("
                UPDATE rate_limits 
                SET requests_count = 1, window_start = NOW(), blocked_until = NULL 
                WHERE identifier = ? AND endpoint = ?
            ");
            $stmt->execute([$identifier, $endpoint]);
            return ['allowed' => true];
        }
        
        // Anfragen-Anzahl erhöhen
        $newCount = $limit['requests_count'] + 1;
        
        if ($newCount > $maxRequests) {
            // Sperren
            $banDuration = $this->config->get('rate_limiting.ban_duration');
            $stmt = $this->db->prepare("
                UPDATE rate_limits 
                SET requests_count = ?, blocked_until = DATE_ADD(NOW(), INTERVAL ? SECOND)
                WHERE identifier = ? AND endpoint = ?
            ");
            $stmt->execute([$newCount, $banDuration, $identifier, $endpoint]);
            
            return [
                'allowed' => false,
                'reason' => 'Rate limit exceeded',
                'retry_after' => $banDuration
            ];
        }
        
        // Anzahl aktualisieren
        $stmt = $this->db->prepare("
            UPDATE rate_limits 
            SET requests_count = ? 
            WHERE identifier = ? AND endpoint = ?
        ");
        $stmt->execute([$newCount, $identifier, $endpoint]);
        
        return ['allowed' => true];
    }
    
    /**
     * Brute-Force-Schutz prüfen
     */
    private function checkBruteForce($companyName) {
        $stmt = $this->db->prepare("
            SELECT failed_login_attempts, locked_until 
            FROM users 
            WHERE company_name = ?
        ");
        $stmt->execute([$companyName]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return ['allowed' => true];
        }
        
        // Prüfen ob gesperrt
        if ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
            return [
                'allowed' => false,
                'reason' => 'Account temporarily locked',
                'retry_after' => strtotime($user['locked_until']) - time()
            ];
        }
        
        $maxAttempts = $this->config->get('security.max_login_attempts');
        if ($user['failed_login_attempts'] >= $maxAttempts) {
            // Account sperren
            $lockoutDuration = $this->config->get('security.lockout_duration');
            $stmt = $this->db->prepare("
                UPDATE users 
                SET locked_until = DATE_ADD(NOW(), INTERVAL ? SECOND) 
                WHERE company_name = ?
            ");
            $stmt->execute([$lockoutDuration, $companyName]);
            
            return [
                'allowed' => false,
                'reason' => 'Too many failed attempts',
                'retry_after' => $lockoutDuration
            ];
        }
        
        return ['allowed' => true];
    }
    
    /**
     * Login-Versuch protokollieren
     */
    private function recordLoginAttempt($companyName, $success = false, $reason = null) {
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        // Login-Versuch in Tabelle protokollieren
        $stmt = $this->db->prepare("
            INSERT INTO login_attempts (identifier, ip_address, user_agent, success, failure_reason)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$companyName, $ipAddress, $userAgent, $success, $reason]);
        
        if (!$success) {
            // Fehlgeschlagene Versuche erhöhen
            $stmt = $this->db->prepare("
                UPDATE users 
                SET failed_login_attempts = failed_login_attempts + 1 
                WHERE company_name = ?
            ");
            $stmt->execute([$companyName]);
        } else {
            // Versuche zurücksetzen bei Erfolg
            $stmt = $this->db->prepare("
                UPDATE users 
                SET failed_login_attempts = 0, locked_until = NULL 
                WHERE company_name = ?
            ");
            $stmt->execute([$companyName]);
        }
    }
    
    /**
     * Benutzer authentifizieren
     */
    public function authenticate($companyName, $password, $rememberMe = false) {
        try {
            // Input-Validierung
            $companyName = $this->sanitizeInput($companyName);
            $validation = $this->validateInput($companyName, $password);
            
            if (!$validation['isValid']) {
                return [
                    'success' => false,
                    'errors' => $validation['errors']
                ];
            }
            
            // Rate Limiting prüfen
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            $rateLimit = $this->checkRateLimit($ipAddress, 'login');
            
            if (!$rateLimit['allowed']) {
                $this->logger->logSecurityEvent('rate_limit_exceeded', 'authentication', 'medium', [
                    'ip_address' => $ipAddress,
                    'identifier' => $companyName
                ]);
                
                return [
                    'success' => false,
                    'reason' => 'Zu viele Anfragen',
                    'retry_after' => $rateLimit['retry_after']
                ];
            }
            
            // Brute-Force-Schutz prüfen
            $bruteForce = $this->checkBruteForce($companyName);
            
            if (!$bruteForce['allowed']) {
                $this->logger->logSecurityEvent('brute_force_blocked', 'authentication', 'high', [
                    'company_name' => $companyName,
                    'ip_address' => $ipAddress
                ]);
                
                return [
                    'success' => false,
                    'reason' => $bruteForce['reason'],
                    'retry_after' => $bruteForce['retry_after']
                ];
            }
            
            // Benutzer abrufen
            $stmt = $this->db->prepare("
                SELECT id, company_name, password_hash, role, permissions, is_active, is_verified
                FROM users 
                WHERE company_name = ?
            ");
            $stmt->execute([$companyName]);
            $user = $stmt->fetch();
            
            if (!$user || !$user['is_active']) {
                $this->recordLoginAttempt($companyName, false, 'user_not_found');
                $this->logger->logSecurityEvent('login_failed', 'authentication', 'medium', [
                    'company_name' => $companyName,
                    'reason' => 'user_not_found'
                ]);
                
                return [
                    'success' => false,
                    'reason' => 'Ungültige Anmeldedaten'
                ];
            }
            
            // Passwort-Verifikation
            if (!password_verify($password, $user['password_hash'])) {
                $this->recordLoginAttempt($companyName, false, 'invalid_password');
                $this->logger->logSecurityEvent('login_failed', 'authentication', 'medium', [
                    'company_name' => $companyName,
                    'user_id' => $user['id'],
                    'reason' => 'invalid_password'
                ]);
                
                return [
                    'success' => false,
                    'reason' => 'Ungültige Anmeldedaten'
                ];
            }
            
            // Erfolgreiche Authentifizierung
            $this->recordLoginAttempt($companyName, true);
            
            // Session erstellen
            $sessionData = $this->createSession($user, $rememberMe);
            
            $this->logger->logSecurityEvent('login_successful', 'authentication', 'low', [
                'company_name' => $companyName,
                'user_id' => $user['id'],
                'session_id' => $sessionData['session_id']
            ]);
            
            return [
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'company_name' => $user['company_name'],
                    'role' => $user['role'],
                    'permissions' => json_decode($user['permissions'], true)
                ],
                'session' => $sessionData
            ];
            
        } catch (Exception $e) {
            $this->logger->logError('Authentication system error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'reason' => 'Systemfehler bei der Authentifizierung'
            ];
        }
    }
    
    /**
     * Sichere Session erstellen
     */
    private function createSession($user, $rememberMe = false) {
        $sessionId = $this->generateSecureToken(32);
        $csrfToken = $this->generateSecureToken(32);
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        $duration = $rememberMe ? 
            $this->config->get('security.remember_me_duration') : 
            $this->config->get('security.session_timeout');
            
        $expiresAt = date('Y-m-d H:i:s', time() + $duration);
        
        // Session in Datenbank speichern
        $stmt = $this->db->prepare("
            INSERT INTO user_sessions (
                id, user_id, csrf_token, ip_address, user_agent, 
                expires_at, remember_me, session_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $sessionData = json_encode([
            'created_at' => time(),
            'user_role' => $user['role'],
            'permissions' => json_decode($user['permissions'], true)
        ]);
        
        $stmt->execute([
            $sessionId, $user['id'], $csrfToken, $ipAddress, 
            $userAgent, $expiresAt, $rememberMe, $sessionData
        ]);
        
        // PHP-Session aktualisieren
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['session_id'] = $sessionId;
        $_SESSION['csrf_token'] = $csrfToken;
        $_SESSION['company_name'] = $user['company_name'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['permissions'] = json_decode($user['permissions'], true);
        
        // Secure Cookie setzen
        $cookieOptions = [
            'expires' => time() + $duration,
            'path' => '/',
            'domain' => '',
            'secure' => isset($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Strict'
        ];
        
        setcookie('qhse_session', $sessionId, $cookieOptions);
        
        return [
            'session_id' => $sessionId,
            'csrf_token' => $csrfToken,
            'expires_at' => $expiresAt
        ];
    }
    
    /**
     * Session validieren
     */
    public function validateSession($sessionId = null) {
        if (!$sessionId) {
            $sessionId = $_COOKIE['qhse_session'] ?? $_SESSION['session_id'] ?? null;
        }
        
        if (!$sessionId) {
            return ['valid' => false, 'reason' => 'No session ID'];
        }
        
        $stmt = $this->db->prepare("
            SELECT s.*, u.company_name, u.role, u.permissions, u.is_active
            FROM user_sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$sessionId]);
        $session = $stmt->fetch();
        
        if (!$session) {
            return ['valid' => false, 'reason' => 'Session not found or expired'];
        }
        
        // Session-Aktivität aktualisieren
        $stmt = $this->db->prepare("
            UPDATE user_sessions 
            SET last_activity_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$sessionId]);
        
        return [
            'valid' => true,
            'session' => [
                'id' => $session['id'],
                'user_id' => $session['user_id'],
                'company_name' => $session['company_name'],
                'role' => $session['role'],
                'permissions' => json_decode($session['permissions'], true),
                'csrf_token' => $session['csrf_token']
            ]
        ];
    }
    
    /**
     * Session zerstören
     */
    public function destroySession($sessionId = null) {
        if (!$sessionId) {
            $sessionId = $_SESSION['session_id'] ?? null;
        }
        
        if ($sessionId) {
            $stmt = $this->db->prepare("DELETE FROM user_sessions WHERE id = ?");
            $stmt->execute([$sessionId]);
        }
        
        // PHP-Session leeren
        session_unset();
        session_destroy();
        
        // Cookie löschen
        setcookie('qhse_session', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Strict'
        ]);
        
        $this->logger->logSecurityEvent('logout', 'authentication', 'low', [
            'session_id' => $sessionId
        ]);
    }
    
    /**
     * CSRF-Token validieren
     */
    public function validateCSRFToken($token) {
        return hash_equals($_SESSION['csrf_token'] ?? '', $token);
    }
}

/**
 * Security Logger für TÜV-Compliance
 */
class SecurityLogger {
    private $db;
    
    public function __construct() {
        $config = QHSEConfig::getInstance();
        $dsn = $config->getDatabaseDSN();
        $username = $config->get('database.username');
        $password = $config->get('database.password');
        $options = $config->get('database.options');
        
        $this->db = new PDO($dsn, $username, $password, $options);
    }
    
    public function logSecurityEvent($eventType, $category, $severity, $details = []) {
        $message = $this->formatMessage($eventType, $details);
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $requestUri = $_SERVER['REQUEST_URI'] ?? '';
        $requestMethod = $_SERVER['REQUEST_METHOD'] ?? '';
        
        $stmt = $this->db->prepare("
            INSERT INTO security_log (
                user_id, event_type, event_category, severity, message, details,
                ip_address, user_agent, request_uri, request_method
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $_SESSION['user_id'] ?? null,
            $eventType,
            $category,
            $severity,
            $message,
            json_encode($details),
            $ipAddress,
            $userAgent,
            $requestUri,
            $requestMethod
        ]);
    }
    
    public function logError($message, $details = []) {
        $this->logSecurityEvent('system_error', 'error', 'high', array_merge([
            'message' => $message
        ], $details));
    }
    
    private function formatMessage($eventType, $details) {
        $messages = [
            'login_successful' => 'User successfully logged in',
            'login_failed' => 'Login attempt failed',
            'logout' => 'User logged out',
            'rate_limit_exceeded' => 'Rate limit exceeded',
            'brute_force_blocked' => 'Brute force attack blocked',
            'system_error' => 'System error occurred'
        ];
        
        return $messages[$eventType] ?? $eventType;
    }
}

?>