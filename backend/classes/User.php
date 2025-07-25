<?php
/**
 * QHSE Meldemodul - Benutzerverwaltung
 * 
 * @author QHSE System
 * @version 1.0
 * @date 2025-01-24
 */

// Verhindere direkten Zugriff
if (!defined('QHSE_SYSTEM')) {
    die('Direkter Zugriff nicht erlaubt');
}

require_once __DIR__ . '/Database.php';

/**
 * Benutzerverwaltungsklasse mit Authentifizierung und Session-Management
 */
class User {
    
    private array $data = [];
    private array $loginAttempts = [];
    
    /**
     * Konstruktor
     *
     * @param array $userData Benutzerdaten
     */
    public function __construct(array $userData = []) {
        $this->data = $userData;
    }
    
    /**
     * Benutzer anmelden
     *
     * @param string $username Benutzername oder E-Mail
     * @param string $password Passwort
     * @param bool $rememberMe Remember-Me-Option
     * @return array Login-Ergebnis
     */
    public static function login(string $username, string $password, bool $rememberMe = false): array {
        try {
            // Rate Limiting prüfen
            if (self::isLoginBlocked($username)) {
                return [
                    'success' => false,
                    'message' => 'Zu viele Anmeldeversuche. Versuchen Sie es später erneut.',
                    'blocked_until' => self::getBlockedUntil($username)
                ];
            }
            
            // Benutzer in Datenbank suchen
            $user = Database::query("
                SELECT * FROM users 
                WHERE (username = :username OR email = :username) 
                AND is_active = 1
            ", ['username' => $username], 'one');
            
            if (!$user) {
                self::recordLoginAttempt($username, false);
                return [
                    'success' => false,
                    'message' => 'Ungültige Anmeldedaten'
                ];
            }
            
            // Passwort verifizieren
            if (!SecurityConfig::verifyPassword($password, $user['password_hash'])) {
                self::recordLoginAttempt($username, false);
                return [
                    'success' => false,
                    'message' => 'Ungültige Anmeldedaten'
                ];
            }
            
            // Erfolgreiche Anmeldung
            self::recordLoginAttempt($username, true);
            
            // Session erstellen
            $sessionId = self::createSession($user['id'], $rememberMe);
            
            // Last Login aktualisieren
            Database::update('users', 
                ['last_login' => date('Y-m-d H:i:s')], 
                ['id' => $user['id']]
            );
            
            // Session-Daten setzen
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['session_id'] = $sessionId;
            $_SESSION['csrf_token'] = SecurityConfig::generateCSRFToken();
            $_SESSION['login_time'] = time();
            
            return [
                'success' => true,
                'message' => 'Erfolgreich angemeldet',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'full_name' => $user['full_name'],
                    'role' => $user['role'],
                    'department' => $user['department']
                ],
                'session_id' => $sessionId
            ];
            
        } catch (Exception $e) {
            error_log("Login-Fehler: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Ein Systemfehler ist aufgetreten'
            ];
        }
    }
    
    /**
     * Benutzer abmelden
     *
     * @param bool $allSessions Alle Sessions des Benutzers beenden
     * @return bool
     */
    public static function logout(bool $allSessions = false): bool {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            $sessionId = $_SESSION['session_id'] ?? null;
            
            if ($userId && $sessionId) {
                if ($allSessions) {
                    // Alle Sessions des Benutzers beenden
                    Database::update('sessions',
                        ['is_active' => 0],
                        ['user_id' => $userId]
                    );
                } else {
                    // Nur aktuelle Session beenden
                    Database::update('sessions',
                        ['is_active' => 0],
                        ['id' => $sessionId]
                    );
                }
            }
            
            // Session-Daten löschen
            $_SESSION = [];
            
            // Session-Cookie löschen
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }
            
            // Session zerstören
            session_destroy();
            
