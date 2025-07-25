<?php
/**
 * QHSE Meldemodul - Datenbank-Verwaltungsklasse
 * 
 * @author QHSE System
 * @version 1.0
 * @date 2025-01-24
 */

// Verhindere direkten Zugriff
if (!defined('QHSE_SYSTEM')) {
    die('Direkter Zugriff nicht erlaubt');
}

require_once __DIR__ . '/../config/database.php';

/**
 * Zentrale Datenbankklasse mit Prepared Statements und Transaktionen
 */
class Database {
    
    private static ?PDO $connection = null;
    private static ?Database $instance = null;
    private array $queryLog = [];
    
    /**
     * Singleton-Pattern: Verhindert mehrfache Instanziierung
     */
    private function __construct() {}
    private function __clone() {}
    public function __wakeup() {
        throw new Exception("Unserialization nicht erlaubt");
    }
    
    /**
     * Gibt die Singleton-Instanz zurück
     *
     * @return Database
     */
    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Stellt die Datenbankverbindung her
     *
     * @return PDO
     * @throws Exception Bei Verbindungsfehlern
     */
    public static function getConnection(): PDO {
        if (self::$connection === null) {
            try {
                self::$connection = DatabaseConfig::getConnection();
                
                // Logging aktivieren (nur in Entwicklung)
                if (DatabaseConfig::ENVIRONMENT === 'development') {
                    self::$connection->setAttribute(PDO::ATTR_STATEMENT_CLASS, [
                        'LoggedPDOStatement', [self::getInstance()]
                    ]);
                }
                
            } catch (PDOException $e) {
                self::logError("Datenbankverbindung fehlgeschlagen: " . $e->getMessage());
                throw new Exception("Datenbankfehler aufgetreten");
            }
        }
        
        return self::$connection;
    }
    
    /**
     * Führt eine SELECT-Abfrage aus
     *
     * @param string $query SQL-Query
     * @param array $params Parameter für Prepared Statement
     * @param string $fetchMode Fetch-Modus (assoc, obj, all)
     * @return mixed Abfrageergebnis
     * @throws Exception Bei SQL-Fehlern
     */
    public static function query(string $query, array $params = [], string $fetchMode = 'all'): mixed {
        try {
            $pdo = self::getConnection();
            $stmt = $pdo->prepare($query);
            
            // Parameter binden
            foreach ($params as $key => $value) {
                $paramType = is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR;
                $stmt->bindValue($key, $value, $paramType);
            }
            
            $stmt->execute();
            
            // Query-Logging (nur in Entwicklung)
            if (DatabaseConfig::ENVIRONMENT === 'development') {
                self::getInstance()->queryLog[] = [
                    'query' => $query,
                    'params' => $params,
                    'timestamp' => date('Y-m-d H:i:s')
                ];
            }
            
            // Fetch-Modus bestimmen
            switch ($fetchMode) {
                case 'one':
                    return $stmt->fetch();
                case 'assoc':
                    return $stmt->fetchAll(PDO::FETCH_ASSOC);
                case 'obj':
                    return $stmt->fetchAll(PDO::FETCH_OBJ);
                case 'column':
                    return $stmt->fetchColumn();
                default:
                    return $stmt->fetchAll();
            }
            
        } catch (PDOException $e) {
            self::logError("SQL-Fehler: " . $e->getMessage() . " | Query: " . $query);
            throw new Exception("Datenbankabfrage fehlgeschlagen");
        }
    }
    
    /**
     * Führt eine INSERT-Abfrage aus
     *
     * @param string $table Tabellenname
     * @param array $data Zu insertierende Daten
     * @return int Letzte eingefügte ID
     * @throws Exception Bei SQL-Fehlern
     */
    public static function insert(string $table, array $data): int {
        try {
            $columns = implode(',', array_keys($data));
            $placeholders = ':' . implode(', :', array_keys($data));
            
            $query = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
            
            $pdo = self::getConnection();
            $stmt = $pdo->prepare($query);
            $stmt->execute($data);
            
            // Audit-Log erstellen
            $insertId = (int)$pdo->lastInsertId();
            self::createAuditLog('INSERT', $table, $insertId, null, $data);
            
            return $insertId;
            
        } catch (PDOException $e) {
            self::logError("INSERT-Fehler: " . $e->getMessage() . " | Table: " . $table);
            throw new Exception("Daten konnten nicht gespeichert werden");
        }
    }
    
