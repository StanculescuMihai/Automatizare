# PAȘI EXACȚI PENTRU A PORNI SITE-UL FUNCȚIONAL

## METODA 1: Pași manuali în CMD (RECOMANDAT)

### Pasul 1: Pornește Backend-ul
```cmd
# Deschide primul CMD în directorul proiectului
cd C:\Users\mihai.stanculescu\Desktop\Automatizare
npm run dev
```
**Lasă acest CMD deschis! Backend-ul va rula pe http://localhost:3001**

### Pasul 2: Pornește Frontend-ul
```cmd
# Deschide al doilea CMD în directorul proiectului
cd C:\Users\mihai.stanculescu\Desktop\Automatizare\client
set SKIP_PREFLIGHT_CHECK=true
set GENERATE_SOURCEMAP=false
npm start
```
**Lasă și acest CMD deschis! Frontend-ul va rula pe http://localhost:3000**

### Pasul 3: Accesează site-ul
- Deschide browser la: **http://localhost:3000**
- Login cu: **admin** / **admin123**

---

## METODA 2: Folosind scripturile create

### Opțiunea A: Script complet
```cmd
reset_and_start.bat
```

### Opțiunea B: Doar backend
```cmd
start_backend_only.bat
```
Apoi manual pentru frontend:
```cmd
cd client
npm start
```

---

## METODA 3: Dacă frontend-ul nu pornește

### Reinstalează dependințele:
```cmd
cd client
rmdir /s /q node_modules
del package-lock.json
npm install --legacy-peer-deps
npm start
```

---

## VERIFICARE RAPIDĂ

### Testează backend-ul:
```cmd
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

### Verifică porturile:
```cmd
netstat -an | findstr :3000
netstat -an | findstr :3001
```

---

## TROUBLESHOOTING

### Dacă vezi erori webpack:
- Ignoră-le dacă aplicația pornește
- Sau folosește versiunea mai veche: `npm install react-scripts@4.0.3`

### Dacă login-ul nu funcționează:
- Verifică că backend-ul rulează pe 3001
- Verifică că frontend-ul rulează pe 3000
- Verifică în Network tab din browser dacă request-urile ajung la backend

---

## COMENZILE ESENȚIALE

```cmd
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend  
cd client
npm start

# Browser
http://localhost:3000
```

**IMPORTANT: Ai nevoie de 2 terminale deschise simultan!**