            return true;
            
        } catch (Exception $e) {
            error_log("Logout-Fehler: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Prüft ob Benutzer angemeldet ist
     *
     * @return bool
     */
    public static function isLoggedIn(): bool {
        SecurityConfig::startSecureSession();
        
        if (!isset($_SESSION['user_id']) || !isset($_SESSION['session_id'])) {
            return false;
        }
        
        // Session in Datenbank prüfen
        $session = Database::query("
            SELECT s.*, u.is_active 
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = :session_id 
            AND s.is_active = 1 
            AND s.expires_at > NOW()
            AND u.is_active = 1
        ", ['session_id' => $_SESSION['session_id']], 'one');
        
        if (!$session) {
            self::logout();
            return false;
        }
        
        // Session-Aktivität aktualisieren
        Database::update('sessions',
            ['last_activity' => date('Y-m-d H:i:s')],
            ['id' => $_SESSION['session_id']]
        );
        
        return true;
    }
    
    /**
     * Gibt aktuellen Benutzer zurück
     *
     * @return User|null
     */
    public static function getCurrentUser(): ?User {
        if (!self::isLoggedIn()) {
            return null;
        }
        
        $userData = Database::query("
            SELECT * FROM users WHERE id = :user_id AND is_active = 1
        ", ['user_id' => $_SESSION['user_id']], 'one');
        
        return $userData ? new self($userData) : null;
    }
    
    /**
     * Prüft ob Benutzer eine bestimmte Rolle hat
     *
     * @param string $role Erforderliche Rolle
     * @return bool
     */
    public function hasRole(string $role): bool {
        return $this->data['role'] === $role;
    }
    
    /**
     * Prüft ob Benutzer Admin ist
     *
     * @return bool
     */
    public function isAdmin(): bool {
        return $this->hasRole('admin');
    }
    
    /**
     * Erstellt neuen Benutzer
     *
     * @param array $userData Benutzerdaten
     * @return array Ergebnis
     */
    public static function create(array $userData): array {
        try {
            // Validierung
            $validation = self::validateUserData($userData);
            if (!$validation['valid']) {
                return [
                    'success' => false,
                    'message' => 'Validierungsfehler',
                    'errors' => $validation['errors']
                ];
            }
            
            // Prüfen ob Benutzer bereits existiert
            $existing = Database::query("
                SELECT id FROM users 
                WHERE username = :username OR email = :email
            ", [
                'username' => $userData['username'],
                'email' => $userData['email']
            ], 'one');
            
            if ($existing) {
                return [
                    'success' => false,
                    'message' => 'Benutzername oder E-Mail bereits vergeben'
                ];
            }
            
            // Passwort hashen
            $userData['password_hash'] = SecurityConfig::hashPassword($userData['password']);
            unset($userData['password']);
            
            // Standard-Werte setzen
            $userData['is_active'] = $userData['is_active'] ?? true;
            $userData['role'] = $userData['role'] ?? 'user';
            
            // Benutzer erstellen
            $userId = Database::insert('users', $userData);
            
            return [
                'success' => true,
                'message' => 'Benutzer erfolgreich erstellt',
                'user_id' => $userId
            ];
            
        } catch (Exception $e) {
            error_log("Benutzer-Erstellungsfehler: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Benutzer konnte nicht erstellt werden'
            ];
        }
    }
    
    /**
     * Aktualisiert Benutzerdaten
     *
     * @param int $userId Benutzer-ID
     * @param array $userData Neue Daten
     * @return array Ergebnis
     */
    public static function update(int $userId, array $userData): array {
        try {
            // Passwort separat behandeln
            if (isset($userData['password'])) {
                if (strlen($userData['password']) >= AppConfig::PASSWORD_MIN_LENGTH) {
                    $userData['password_hash'] = SecurityConfig::hashPassword($userData['password']);
                }
                unset($userData['password']);
            }
            
            // Updated_at setzen
            $userData['updated_at'] = date('Y-m-d H:i:s');
            
            $affectedRows = Database::update('users', $userData, ['id' => $userId]);
            
            return [
                'success' => $affectedRows > 0,
                'message' => $affectedRows > 0 ? 'Benutzer aktualisiert' : 'Keine Änderungen vorgenommen'
            ];
            
        } catch (Exception $e) {
            error_log("Benutzer-Update-Fehler: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Benutzer konnte nicht aktualisiert werden'
            ];
        }
    }
    
    /**
     * Validiert Benutzerdaten
     *
     * @param array $userData Zu validierende Daten
     * @return array Validierungsergebnis
     */
    private static function validateUserData(array $userData): array {
        $errors = [];
        
        // Username
        if (empty($userData['username'])) {
            $errors['username'] = 'Benutzername ist erforderlich';
        } elseif (strlen($userData['username']) < 3) {
            $errors['username'] = 'Benutzername muss mindestens 3 Zeichen lang sein';
        }
        
        // E-Mail
        if (empty($userData['email'])) {
            $errors['email'] = 'E-Mail ist erforderlich';
        } elseif (!SecurityConfig::validateEmail($userData['email'])) {
            $errors['email'] = 'Ungültige E-Mail-Adresse';
        }
        
        // Passwort (nur bei Neuerstellung)
        if (isset($userData['password'])) {
            if (strlen($userData['password']) < AppConfig::PASSWORD_MIN_LENGTH) {
                $errors['password'] = 'Passwort muss mindestens ' . AppConfig::PASSWORD_MIN_LENGTH . ' Zeichen lang sein';
            }
        }
        
        // Vollständiger Name
        if (empty($userData['full_name'])) {
            $errors['full_name'] = 'Vollständiger Name ist erforderlich';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Erstellt eine neue Session
     *
     * @param int $userId Benutzer-ID
     * @param bool $rememberMe Lange Session
     * @return string Session-ID
     */
    private static function createSession(int $userId, bool $rememberMe = false): string {
        $sessionId = bin2hex(random_bytes(32));
        $expiryTime = $rememberMe ? 
            date('Y-m-d H:i:s', time() + (30 * 24 * 3600)) : // 30 Tage
            date('Y-m-d H:i:s', time() + AppConfig::SESSION_LIFETIME); // Standard
        
        Database::insert('sessions', [
            'id' => $sessionId,
            'user_id' => $userId,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'expires_at' => $expiryTime,
            'is_active' => 1
        ]);
        
        return $sessionId;
    }
    
    /**
     * Zeichnet Anmeldeversuche auf (Rate Limiting)
     *
     * @param string $username Benutzername
     * @param bool $successful Erfolgreicher Versuch
     */
    private static function recordLoginAttempt(string $username, bool $successful): void {
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
        $key = $username . '|' . $ipAddress;
        
        if (!isset($_SESSION['login_attempts'])) {
            $_SESSION['login_attempts'] = [];
        }
        
        if (!$successful) {
            if (!isset($_SESSION['login_attempts'][$key])) {
                $_SESSION['login_attempts'][$key] = [
                    'count' => 0,
                    'last_attempt' => time()
                ];
            }
            
            $_SESSION['login_attempts'][$key]['count']++;
            $_SESSION['login_attempts'][$key]['last_attempt'] = time();
        } else {
            // Erfolgreiche Anmeldung - Counter zurücksetzen
            unset($_SESSION['login_attempts'][$key]);
        }
    }
    
    /**
     * Prüft ob Login blockiert ist
     *
     * @param string $username Benutzername
     * @return bool
     */
    private static function isLoginBlocked(string $username): bool {
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
        $key = $username . '|' . $ipAddress;
        
        if (!isset($_SESSION['login_attempts'][$key])) {
            return false;
        }
        
        $attempts = $_SESSION['login_attempts'][$key];
        
        if ($attempts['count'] >= AppConfig::MAX_LOGIN_ATTEMPTS) {
            $timeSinceLastAttempt = time() - $attempts['last_attempt'];
            return $timeSinceLastAttempt < AppConfig::LOCKOUT_TIME;
        }
        
        return false;
    }
    
    /**
     * Gibt Zeitpunkt zurück, bis wann Login blockiert ist
     *
     * @param string $username Benutzername
     * @return int|null Timestamp oder null
     */
    private static function getBlockedUntil(string $username): ?int {
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
        $key = $username . '|' . $ipAddress;
        
        if (!isset($_SESSION['login_attempts'][$key])) {
            return null;
        }
        
        $attempts = $_SESSION['login_attempts'][$key];
        return $attempts['last_attempt'] + AppConfig::LOCKOUT_TIME;
    }
    
    /**
     * Gibt alle aktiven Benutzer zurück
     *
     * @return array
     */
    public static function getAllUsers(): array {
        return Database::query("
            SELECT id, username, email, full_name, role, department, 
                   is_active, created_at, last_login
            FROM users 
            ORDER BY full_name
        ");
    }
    
    /**
     * Deaktiviert einen Benutzer
     *
     * @param int $userId Benutzer-ID
     * @return bool
     */
    public static function deactivateUser(int $userId): bool {
        try {
            // Benutzer deaktivieren
            Database::update('users', ['is_active' => 0], ['id' => $userId]);
            
            // Alle Sessions beenden
            Database::update('sessions', ['is_active' => 0], ['user_id' => $userId]);
            
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Passwort zurücksetzen
     *
     * @param string $email E-Mail-Adresse
     * @return array Ergebnis
     */
    public static function resetPassword(string $email): array {
        try {
            $user = Database::query("
                SELECT id, username, full_name FROM users 
                WHERE email = :email AND is_active = 1
            ", ['email' => $email], 'one');
            
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'E-Mail-Adresse nicht gefunden'
                ];
            }
            
            // Temporäres Passwort generieren
            $tempPassword = bin2hex(random_bytes(8));
            $hashedPassword = SecurityConfig::hashPassword($tempPassword);
            
            // Passwort in Datenbank aktualisieren
            Database::update('users', 
                ['password_hash' => $hashedPassword], 
                ['id' => $user['id']]
            );
            
            // E-Mail senden (vereinfacht - in Produktion sollte eine E-Mail-Klasse verwendet werden)
            $subject = "QHSE System - Passwort zurückgesetzt";
            $message = "Hallo " . $user['full_name'] . ",\n\n";
            $message .= "Ihr neues temporäres Passwort lautet: " . $tempPassword . "\n\n";
            $message .= "Bitte ändern Sie es nach der nächsten Anmeldung.\n\n";
            $message .= "Mit freundlichen Grüßen\nIhr QHSE-Team";
            
            $headers = "From: " . AppConfig::FROM_EMAIL . "\r\n";
            $headers .= "Reply-To: " . AppConfig::FROM_EMAIL . "\r\n";
            
            $emailSent = mail($email, $subject, $message, $headers);
            
            return [
                'success' => true,
                'message' => $emailSent ? 
                    'Neues Passwort wurde per E-Mail gesendet' : 
                    'Passwort wurde zurückgesetzt, aber E-Mail konnte nicht gesendet werden',
                'temp_password' => DatabaseConfig::ENVIRONMENT === 'development' ? $tempPassword : null
            ];
            
        } catch (Exception $e) {
            error_log("Password-Reset-Fehler: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Passwort konnte nicht zurückgesetzt werden'
            ];
        }
    }
    
    /**
     * Gibt Benutzerdaten zurück
     *
     * @return array
     */
    public function getData(): array {
        return $this->data;
    }
    
    /**
     * Gibt spezifisches Feld zurück
     *
     * @param string $field Feldname
     * @return mixed
     */
    public function get(string $field): mixed {
        return $this->data[$field] ?? null;
    }
    
    /**
     * Magic Method für Eigenschaftszugriff
     *
     * @param string $name Eigenschaftsname
     * @return mixed
     */
    public function __get(string $name): mixed {
        return $this->get($name);
    }
    
    /**
     * Magic Method für Eigenschaftsprüfung
     *
     * @param string $name Eigenschaftsname
     * @return bool
     */
    public function __isset(string $name): bool {
        return isset($this->data[$name]);
    }
}
?>