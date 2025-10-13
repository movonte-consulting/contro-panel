# 🔧 ChatKit Troubleshooting - "No me deja hacer nada"

## 🚨 Problema Identificado

El chat muestra la interfaz pero **no hay campo de entrada de texto** ni funcionalidad interactiva. Esto indica que ChatKit no se está cargando correctamente.

## 🔍 Pasos de Diagnóstico

### **1. Abrir Consola del Navegador**
1. Ve a la página de chat: `http://localhost:5173/dashboard/chat`
2. Presiona `F12` o `Ctrl+Shift+I` para abrir DevTools
3. Ve a la pestaña **"Console"**
4. Busca mensajes que empiecen con:
   - `🔍 ChatKitWidget: Component mounted`
   - `🔍 ChatKit: getClientSecret called`
   - `🔍 useChatKit: createSession called`

### **2. Verificar Estado de Autenticación**
En la consola, deberías ver:
```javascript
🔍 ChatKitWidget: Component mounted {
  isAuthenticated: true,
  user: "tu_usuario",
  isLoading: false,
  error: null,
  isMinimized: false
}
```

### **3. Probar Endpoint ChatKit**
1. En la página de chat, busca el componente **"ChatKit Debug"** en la barra lateral
2. Haz clic en **"Probar Endpoint ChatKit"**
3. Revisa el resultado en la consola

## 🚨 Posibles Problemas y Soluciones

### **Problema 1: Usuario no autenticado**
**Síntomas:**
- `isAuthenticated: false` en la consola
- Error: "Usuario no autenticado"

**Solución:**
1. Asegúrate de estar logueado
2. Verifica que el token JWT sea válido
3. Recarga la página

### **Problema 2: Backend no configurado**
**Síntomas:**
- Error 500 en el test del endpoint
- Error: "Error interno del servidor"

**Solución:**
1. Verifica que el backend esté corriendo
2. Configura las variables de entorno:
   ```env
   OPENAI_API_KEY=tu_api_key
   OPENAI_CHATKIT_WORKFLOW_ID=wf_tu_workflow_id
   ```
3. Reinicia el servidor backend

### **Problema 3: Variables de entorno faltantes**
**Síntomas:**
- Error: "Workflow not found"
- Error: "Invalid API key"

**Solución:**
1. Crea un archivo `.env` en el directorio `newChat/`
2. Agrega las variables:
   ```env
   OPENAI_API_KEY=sk-...
   OPENAI_CHATKIT_WORKFLOW_ID=wf_...
   ```
3. Reinicia el servidor

### **Problema 4: Workflow no creado**
**Síntomas:**
- Error: "Workflow not found"
- Error: "Invalid workflow ID"

**Solución:**
1. Ve a [Agent Builder](https://platform.openai.com/agent-builder)
2. Crea un nuevo workflow
3. Configura el system message:
   ```
   Eres un asistente de IA especializado en ayudar con tareas administrativas y de gestión del sistema Movonte Dashboard. Puedes ayudar con consultas sobre proyectos, usuarios, servicios, tickets y configuraciones del sistema. Responde de manera profesional y útil.
   ```
4. Copia el Workflow ID (formato: `wf_...`)
5. Agrégalo a tu `.env`

### **Problema 5: API Key inválida**
**Síntomas:**
- Error: "Invalid API key"
- Error: "Unauthorized"

**Solución:**
1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Verifica que tu API key sea válida
3. Asegúrate de que tenga permisos para ChatKit
4. Verifica que tengas créditos disponibles

## 🔧 Comandos de Diagnóstico

### **Verificar Backend**
```bash
cd newChat
npm run build
npm start
```

### **Verificar Variables de Entorno**
```bash
# En el directorio newChat
echo $OPENAI_API_KEY
echo $OPENAI_CHATKIT_WORKFLOW_ID
```

### **Probar Endpoint Manualmente**
```bash
curl -X POST http://localhost:3000/api/chatkit/session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_jwt_token" \
  -d '{"userId": 1, "username": "test"}'
```

## 📋 Checklist de Verificación

- [ ] ✅ Usuario autenticado correctamente
- [ ] ✅ Backend corriendo en puerto 3000
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ API Key de OpenAI válida
- [ ] ✅ Workflow ID creado en Agent Builder
- [ ] ✅ Sin errores en consola del navegador
- [ ] ✅ Endpoint ChatKit responde correctamente

## 🆘 Si Nada Funciona

1. **Revisa los logs del backend** en la terminal donde corre el servidor
2. **Verifica la consola del navegador** para errores JavaScript
3. **Prueba el endpoint manualmente** con curl o Postman
4. **Verifica la configuración de red** (CORS, firewall, etc.)

## 📞 Información para Soporte

Si necesitas ayuda, proporciona:
1. **Logs de la consola del navegador**
2. **Logs del servidor backend**
3. **Resultado del test de endpoint**
4. **Configuración de variables de entorno** (sin mostrar la API key)

---

**Nota:** Una vez que identifiques y soluciones el problema, puedes remover el componente `ChatKitDebug` de la página de chat.


