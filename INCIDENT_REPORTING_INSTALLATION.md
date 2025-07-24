# QHSE Meldemodul - Installationsanleitung

## Übersicht

Das QHSE Meldemodul ist eine professionelle Erweiterung für das bestehende QHSE Management System, das es Mitarbeitern ermöglicht, Unfälle und Beinaheunfälle sicher und strukturiert zu melden.

## Systemanforderungen

### Server-Anforderungen
- **PHP**: Version 7.4 oder höher (empfohlen: PHP 8.0+)
- **MySQL**: Version 5.7 oder höher (empfohlen: MySQL 8.0+)
- **Webserver**: Apache 2.4+ oder Nginx 1.18+
- **Speicherplatz**: Mindestens 100MB für Dateien und Uploads
- **RAM**: Mindestens 512MB verfügbarer Arbeitsspeicher

### PHP-Erweiterungen
Folgende PHP-Erweiterungen werden benötigt:
- `pdo` und `pdo_mysql` (Datenbankverbindung)
- `gd` (Bildverarbeitung)
- `fileinfo` (Dateityperkennung)
- `mbstring` (Zeichenkodierung)
- `openssl` (Verschlüsselung)
- `json` (JSON-Verarbeitung)

### Browser-Kompatibilität
- **Moderne Browser**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
- **JavaScript**: Muss aktiviert sein
- **Cookies**: Müssen aktiviert sein

## Installation

### Schritt 1: Frontend-Integration (bereits implementiert)

Das Frontend ist bereits vollständig in das bestehende QHSE System integriert:

1. **Sidebar-Integration**: 
   - Buttons "Unfall melden" und "Beinaheunfall melden" sind in `index.html` implementiert
   - Befinden sich in der linken Seitenleiste unter dem QHSE-Logo

2. **Modal-Formular**: 
   - Vollständiges Meldungsformular ist in `index.html` integriert
   - Umfasst alle Pflichtfelder und optionale Felder
   - Drag & Drop Datei-Upload-Bereich

3. **CSS-Styling**: 
   - Professionelle Styles sind in `styles.css` implementiert
   - Responsive Design für alle Gerätegrößen
   - Konsistente Corporate Identity

4. **JavaScript-Funktionalität**: 
   - Vollständige Funktionalität in `script.js` implementiert
   - Event-Listener, Drag & Drop, Formvalidierung
   - Lokale Speicherung und Notification-System

### Schritt 2: Datenbank einrichten

1. **Datenbank erstellen**:
   ```sql
   CREATE DATABASE qhse_meldemodul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **SQL-Schema importieren**:
   ```bash
   mysql -u root -p qhse_meldemodul < database/meldemodul.sql
   ```

3. **Datenbankbenutzer erstellen**:
   ```sql
   CREATE USER 'qhse_app'@'localhost' IDENTIFIED BY 'your_secure_password_here';
   GRANT SELECT, INSERT, UPDATE, DELETE ON qhse_meldemodul.* TO 'qhse_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Schritt 3: Backend-Dateien erstellen

Da das Frontend bereits vollständig implementiert ist, müssen noch die Backend-Dateien erstellt werden:

#### 3.1 Verzeichnisstruktur
```
backend/
├── config/
│   └── database.php                 ✅ Bereits erstellt
├── classes/
│   ├── Database.php                 ✅ Bereits erstellt
│   └── User.php                     ✅ Bereits erstellt
├── api/                             ❗ Neu erstellen
│   ├── submit_incident.php
│   ├── get_incidents.php
│   ├── upload_files.php
│   └── delete_incident.php
├── uploads/                         ❗ Neu erstellen
│   ├── incidents/
│   ├── temp/
│   └── thumbnails/
└── logs/                           ❗ Neu erstellen
```

#### 3.2 API-Endpunkte erstellen

