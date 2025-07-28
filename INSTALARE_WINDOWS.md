# Ghid de Instalare pentru Windows - Sistem Gestionare Mijloace Fixe

## 🚀 Pași de Instalare pe Windows

### 1. Instalarea Node.js

**Opțiunea 1: Download de pe site oficial**
1. Mergeți la https://nodejs.org/
2. Descărcați versiunea LTS (Long Term Support) - recomandat v18.x sau v20.x
3. Rulați installer-ul `.msi` descărcat
4. Urmați pașii din wizard (acceptați toate setările default)
5. Restartați terminalul/Command Prompt

**Opțiunea 2: Folosind Chocolatey (dacă este instalat)**
```cmd
choco install nodejs
```

**Opțiunea 3: Folosind winget (Windows 10/11)**
```cmd
winget install OpenJS.NodeJS
```

### 2. Verificarea Instalării

Deschideți Command Prompt sau PowerShell și rulați:
```cmd
node --version
npm --version
```

Ar trebui să vedeți versiunile instalate (ex: v18.17.0 și 9.6.7).

### 3. Instalarea PostgreSQL

**Opțiunea 1: Download oficial**
1. Mergeți la https://www.postgresql.org/download/windows/
2. Descărcați installer-ul pentru Windows
3. Rulați installer-ul și urmați pașii:
   - Setați o parolă pentru utilizatorul `postgres` (notați-o!)
   - Portul default 5432 este OK
   - Locale-ul default este OK
4. La final, bifați "Launch Stack Builder" pentru pgAdmin (opțional)

**Opțiunea 2: Folosind Chocolatey**
```cmd
choco install postgresql
```

### 4. Configurarea Bazei de Date

Deschideți Command Prompt ca Administrator și rulați:
```cmd
# Conectarea la PostgreSQL
psql -U postgres

# În consola PostgreSQL, creați baza de date:
CREATE DATABASE mijloace_fixe;
CREATE USER app_user WITH PASSWORD 'parola123';
GRANT ALL PRIVILEGES ON DATABASE mijloace_fixe TO app_user;
\q
```

### 5. Clonarea și Configurarea Proiectului

```cmd
# Navigați în directorul dorit
cd C:\Users\%USERNAME%\Desktop

# Clonați proiectul (dacă este pe Git) sau copiați folderul
# cd automatizare

# Instalați dependențele backend
npm install

# Configurați variabilele de mediu
copy .env.example .env
notepad .env
```

Editați fișierul `.env` cu următoarele setări:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mijloace_fixe
DB_USER=app_user
DB_PASSWORD=parola123

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=secret_foarte_sigur_pentru_dezvoltare
JWT_EXPIRES_IN=24h
```

### 6. Instalarea Dependențelor Frontend

```cmd
cd client
npm install
cd ..
```

### 7. Inițializarea Bazei de Date

```cmd
# Popularea cu date inițiale
node scripts/seedDatabase.js

# Testarea aplicației
node scripts/testApplication.js
```

### 8. Pornirea Aplicației

**Pentru dezvoltare (2 terminale separate):**

Terminal 1 - Backend:
```cmd
npm run dev
```

Terminal 2 - Frontend:
```cmd
cd client
npm start
```

**Pentru producție:**
```cmd
# Build frontend
cd client
npm run build
cd ..

# Start server
npm start
```

### 9. Accesarea Aplicației

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentație API**: http://localhost:3001/api-docs (dacă este configurată)

## 🔧 Troubleshooting Windows

### Probleme Comune

**1. "npm is not recognized"**
- Restartați terminalul după instalarea Node.js
- Verificați că Node.js este în PATH: `echo %PATH%`
- Reinstalați Node.js cu opțiunea "Add to PATH" bifată

**2. "Permission denied" la npm install**
```cmd
# Rulați ca Administrator sau folosiți:
npm install --no-optional
```

**3. Erori la compilarea modulelor native**
```cmd
# Instalați Visual Studio Build Tools
npm install -g windows-build-tools
```

**4. PostgreSQL nu pornește**
```cmd
# Verificați serviciul
net start postgresql-x64-14
# sau
services.msc (căutați PostgreSQL)
```

**5. Portul 3000/3001 este ocupat**
```cmd
# Găsiți procesul care folosește portul
netstat -ano | findstr :3000
# Opriți procesul
taskkill /PID <PID_NUMBER> /F
```

### Comenzi Utile Windows

```cmd
# Verificare porturi ocupate
netstat -ano | findstr :3001

# Oprire proces pe port
for /f "tokens=5" %a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %a

# Verificare servicii PostgreSQL
sc query postgresql*

# Restart serviciu PostgreSQL
net stop postgresql-x64-14
net start postgresql-x64-14
```

## 📝 Scripturi NPM Disponibile

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node scripts/testApplication.js",
    "seed": "node scripts/seedDatabase.js",
    "client": "cd client && npm start",
    "build": "cd client && npm run build",
    "heroku-postbuild": "cd client && npm install && npm run build"
  }
}
```

## 🎯 Următorii Pași

După instalare cu succes:

1. **Testați conexiunea la baza de date**:
   ```cmd
   node scripts/testApplication.js
   ```

2. **Populați baza de date cu date de test**:
   ```cmd
   node scripts/seedDatabase.js
   ```

3. **Porniți aplicația în modul dezvoltare**:
   ```cmd
   npm run dev
   ```

4. **Accesați aplicația la**: http://localhost:3000

5. **Logați-vă cu**:
   - Username: `admin`
   - Password: `admin123`

## 🆘 Suport

Dacă întâmpinați probleme:

1. Verificați că toate serviciile rulează:
   - Node.js: `node --version`
   - npm: `npm --version`
   - PostgreSQL: `psql --version`

2. Verificați logs-urile pentru erori:
   ```cmd
   # Backend logs
   npm run dev

   # Frontend logs
   cd client && npm start
   ```

3. Verificați configurația `.env`

4. Restartați serviciile și terminalele

---

**Notă**: Acest ghid este specific pentru Windows 10/11. Pentru alte versiuni de Windows, pașii pot varia ușor.