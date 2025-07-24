# QHSE Login System - Installationsanleitung
## Sichere Installation und Konfiguration

### 1. Systemanforderungen

#### 1.1 Minimale Anforderungen
- **Webserver**: Apache 2.4+ oder Nginx 1.18+
- **PHP**: Version 8.0 oder höher
- **MySQL**: Version 8.0+ oder MariaDB 10.5+
- **SSL-Zertifikat**: Für HTTPS-Verschlüsselung
- **Speicherplatz**: Mindestens 500 MB freier Speicherplatz

#### 1.2 Empfohlene PHP-Erweiterungen
```bash
php-mysql
php-mbstring
php-json
php-openssl
php-session
php-curl
php-filter
```

### 2. Installation Schritt-für-Schritt

#### 2.1 Dateien herunterladen
```bash
# Repository klonen oder Dateien herunterladen
git clone https://github.com/your-repo/qhse-login-system.git
cd qhse-login-system
```

#### 2.2 Verzeichnisstruktur einrichten
```
qhse-login-system/
├── login.html
├── login-styles.css
├── login-security.js
├── login-app.js
├── backend/
│   ├── config.php
│   ├── auth.php
│   ├── api.php
│   └── database.sql
├── .env.example
├── .htaccess
└── README.md
```

#### 2.3 Umgebungskonfiguration
```bash
# Environment-Datei erstellen
cp .env.example .env

# Environment-Variablen konfigurieren
nano .env
```

**Beispiel .env-Datei:**
```env
# Umgebung
ENVIRONMENT=production

# Datenbank
DB_HOST=localhost
DB_PORT=3306
DB_NAME=qhse_system
DB_USERNAME=qhse_user
DB_PASSWORD=SecurePassword123!

# Anwendung
BASE_URL=https://your-domain.com
MAINTENANCE_MODE=false

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/qhse/application.log

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=noreply@example.com
SMTP_PASSWORD=EmailPassword123!
SMTP_ENCRYPTION=tls
FROM_EMAIL=noreply@qhse.example.com
```

### 3. Datenbank-Setup

#### 3.1 Datenbank erstellen
```sql
-- Als MySQL Root-Benutzer ausführen
CREATE DATABASE qhse_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Anwendungsbenutzer erstellen
CREATE USER 'qhse_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';
GRANT SELECT, INSERT, UPDATE, DELETE ON qhse_system.* TO 'qhse_user'@'localhost';
GRANT EXECUTE ON qhse_system.* TO 'qhse_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 3.2 Schema installieren
```bash
# Schema importieren
mysql -u qhse_user -p qhse_system < backend/database.sql
```

#### 3.3 Standard-Benutzer konfigurieren
Die Datenbank wird mit zwei Standard-Benutzern erstellt:

**Admin-Account:**
- Firmenname: `QHSE GFT`
- Passwort: `SecureQHSE2024!`

**Demo-Account:**
- Firmenname: `Demo Company`
- Passwort: `Demo123!`

> **Wichtig**: Ändern Sie diese Passwörter nach der Installation!

### 4. Webserver-Konfiguration

#### 4.1 Apache-Konfiguration
```apache
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /var/www/qhse-login-system
    
    # SSL-Konfiguration
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # Sicherheits-Header
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    
    # PHP-Konfiguration
    php_value session.cookie_httponly 1
    php_value session.cookie_secure 1
    php_value session.cookie_samesite Strict
    php_value session.use_strict_mode 1
    
    # Log-Dateien
    ErrorLog ${APACHE_LOG_DIR}/qhse_error.log
    CustomLog ${APACHE_LOG_DIR}/qhse_access.log combined
</VirtualHost>

# HTTP zu HTTPS Weiterleitung
<VirtualHost *:80>
    ServerName your-domain.com
    Redirect permanent / https://your-domain.com/
</VirtualHost>
```

#### 4.2 .htaccess-Datei
```apache
# QHSE Login System - Apache Konfiguration

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Content Security Policy
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:"

# HTTPS Redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Directory Index
DirectoryIndex login.html

# File Access Protection
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

<Files "*.md">
    Order allow,deny
    Deny from all
</Files>

# PHP Security
php_value expose_php 0
php_value display_errors 0
php_value log_errors 1
```

#### 4.3 Nginx-Konfiguration (Alternative)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    root /var/www/qhse-login-system;
    index login.html;
    
    # SSL-Konfiguration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Sicherheits-Header
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    
    # PHP-Verarbeitung
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    # Dateischutz
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(md|env)$ {
        deny all;
    }
}
```

### 5. PHP-Konfiguration

#### 5.1 Empfohlene php.ini Einstellungen
```ini
# Grundeinstellungen
max_execution_time = 30
memory_limit = 256M
post_max_size = 10M
upload_max_filesize = 10M

# Sicherheit
expose_php = Off
display_errors = Off
log_errors = On
error_log = /var/log/php/error.log

# Session
session.cookie_httponly = 1
session.cookie_secure = 1
session.cookie_samesite = Strict
session.use_strict_mode = 1
session.gc_maxlifetime = 3600

# Sicherheitsfeatures
allow_url_include = Off
allow_url_fopen = Off
disable_functions = exec,passthru,shell_exec,system,proc_open,popen
```

### 6. Logging-Setup

#### 6.1 Log-Verzeichnisse erstellen
```bash
# Log-Verzeichnisse erstellen
sudo mkdir -p /var/log/qhse
sudo mkdir -p /var/log/php

# Berechtigungen setzen
sudo chown www-data:www-data /var/log/qhse
sudo chown www-data:www-data /var/log/php
sudo chmod 755 /var/log/qhse
sudo chmod 755 /var/log/php
```