**A) Meldung einreichen** (`backend/api/submit_incident.php`):
```php
<?php
define('QHSE_SYSTEM', true);
require_once '../config/database.php';
require_once '../classes/Database.php';
require_once '../classes/User.php';

SecurityConfig::startSecureSession();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'message' => 'Method not allowed']));
}

// CSRF-Token validieren
if (!SecurityConfig::validateCSRFToken($_POST['csrf_token'] ?? '')) {
    http_response_code(403);
    exit(json_encode(['success' => false, 'message' => 'CSRF token invalid']));
}

// Benutzer-Authentifizierung prüfen
if (!User::isLoggedIn()) {
    http_response_code(401);
    exit(json_encode(['success' => false, 'message' => 'Not authenticated']));
}

try {
    Database::beginTransaction();
    
    // Meldungsdaten sammeln
    $incidentData = [
        'type' => SecurityConfig::sanitizeInput($_POST['incidentType'] ?? ''),
        'datetime' => $_POST['incidentDateTime'] ?? '',
        'location' => SecurityConfig::sanitizeInput($_POST['incidentLocation'] ?? ''),
        'description' => SecurityConfig::sanitizeInput($_POST['incidentDescription'] ?? ''),
        'reporter_name' => SecurityConfig::sanitizeInput($_POST['reporterName'] ?? ''),
        'reporter_email' => SecurityConfig::sanitizeInput($_POST['reporterEmail'] ?? ''),
        'reporter_phone' => SecurityConfig::sanitizeInput($_POST['reporterPhone'] ?? ''),
        'reporter_department' => SecurityConfig::sanitizeInput($_POST['reporterDepartment'] ?? ''),
        'involved_persons' => SecurityConfig::sanitizeInput($_POST['involvedPersons'] ?? ''),
        'immediate_actions' => SecurityConfig::sanitizeInput($_POST['immediateActions'] ?? ''),
        'severity' => SecurityConfig::sanitizeInput($_POST['incidentSeverity'] ?? ''),
        'category' => SecurityConfig::sanitizeInput($_POST['incidentCategory'] ?? ''),
        'user_id' => $_SESSION['user_id'],
        'status' => 'submitted',
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    // Validierung
    $errors = [];
    if (empty($incidentData['datetime'])) $errors[] = 'Datum und Uhrzeit erforderlich';
    if (empty($incidentData['location'])) $errors[] = 'Ort des Ereignisses erforderlich';
    if (empty($incidentData['description'])) $errors[] = 'Beschreibung erforderlich';
    if (empty($incidentData['reporter_name'])) $errors[] = 'Name des Meldenden erforderlich';
    if (empty($incidentData['reporter_email'])) $errors[] = 'E-Mail erforderlich';
    if (empty($incidentData['severity'])) $errors[] = 'Schweregrad erforderlich';
    if (empty($incidentData['category'])) $errors[] = 'Kategorie erforderlich';
    
    if (!empty($errors)) {
        Database::rollback();
        exit(json_encode([
            'success' => false, 
            'message' => 'Validierungsfehler',
            'errors' => $errors
        ]));
    }
    
    // Meldung in Datenbank speichern
    $incidentId = Database::insert('incident_reports', $incidentData);
    
    // Dateien verarbeiten (falls vorhanden)
    $uploadedFiles = [];
    if (!empty($_FILES['files'])) {
        $uploadedFiles = handleFileUploads($_FILES['files'], $incidentId);
    }
    
    Database::commit();
    
    // E-Mail-Benachrichtigung senden (optional)
    sendNotificationEmail($incidentData, $incidentId);
    
    echo json_encode([
        'success' => true,
        'message' => 'Meldung erfolgreich übermittelt',
        'incident_id' => $incidentId,
        'uploaded_files' => count($uploadedFiles)
    ]);
    
} catch (Exception $e) {
    Database::rollback();
    error_log("Incident submission error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Fehler beim Übermitteln der Meldung'
    ]);
}

function handleFileUploads($files, $incidentId) {
    $uploadedFiles = [];
    $uploadDir = AppConfig::UPLOAD_DIR . 'incidents/';
    
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    for ($i = 0; $i < count($files['name']); $i++) {
        if ($files['error'][$i] === UPLOAD_ERR_OK) {
            $originalName = $files['name'][$i];
            $tmpName = $files['tmp_name'][$i];
            $fileSize = $files['size'][$i];
            $fileType = $files['type'][$i];
            
            // Sichere Dateinamen generieren
            $extension = pathinfo($originalName, PATHINFO_EXTENSION);
            $safeFileName = $incidentId . '_' . time() . '_' . $i . '.' . $extension;
            $uploadPath = $uploadDir . $safeFileName;
            
            if (move_uploaded_file($tmpName, $uploadPath)) {
                // Datei-Info in Datenbank speichern
                $fileData = [
                    'incident_id' => $incidentId,
                    'original_name' => $originalName,
                    'stored_name' => $safeFileName,
                    'file_path' => $uploadPath,
                    'file_size' => $fileSize,
                    'mime_type' => $fileType,
                    'uploaded_at' => date('Y-m-d H:i:s')
                ];
                
                Database::insert('incident_files', $fileData);
                $uploadedFiles[] = $safeFileName;
            }
        }
    }
    
    return $uploadedFiles;
}

function sendNotificationEmail($incidentData, $incidentId) {
    // E-Mail-Benachrichtigung an QHSE-Team
    $subject = "Neue " . ($incidentData['type'] === 'accident' ? 'Unfall' : 'Beinaheunfall') . "meldung - ID: $incidentId";
    
    $message = "Eine neue Meldung wurde eingereicht:\n\n";
    $message .= "ID: $incidentId\n";
    $message .= "Typ: " . ($incidentData['type'] === 'accident' ? 'Unfall' : 'Beinaheunfall') . "\n";
    $message .= "Datum/Zeit: " . $incidentData['datetime'] . "\n";
    $message .= "Ort: " . $incidentData['location'] . "\n";
    $message .= "Schweregrad: " . $incidentData['severity'] . "\n";
    $message .= "Melder: " . $incidentData['reporter_name'] . "\n";
    $message .= "E-Mail: " . $incidentData['reporter_email'] . "\n\n";
    $message .= "Bitte loggen Sie sich in das QHSE-System ein, um die vollständigen Details einzusehen.\n";
    
    $headers = "From: " . AppConfig::FROM_EMAIL . "\r\n";
    $headers .= "Reply-To: " . $incidentData['reporter_email'] . "\r\n";
    
    // E-Mail senden (vereinfacht - in Produktion sollte PHPMailer verwendet werden)
    mail('qhse@hoffmann-voss.de', $subject, $message, $headers);
}
?>
```

