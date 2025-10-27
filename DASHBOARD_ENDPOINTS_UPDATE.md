# 🔧 Dashboard Endpoints Update

## ✅ **Cambios Realizados en el Modal de Instrucciones**

### **1. Nuevos Endpoints Agregados**

**Endpoints de Tickets:**
- ✅ **Crear Ticket**: `POST /api/service/create-ticket`
- ✅ **Conectar a Ticket**: `POST /api/widget/connect`
- ✅ **Enviar Mensaje a Ticket**: `POST /api/widget/send-message`

### **2. Secciones Agregadas al Modal**

**Nuevas secciones en el modal:**
1. **Crear Ticket** - Con icono púrpura y descripción
2. **Conectar a Ticket** - Con icono índigo y descripción
3. **Enviar Mensaje a Ticket** - Con icono teal y descripción

### **3. Ejemplos de Código Agregados**

**Ejemplos de cURL para tickets:**
```bash
# Crear Ticket
curl -X POST "https://chat.movonte.com/api/service/create-ticket" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PROTECTED_TOKEN" \
  -d '{
    "customerInfo": {
      "name": "Usuario Test",
      "email": "test@example.com",
      "company": "Test Company"
    },
    "serviceId": "SERVICE_ID"
  }'

# Conectar a Ticket
curl -X POST "https://chat.movonte.com/api/widget/connect" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PROTECTED_TOKEN" \
  -d '{
    "issueKey": "TEST-123",
    "customerInfo": {
      "name": "Usuario Test",
      "email": "test@example.com",
      "company": "Test Company"
    }
  }'

# Enviar Mensaje a Ticket
curl -X POST "https://chat.movonte.com/api/widget/send-message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PROTECTED_TOKEN" \
  -d '{
    "message": "Hola, necesito ayuda con este ticket",
    "issueKey": "TEST-123",
    "customerInfo": {
      "name": "Usuario Test",
      "email": "test@example.com",
      "company": "Test Company"
    }
  }'
```

## 🎯 **Funcionalidades del Modal**

### **Endpoints Mostrados:**
1. **Chat** - `POST /api/user/services/{serviceId}/chat`
2. **Estado** - `GET /api/user/services/{serviceId}/status`
3. **Crear Ticket** - `POST /api/service/create-ticket` ✅ **NUEVO**
4. **Conectar a Ticket** - `POST /api/widget/connect` ✅ **NUEVO**
5. **Enviar Mensaje a Ticket** - `POST /api/widget/send-message` ✅ **NUEVO**
6. **WebSocket** - `wss://chat.movonte.com/socket.io/`

### **Características:**
- ✅ **Botones de copiar** para cada endpoint
- ✅ **Ejemplos de cURL** para todos los endpoints
- ✅ **Descripciones claras** de cada endpoint
- ✅ **Iconos distintivos** para cada tipo de endpoint
- ✅ **Tokens protegidos** integrados en los ejemplos

## 🚀 **Resultado**

El modal ahora muestra:
- ✅ **Endpoints correctos** para tickets
- ✅ **Ejemplos de código** actualizados
- ✅ **Instrucciones claras** para cada endpoint
- ✅ **Funcionalidad completa** de tickets

¡El modal de instrucciones ahora está actualizado con los endpoints correctos! 🎉

