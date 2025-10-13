# Integración de ChatKit de OpenAI en Movonte Dashboard

## ✅ Integración Completada

La integración de ChatKit oficial de OpenAI en tu proyecto movonte-dashboard ha sido completada exitosamente. Aquí tienes un resumen de lo que se ha implementado:

## 🚀 Características Implementadas

### Frontend (React/TypeScript)
- ✅ **ChatKitWidget**: Componente principal de chat con tema personalizado
- ✅ **useChatKit Hook**: Hook personalizado para manejar sesiones
- ✅ **ChatPage**: Página dedicada para chat con estadísticas
- ✅ **Integración en Dashboard**: Widget de chat en el dashboard principal
- ✅ **Navegación**: Enlace "Chat IA" en el menú lateral
- ✅ **Responsive Design**: Funciona en desktop y móvil
- ✅ **Tema Personalizado**: Colores y estilos que coinciden con tu diseño

### Backend (Node.js/Express)
- ✅ **ChatKitController**: Controlador para manejar sesiones de ChatKit
- ✅ **Endpoints API**: Rutas para crear, refrescar y gestionar sesiones
- ✅ **Autenticación**: Integración con tu sistema de autenticación existente
- ✅ **Contexto de Usuario**: Envío de información del usuario al asistente

## 📁 Archivos Creados/Modificados

### Frontend
```
src/
├── components/
│   ├── ChatKitWidget.tsx          # Widget principal de chat
│   ├── ChatPage.tsx               # Página dedicada de chat
│   ├── Dashboard.tsx              # Integración en dashboard
│   └── Layout.tsx                 # Enlace en menú
├── hooks/
│   └── useChatKit.ts              # Hook para manejar sesiones
├── config/
│   └── api.ts                     # Endpoints de ChatKit
└── routes/
    └── index.tsx                  # Ruta para página de chat
```

### Backend
```
src/
├── controllers/
│   └── chatkit_controller.ts      # Controlador de ChatKit
└── routes/
    └── index.ts                   # Rutas de ChatKit
```

## 🔧 Configuración Requerida

### 1. Variables de Entorno
Agrega estas variables a tu archivo `.env` en el backend:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# ChatKit Workflow ID (obtenido de Agent Builder)
OPENAI_CHATKIT_WORKFLOW_ID=wf_your_workflow_id_here
```

### 2. Crear Workflow en Agent Builder
1. Ve a [Agent Builder](https://platform.openai.com/agent-builder)
2. Crea un nuevo workflow
3. Configura el system message:
   ```
   Eres un asistente de IA especializado en ayudar con tareas administrativas y de gestión del sistema Movonte Dashboard. Puedes ayudar con consultas sobre proyectos, usuarios, servicios, tickets y configuraciones del sistema. Responde de manera profesional y útil.
   ```
4. Guarda el workflow y copia el ID

### 3. Instalar Dependencias
```bash
# Frontend (ya instalado)
npm install @openai/chatkit-react

# Backend (ya instalado)
npm install openai
```

## 🎯 Cómo Usar

### Acceso al Chat
1. **Desde el Dashboard**: Widget de chat en la columna derecha
2. **Página Dedicada**: Navega a "Chat IA" en el menú lateral
3. **Botón Flotante**: Aparece cuando el chat está cerrado

### Funcionalidades
- ✅ **Chat en tiempo real** con IA
- ✅ **Subida de archivos** para análisis
- ✅ **Contexto persistente** durante la sesión
- ✅ **Tema personalizado** que coincide con tu diseño
- ✅ **Estadísticas de uso** en la página dedicada
- ✅ **Vista de pantalla completa** para chat intensivo

## 🔗 Endpoints API Disponibles

```
POST /api/chatkit/session          # Crear nueva sesión
POST /api/chatkit/refresh          # Refrescar sesión existente
GET  /api/chatkit/session/:id      # Obtener información de sesión
DELETE /api/chatkit/session/:id    # Eliminar sesión
GET  /api/chatkit/stats            # Estadísticas de uso
```

## 🎨 Personalización

### Tema del Chat
El tema está configurado en `ChatKitWidget.tsx`:
```typescript
theme: {
  colors: {
    primary: '#1e40af',    // blue-800
    secondary: '#3b82f6',  // blue-500
    background: '#ffffff',
    // ... más colores
  }
}
```

### System Message
Puedes personalizar el mensaje del sistema en `chatkit_controller.ts`:
```typescript
systemMessage: `Tu mensaje personalizado aquí...`
```

## 🚨 Troubleshooting

### Error: "No workflow ID configured"
- Verifica que `OPENAI_CHATKIT_WORKFLOW_ID` esté en tu `.env`
- Asegúrate de que el workflow esté activo en Agent Builder

### Error: "Invalid API key"
- Verifica que `OPENAI_API_KEY` sea correcta
- Asegúrate de que tenga permisos para ChatKit

### Error: "Usuario no autenticado"
- Verifica que el usuario esté logueado
- Revisa que el token de autenticación sea válido

## 🎉 ¡Listo para Usar!

Tu integración de ChatKit está completa y lista para usar. Solo necesitas:

1. ✅ Configurar las variables de entorno
2. ✅ Crear el workflow en Agent Builder
3. ✅ Reiniciar el servidor backend
4. ✅ ¡Disfrutar del chat con IA!

## 📞 Soporte

Si tienes algún problema o necesitas personalizaciones adicionales, no dudes en preguntar. La integración está diseñada para ser flexible y fácil de modificar.


