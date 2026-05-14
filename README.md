# Turnos Server — con Prisma + PostgreSQL

Backend Express + TypeScript usando **Prisma ORM** con **PostgreSQL**.

---

## Estructura del proyecto

```
turnos-server/
├── prisma/
│   └── schema.prisma   <- Modelos de la BD (Turno, Reserva, Usuario)
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── health.controller.ts
│   │   ├── reservas.controller.ts
│   │   └── turnos.controller.ts
│   ├── db/
│   │   └── prisma.ts       <- Cliente Prisma 
│   ├── middlewares/
│   │   └── validaciones.ts
│   ├── routes/
│   │   └── routes.ts
│   └── index.ts
├── requests.http
├── .env
└── package.json
```

---

## Configuración inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env
# Editar DATABASE_URL en .env
```

### 3. Crear la base de datos en PostgreSQL
```sql
CREATE DATABASE turnos_db;
```

### 4. Ejecutar migraciones
```bash
npm run db:migrate
# o sin historial de migraciones:
npm run db:push
```
