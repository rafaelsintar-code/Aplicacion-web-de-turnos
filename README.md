# Sistema de Gestión de Turnos

Aplicación web para gestionar turnos y reservas, desarrollada como proyecto del Primer Examen Parcial de **Programación Web Avanzada**.

Construida íntegramente en React, sin ningún servidor backend. Toda la información se almacena en el navegador del usuario mediante **IndexedDB**.

---

## Tabla de contenidos

- [Demo rápida](#demo-rápida)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Funcionalidades](#funcionalidades)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Rutas](#rutas)
- [Custom hooks](#custom-hooks)
- [Base de datos](#base-de-datos)
- [Resetear datos](#resetear-datos)

---

## Demo rápida

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@turnos.com` | `admin123` |

Al abrir la aplicación por primera vez se crean automáticamente el usuario administrador y 6 turnos de ejemplo para los próximos días.

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| React 18 | UI y lógica de componentes |
| React Router DOM v6 | Rutas anidadas y protegidas |
| Dexie.js | Wrapper de IndexedDB con reactividad |
| Vite | Entorno de desarrollo y bundler |

> **¿Por qué IndexedDB y no localStorage?**
> IndexedDB permite consultas por índice (`where().equals()`), tiene capacidad de cientos de MB frente a los ~5MB de localStorage, su API es asíncrona (no bloquea la UI), y Dexie agrega reactividad automática con `useLiveQuery` — cualquier cambio en la base de datos se refleja en pantalla sin recargar.

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/turnos-app.git
cd turnos-app

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173) en el navegador.

---

## Funcionalidades

### Vista pública `/`
- Lista de turnos disponibles agrupados por fecha
- Cupos restantes en tiempo real
- Formulario de reserva con nombre completo y carnet de identidad (11 dígitos)

### Login `/login`
- Autenticación del administrador
- Sesión persistente al recargar la página
- Sincronización de sesión entre pestañas

### Panel de administración `/admin` *(requiere login)*

**Gestión de turnos** `/admin/turnos`
- Crear, editar y eliminar turnos
- Validación de solapamiento de horarios
- No permite fechas anteriores a la actual
- Al eliminar un turno, sus reservas se cancelan automáticamente

**Gestión de reservas** `/admin/reservas`
- Listado completo con datos del cliente y turno asociado
- Filtro por estado (todas, confirmadas, canceladas)
- Cancelar reserva (cambia el estado, mantiene el registro)
- Eliminar reserva (borra el registro permanentemente)

---

## Estructura del proyecto

```
src/
├── db/
│   └── database.js              # Configuración de Dexie + seed inicial
│
├── context/
│   └── AuthContext.jsx          # Estado global de autenticación
│
├── hooks/
│   ├── useAuth.js               # Acceso al AuthContext con guard
│   ├── useStorage.js            # CRUD directo sobre IndexedDB
│   ├── useTurnos.js             # Lógica de negocio: turnos y solapamientos
│   └── useReservas.js           # Lógica de negocio: reservas y cupos
│
├── components/
│   ├── layouts/
│   │   ├── PublicLayout.jsx     # Header + footer para rutas públicas
│   │   └── AdminLayout.jsx      # Sidebar + Outlet para rutas protegidas
│   │
│   ├── pages/
│   │   ├── TurnosDisponibles.jsx
│   │   └── Login.jsx
│   │
│   ├── admin/
│   │   ├── CRUDTurnos.jsx
│   │   └── ListadoReservas.jsx
│   │
│   └── ui/
│       ├── Modal.jsx            # Modal con React Portal (position fixed real)
│       ├── FormularioTurno.jsx  # Formulario reutilizable crear/editar
│       └── ProtectedRoute.jsx   # Guarda de rutas privadas
│
├── App.jsx                      # Configuración de rutas
└── main.jsx                     # Punto de entrada
```

---

## Rutas

| Ruta | Acceso | Componente |
|---|---|---|
| `/` | Pública | `TurnosDisponibles` |
| `/login` | Pública | `Login` |
| `/admin` | Protegida | Redirige a `/admin/turnos` |
| `/admin/turnos` | Protegida (anidada) | `CRUDTurnos` |
| `/admin/reservas` | Protegida (anidada) | `ListadoReservas` |

Las rutas protegidas verifican autenticación mediante `ProtectedRoute`. Si el usuario no está logueado es redirigido al login, y al autenticarse vuelve a la ruta original.

---

## Custom hooks

### `useAuth`
Provee acceso al `AuthContext` desde cualquier componente. Lanza un error descriptivo si se usa fuera del `AuthProvider`.

### `useStorage`
Único punto de contacto directo con Dexie. Expone operaciones CRUD sin lógica de negocio:
`getTurnos` · `addTurno` · `updateTurno` · `deleteTurno` · `getReservas` · `addReserva` · `cancelReserva` · `getUsuarioByEmail`

### `useTurnos`
Construye sobre `useStorage`. Agrega:
- Datos reactivos con `useLiveQuery`
- Cálculo de `cuposRestantes` y `cuposOcupados` por turno
- Validación de solapamiento de horarios al crear o editar
- Al eliminar un turno, cancela automáticamente sus reservas

### `useReservas`
Construye sobre `useStorage`. Agrega:
- Join manual de reservas con sus turnos (usando `bulkGet`)
- Verificación de cupo disponible al momento de confirmar la reserva
- Expone `hacerReserva`, `cancelarReserva` y `eliminarReserva`

---

## Base de datos

Tres tablas en IndexedDB:

```
turnos   → id, fecha, horaInicio, horaFin, capacidadMaxima, estado
reservas → id, turnoId, nombreCliente, carnetIdentidad, fechaReserva, estado
usuarios → id, email, password, nombre, rol
```

---

## Resetear datos

Para volver al estado inicial (usuario admin + turnos de ejemplo):

1. Abrir las herramientas del navegador (`F12`)
2. Ir a **Application → Storage → IndexedDB**
3. Eliminar la base de datos `TurnosDB`
4. Recargar la página

