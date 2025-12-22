# API – EJENEX (Supabase Backend)

## Descripción general
El sistema EJENEX utiliza Supabase como Backend-as-a-Service (BaaS), proporcionando base de datos PostgreSQL, autenticación y control de acceso mediante Row Level Security (RLS).  
El frontend consume directamente la Data API de Supabase utilizando la Publishable Key, mientras que la seguridad y validaciones se aplican del lado del servidor mediante políticas.

---

## Endpoints lógicos (capa frontend)

> Nota: Supabase no expone endpoints REST personalizados tradicionales; en su lugar, el frontend interactúa con la base de datos mediante la Data API.  
Los siguientes endpoints representan equivalentes funcionales utilizados por el sistema.

---

### POST /admin/groups
**Descripción:**  
Crea un nuevo grupo estudiantil en el sistema.

**Origen frontend:**  
`postAdminGroups(data)`  
Archivo: `src/js/modules/groups/groups.api.js`

**Tabla afectada:**  
`public.groups`

**Autenticación:**  
Requiere usuario autenticado (Supabase Auth).

**Autorización:**  
Solo usuarios con rol `admin` (validado mediante policy RLS).

**Validaciones:**
- Campos obligatorios: `name`, `short_description`
- El nombre del grupo debe ser único.
- El rol del usuario debe ser `admin`.

**Seguridad:**  
Row Level Security + Policy `Admin insert groups`.

**Respuesta exitosa (201):**
```json
{
  "id": "uuid",
  "name": "Grupo EJENEX",
  "short_description": "Descripción del grupo",
  "created_at": "2025-01-01T00:00:00Z"
}

¡Claro! 👍 Tienes razón: en el mensaje anterior te puse los dos documentos seguidos y puede verse confuso.
Aquí te los dejo claramente separados, con títulos grandes y una indicación exacta de en qué archivo va cada uno.

📄 ARCHIVO 1 → docs/api.md

👉 Este contenido va SOLO en docs/api.md

# API – EJENEX (Supabase Backend)

## Descripción general
El sistema EJENEX utiliza Supabase como Backend-as-a-Service (BaaS), proporcionando base de datos PostgreSQL, autenticación y control de acceso mediante Row Level Security (RLS).  
El frontend consume directamente la Data API de Supabase utilizando la Publishable Key, mientras que la seguridad y validaciones se aplican del lado del servidor mediante políticas.

---

## Endpoints lógicos (capa frontend)

> Nota: Supabase no expone endpoints REST personalizados tradicionales; en su lugar, el frontend interactúa con la base de datos mediante la Data API.  
Los siguientes endpoints representan equivalentes funcionales utilizados por el sistema.

---

### POST /admin/groups
**Descripción:**  
Crea un nuevo grupo estudiantil en el sistema.

**Origen frontend:**  
`postAdminGroups(data)`  
Archivo: `src/js/modules/groups/groups.api.js`

**Tabla afectada:**  
`public.groups`

**Autenticación:**  
Requiere usuario autenticado (Supabase Auth).

**Autorización:**  
Solo usuarios con rol `admin` (validado mediante policy RLS).

**Validaciones:**
- Campos obligatorios: `name`, `short_description`
- El nombre del grupo debe ser único.
- El rol del usuario debe ser `admin`.

**Seguridad:**  
Row Level Security + Policy `Admin insert groups`.

**Respuesta exitosa (201):**
```json
{
  "id": "uuid",
  "name": "Grupo EJENEX",
  "short_description": "Descripción del grupo",
  "created_at": "2025-01-01T00:00:00Z"
}

GET /groups

Descripción:
Obtiene el catálogo de grupos estudiantiles registrados.

Origen frontend:
getGroups()
Archivo: src/js/modules/groups/groups.api.js

Tabla consultada:
public.groups

Autenticación:
No requerida (acceso público).

Autorización:
Permitida mediante policy pública de lectura.

Seguridad:
Row Level Security + Policy Public read groups.

Respuesta exitosa (200):

[
  {
    "id": "uuid",
    "name": "Grupo EJENEX",
    "short_description": "Descripción",
    "created_at": "2025-01-01T00:00:00Z"
  }
]

Consideraciones de seguridad

El frontend utiliza únicamente la Publishable Key de Supabase.

Las claves secretas (service_role) no se utilizan en el cliente.

El control de acceso se implementa exclusivamente mediante RLS y policies.

La validación de rol administrador se realiza a nivel de base de datos.

Tecnologías

Supabase (PostgreSQL, Auth, RLS)

JavaScript (ES Modules)

Frontend estático (HTML/CSS/JS)