    /**
     * Führt eine UPDATE-Abfrage aus
     *
     * @param string $table Tabellenname
     * @param array $data Zu updatende Daten
     * @param array $where WHERE-Bedingungen
     * @return int Anzahl betroffener Zeilen
     * @throws Exception Bei SQL-Fehlern
     */
    public static function update(string $table, array $data, array $where): int {
        try {
            // Alte Daten für Audit-Log laden
            $oldData = self::selectOne($table, $where);
            
            $setClause = [];
            foreach ($data as $key => $value) {
                $setClause[] = "{$key} = :{$key}";
            }
            
            $whereClause = [];
            foreach ($where as $key => $value) {
                $whereClause[] = "{$key} = :where_{$key}";
                $data["where_{$key}"] = $value;
            }
            
            $query = "UPDATE {$table} SET " . implode(', ', $setClause) . 
                     " WHERE " . implode(' AND ', $whereClause);
            
            $pdo = self::getConnection();
            $stmt = $pdo->prepare($query);
            $stmt->execute($data);
            
            $affectedRows = $stmt->rowCount();
            
            // Audit-Log erstellen
            if ($affectedRows > 0 && $oldData) {
                self::createAuditLog('UPDATE', $table, $where['id'] ?? null, $oldData, array_diff_key($data, array_flip(array_keys($where))));
            }
            
            return $affectedRows;
            
        } catch (PDOException $e) {
            self::logError("UPDATE-Fehler: " . $e->getMessage() . " | Table: " . $table);
            throw new Exception("Daten konnten nicht aktualisiert werden");
        }
    }
    
    /**
     * Führt eine DELETE-Abfrage aus
     *
     * @param string $table Tabellenname
     * @param array $where WHERE-Bedingungen
     * @return int Anzahl gelöschter Zeilen
     * @throws Exception Bei SQL-Fehlern
     */
    public static function delete(string $table, array $where): int {
        try {
            // Alte Daten für Audit-Log laden
            $oldData = self::selectOne($table, $where);
            
            $whereClause = [];
            foreach ($where as $key => $value) {
                $whereClause[] = "{$key} = :{$key}";
            }
            
            $query = "DELETE FROM {$table} WHERE " . implode(' AND ', $whereClause);
            
            $pdo = self::getConnection();
            $stmt = $pdo->prepare($query);
            $stmt->execute($where);
            
            $affectedRows = $stmt->rowCount();
            
            // Audit-Log erstellen
            if ($affectedRows > 0 && $oldData) {
                self::createAuditLog('DELETE', $table, $where['id'] ?? null, $oldData, null);
            }
            
            return $affectedRows;
            
        } catch (PDOException $e) {
            self::logError("DELETE-Fehler: " . $e->getMessage() . " | Table: " . $table);
            throw new Exception("Daten konnten nicht gelöscht werden");
        }
    }
    
    /**
     * Lädt einen einzelnen Datensatz
     *
     * @param string $table Tabellenname
     * @param array $where WHERE-Bedingungen
     * @return array|null Datensatz oder null
     */
    public static function selectOne(string $table, array $where): ?array {
        $whereClause = [];
        foreach ($where as $key => $value) {
            $whereClause[] = "{$key} = :{$key}";
        }
        
        $query = "SELECT * FROM {$table} WHERE " . implode(' AND ', $whereClause) . " LIMIT 1";
        $result = self::query($query, $where, 'one');
        
        return $result ?: null;
    }
    
    /**
     * Startet eine Datenbanktransaktion
     *
     * @return bool
     */
    public static function beginTransaction(): bool {
        return self::getConnection()->beginTransaction();
    }
    
    /**
     * Bestätigt eine Transaktion
     *
     * @return bool
     */
    public static function commit(): bool {
        return self::getConnection()->commit();
    }
    
    /**
     * Bricht eine Transaktion ab
     *
     * @return bool
     */
    public static function rollback(): bool {
        return self::getConnection()->rollBack();
    }
    
    /**
     * Führt eine Transaktion aus
     *
     * @param callable $callback Funktion die in der Transaktion ausgeführt wird
     * @return mixed Rückgabewert der Callback-Funktion
     * @throws Exception Bei Transaktionsfehlern
     */
    public static function transaction(callable $callback): mixed {
        try {
            self::beginTransaction();
            $result = $callback();
            self::commit();
            return $result;
        } catch (Exception $e) {
            self::rollback();
            throw $e;
        }
    }
    