**B) Meldungen abrufen** (`backend/api/get_incidents.php`):
```php
<?php
define('QHSE_SYSTEM', true);
require_once '../config/database.php';
require_once '../classes/Database.php';
require_once '../classes/User.php';

SecurityConfig::startSecureSession();

if (!User::isLoggedIn()) {
    http_response_code(401);
    exit(json_encode(['success' => false, 'message' => 'Not authenticated']));
}

$currentUser = User::getCurrentUser();
if (!$currentUser || !$currentUser->isAdmin()) {
    http_response_code(403);
    exit(json_encode(['success' => false, 'message' => 'Access denied']));
}

try {
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(50, max(10, intval($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    
    $filter = $_GET['filter'] ?? 'all';
    $search = SecurityConfig::sanitizeInput($_GET['search'] ?? '');
    
    // Query aufbauen
    $whereClause = "1=1";
    $params = [];
    
    if ($filter !== 'all') {
        $whereClause .= " AND type = :filter";
        $params['filter'] = $filter;
    }
    
    if (!empty($search)) {
        $whereClause .= " AND (location LIKE :search OR description LIKE :search OR reporter_name LIKE :search)";
        $params['search'] = "%$search%";
    }
    
    // Meldungen abrufen
    $incidents = Database::query("
        SELECT ir.*, 
               COUNT(if.id) as file_count,
               COUNT(ic.id) as comment_count
        FROM incident_reports ir
        LEFT JOIN incident_files if ON ir.id = if.incident_id
        LEFT JOIN incident_comments ic ON ir.id = ic.incident_id
        WHERE $whereClause
        GROUP BY ir.id
        ORDER BY ir.created_at DESC
        LIMIT $limit OFFSET $offset
    ", $params);
    
    // Gesamtanzahl ermitteln
    $total = Database::query("
        SELECT COUNT(*) as count 
        FROM incident_reports 
        WHERE $whereClause
    ", $params, 'one')['count'];
    
    echo json_encode([
        'success' => true,
        'incidents' => $incidents,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Get incidents error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Fehler beim Laden der Meldungen'
    ]);
}
?>
```

