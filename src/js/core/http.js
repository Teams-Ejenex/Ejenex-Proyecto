/*
Archivo: http.js
Propósito:
Wrapper centralizado para peticiones HTTP (fetch).

Uso futuro:
- Agregar headers comunes (Authorization).
- Manejo estándar de errores.
- Configuración de CORS y timeouts.
- Reutilizable por todos los módulos.
*/

//Manejo de errores
export async function handleRequest(promise) {
  try {
    return await promise;
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Error interno del sistema'
    };
  }
}
