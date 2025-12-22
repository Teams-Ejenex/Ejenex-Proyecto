# Arquitectura del Sistema – EJENEX

## Visión general
El sistema EJENEX se implementa bajo una arquitectura frontend-first, utilizando Supabase como Backend-as-a-Service (BaaS).  
La aplicación no cuenta con un servidor propio; el frontend interactúa directamente con Supabase, delegando la seguridad, autenticación y control de acceso al backend administrado.

---

## Arquitectura general

Navegador (Frontend)
├── UI (HTML/CSS)
├── Lógica de presentación (UI)
├── Controladores
├── Capa de acceso a datos (API Layer)
└── Cliente Supabase
↓
Supabase Backend
├── Auth (auth.users)
├── PostgreSQL (groups, profiles)
└── Row Level Security (RLS + Policies)


---

## Capas del sistema

### 1. Capa de Presentación (UI)
**Ubicación:**  
`src/pages/`

**Responsabilidades:**
- Mostrar formularios y vistas administrativas.
- Capturar datos del usuario.
- Mostrar mensajes de éxito o error.

---

### 2. Capa de Controladores
**Ubicación:**  
`src/js/modules/groups/groups.controller.js`

**Responsabilidades:**
- Orquestar el flujo entre UI, validaciones y API.
- Preparar los datos antes de enviarlos al backend.
- Manejar la lógica de negocio del módulo Groups.

---

### 3. Capa de Acceso a Datos (API Layer)
**Ubicación:**  
`src/js/modules/groups/groups.api.js`

**Responsabilidades:**
- Encapsular todas las interacciones con Supabase.
- Evitar llamadas directas a la base de datos desde la UI.
- Proveer funciones equivalentes a endpoints REST.

---

### 4. Cliente Supabase
**Ubicación:**  
`src/js/core/supabaseClient.js`

**Responsabilidades:**
- Inicializar la conexión con Supabase.
- Gestionar la sesión del usuario autenticado.
- Proveer acceso seguro a la Data API.

---

## Backend (Supabase)

### Base de Datos
- PostgreSQL administrado por Supabase.
- Tablas principales:
  - `groups`
  - `profiles`

### Autenticación
- Supabase Auth (`auth.users`).

### Seguridad
- Row Level Security (RLS) activado.
- Policies para:
  - Lectura pública del catálogo.
  - Inserción exclusiva para administradores.
  - Lectura del perfil propio.

---

## Control de Acceso (RBAC)
- **Admin:** puede crear grupos.
- **Usuario autenticado:** puede consultar su perfil.
- **Público:** puede visualizar el catálogo de grupos.

---

## Decisiones arquitectónicas clave
- Uso de Supabase para eliminar la necesidad de backend propio.
- Separación clara entre UI, controladores y acceso a datos.
- Seguridad implementada exclusivamente en el backend mediante RLS.
- Arquitectura preparada para escalar sin modificar la interfaz.

---

## Cumplimiento de requisitos
- Registro seguro de grupos estudiantiles.
- Validación de roles.
- Persistencia en base de datos.
- Acceso controlado según rol.