#### 6.2 Logrotate-Konfiguration
```bash
# /etc/logrotate.d/qhse
/var/log/qhse/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    create 644 www-data www-data
    postrotate
        /usr/sbin/service apache2 reload > /dev/null 2>&1 || true
    endscript
}
```

### 7. Sicherheitshärtung

#### 7.1 Dateiberechtigungen
```bash
# Verzeichnisberechtigungen
find /var/www/qhse-login-system -type d -exec chmod 755 {} \;

# Dateiberechtigungen
find /var/www/qhse-login-system -type f -exec chmod 644 {} \;

# Spezielle Berechtigungen
chmod 600 /var/www/qhse-login-system/.env
chmod 644 /var/www/qhse-login-system/backend/*.php

# Besitzer setzen
chown -R www-data:www-data /var/www/qhse-login-system
```

#### 7.2 Firewall-Konfiguration
```bash
# UFW Firewall (Ubuntu/Debian)
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable

# Oder iptables
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```

### 8. Testing & Validierung

#### 8.1 Funktionstest
```bash
# Frontend-Test
curl -I https://your-domain.com/login.html

# Backend-Test
curl -X POST -H "Content-Type: application/json" \
     -d '{"companyName":"Demo Company","password":"Demo123!"}' \
     https://your-domain.com/backend/api.php/login
```

#### 8.2 Sicherheitstest
```bash
# SSL-Test
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Header-Test
curl -I https://your-domain.com/login.html | grep -E "(X-.*|Strict-Transport|Content-Security)"
```

### 9. Wartung & Monitoring

#### 9.1 Automatische Updates
```bash
# Cron-Job für System-Updates (täglich)
echo "0 2 * * * root apt update && apt upgrade -y" >> /etc/crontab

# Database Cleanup (stündlich)
echo "0 * * * * www-data mysql -u qhse_user -p'password' qhse_system -e 'CALL CleanupExpiredSessions();'" >> /etc/crontab
```

#### 9.2 Monitoring-Script
```bash
#!/bin/bash
# /usr/local/bin/qhse-health-check.sh

# System-Status prüfen
if ! systemctl is-active --quiet apache2; then
    echo "CRITICAL: Apache2 not running" | mail -s "QHSE System Alert" admin@example.com
fi

# Datenbank-Status prüfen
if ! mysql -u qhse_user -p"$DB_PASSWORD" -e "SELECT 1" qhse_system &>/dev/null; then
    echo "CRITICAL: Database connection failed" | mail -s "QHSE System Alert" admin@example.com
fi

# SSL-Zertifikat prüfen
EXPIRY=$(openssl x509 -in /path/to/certificate.crt -noout -enddate | cut -d= -f2)
EXPIRY_DATE=$(date -d "$EXPIRY" +%s)
CURRENT_DATE=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_DATE - $CURRENT_DATE) / 86400 ))

if [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
    echo "WARNING: SSL certificate expires in $DAYS_UNTIL_EXPIRY days" | mail -s "QHSE SSL Alert" admin@example.com
fi
```

### 10. Backup & Recovery

#### 10.1 Backup-Script
```bash
#!/bin/bash
# /usr/local/bin/qhse-backup.sh

BACKUP_DIR="/backup/qhse"
DATE=$(date +%Y%m%d_%H%M%S)

# Datenbank-Backup
mysqldump -u qhse_user -p"$DB_PASSWORD" qhse_system > "$BACKUP_DIR/db_backup_$DATE.sql"

# Datei-Backup
tar -czf "$BACKUP_DIR/files_backup_$DATE.tar.gz" /var/www/qhse-login-system

# Alte Backups löschen (älter als 30 Tage)
find "$BACKUP_DIR" -name "*.sql" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete
```

#### 10.2 Recovery-Prozedur
```bash
# Datenbank wiederherstellen
mysql -u qhse_user -p qhse_system < /backup/qhse/db_backup_YYYYMMDD_HHMMSS.sql

# Dateien wiederherstellen
tar -xzf /backup/qhse/files_backup_YYYYMMDD_HHMMSS.tar.gz -C /
```

### 11. Troubleshooting

#### 11.1 Häufige Probleme

**Problem: 500 Internal Server Error**
```bash
# Lösung: Log-Dateien prüfen
tail -f /var/log/apache2/error.log
tail -f /var/log/qhse/application.log
```

**Problem: Datenbankverbindung fehlgeschlagen**
```bash
# Lösung: Verbindung testen
mysql -u qhse_user -p -h localhost qhse_system
```

**Problem: Session-Probleme**
```bash
# Lösung: Session-Verzeichnis prüfen
ls -la /var/lib/php/sessions/
sudo chown www-data:www-data /var/lib/php/sessions/
```

### 12. Support & Wartung

#### 12.1 Kontaktinformationen
- **Technical Support**: support@qhse-system.example.com
- **Security Issues**: security@qhse-system.example.com
- **Emergency**: +49 XXX XXXXXXX

#### 12.2 Wartungsverträge
- **Updates**: Monatliche Sicherheitsupdates
- **Monitoring**: 24/7 System-Überwachung
- **Support**: Werktags 9-17 Uhr, Notfall 24/7

---

**Version**: 1.0  
**Datum**: 2024-12-07  
**Nächste Aktualisierung**: 2025-03-07  

Bei Fragen zur Installation wenden Sie sich an das Support-Team.