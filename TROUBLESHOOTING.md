# Ghid de Rezolvare Probleme - Sistem Gestionare Mijloace Fixe

## 🚨 Probleme Comune și Soluții

### 1. Probleme cu Baza de Date

#### ❌ Eroare: "relation does not exist" sau "table does not exist"
**Cauza**: Tabelele nu au fost create în baza de date.

**Soluție**:
```bash
# Opțiunea 1: Folosește scriptul batch
start.bat
# Alege opțiunea 5 (Setup complet)

# Opțiunea 2: Manual
node scripts/initDatabase.js
node scripts/seedDatabase.js
```

#### ❌ Eroare: "column does not exist"
**Cauza**: Structura tabelelor nu corespunde cu modelele.

**Soluție**:
```bash
# Reinițializează baza de date
node scripts/initDatabase.js
node scripts/seedDatabase.js
```

#### ❌ Eroare: "connection refused" sau "ECONNREFUSED"
**Cauza**: PostgreSQL nu rulează sau configurația este greșită.

**Soluție**:
1. Verifică că PostgreSQL rulează:
   ```bash
   # Windows
   net start postgresql-x64-14
   
   # Sau verifică în Services (services.msc)
   ```

2. Verifică configurația în `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=mijloace_fixe
   DB_USER=app_user
   DB_PASSWORD=parola_ta
   ```

3. Testează conexiunea manual:
   ```bash
   psql -h localhost -U app_user -d mijloace_fixe
   ```

### 2. Probleme cu Node.js și npm

#### ❌ Eroare: "npm is not recognized"
**Soluție**:
1. Instalează Node.js de pe https://nodejs.org/
2. Restartează terminalul
3. Verifică instalarea: `node --version` și `npm --version`

#### ❌ Eroare: "Cannot find module"
**Soluție**:
```bash
# Reinstalează dependențele
rm -rf node_modules package-lock.json
npm install

# Pentru frontend
cd client
rm -rf node_modules package-lock.json
npm install
```

#### ❌ Eroare: "EACCES permission denied"
**Soluție**:
```bash
# Windows - rulează ca Administrator
# Sau configurează npm pentru directorul local
npm config set prefix %APPDATA%\npm
```

### 3. Probleme cu Scripturile

#### ❌ Script `seedDatabase.js` eșuează
**Diagnostic**:
```bash
# Verifică conexiunea
node scripts/testApplication.js
```

**Soluții**:
1. **Dacă testul 1/6 eșuează**: Problemă de conexiune la baza de date
   - Verifică că PostgreSQL rulează
   - Verifică configurația `.env`

2. **Dacă testul 2/6 eșuează**: Problemă cu modelele
   - Rulează: `node scripts/initDatabase.js`

3. **Dacă testul 3/6 eșuează**: Problemă cu serviciul de codificare
   - Verifică că tabelele sunt populate cu date

#### ❌ Script `testApplication.js` se oprește la pasul 1
**Soluție**:
```bash
# Verifică configurația bazei de date
echo "Testez conexiunea..."
psql -h localhost -U app_user -d mijloace_fixe -c "SELECT version();"

# Dacă eșuează, recreează utilizatorul
psql -U postgres -c "DROP USER IF EXISTS app_user;"
psql -U postgres -c "CREATE USER app_user WITH PASSWORD 'parola123';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE mijloace_fixe TO app_user;"
```

### 4. Probleme cu Frontend-ul

#### ❌ Eroare: "Cannot find module 'react'"
**Soluție**:
```bash
cd client
npm install
```

#### ❌ Eroare: "Port 3000 is already in use"
**Soluție**:
```bash
# Windows - găsește și oprește procesul
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Sau schimbă portul
set PORT=3001 && npm start
```

### 5. Probleme cu Autentificarea

#### ❌ Eroare: "Invalid credentials" la login
**Cauza**: Nu există utilizatori în baza de date.

**Soluție**:
```bash
# Populează baza de date cu utilizatori default
node scripts/seedDatabase.js

# Utilizatori default:
# Username: admin, Password: admin123
```

