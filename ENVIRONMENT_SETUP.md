# 🔧 Configuración de Variables de Entorno

## 📋 **Variables de Entorno del Frontend**

Para que la página de prueba de ChatKit funcione correctamente, necesitas configurar las siguientes variables de entorno.

### **Crear archivo `.env`**

Crea un archivo `.env` en la raíz del proyecto `movonte-dashboard`:

```bash
# En la raíz de movonte-dashboard/
touch .env
```

### **Contenido del archivo `.env`**

```env
# URL del Backend API
VITE_URL_HOST=https://chat.movonte.com

# Configuración de ChatKit (opcional)
VITE_CHATKIT_WORKFLOW_ID=wf_68e8201822848190bba4d97ecb00a4120acf471c2566d41d

# Configuración de desarrollo
VITE_DEV_MODE=true
VITE_DEBUG_MODE=true
```

## 🚀 **Configuración por Defecto**

Si no configuras las variables de entorno, la aplicación usará estos valores por defecto:

- **API Base URL**: `https://chat.movonte.com`
- **Workflow ID**: `wf_68e8201822848190bba4d97ecb00a4120acf471c2566d41d`
- **Dev Mode**: `false`
- **Debug Mode**: `false`

## 🔧 **Variables Disponibles**

### **VITE_URL_HOST**
- **Descripción**: URL base del backend API
- **Valor por defecto**: `https://chat.movonte.com`
- **Ejemplo**: `VITE_URL_HOST=http://localhost:3000` (para desarrollo local)

### **VITE_CHATKIT_WORKFLOW_ID**
- **Descripción**: ID del workflow de ChatKit
- **Valor por defecto**: `wf_68e8201822848190bba4d97ecb00a4120acf471c2566d41d`
- **Ejemplo**: `VITE_CHATKIT_WORKFLOW_ID=wf_tu_workflow_id_aqui`

### **VITE_DEV_MODE**
- **Descripción**: Habilita modo de desarrollo
- **Valores**: `true` o `false`
- **Efecto**: Habilita logging adicional y funcionalidades de desarrollo

### **VITE_DEBUG_MODE**
- **Descripción**: Habilita logging de debug
- **Valores**: `true` o `false`
- **Efecto**: Muestra logs detallados en la consola del navegador

## 🛠️ **Configuración para Desarrollo Local**

Si estás desarrollando localmente, usa esta configuración:

```env
# Desarrollo local
VITE_URL_HOST=http://localhost:3000
VITE_DEV_MODE=true
VITE_DEBUG_MODE=true
VITE_CHATKIT_WORKFLOW_ID=wf_68e8201822848190bba4d97ecb00a4120acf471c2566d41d
```

## 🚀 **Configuración para Producción**

Para producción, usa esta configuración:

```env
# Producción
VITE_URL_HOST=https://chat.movonte.com
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false
VITE_CHATKIT_WORKFLOW_ID=wf_68e8201822848190bba4d97ecb00a4120acf471c2566d41d
```

## 🔄 **Reiniciar el Servidor**

Después de crear o modificar el archivo `.env`:

1. **Detener el servidor de desarrollo**:
   ```bash
   # Presionar Ctrl+C en la terminal donde corre el servidor
   ```

2. **Reiniciar el servidor**:
   ```bash
   npm run dev
   # o
   yarn dev
   ```

## 🧪 **Verificar Configuración**

Para verificar que las variables están configuradas correctamente:

1. **Abrir la consola del navegador** (F12)
2. **Ir a la página de prueba**: `http://localhost:5173/dashboard/chatkit-test`
3. **Verificar los logs**:
   ```
   [DEBUG] ChatKitTestPage initialized {user: "admin", ticket: "DEMO-123"}
   ```

## 🚨 **Solución de Problemas**

### **Error: "process is not defined"**
- **Causa**: Intentando acceder a `process.env` en el frontend
- **Solución**: Usar `import.meta.env` en lugar de `process.env`

### **Error: "API endpoint not found"**
- **Causa**: URL del backend incorrecta
- **Solución**: Verificar `VITE_URL_HOST` en el archivo `.env`

### **Error: "Workflow not found"**
- **Causa**: Workflow ID incorrecto
- **Solución**: Verificar `VITE_CHATKIT_WORKFLOW_ID` en el archivo `.env`

### **Variables no se cargan**
- **Causa**: Archivo `.env` no encontrado o formato incorrecto
- **Solución**: 
  1. Verificar que el archivo esté en la raíz del proyecto
  2. Verificar que las variables empiecen con `VITE_`
  3. Reiniciar el servidor de desarrollo

## 📚 **Recursos Adicionales**

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)

---

**¡Configuración completada!** 🎉