    /**
     * Erstellt einen Audit-Log-Eintrag
     *
     * @param string $action Aktion (INSERT, UPDATE, DELETE)
     * @param string $table Tabellenname
     * @param int|null $recordId Datensatz-ID
     * @param array|null $oldValues Alte Werte
     * @param array|null $newValues Neue Werte
     */
    private static function createAuditLog(string $action, string $table, ?int $recordId, ?array $oldValues, ?array $newValues): void {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            
            $auditData = [
                'user_id' => $userId,
                'action' => $action,
                'table_name' => $table,
                'record_id' => $recordId,
                'old_values' => $oldValues ? json_encode($oldValues) : null,
                'new_values' => $newValues ? json_encode($newValues) : null,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent
            ];
            
            $pdo = self::getConnection();
            $stmt = $pdo->prepare("
                INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
                VALUES (:user_id, :action, :table_name, :record_id, :old_values, :new_values, :ip_address, :user_agent)
            ");
            $stmt->execute($auditData);
            
        } catch (PDOException $e) {
            // Audit-Log-Fehler nicht weiterwerfen, nur loggen
            self::logError("Audit-Log-Fehler: " . $e->getMessage());
        }
    }
    
    /**
     * Loggt Fehler in Datei
     *
     * @param string $message Fehlermeldung
     */
    private static function logError(string $message): void {
        $logFile = AppConfig::LOG_DIR . 'database_errors.log';
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] {$message}" . PHP_EOL;
        
        // Prüfen ob Log-Verzeichnis existiert
        if (!is_dir(AppConfig::LOG_DIR)) {
            mkdir(AppConfig::LOG_DIR, 0750, true);
        }
        
        error_log($logEntry, 3, $logFile);
    }
    
    /**
     * Gibt Query-Log zurück (nur in Entwicklung)
     *
     * @return array
     */
    public function getQueryLog(): array {
        return $this->queryLog;
    }
    
    /**
     * Bereinigt alte Sessions
     */
    public static function cleanupSessions(): void {
        try {
            self::query("DELETE FROM sessions WHERE expires_at < NOW() OR last_activity < DATE_SUB(NOW(), INTERVAL 1 DAY)");
        } catch (Exception $e) {
            self::logError("Session-Cleanup-Fehler: " . $e->getMessage());
        }
    }
    
    /**
     * Erstellt Datenbankbackup (vereinfacht)
     *
     * @param string $backupPath Pfad für Backup-Datei
     * @return bool Success
     */
    public static function createBackup(string $backupPath): bool {
        try {
            $config = DatabaseConfig::getConfig();
            
            $command = sprintf(
                'mysqldump --user=%s --password=%s --host=%s --port=%d %s > %s',
                escapeshellarg($config['username']),
                escapeshellarg($config['password']),
                escapeshellarg($config['host']),
                $config['port'],
                escapeshellarg($config['database']),
                escapeshellarg($backupPath)
            );
            
            $output = [];
            $returnVar = 0;
            exec($command, $output, $returnVar);
            
            return $returnVar === 0;
            
        } catch (Exception $e) {
            self::logError("Backup-Fehler: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Prüft Datenbankintegrität
     *
     * @return array Integritätsbericht
     */
    public static function checkIntegrity(): array {
        $results = [];
        
        try {
            // Tabellen prüfen
            $tables = self::query("SHOW TABLES", [], 'column');
            $results['tables_count'] = count($tables);
            
            // Inkonsistenzen prüfen
            $results['orphaned_files'] = self::query("
                SELECT COUNT(*) as count FROM incident_files 
                WHERE incident_id NOT IN (SELECT id FROM incident_reports)
            ", [], 'one')['count'];
            
            $results['orphaned_comments'] = self::query("
                SELECT COUNT(*) as count FROM incident_comments 
                WHERE incident_id NOT IN (SELECT id FROM incident_reports)
            ", [], 'one')['count'];
            
            // Datenbankgröße
            $size = self::query("
                SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
            ", [], 'one');
            $results['database_size_mb'] = $size['size_mb'] ?? 0;
            
        } catch (Exception $e) {
            $results['error'] = $e->getMessage();
        }
        
        return $results;
    }
}

/**
 * Erweiterte PDOStatement-Klasse für Query-Logging
 */
class LoggedPDOStatement extends PDOStatement {
    private Database $logger;
    
    protected function __construct(Database $logger) {
        $this->logger = $logger;
    }
    
    public function execute(?array $params = null): bool {
        $start = microtime(true);
        $result = parent::execute($params);
        $end = microtime(true);
        
        // Query-Performance loggen
        if (($end - $start) > 1.0) { // Slow queries > 1 Sekunde
            error_log("Slow Query: " . $this->queryString . " | Time: " . ($end - $start) . "s");
        }
        
        return $result;
    }
}
?>