<?php
/**
 * QHSE Authentication API
 * RESTful API für sicheres Login-System
 * 
 * Endpoints:
 * POST /api/login - Benutzer-Authentifizierung
 * POST /api/logout - Session beenden
 * GET /api/session - Session-Status prüfen
 * POST /api/refresh - Session erneuern
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

require_once 'auth.php';

// CORS-Headers für Frontend (nur in Entwicklung)
if (config('app.environment') === 'development') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
}

// Preflight-Request für CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

class QHSEAuthAPI {
    private $auth;
    private $method;
    private $endpoint;
    
    public function __construct() {
        $this->auth = new QHSEAuth();
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->endpoint = $this->getEndpoint();
    }
    
    /**
     * Endpoint aus URL extrahieren
     */
    private function getEndpoint() {
        $uri = $_SERVER['REQUEST_URI'];
        $path = parse_url($uri, PHP_URL_PATH);
        
        // /backend/api.php/login -> login
        $pathParts = explode('/', trim($path, '/'));
        return end($pathParts);
    }
    
    /**
     * JSON-Input verarbeiten
     */
    private function getJsonInput() {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->sendError('Invalid JSON input', 400);
        }
        
        return $data ?? [];
    }
    
    /**
     * Erfolgreiche Antwort senden
     */
    private function sendSuccess($data = [], $message = 'OK', $code = 200) {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('c')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    /**
     * Fehler-Antwort senden
     */
    private function sendError($message = 'Internal Server Error', $code = 500, $details = []) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error' => $message,
            'details' => $details,
            'timestamp' => date('c')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    /**
     * Request verarbeiten
     */
    public function handleRequest() {
        try {
            switch ($this->endpoint) {
                case 'login':
                    $this->handleLogin();
                    break;
                    
                case 'logout':
                    $this->handleLogout();
                    break;
                    
                case 'session':
                    $this->handleSessionCheck();
                    break;
                    
                case 'refresh':
                    $this->handleSessionRefresh();
                    break;
                    
                default:
                    $this->sendError('Endpoint not found', 404);
                    break;
            }
        } catch (Exception $e) {
            error_log("API Error: " . $e->getMessage());
            $this->sendError('Internal server error', 500);
        }
    }
    
    /**
     * Login-Endpoint
     */
    private function handleLogin() {
        if ($this->method !== 'POST') {
            $this->sendError('Method not allowed', 405);
        }
        
        $input = $this->getJsonInput();
        
        // Eingabe-Validierung
        if (empty($input['companyName']) || empty($input['password'])) {
            $this->sendError('Missing required fields', 400, [
                'required' => ['companyName', 'password']
            ]);
        }
        
        $companyName = $input['companyName'];
        $password = $input['password'];
        $rememberMe = $input['rememberMe'] ?? false;
        
        // Authentifizierung
        $result = $this->auth->authenticate($companyName, $password, $rememberMe);
        
        if ($result['success']) {
            $this->sendSuccess([
                'user' => $result['user'],
                'session' => [
                    'id' => $result['session']['session_id'],
                    'csrf_token' => $result['session']['csrf_token'],
                    'expires_at' => $result['session']['expires_at']
                ],
                'redirect_url' => 'index.html'
            ], 'Login successful');
        } else {
            $code = 401;
            if (isset($result['retry_after'])) {
                $code = 429; // Too Many Requests
            }
            
            $this->sendError(
                $result['reason'] ?? 'Authentication failed',
                $code,
                [
                    'errors' => $result['errors'] ?? [],
                    'retry_after' => $result['retry_after'] ?? null
                ]
            );
        }
    }
    
    /**
     * Logout-Endpoint
     */
    private function handleLogout() {
        if ($this->method !== 'POST') {
            $this->sendError('Method not allowed', 405);
        }
        
        $sessionId = $_COOKIE['qhse_session'] ?? $_SESSION['session_id'] ?? null;
        
        if ($sessionId) {
            $this->auth->destroySession($sessionId);
        }
        
        $this->sendSuccess([], 'Logout successful');
    }
    
    /**
     * Session-Check-Endpoint
     */
    private function handleSessionCheck() {
        if ($this->method !== 'GET') {
            $this->sendError('Method not allowed', 405);
        }
        
        $sessionId = $_COOKIE['qhse_session'] ?? $_GET['session_id'] ?? null;
        
        if (!$sessionId) {
            $this->sendError('No session ID provided', 400);
        }
        
        $validation = $this->auth->validateSession($sessionId);
        
        if ($validation['valid']) {
            $this->sendSuccess([
                'session' => $validation['session'],
                'authenticated' => true
            ], 'Session is valid');
        } else {
            $this->sendError('Session invalid or expired', 401, [
                'reason' => $validation['reason']
            ]);
        }
    }
    
    /**
     * Session-Refresh-Endpoint
     */
    private function handleSessionRefresh() {
        if ($this->method !== 'POST') {
            $this->sendError('Method not allowed', 405);
        }
        
        $sessionId = $_COOKIE['qhse_session'] ?? $_SESSION['session_id'] ?? null;
        
        if (!$sessionId) {
            $this->sendError('No active session', 400);
        }
        
        $validation = $this->auth->validateSession($sessionId);
        
        if (!$validation['valid']) {
            $this->sendError('Session invalid', 401);
        }
        
        // Session-Daten aktualisieren (bereits in validateSession gemacht)
        $this->sendSuccess([
            'session' => $validation['session']
        ], 'Session refreshed');
    }
}

// API-Request verarbeiten
$api = new QHSEAuthAPI();
$api->handleRequest();

?>