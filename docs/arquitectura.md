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
Políticas de acceso para rol Administrador (RLS)

La seguridad de acceso se implementa directamente en la base de datos mediante Row Level Security (RLS) en Supabase, lo que garantiza que incluso si el frontend es manipulado, las operaciones no autorizadas serán bloqueadas.

Modelo de roles

El rol del usuario se guarda en public.profiles.role.

profiles.id corresponde a auth.users.id.

Roles considerados: admin (Sprint 1). Roles adicionales pueden agregarse después.

Reglas de acceso definidas (Sprint 1)

Catálogo público

public.groups puede consultarse en modo público.

Política: SELECT permitido para anon y authenticated.

Administración (Admin Web)

Solo usuarios autenticados con profiles.role = 'admin' pueden crear registros en groups.

Política: INSERT permitido solo si existe un registro en profiles con id = auth.uid() y role = 'admin'.

Perfiles

Cada usuario puede consultar únicamente su propio registro en profiles.

Esto es necesario para que la política de admin funcione (validación de rol desde RLS).

Protección adicional

created_by_admin se asigna automáticamente con auth.uid() por defecto, evitando que el cliente defina manualmente al creador.

Para Sprint futuro se contemplan políticas UPDATE y DELETE restringidas a admin.

Validación

Durante pruebas se verificó que un usuario sin rol admin recibe 403 Forbidden al intentar INSERT en groups.

Tras asignar rol admin en profiles, la inserción se permite y retorna Insert OK.

Validación del esquema de Base de Datos

El esquema de la base de datos fue validado y definido mediante migraciones versionadas en Supabase (supabase/migrations), garantizando consistencia, seguridad y trazabilidad de cambios.

Migración inicial (001_init.sql)

La migración inicial define las entidades base del sistema:

Tabla profiles

Relacionada directamente con auth.users.

Almacena el rol del usuario (user / admin).

Garantiza integridad referencial mediante ON DELETE CASCADE.

Tabla groups

Utiliza UUID como clave primaria.

Campos obligatorios: name, short_description.

Campos opcionales para futuras iteraciones: full_description, email, social_links, logo_url.

Auditoría mediante created_at, updated_at.

Relación con el usuario administrador que crea el grupo (created_by_admin), con valor por defecto auth.uid().

Integridad y validaciones

Uso de NOT NULL en campos críticos.

Restricción UNIQUE en el nombre del grupo.

Integridad referencial con auth.users.

Trigger automático para mantener updated_at actualizado en modificaciones.

La seguridad de acceso a los datos se implementa de forma separada mediante Row Level Security (RLS) y políticas declaradas en policies.sql, manteniendo una clara separación entre:

Estructura del modelo de datos

Reglas de acceso y autorización

Este diseño permite escalar el sistema y auditar cambios sin afectar la lógica de negocio del frontend.