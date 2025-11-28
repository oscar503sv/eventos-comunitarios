# 📅 App de Eventos Comunitarios

Aplicación móvil para crear, gestionar y participar en eventos comunitarios. Permite a los usuarios organizar eventos, confirmar asistencia y dejar reseñas.

## 🛠️ Tecnologías

| Backend | Frontend |
|---------|----------|
| Node.js + Express | React Native + Expo |
| TypeScript | TypeScript |
| Prisma ORM | React Navigation |
| MySQL | Axios |
| Firebase Admin (Auth) | Firebase (Auth + Google Sign-In) |

## ✨ Características

- **Autenticación:** Login/Registro con email o Google
- **Eventos:** Crear, editar, ver lista y detalles de eventos
- **RSVP:** Confirmar o cancelar asistencia a eventos
- **Reseñas:** Calificar (1-5 ⭐) y comentar eventos pasados
- **Historial:** Ver eventos organizados y asistidos

## 🚀 Instalación

### Requisitos previos
- Node.js 18+
- MySQL
- Cuenta de Firebase (con Authentication habilitado)

### Backend
```bash
cd backend
npm install
# Configurar .env con DATABASE_URL y credenciales Firebase
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Configurar firebase.ts con tus credenciales
npm start
```

## 📁 Estructura
```
├── backend/          # API REST (Express + Prisma)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── middleware/
│   └── prisma/       # Schema y migraciones
└── frontend/         # App móvil (React Native)
    └── src/
        ├── screens/  # Pantallas de la app
        └── config/   # Configuración API y Firebase
```

## 📝 Licencia

Creative Commons Attribution 4.0 International License