### Schritt 4: Konfiguration anpassen

1. **Datenbank-Konfiguration** (`backend/config/database.php`):
   ```php
   // Produktions-Einstellungen anpassen
   const PROD_HOST = 'localhost';
   const PROD_DATABASE = 'qhse_meldemodul';
   const PROD_USERNAME = 'qhse_app';
   const PROD_PASSWORD = 'IHR_SICHERES_PASSWORT'; // ÄNDERN!
   
   // Umgebung auf Produktion setzen
   const ENVIRONMENT = 'production'; // ÄNDERN!
   ```

2. **E-Mail-Konfiguration** anpassen:
   ```php
   const SMTP_HOST = 'smtp.ihre-domain.de';
   const SMTP_USERNAME = 'qhse@ihre-domain.de';
   const SMTP_PASSWORD = 'ihr_email_passwort'; // ÄNDERN!
   const FROM_EMAIL = 'qhse@ihre-domain.de';
   ```

### Schritt 5: Verzeichnisse und Berechtigungen

1. **Upload-Verzeichnisse erstellen**:
   ```bash
   mkdir -p backend/uploads/{incidents,temp,thumbnails}
   chmod 755 backend/uploads
   chmod 755 backend/uploads/*
   ```

2. **Log-Verzeichnis erstellen**:
   ```bash
   mkdir -p backend/logs
   chmod 755 backend/logs
   ```

3. **Sicherheits-Dateien erstellen**:
   ```bash
   # .htaccess für Upload-Schutz
   echo "Order Deny,Allow\nDeny from all" > backend/uploads/.htaccess
   ```

### Schritt 6: Frontend-Backend-Verbindung

Das JavaScript im Frontend ist bereits so konfiguriert, dass es mit dem Backend kommuniziert. Um die vollständige Integration zu aktivieren, müssen Sie in `script.js` die Zeile zum Aktivieren der Backend-Kommunikation ändern:

```javascript
// In der submitIncidentReport-Funktion diese Zeile aktivieren:
this.submitIncidentToBackend(incidentData);
```

Und die API-URL konfigurieren:
```javascript
// API-Basis-URL setzen
const API_BASE_URL = '/backend/api';
```

### Schritt 7: Webserver-Konfiguration

#### Apache-Konfiguration (.htaccess):
```apache
RewriteEngine On

# HTTPS erzwingen (Produktion)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Upload-Größe begrenzen
LimitRequestBody 10485760

# Backend-Dateien schützen
<Files "*.php">
    Order Allow,Deny
    Allow from all
</Files>

<Directory "backend/uploads">
    Options -Indexes
    Order Deny,Allow
    Deny from all
</Directory>
```

## Testing und Validierung

### Funktionalitätstests

1. **Frontend-Tests**:
   ```javascript
   // Browser-Konsole öffnen und testen:
   qhseDashboard.openIncidentModal('accident');
   qhseDashboard.openIncidentModal('near_miss');
   ```

2. **Backend-Tests**:
   ```bash
   # Datenbankverbindung testen
   php -r "require 'backend/config/database.php'; var_dump(DatabaseConfig::testConnection());"
   ```

3. **Upload-Tests**:
   - Verschiedene Dateitypen testen (JPG, PNG, PDF, DOC)
   - Maximale Dateigröße prüfen (10MB)
   - Drag & Drop Funktionalität testen
   - Mehrere Dateien gleichzeitig hochladen

