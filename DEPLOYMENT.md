# Ghid de Deployment - Sistem Gestionare Mijloace Fixe

## 📋 Cerințe de Sistem

### Server Requirements
- **OS**: Ubuntu 20.04 LTS sau CentOS 8+
- **RAM**: Minim 2GB, recomandat 4GB+
- **Storage**: Minim 20GB SSD
- **CPU**: 2 cores minim
- **Network**: Conexiune internet stabilă

### Software Requirements
- **Node.js**: v16.x LTS sau mai nou
- **PostgreSQL**: v12+ 
- **Nginx**: v1.18+ (pentru reverse proxy)
- **PM2**: Pentru process management
- **Git**: Pentru deployment din repository

## 🚀 Pași de Deployment

### 1. Pregătirea Serverului

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Instalare Node.js 16.x LTS
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalare PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Instalare Nginx
sudo apt install nginx -y

# Instalare PM2 global
sudo npm install -g pm2

# Instalare Git
sudo apt install git -y
```

### 2. Configurarea PostgreSQL

```bash
# Switch la utilizatorul postgres
sudo -u postgres psql

# În consola PostgreSQL:
CREATE DATABASE mijloace_fixe;
CREATE USER app_user WITH PASSWORD 'parola_sigura_aici';
GRANT ALL PRIVILEGES ON DATABASE mijloace_fixe TO app_user;
\q
```

### 3. Configurarea Aplicației

```bash
# Crearea directorului aplicației
sudo mkdir -p /var/www/mijloace-fixe
sudo chown $USER:$USER /var/www/mijloace-fixe

# Clonarea repository-ului
cd /var/www/mijloace-fixe
git clone <repository-url> .

# Instalarea dependințelor backend
npm install --production

# Instalarea dependințelor frontend
cd client
npm install
npm run build
cd ..
```

### 4. Configurarea Variabilelor de Mediu

```bash
# Crearea fișierului .env
cp .env.example .env
nano .env
```

Configurați următoarele variabile în `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mijloace_fixe
DB_USER=app_user
DB_PASSWORD=parola_sigura_aici

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=secret_foarte_sigur_generat_random
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Inițializarea Bazei de Date

```bash
# Rularea scriptului de seed
node scripts/seedDatabase.js

# Testarea aplicației
node scripts/testApplication.js
```

### 6. Configurarea PM2

Creați fișierul `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'mijloace-fixe',
    script: 'server.js',
    cwd: '/var/www/mijloace-fixe',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/mijloace-fixe-error.log',
    out_file: '/var/log/pm2/mijloace-fixe-out.log',
    log_file: '/var/log/pm2/mijloace-fixe.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

Pornirea aplicației cu PM2:

```bash
# Start aplicația
pm2 start ecosystem.config.js

# Salvarea configurației PM2
pm2 save

# Auto-start la boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 7. Configurarea Nginx

Creați fișierul `/etc/nginx/sites-available/mijloace-fixe`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # Static files
    location / {
        root /var/www/mijloace-fixe/client/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API routes
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # File upload size
    client_max_body_size 10M;
    
    # Logs
    access_log /var/log/nginx/mijloace-fixe.access.log;
    error_log /var/log/nginx/mijloace-fixe.error.log;
}
```

Activarea site-ului:

```bash
# Link către sites-enabled
sudo ln -s /etc/nginx/sites-available/mijloace-fixe /etc/nginx/sites-enabled/

# Test configurație
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 8. Configurarea SSL cu Let's Encrypt

```bash
# Instalare Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obținerea certificatului SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 9. Configurarea Firewall

```bash
# Activarea UFW
sudo ufw enable

# Permiterea conexiunilor necesare
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 5432  # PostgreSQL (doar dacă accesul extern este necesar)

# Verificarea statusului
sudo ufw status
```

### 10. Backup și Monitoring

#### Script de Backup (`/home/user/backup-db.sh`):

```bash
#!/bin/bash
BACKUP_DIR="/home/user/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="mijloace_fixe"

# Crearea directorului de backup
mkdir -p $BACKUP_DIR

# Backup baza de date
pg_dump -U app_user -h localhost $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Păstrarea doar a ultimelor 7 backup-uri
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql"
```

Configurarea cron job pentru backup zilnic:

```bash
# Editarea crontab
crontab -e

# Adăugarea job-ului (backup zilnic la 2:00 AM)
0 2 * * * /home/user/backup-db.sh
```

#### Monitoring cu PM2:

```bash
# Monitorizarea aplicației
pm2 monit

# Logs în timp real
pm2 logs mijloace-fixe

# Status aplicație
pm2 status
```

## 🔧 Configurări Avansate

### 1. Load Balancing (pentru trafic mare)

Pentru aplicații cu trafic mare, configurați mai multe instanțe:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'mijloace-fixe',
    script: 'server.js',
    instances: 4,  // sau 'max' pentru toate core-urile
    exec_mode: 'cluster'
  }]
};
```

### 2. Redis pentru Session Storage

```bash
# Instalare Redis
sudo apt install redis-server -y

# Configurare în aplicație
npm install redis connect-redis
```

### 3. Monitoring cu Prometheus + Grafana

```bash
# Instalare Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.3.1/node_exporter-1.3.1.linux-amd64.tar.gz
tar xvfz node_exporter-1.3.1.linux-amd64.tar.gz
sudo cp node_exporter-1.3.1.linux-amd64/node_exporter /usr/local/bin/
```

## 🚨 Troubleshooting

### Probleme Comune

1. **Aplicația nu pornește**:
   ```bash
   pm2 logs mijloace-fixe
   # Verificați logs pentru erori
   ```

2. **Erori de conexiune la baza de date**:
   ```bash
   sudo -u postgres psql -c "SELECT version();"
   # Verificați că PostgreSQL rulează
   ```

3. **Nginx 502 Bad Gateway**:
   ```bash
   sudo nginx -t
   curl http://localhost:3001/api/health
   # Verificați că aplicația Node.js rulează
   ```

4. **SSL Certificate Issues**:
   ```bash
   sudo certbot certificates
   sudo certbot renew
   ```

### Comenzi Utile

```bash
# Restart aplicație
pm2 restart mijloace-fixe

# Update aplicație
cd /var/www/mijloace-fixe
git pull origin main
npm install --production
cd client && npm run build && cd ..
pm2 restart mijloace-fixe

# Verificare status servicii
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Logs
sudo tail -f /var/log/nginx/mijloace-fixe.error.log
pm2 logs mijloace-fixe --lines 100
```

## 📊 Metrici de Performanță

### Benchmarks Așteptate
- **Response Time API**: < 200ms (mediu)
- **Page Load Time**: < 2s (first contentful paint)
- **Database Queries**: < 100ms (mediu)
- **Memory Usage**: < 512MB per process
- **CPU Usage**: < 50% în condiții normale

### Optimizări Recomandate
- Activarea compresiei gzip în Nginx
- Configurarea cache-ului pentru assets statice
- Optimizarea query-urilor de bază de date
- Implementarea CDN pentru assets
- Monitorizarea și alertele pentru performanță

---

**Nota**: Acest ghid presupune o configurație standard. Adaptați configurațiile în funcție de cerințele specifice ale infrastructurii voastre.