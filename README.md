# Ejenex-Proyecto
Repositorio para trabajar con el proyecto de Ejenex
# pagina_ejenex
## Cómo correr el proyecto en local

1. Clona el repositorio.
2. Abre la carpeta en VS Code.
3. Instala la extensión "Live Server".
4. Abre `src/index.html` y haz clic en "Open with Live Server".

Organización del proyecto y uso de endpoints

Este proyecto utiliza Supabase como backend (BaaS) y una arquitectura Frontend-first, donde toda la comunicación con la base de datos se realiza mediante módulos JavaScript bien definidos.

Estructura general
src/
 ├─ js/
 │   ├─ core/                # Configuración base (auth, supabaseClient, helpers)
 │   ├─ modules/             # AQUÍ van los endpoints lógicos
 │   │   └─ groups/
 │   │       ├─ groups.api.js        # Funciones públicas tipo endpoint
 │   │       ├─ groups.controller.js # Lógica de negocio
 │   │       └─ groups.service.js    # Acceso directo a Supabase
 │   ├─ main.js
 │
 ├─ pages/
 │   ├─ public/              # Páginas públicas
 │   └─ admin/               # Vistas administrativas
 │
 ├─ supabase/
 │   ├─ policies.sql         # Row Level Security
 │   ├─ seed.sql             # Datos iniciales
 │   └─ migrations/          # Cambios estructurales

¿Dónde deben ir los “endpoints”?

NO se crean endpoints HTTP tradicionales (Express, rutas REST, etc.)

En su lugar, cada módulo tiene endpoints lógicos escritos en JavaScript:

Ruta obligatoria

src/js/modules/<modulo>/<modulo>.api.js

Ejemplo (Groups)
// groups.api.js
export async function postAdminGroups(data) {
  // Validaciones de permisos
  // Llamada a controller
}


Estos métodos se comportan como endpoints y son los únicos que deben ser llamados desde la UI.

1. Separación de responsabilidades (OBLIGATORIO)
1️api.js (endpoint lógico)

Punto de entrada desde la UI

Valida permisos (admin, usuario autenticado, etc.)

NO accede directamente a Supabase

2. controller.js (lógica de negocio)

Reglas de negocio

Validaciones

Orquestación de datos

3. service.js (acceso a datos)

Llamadas directas a Supabase (select, insert, update)

NO contiene lógica de permisos

❌ No usar supabase.from() directamente en HTML o UI
❌ No escribir SQL en el frontend
❌ No saltarse los módulos
❌ No usar service_role key en frontend

Seguridad

Todas las operaciones están protegidas por Row Level Security (RLS)

El rol del usuario se valida contra la tabla profiles

Aunque el frontend falle, la base de datos bloquea accesos no autorizados

Pruebas

Para pruebas locales se pueden usar archivos temporales como:

src/js/test-*.js


Flujo recomendado para agregar un nuevo endpoint

Crear carpeta del módulo (si no existe)

Agregar función en *.api.js

Implementar lógica en controller.js

Acceso a datos en service.js

Validar permisos con RLS en Supabase

Documentar el endpoint en docs/api.md