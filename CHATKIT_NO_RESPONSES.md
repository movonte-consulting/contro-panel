# 🚨 ChatKit: Envía Mensajes pero No Muestra Respuestas

## 🔍 Problema Identificado

El chat se conecta correctamente, envía mensajes, pero **no muestra las respuestas del asistente**. Esto indica un problema en la configuración del workflow o en la comunicación con ChatKit.

## 🚨 Posibles Causas

### **1. Workflow No Configurado Correctamente**
- El Workflow ID no existe o está inactivo
- El workflow no tiene un system message configurado
- El workflow no está publicado

### **2. Configuración del System Message**
- El system message está vacío o mal configurado
- El asistente no sabe cómo responder

### **3. Problema de Conexión con OpenAI**
- La API key no tiene permisos para ChatKit
- El workflow no está asociado a la API key

### **4. Problema de Frontend**
- ChatKit no está procesando las respuestas correctamente
- Error en la visualización de mensajes

## 🔧 Soluciones Paso a Paso

### **Paso 1: Verificar Workflow en Agent Builder**

1. **Ve a Agent Builder**: [https://platform.openai.com/agent-builder](https://platform.openai.com/agent-builder)
2. **Verifica que el workflow existe** y está activo
3. **Revisa el System Message**:
   ```
   Eres un asistente de IA especializado en ayudar con tareas administrativas y de gestión del sistema Movonte Dashboard. Puedes ayudar con consultas sobre proyectos, usuarios, servicios, tickets y configuraciones del sistema. Responde de manera profesional y útil.
   ```
4. **Asegúrate de que esté publicado**

### **Paso 2: Verificar Variables de Entorno**

En tu archivo `.env` del backend:
```env
OPENAI_API_KEY=sk-...                    # Tu API key
OPENAI_CHATKIT_WORKFLOW_ID=wf_...        # ID del workflow
```

### **Paso 3: Probar con el Panel de Debug**

1. Ve a la página de chat
2. Usa el panel **"ChatKit Debug"**
3. Haz clic en **"Probar Conexión Directa"**
4. Revisa los resultados

### **Paso 4: Verificar Logs del Backend**

En los logs del servidor, deberías ver:
```
🔄 Creando sesión de ChatKit para usuario: admin
✅ Sesión de ChatKit creada exitosamente: cksess_...
```

### **Paso 5: Verificar Logs del Frontend**

En la consola del navegador, deberías ver:
```javascript
🔍 ChatKit: getClientSecret called
🆕 ChatKit: Creando nueva sesión
🔍 useChatKit: createSession called
```

## 🧪 Tests de Diagnóstico

### **Test 1: Verificar Workflow**
```bash
# En el backend, verifica que el workflow existe
curl -X GET "https://api.openai.com/v1/assistants" \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### **Test 2: Verificar Sesión**
```bash
# Probar creación de sesión
curl -X POST "https://api.openai.com/v1/chatkit/sessions" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "OpenAI-Beta: chatkit_beta=v1" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": {"id": "wf_tu_workflow_id"},
    "user": "test_user"
  }'
```

### **Test 3: Verificar Frontend**
1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Envía un mensaje en el chat
4. Verifica que se hagan peticiones a ChatKit

## 🔍 Diagnóstico Avanzado

### **Verificar en la Consola del Navegador:**

Busca estos mensajes:
```javascript
// ✅ Correctos
🔍 ChatKit: getClientSecret called
🆕 ChatKit: Creando nueva sesión
✅ ChatKit test response: {success: true, data: {...}}

// ❌ Problemáticos
❌ ChatKit: Error en session: ...
❌ useChatKit: Usuario no autenticado
❌ Failed to load resource: 400/500
```

### **Verificar en los Logs del Backend:**

```bash
# ✅ Correctos
🔄 Creando sesión de ChatKit para usuario: admin
✅ Sesión de ChatKit creada exitosamente: cksess_...

# ❌ Problemáticos
❌ Error creando sesión de ChatKit: ...
❌ OpenAI API error: Invalid workflow ID
❌ OpenAI API error: Invalid API key
```

## 🚀 Soluciones Específicas

### **Si el Workflow No Existe:**
1. Crea un nuevo workflow en Agent Builder
2. Configura el system message
3. Publica el workflow
4. Actualiza el Workflow ID en `.env`

### **Si el System Message Está Vacío:**
1. Ve a Agent Builder
2. Edita el workflow
3. Agrega un system message apropiado
4. Guarda y publica

### **Si la API Key No Tiene Permisos:**
1. Verifica que la API key sea válida
2. Asegúrate de que tenga acceso a ChatKit
3. Verifica que tengas créditos disponibles

### **Si el Frontend No Procesa Respuestas:**
1. Verifica que el script de ChatKit esté cargado
2. Revisa la consola para errores JavaScript
3. Asegúrate de que la configuración sea mínima

## 📋 Checklist de Verificación

- [ ] ✅ Workflow existe y está activo en Agent Builder
- [ ] ✅ System message configurado correctamente
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ API key válida y con permisos
- [ ] ✅ Backend crea sesiones exitosamente
- [ ] ✅ Frontend se conecta sin errores
- [ ] ✅ ChatKit widget se carga correctamente

## 🆘 Si Nada Funciona

1. **Revisa los logs completos** del backend y frontend
2. **Verifica la configuración** en Agent Builder
3. **Prueba con un workflow simple** primero
4. **Contacta soporte** con los logs específicos

---

**El problema más común es la configuración del workflow en Agent Builder.** 🎯