4. **Formvalidierung testen**:
   - Leere Pflichtfelder testen
   - E-Mail-Validierung prüfen
   - Datumsformat validieren

### Sicherheitstests

1. **CSRF-Schutz testen**:
   ```bash
   curl -X POST backend/api/submit_incident.php -d "test=data"
   # Sollte CSRF-Fehler zurückgeben
   ```

2. **SQL-Injection-Tests durchführen**
3. **File-Upload-Sicherheit prüfen**
4. **Session-Management testen**

## Produktive Verwendung

### Admin-Interface erstellen

Für die produktive Verwendung sollten Sie ein Admin-Interface erstellen, um eingereichte Meldungen zu verwalten:

1. **Meldungsübersicht** mit Filter- und Suchfunktionen
2. **Detailansicht** mit allen Meldungsinformationen
3. **Status-Management** (offen, in Bearbeitung, abgeschlossen)
4. **Kommentar-System** für interne Notizen
5. **Export-Funktionen** (PDF, Excel)
6. **Statistiken und Reports**

### E-Mail-Benachrichtigungen

Implementieren Sie automatische E-Mail-Benachrichtigungen:
- Bei neuen Meldungen an QHSE-Team
- Status-Updates an Melder
- Erinnerungen bei offenen Meldungen
- Wöchentliche Zusammenfassungen

### Reporting und Statistiken

Erstellen Sie Reports für:
- Anzahl Meldungen pro Zeitraum
- Verteilung nach Schweregrad
- Häufigste Unfallkategorien
- Bearbeitungszeiten
- Präventionsmaßnahmen-Tracking

## Wartung und Support

### Regelmäßige Aufgaben
- **Tägliche Backups**: Automatisierte Datenbank-Backups
- **Log-Rotation**: Alte Log-Dateien automatisch archivieren
- **Session-Cleanup**: Alte Sessions automatisch löschen
- **Datei-Cleanup**: Temporäre Upload-Dateien löschen

### Monitoring
- **System-Health-Checks**: Regelmäßige Verfügbarkeitsprüfungen
- **Performance-Monitoring**: Ladezeiten und Datenbankperformance
- **Fehler-Tracking**: Automatische Benachrichtigung bei Fehlern
- **Sicherheits-Monitoring**: Verdächtige Aktivitäten überwachen

## Fehlerbehebung

### Häufige Probleme

1. **Meldung kann nicht gesendet werden**:
   - JavaScript-Konsole auf Fehler prüfen
   - Backend-API-Erreichbarkeit testen
   - CSRF-Token validieren

2. **Datei-Upload funktioniert nicht**:
   - Upload-Verzeichnis-Berechtigungen prüfen
   - PHP-Upload-Limits kontrollieren
   - Dateityp-Validierung überprüfen

3. **E-Mail-Benachrichtigungen kommen nicht an**:
   - SMTP-Konfiguration überprüfen
   - Spam-Filter kontrollieren
   - Mail-Server-Logs analysieren

4. **Performance-Probleme**:
   - Datenbank-Indizes optimieren
   - Große Dateien komprimieren
   - Caching implementieren

### Log-Dateien
- **Application-Logs**: `backend/logs/application.log`
- **Database-Logs**: `backend/logs/database_errors.log`
- **PHP-Error-Logs**: `/var/log/php/error.log`
- **Web-Server-Logs**: `/var/log/apache2/error.log`

## Support-Kontakt

Bei Fragen zur Installation oder Problemen mit dem Meldemodul:

- **E-Mail**: qhse-support@hoffmann-voss.de
- **Telefon**: +49 (0) XXX XXXXXXX
- **Dokumentation**: Siehe CLAUDE.md für technische Details

---

**Version**: 1.0  
**Datum**: 2025-01-24  
**Autor**: QHSE System Development Team

**Wichtiger Hinweis**: Diese Installation setzt ein funktionsfähiges QHSE Management System voraus. Das Frontend ist bereits vollständig implementiert - es müssen nur noch die Backend-Komponenten erstellt und konfiguriert werden.