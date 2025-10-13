# 🧪 ChatKit Test Page - Guía de Uso

## 📋 **Descripción**

La página de prueba de ChatKit es una herramienta completa para testear la integración de ChatKit con Jira. Permite simular el flujo completo de mensajes desde el widget hasta Jira y viceversa.

## 🚀 **Acceso**

- **URL**: `http://localhost:5173/dashboard/chatkit-test`
- **Navegación**: Menú lateral → "ChatKit Test"
- **Autenticación**: Requiere estar logueado

## 🎯 **Funcionalidades**

### **1. Configuración de Prueba**
- **Issue Key**: Ticket de Jira para las pruebas (ej: DEMO-123)
- **Nombre del Cliente**: Nombre del usuario que envía mensajes
- **Email del Cliente**: Email del usuario

### **2. Pruebas Disponibles**

#### **🔗 Conectar al Ticket**
- Crea una sesión de ChatKit para el ticket especificado
- Establece la conexión inicial
- Muestra el ID de sesión generado

#### **📤 Enviar Mensaje**
- Envía un mensaje del widget a Jira
- Procesa la respuesta usando ChatKit
- Simula la respuesta del asistente

#### **🔄 Probar Webhook**
- Simula un comentario de Jira
- Procesa el webhook usando ChatKit
- Genera respuesta automática

#### **📊 Estado de Sesión**
- Verifica si hay una sesión activa
- Muestra el estado de conexión

### **3. Chat en Tiempo Real**
- **Interfaz de chat** similar al widget real
- **Mensajes del usuario** (azul, lado derecho)
- **Respuestas del asistente** (gris, lado izquierdo)
- **Mensajes del sistema** (amarillo, centrado)

### **4. Mensajes Rápidos**
- Botones predefinidos con mensajes comunes
- Facilita las pruebas rápidas
- Incluye: "Hola", "Soporte técnico", "Crear ticket", etc.

## 🧪 **Flujo de Prueba Recomendado**

### **Paso 1: Configuración Inicial**
1. Configurar el **Issue Key** (ej: DEMO-123)
2. Configurar **Nombre** y **Email** del cliente
3. Hacer clic en **"Conectar al Ticket"**

### **Paso 2: Prueba de Mensaje**
1. Escribir un mensaje en el chat
2. Hacer clic en **"Enviar"** o presionar Enter
3. Verificar que aparezca la respuesta del asistente

### **Paso 3: Prueba de Webhook**
1. Hacer clic en **"Probar Webhook"**
2. Verificar que se procese el comentario de Jira
3. Confirmar que se genere una respuesta

### **Paso 4: Verificación de Estado**
1. Hacer clic en **"Estado de Sesión"**
2. Verificar que la sesión esté activa
3. Confirmar la conexión

## 📊 **Panel de Resultados**

### **Indicadores de Estado**
- ✅ **Verde**: Operación exitosa
- ❌ **Rojo**: Error en la operación
- 🔄 **Amarillo**: Operación en progreso

### **Detalles de Respuesta**
- **Mensaje**: Descripción del resultado
- **Datos**: Información técnica (expandible)
- **Timestamp**: Hora de la operación

## 🔧 **Configuración Técnica**

### **Endpoints Utilizados**
```
POST /api/chatkit/widget/connect
POST /api/chatkit/widget/send
POST /api/chatkit/webhook/jira
GET /api/chatkit/session/:issueKey
```

### **Variables de Entorno Requeridas**
```env
OPENAI_API_KEY=sk-...
OPENAI_CHATKIT_WORKFLOW_ID=wf_...
```

## 🚨 **Solución de Problemas**

### **Error: "No autenticado"**
- Verificar que estés logueado
- Refrescar la página
- Verificar el token de autenticación

### **Error: "No se puede conectar al ticket"**
- Verificar que el backend esté funcionando
- Confirmar que las variables de entorno estén configuradas
- Revisar los logs del servidor

### **Error: "Workflow no encontrado"**
- Verificar que el workflow esté publicado en Agent Builder
- Confirmar que el Workflow ID sea correcto
- Revisar la configuración del system message

### **No se reciben respuestas**
- Verificar que el workflow esté publicado
- Confirmar que tenga un system message configurado
- Revisar los logs de ChatKit

## 📝 **Logs y Debugging**

### **Consola del Navegador**
- Abrir DevTools (F12)
- Revisar la pestaña "Console"
- Buscar errores o mensajes de debug

### **Logs del Backend**
```bash
cd newChat
npm run dev
# Revisar los logs en la consola
```

### **Logs de ChatKit**
- Verificar en Agent Builder
- Revisar el estado del workflow
- Confirmar que esté publicado

## 🎯 **Casos de Uso**

### **1. Desarrollo**
- Probar nuevas funcionalidades
- Verificar integraciones
- Debug de problemas

### **2. Testing**
- Validar flujos completos
- Probar diferentes escenarios
- Verificar respuestas del asistente

### **3. Demostración**
- Mostrar funcionalidades
- Explicar el flujo
- Validar con stakeholders

## 🔄 **Integración con Widget Real**

La página de prueba simula el mismo flujo que el widget real:

1. **Widget** → Envía mensaje
2. **Backend** → Procesa con ChatKit
3. **Jira** → Recibe comentario
4. **Webhook** → Procesa respuesta
5. **ChatKit** → Genera respuesta
6. **Jira** → Recibe respuesta
7. **WebSocket** → Notifica al widget

## 📚 **Recursos Adicionales**

- [Documentación de ChatKit](https://platform.openai.com/docs/chatkit)
- [Agent Builder](https://platform.openai.com/agent-builder)
- [API de OpenAI](https://platform.openai.com/docs/api-reference)

---

**¡La página de prueba está lista para usar!** 🚀