### 6. Probleme cu API-ul

#### ❌ Eroare: "Cannot GET /api/..."
**Cauza**: Backend-ul nu rulează.

**Soluție**:
```bash
# Pornește backend-ul
npm run dev

# Sau
node server.js
```

#### ❌ Eroare: "CORS policy"
**Soluție**: Verifică că frontend-ul rulează pe portul corect (3000) și backend-ul pe 3001.

## 🔧 Comenzi Utile pentru Diagnostic

### Verificare Sistem
```bash
# Verifică versiunile
node --version
npm --version
psql --version

# Verifică procesele care rulează
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Verifică serviciile PostgreSQL
sc query postgresql*
```

### Verificare Baza de Date
```bash
# Conectează-te la baza de date
psql -h localhost -U app_user -d mijloace_fixe

# În consola PostgreSQL:
\dt                    # Listează tabelele
\d levels             # Descrie tabela levels
\d fixed_assets       # Descrie tabela fixed_assets
SELECT COUNT(*) FROM levels;        # Numără înregistrările
SELECT COUNT(*) FROM fixed_assets;  # Numără mijloacele fixe
\q                    # Ieși
```

### Verificare Aplicație
```bash
# Testează toate componentele
node scripts/testApplication.js

# Testează doar conexiunea
node -e "require('./config/database').authenticate().then(() => console.log('OK')).catch(console.error)"

# Verifică structura modelelor
node -e "console.log(Object.keys(require('./models')))"
```

## 📝 Pași de Rezolvare Sistematică

### Când aplicația nu funcționează deloc:

1. **Verifică cerințele de sistem**:
   ```bash
   node --version    # Trebuie să fie v16+
   npm --version     # Trebuie să existe
   psql --version    # Trebuie să fie v12+
   ```

2. **Verifică serviciile**:
   ```bash
   # PostgreSQL trebuie să ruleze
   net start postgresql-x64-14
   ```

3. **Verifică configurația**:
   ```bash
   # Fișierul .env trebuie să existe și să fie configurat corect
   type .env
   ```

4. **Inițializează baza de date**:
   ```bash
   node scripts/initDatabase.js
   node scripts/seedDatabase.js
   ```

5. **Testează aplicația**:
   ```bash
   node scripts/testApplication.js
   ```

6. **Pornește aplicația**:
   ```bash
   # Backend
   npm run dev
   
   # Frontend (în alt terminal)
   cd client && npm start
   ```

### Când aplicația rulează parțial:

1. **Verifică logs-urile pentru erori**
2. **Testează API-ul manual**: http://localhost:3001/api/levels
3. **Verifică că toate dependențele sunt instalate**
4. **Restartează serviciile**

## 🆘 Când Nimic Nu Funcționează

Dacă toate soluțiile de mai sus eșuează:

1. **Reset complet**:
   ```bash
   # Șterge toate dependențele
   rm -rf node_modules client/node_modules
   rm package-lock.json client/package-lock.json
   
   # Reinstalează tot
   npm install
   cd client && npm install && cd ..
   
   # Reset baza de date
   psql -U postgres -c "DROP DATABASE IF EXISTS mijloace_fixe;"
   psql -U postgres -c "CREATE DATABASE mijloace_fixe;"
   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE mijloace_fixe TO app_user;"
   
   # Reinițializează
   node scripts/initDatabase.js
   node scripts/seedDatabase.js
   ```

2. **Verifică logs-urile detaliate**:
   ```bash
   # Pornește cu debug activat
   DEBUG=* npm run dev
   ```

3. **Contactează suportul** cu următoarele informații:
   - Versiunea Node.js și npm
   - Versiunea PostgreSQL
   - Sistemul de operare
   - Mesajele de eroare complete
   - Pașii urmați până la eroare

---

**Notă**: Acest ghid acoperă cele mai comune probleme. Pentru probleme specifice, consultați logs-urile aplicației și documentația tehnică.