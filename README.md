# Sistema de Gestión de Turnos

Proyecto del Primer Examen Parcial — Programación Web Avanzada.

## Credenciales de demo

```
Email:    admin@turnos.com
Password: admin123
```

## Instalación y uso

```bash
npm install
npm run dev
```

Abrir http://localhost:5173

## Tecnologías

- **React 18** + Vite
- **React Router DOM v6** — rutas anidadas y protegidas
- **Dexie.js** — wrapper de IndexedDB con reactividad (`useLiveQuery`)
- Sin backend ni API externa

## ¿Por qué IndexedDB sobre localStorage?

| Aspecto | localStorage | IndexedDB |
|---|---|---|
| Capacidad | ~5 MB | Cientos de MB |
| Consultas por índice | No (sólo clave) | Sí (`where().equals()`) |
| API | Síncrona (bloquea UI) | Asíncrona (no bloquea) |
| Transacciones | No | Sí |
| Reactivo con Dexie | No | Sí (`useLiveQuery`) |

Se elige **IndexedDB** para poder escalar el sistema y aprovechar la reactividad automática de Dexie.

## Estructura de carpetas

```
src/
├── db/
│   └── database.js          # Configuración Dexie + seed inicial
├── context/
│   └── AuthContext.jsx       # Contexto global de autenticación
├── hooks/
│   ├── useAuth.js            # Acceso al AuthContext con guard
│   ├── useStorage.js         # CRUD genérico sobre IndexedDB
│   ├── useTurnos.js          # Lógica de negocio de turnos
│   └── useReservas.js        # Lógica de negocio de reservas
├── components/
│   ├── layouts/
│   │   ├── PublicLayout.jsx  # Envoltorio rutas públicas
│   │   └── AdminLayout.jsx   # Sidebar + Outlet rutas admin
│   ├── pages/
│   │   ├── TurnosDisponibles.jsx
│   │   └── Login.jsx
│   ├── admin/
│   │   ├── CRUDTurnos.jsx
│   │   └── ListadoReservas.jsx
│   └── ui/
│       ├── Modal.jsx
│       ├── FormularioTurno.jsx
│       └── ProtectedRoute.jsx
├── App.jsx                   # Árbol de rutas
└── main.jsx
```

## Rutas

| Ruta | Acceso | Componente |
|---|---|---|
| `/` | Pública | TurnosDisponibles |
| `/login` | Pública | Login |
| `/admin` | Protegida | AdminLayout (redirige a /admin/turnos) |
| `/admin/turnos` | Protegida (anidada) | CRUDTurnos |
| `/admin/reservas` | Protegida (anidada) | ListadoReservas |

## Custom Hooks

### `useAuth`
Provee acceso al `AuthContext`. Lanza error si se usa fuera del proveedor.

### `useStorage`
Encapsula todas las operaciones primitivas sobre IndexedDB:
`getTurnos`, `addTurno`, `updateTurno`, `deleteTurno`, `getReservas`, `addReserva`, `cancelReserva`, `getUsuarioByEmail`.

### `useTurnos`
- Usa `useLiveQuery` para datos reactivos de turnos
- Calcula `cuposRestantes` = capacidad − reservas confirmadas
- Valida **solapamientos horarios** al crear/editar un turno
- Expone: `crearTurno`, `editarTurno`, `eliminarTurno`

### `useReservas`
- Une reservas con sus turnos (join manual en cliente)
- Valida **cupo disponible** antes de confirmar
- Expone: `hacerReserva`, `cancelarReserva`

## Esquema de datos (IndexedDB)

```js
turnos:   { id, fecha, horaInicio, horaFin, capacidadMaxima, estado }
reservas: { id, turnoId, nombreCliente, carnetIdentidad, fechaReserva, estado }
usuarios: { id, email, password, nombre, rol }
```
