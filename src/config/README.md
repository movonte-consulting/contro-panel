# Configuración de la API

## Variables de Entorno

Para configurar la URL del servidor backend, crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# API Configuration
VITE_URL_HOST=https://chat.movonte.com

# Development
NODE_ENV=development
```

## Ejemplos de URLs

```env
# Desarrollo local
VITE_URL_HOST=http://localhost:3000

# Servidor de desarrollo
VITE_URL_HOST=http://localhost:8000

# Producción
VITE_URL_HOST=https://api.tudominio.com

# Staging
VITE_URL_HOST=https://staging-api.tudominio.com
```

## Endpoints Disponibles

Todos los endpoints se construyen automáticamente usando la variable `VITE_URL_HOST`:

- **Login:** `{VITE_URL_HOST}/api/auth/login`
- **Logout:** `{VITE_URL_HOST}/api/auth/logout`
- **Usuarios:** `{VITE_URL_HOST}/api/users`
- **Dashboard:** `{VITE_URL_HOST}/api/dashboard/stats`
- **Reportes:** `{VITE_URL_HOST}/api/reports`

## Uso en el Código

```typescript
import { API_ENDPOINTS } from '../config/api';
import { useApi } from '../hooks/useApi';

const { post } = useApi();

// Hacer una llamada a la API
const response = await post(API_ENDPOINTS.LOGIN, {
  username: 'usuario',
  password: 'contraseña'
});
```

## Notas Importantes

1. **Prefijo VITE_:** Las variables de entorno en Vite deben tener el prefijo `VITE_` para ser accesibles en el frontend.

2. **Reinicio del Servidor:** Después de cambiar el archivo `.env`, reinicia el servidor de desarrollo.

3. **Seguridad:** Nunca commites el archivo `.env` con credenciales reales. Usa `.env.example` para documentar las variables necesarias.
