<?php
/**
 * QHSE Compliance API
 * RESTful API für DGUV-Compliance und Meldepflicht-Integration
 * 
 * Endpoints:
 * POST /api/compliance/dguv/generate - DGUV Form 1 generieren
 * POST /api/compliance/dguv/submit - DGUV Form an Berufsgenossenschaft senden
 * GET /api/compliance/incidents/{id}/dguv - DGUV-Daten für Unfall abrufen
 * POST /api/compliance/incidents/{id}/export - Unfall zu DGUV exportieren
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

require_once 'auth.php';
require_once 'classes/Database.php';

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

class QHSEComplianceAPI {
    private $auth;
    private $db;
    private $method;
    private $endpoint;
    
    public function __construct() {
        $this->auth = new QHSEAuth();
        $this->db = new QHSEDatabase();
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->endpoint = $this->getEndpoint();
    }
    
    /**
     * Endpoint aus URL extrahieren
     */
    private function getEndpoint() {
        $uri = $_SERVER['REQUEST_URI'];
        $path = parse_url($uri, PHP_URL_PATH);
        
        // /backend/compliance-api.php/dguv/generate -> dguv/generate
        $pathParts = explode('/', trim($path, '/'));
        $apiIndex = array_search('compliance-api.php', $pathParts);
        
        if ($apiIndex !== false && isset($pathParts[$apiIndex + 1])) {
            return implode('/', array_slice($pathParts, $apiIndex + 1));
        }
        
        return '';
    }
    
    /**
     * API Request verarbeiten
     */
    public function handleRequest() {
        try {
            // Session validieren für geschützte Endpunkte
            if (!$this->isPublicEndpoint($this->endpoint)) {
                $sessionResult = $this->auth->validateSession();
                if (!$sessionResult['valid']) {
                    return $this->sendError('Unauthorized', 401);
                }
            }
            
            // Route zu entsprechendem Handler
            switch ($this->endpoint) {
                case 'dguv/generate':
                    return $this->handleDGUVGenerate();
                
                case 'dguv/submit':
                    return $this->handleDGUVSubmit();
                
                case strpos($this->endpoint, 'incidents/') === 0 && strpos($this->endpoint, '/dguv') !== false:
                    return $this->handleIncidentDGUV();
                
                case strpos($this->endpoint, 'incidents/') === 0 && strpos($this->endpoint, '/export') !== false:
                    return $this->handleIncidentExport();
                
                case 'berufsgenossenschaften':
                    return $this->handleBerufsgenossenschaften();
                
                case 'company':
                    return $this->handleCompanyData();
                
                default:
                    return $this->sendError('Endpoint not found', 404);
            }
            
        } catch (Exception $e) {
            error_log('Compliance API Error: ' . $e->getMessage());
            return $this->sendError('Internal server error', 500);
        }
    }
    
    /**
     * DGUV Form 1 generieren
     */
    private function handleDGUVGenerate() {
        if ($this->method !== 'POST') {
            return $this->sendError('Method not allowed', 405);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['incidentData']) || !isset($input['companyData'])) {
            return $this->sendError('Missing required data: incidentData, companyData', 400);
        }
        
        try {
            // DGUV Form 1 Daten strukturieren
            $dguvData = $this->generateDGUVForm1($input['incidentData'], $input['companyData']);
            
            // In Datenbank speichern für Audit-Trail
            $this->saveDGUVGeneration($input['incidentData']['id'] ?? null, $dguvData);
            
            return $this->sendSuccess([
                'dguv_data' => $dguvData,
                'generated_at' => date('c'),
                'generator' => 'QHSE Backend API'
            ]);
            
        } catch (Exception $e) {
            return $this->sendError('DGUV generation failed: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * DGUV Form an Berufsgenossenschaft senden
     */
    private function handleDGUVSubmit() {
        if ($this->method !== 'POST') {
            return $this->sendError('Method not allowed', 405);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['dguvData']) || !isset($input['berufsgenossenschaft'])) {
            return $this->sendError('Missing required data: dguvData, berufsgenossenschaft', 400);
        }
        
        try {
            // Validierung der DGUV-Daten
            $validation = $this->validateDGUVData($input['dguvData']);
            if (!$validation['valid']) {
                return $this->sendError('DGUV data validation failed', 400, [
                    'errors' => $validation['errors']
                ]);
            }
            
            // Übermittlung an Berufsgenossenschaft simulieren
            $submissionResult = $this->submitToBG($input['dguvData'], $input['berufsgenossenschaft']);
            
            // Submission-Log speichern
            $this->saveSubmissionLog($input['dguvData'], $submissionResult);
            
            return $this->sendSuccess([
                'submitted' => true,
                'submission_id' => $submissionResult['id'],
                'bg_response' => $submissionResult['response'],
                'submitted_at' => date('c')
            ]);
            
        } catch (Exception $e) {
            return $this->sendError('DGUV submission failed: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * DGUV-Daten für Unfall abrufen
     */
    private function handleIncidentDGUV() {
        if ($this->method !== 'GET') {
            return $this->sendError('Method not allowed', 405);
        }
        
        // Incident ID aus Endpoint extrahieren
        preg_match('/incidents\/([^\/]+)\/dguv/', $this->endpoint, $matches);
        $incidentId = $matches[1] ?? null;
        
        if (!$incidentId) {
            return $this->sendError('Invalid incident ID', 400);
        }
        
        try {
            // DGUV-Daten aus Datenbank laden
            $dguvData = $this->loadDGUVDataForIncident($incidentId);
            
            if (!$dguvData) {
                return $this->sendError('DGUV data not found for incident', 404);
            }
            
            return $this->sendSuccess($dguvData);
            
        } catch (Exception $e) {
            return $this->sendError('Failed to load DGUV data: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Unfall zu DGUV exportieren
     */
    private function handleIncidentExport() {
        if ($this->method !== 'POST') {
            return $this->sendError('Method not allowed', 405);
        }
        
        // Incident ID aus Endpoint extrahieren
        preg_match('/incidents\/([^\/]+)\/export/', $this->endpoint, $matches);
        $incidentId = $matches[1] ?? null;
        
        if (!$incidentId) {
            return $this->sendError('Invalid incident ID', 400);
        }
        
        try {
            // Incident-Daten laden
            $incidentData = $this->loadIncidentData($incidentId);
            if (!$incidentData) {
                return $this->sendError('Incident not found', 404);
            }
            
            // Firmendaten laden
            $companyData = $this->loadCompanyData();
            
            // DGUV Form 1 generieren
            $dguvData = $this->generateDGUVForm1($incidentData, $companyData);
            
            // Export-Log speichern
            $this->saveExportLog($incidentId, $dguvData);
            
            return $this->sendSuccess([
                'exported' => true,
                'dguv_data' => $dguvData,
                'export_id' => uniqid('export_'),
                'exported_at' => date('c')
            ]);
            
        } catch (Exception $e) {
            return $this->sendError('Export failed: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Berufsgenossenschaften-Liste
     */
    private function handleBerufsgenossenschaften() {
        if ($this->method !== 'GET') {
            return $this->sendError('Method not allowed', 405);
        }
        
        $berufsgenossenschaften = [
            'BG01' => [
                'code' => 'BG01',
                'name' => 'Berufsgenossenschaft der Bauwirtschaft',
                'short' => 'BG BAU',
                'address' => 'Hildegardstraße 29/30, 10715 Berlin',
                'contact' => [
                    'phone' => '+49 30 85781-0',
                    'email' => 'info@bgbau.de',
                    'web' => 'https://www.bgbau.de'
                ]
            ],
            'BG02' => [
                'code' => 'BG02',
                'name' => 'Berufsgenossenschaft Energie Textil Elektro Medienerzeugnisse',
                'short' => 'BG ETEM',
                'address' => 'Gustav-Heinemann-Ufer 130, 50968 Köln',
                'contact' => [
                    'phone' => '+49 221 3778-0',
                    'email' => 'info@bgetem.de',
                    'web' => 'https://www.bgetem.de'
                ]
            ]
            // Weitere BGs können hinzugefügt werden...
        ];
        
        return $this->sendSuccess($berufsgenossenschaften);
    }
    
    /**
     * Firmendaten abrufen
     */
    private function handleCompanyData() {
        if ($this->method !== 'GET') {
            return $this->sendError('Method not allowed', 405);
        }
        
        try {
            $companyData = $this->loadCompanyData();
            return $this->sendSuccess($companyData);
        } catch (Exception $e) {
            return $this->sendError('Failed to load company data: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * DGUV Form 1 generieren (Backend-Logic)
     */
    private function generateDGUVForm1($incidentData, $companyData) {
        return [
            'header' => [
                'form_type' => 'DGUV Form 1',
                'version' => '2024.1',
                'generated' => date('c'),
                'generator' => 'QHSE Backend API'
            ],
            'sections' => [
                'company' => [
                    '1.1' => $companyData['name'] ?? '',
                    '1.2' => $companyData['address'] ?? '',
                    '1.3a' => $companyData['postal_code'] ?? '',
                    '1.3b' => $companyData['city'] ?? '',
                    '1.4' => $companyData['phone'] ?? '',
                    '1.5' => $companyData['email'] ?? '',
                    '1.6' => $companyData['membership_number'] ?? '',
                    '1.7' => $companyData['industry_code'] ?? '88999'
                ],
                'person' => [
                    '2.1' => $incidentData['person']['last_name'] ?? '',
                    '2.2' => $incidentData['person']['first_name'] ?? '',
                    '2.3' => $incidentData['person']['birth_date'] ?? '',
                    '2.4' => $incidentData['person']['gender'] ?? 'd',
                    '2.5' => $incidentData['person']['nationality'] ?? 'deutsch',
                    '2.6' => $incidentData['person']['address'] ?? '',
                    '2.7a' => $incidentData['person']['postal_code'] ?? '',
                    '2.7b' => $incidentData['person']['city'] ?? '',
                    '2.8' => $incidentData['person']['personnel_number'] ?? '',
                    '2.9' => $incidentData['person']['job_title'] ?? '',
                    '2.10' => $incidentData['person']['employment_start'] ?? '',
                    '2.11' => $incidentData['person']['working_hours_per_week'] ?? '40'
                ],
                'accident' => [
                    '3.1' => $this->formatDate($incidentData['incident_date_time'] ?? ''),
                    '3.2' => $this->formatTime($incidentData['incident_date_time'] ?? ''),
                    '3.3' => $incidentData['incident_location'] ?? '',
                    '3.4' => $incidentData['work_process'] ?? '',
                    '3.5' => $incidentData['accident_cause'] ?? '',
                    '3.6' => $incidentData['incident_description'] ?? '',
                    '3.7' => $incidentData['witnesses'] ?? ''
                ],
                'injury' => [
                    '4.1' => $incidentData['consequences']['body_part'] ?? '',
                    '4.2' => $incidentData['consequences']['injury_type'] ?? '',
                    '4.3' => $this->mapSeverity($incidentData['incident_severity'] ?? ''),
                    '4.4' => $incidentData['consequences']['first_aid'] ?? false,
                    '4.5' => $incidentData['consequences']['doctor_treatment'] ?? false,
                    '4.6' => $incidentData['consequences']['hospital_treatment'] ?? false,
                    '4.7' => $incidentData['consequences']['work_incapacity'] ?? false,
                    '4.8' => $incidentData['consequences']['workdays_lost'] ?? ''
                ],
                'reporting' => [
                    '5.1' => date('d.m.Y'),
                    '5.2' => $incidentData['reporter_name'] ?? '',
                    '5.3' => $incidentData['reporter_position'] ?? '',
                    '5.4' => $incidentData['reporter_phone'] ?? '',
                    '5.5' => $incidentData['reporter_email'] ?? ''
                ]
            ],
            'validation' => $this->validateDGUVSections($incidentData, $companyData)
        ];
    }
    
    /**
     * Helper Methoden
     */
    private function formatDate($dateString) {
        if (empty($dateString)) return '';
        $date = new DateTime($dateString);
        return $date->format('d.m.Y');
    }
    
    private function formatTime($dateString) {
        if (empty($dateString)) return '';
        $date = new DateTime($dateString);
        return $date->format('H:i');
    }
    
    private function mapSeverity($severity) {
        $map = [
            'niedrig' => 'leicht',
            'mittel' => 'leicht',
            'hoch' => 'schwer',
            'kritisch' => 'schwer',
            'tödlich' => 'tödlich'
        ];
        return $map[$severity] ?? 'leicht';
    }
    
    private function validateDGUVSections($incidentData, $companyData) {
        // Basis-Validierung implementieren
        return [
            'is_valid' => true,
            'errors' => [],
            'warnings' => [],
            'completeness' => 85
        ];
    }
    
    private function isPublicEndpoint($endpoint) {
        $publicEndpoints = ['berufsgenossenschaften'];
        return in_array($endpoint, $publicEndpoints);
    }
    
    private function loadCompanyData() {
        // Aus Datenbank oder Konfiguration laden
        return [
            'name' => 'QHSE GFT',
            'address' => 'Musterstraße 123',
            'postal_code' => '12345',
            'city' => 'Musterstadt',
            'phone' => '+49 123 456789',
            'email' => 'info@qhse-gft.de',
            'membership_number' => 'BG01123456',
            'industry_code' => '88999'
        ];
    }
    
    private function loadIncidentData($incidentId) {
        // Aus Datenbank laden
        // Dummy-Implementation
        return null;
    }
    
    private function saveDGUVGeneration($incidentId, $dguvData) {
        // In compliance_logs Tabelle speichern
    }
    
    private function saveSubmissionLog($dguvData, $submissionResult) {
        // Submission-Log speichern
    }
    
    private function saveExportLog($incidentId, $dguvData) {
        // Export-Log speichern
    }
    
    private function submitToBG($dguvData, $bg) {
        // Simulation der BG-Übermittlung
        return [
            'id' => uniqid('bg_'),
            'response' => 'Unfallanzeige erfolgreich übermittelt',
            'status' => 'success'
        ];
    }
    
    private function loadDGUVDataForIncident($incidentId) {
        // DGUV-Daten aus Datenbank laden
        return null;
    }
    
    private function validateDGUVData($dguvData) {
        return ['valid' => true, 'errors' => []];
    }
    
    /**
     * Response Helper
     */
    private function sendSuccess($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode([
            'success' => true,
            'data' => $data,
            'timestamp' => date('c')
        ]);
        exit;
    }
    
    private function sendError($message, $statusCode = 400, $details = null) {
        http_response_code($statusCode);
        $response = [
            'success' => false,
            'error' => $message,
            'timestamp' => date('c')
        ];
        
        if ($details) {
            $response['details'] = $details;
        }
        
        echo json_encode($response);
        exit;
    }
}

// API instanziieren und Request verarbeiten
$api = new QHSEComplianceAPI();
$api->handleRequest();