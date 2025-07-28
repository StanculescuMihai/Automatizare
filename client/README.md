# Fixed Assets Management - Frontend

Aplicația React pentru gestionarea mijloacelor fixe.

## Structura Proiectului

```
client/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   └── Layout.tsx          # Layout principal cu navigare
│   │   └── ProtectedRoute/
│   │       └── ProtectedRoute.tsx  # Componenta pentru rute protejate
│   ├── contexts/
│   │   └── AuthContext.tsx         # Context pentru autentificare
│   ├── pages/
│   │   ├── Login/
│   │   │   └── Login.tsx           # Pagina de login
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx       # Dashboard cu statistici
│   │   ├── FixedAssets/
│   │   │   └── FixedAssets.tsx     # Gestionarea mijloacelor fixe
│   │   └── Admin/
│   │       └── Admin.tsx           # Panel de administrare
│   ├── App.tsx                     # Componenta principală
│   └── index.tsx                   # Entry point
├── package.json
└── README.md
```

## Funcționalități Implementate

### 1. Autentificare
- Login cu username și parolă
- JWT token management
- Rute protejate
- Auto-logout la expirarea token-ului

### 2. Layout și Navigare
- Layout responsiv cu Material-UI
- Sidebar cu navigare
- Header cu informații utilizator
- Menu dropdown pentru logout

### 3. Dashboard
- Statistici generale despre mijloacele fixe
- Distribuție pe locații și categorii
- Mijloace fixe adăugate recent
- Grafice și indicatori

### 4. Gestionarea Mijloacelor Fixe
- Listare cu paginare
- Căutare și filtrare avansată
- Vizualizare, editare, ștergere
- Status indicators (activ, inactiv, mentenanță)

### 5. Panel de Administrare
- Gestionarea structurii ierarhice (5 nivele)
- CRUD operații pentru fiecare nivel
- Validare și relații între nivele
- Interface cu tabs pentru fiecare nivel

## Tehnologii Utilizate

- **React 18** cu TypeScript
- **Material-UI (MUI)** pentru componente UI
- **React Router** pentru navigare
- **React Query** pentru state management server
- **Axios** pentru API calls
- **Notistack** pentru notificări

## Instalare și Rulare

```bash
# Instalare dependențe
npm install

# Rulare în modul dezvoltare
npm start

# Build pentru producție
npm run build
```

## Configurare

Aplicația se conectează la backend-ul Node.js care rulează pe portul 3001. 
API endpoints sunt configurate să folosească `/api` ca prefix.

## Structura API

Aplicația consumă următoarele endpoint-uri:

- `POST /api/auth/login` - Autentificare
- `GET /api/dashboard/stats` - Statistici dashboard
- `GET /api/fixed-assets` - Lista mijloace fixe
- `GET /api/levels` - Structura ierarhică
- `POST/PUT/DELETE /api/levels/:id` - CRUD nivele

## Note pentru Dezvoltare

1. **TypeScript Errors**: Erorile TypeScript sunt normale până la instalarea dependențelor cu `npm install`

2. **Material-UI Theme**: Tema este configurată în `App.tsx` cu culori și stiluri personalizate

3. **Responsive Design**: Layout-ul este responsiv și se adaptează la dispozitive mobile

4. **Error Handling**: Toate componentele au gestionarea erorilor implementată

5. **Loading States**: Stări de încărcare pentru toate operațiunile async

## Următorii Pași

1. Instalarea dependențelor npm
2. Implementarea formularelor pentru adăugare/editare mijloace fixe
3. Integrarea cu Google Drive pentru poze
4. Testarea și optimizarea performanței
5. Deployment în producție