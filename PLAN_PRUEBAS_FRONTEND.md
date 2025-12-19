# Plan de Pruebas - Frontend

## 1. Información General

**Sistema:** Movonte Dashboard (Frontend)  
**Tecnología:** React, TypeScript, Vite, React Router, React Query, Tailwind CSS  
**Fecha de Creación:** 2024  
**Versión:** 0.0.0

---

## 2. Objetivos de las Pruebas

- Verificar la funcionalidad de todos los componentes de la interfaz
- Validar la experiencia de usuario (UX)
- Asegurar la integración correcta con la API backend
- Comprobar la responsividad en diferentes dispositivos
- Validar el manejo de estados y errores
- Verificar la accesibilidad y usabilidad
- Comprobar el rendimiento y optimización

---

## 3. Tipos de Pruebas

### 3.1 Pruebas Unitarias (Componentes)
### 3.2 Pruebas de Integración (Componentes + Hooks)
### 3.3 Pruebas End-to-End (Flujos completos)
### 3.4 Pruebas de UI/UX
### 3.5 Pruebas de Rendimiento
### 3.6 Pruebas de Accesibilidad
### 3.7 Pruebas de Responsividad

---

## 4. Pruebas por Componente

### 4.1 Autenticación

#### 4.1.1 Componente Login
- [ ] **Renderizado**
  - [ ] Renderiza correctamente el formulario de login
  - [ ] Muestra campos de email y contraseña
  - [ ] Muestra botón de submit
  - [ ] Muestra mensajes de error cuando corresponden
  - [ ] Muestra estado de carga durante el login

- [ ] **Funcionalidad**
  - [ ] Login exitoso con credenciales válidas
  - [ ] Redirección después de login exitoso
  - [ ] Muestra error con credenciales inválidas
  - [ ] Muestra error con email inválido
  - [ ] Muestra error con contraseña vacía
  - [ ] Valida formato de email
  - [ ] Maneja errores de red
  - [ ] Guarda token en localStorage/sessionStorage
  - [ ] Actualiza estado de autenticación

- [ ] **UX**
  - [ ] Feedback visual durante el proceso
  - [ ] Mensajes de error claros
  - [ ] Deshabilita botón durante el proceso
  - [ ] Maneja timeout de sesión

#### 4.1.2 Componente ProtectedRoute
- [ ] **Funcionalidad**
  - [ ] Permite acceso a usuarios autenticados
  - [ ] Redirige a login si no está autenticado
  - [ ] Valida token antes de permitir acceso
  - [ ] Maneja token expirado
  - [ ] Preserva URL de destino para redirección

#### 4.1.3 Hook useAuth
- [ ] **Funcionalidad**
  - [ ] Inicializa estado de autenticación
  - [ ] Login exitoso actualiza estado
  - [ ] Logout limpia estado y token
  - [ ] Verifica token válido
  - [ ] Maneja refresh de token
  - [ ] Maneja errores de autenticación

---

### 4.2 Dashboard Principal

#### 4.2.1 Componente Dashboard
- [ ] **Renderizado**
  - [ ] Renderiza correctamente el dashboard
  - [ ] Muestra métricas principales
  - [ ] Muestra gráficos si existen
  - [ ] Muestra lista de actividades recientes
  - [ ] Muestra estado de servicios

- [ ] **Funcionalidad**
  - [ ] Carga datos del dashboard
  - [ ] Actualiza datos periódicamente
  - [ ] Maneja errores de carga
  - [ ] Muestra estado de carga
  - [ ] Filtra y ordena datos
  - [ ] Navega a secciones específicas

- [ ] **UX**
  - [ ] Loading states apropiados
  - [ ] Empty states cuando no hay datos
  - [ ] Error states informativos
  - [ ] Animaciones suaves

#### 4.2.2 Componente RecentActivity
- [ ] **Renderizado**
  - [ ] Lista actividades recientes
  - [ ] Muestra timestamp de actividades
  - [ ] Muestra tipo de actividad
  - [ ] Muestra usuario/entidad relacionada

- [ ] **Funcionalidad**
  - [ ] Carga actividades desde API
  - [ ] Actualiza en tiempo real si aplica
  - [ ] Filtra por tipo de actividad
  - [ ] Paginación si existe
  - [ ] Maneja errores

#### 4.2.3 Context ActivityContext
- [ ] **Funcionalidad**
  - [ ] Proporciona estado de actividades
  - [ ] Actualiza actividades globalmente
  - [ ] Maneja suscripciones
  - [ ] Limpia estado al desmontar

---

### 4.3 Gestión de Usuarios

#### 4.3.1 Componente UsersManager
- [ ] **Renderizado**
  - [ ] Lista de usuarios
  - [ ] Botones de acción (editar, eliminar)
  - [ ] Formulario de creación/edición
  - [ ] Filtros y búsqueda

- [ ] **Funcionalidad**
  - [ ] Carga lista de usuarios
  - [ ] Crea nuevo usuario
  - [ ] Edita usuario existente
  - [ ] Elimina usuario
  - [ ] Busca usuarios
  - [ ] Filtra usuarios
  - [ ] Paginación
  - [ ] Valida formularios
  - [ ] Maneja errores

- [ ] **Validaciones**
  - [ ] Email válido
  - [ ] Contraseña segura
  - [ ] Campos requeridos
  - [ ] Permisos de usuario

#### 4.3.2 Componente UsersPage
- [ ] **Renderizado**
  - [ ] Layout correcto
  - [ ] Integra UsersManager
  - [ ] Muestra breadcrumbs si existen

- [ ] **Funcionalidad**
  - [ ] Navegación correcta
  - [ ] Maneja permisos de acceso

#### 4.3.3 Hook useUsers
- [ ] **Funcionalidad**
  - [ ] Obtiene lista de usuarios
  - [ ] Crea usuario
  - [ ] Actualiza usuario
  - [ ] Elimina usuario
  - [ ] Maneja cache de React Query
  - [ ] Maneja errores

---

### 4.4 Gestión de Servicios

#### 4.4.1 Componente ServicesManager
- [ ] **Renderizado**
  - [ ] Lista de servicios
  - [ ] Formulario de creación/edición
  - [ ] Configuración de servicios
  - [ ] Estado de servicios (activo/inactivo)

- [ ] **Funcionalidad**
  - [ ] Carga servicios
  - [ ] Crea servicio
  - [ ] Edita servicio
  - [ ] Elimina servicio
  - [ ] Activa/desactiva servicio
  - [ ] Configura parámetros del servicio
  - [ ] Valida configuraciones
  - [ ] Maneja errores

- [ ] **Validaciones**
  - [ ] Nombre de servicio único
  - [ ] Configuración válida
  - [ ] Tokens válidos (Jira, OpenAI)

#### 4.4.2 Componente UserServicesManager
- [ ] **Renderizado**
  - [ ] Lista de servicios del usuario
  - [ ] Formulario de creación
  - [ ] Configuración de servicios del usuario

- [ ] **Funcionalidad**
  - [ ] Carga servicios del usuario
  - [ ] Crea servicio para usuario
  - [ ] Edita servicio del usuario
  - [ ] Elimina servicio del usuario
  - [ ] Valida permisos del usuario
  - [ ] Maneja errores

#### 4.4.3 Componente UserServicesPage
- [ ] **Renderizado**
  - [ ] Layout correcto
  - [ ] Integra UserServicesManager

- [ ] **Funcionalidad**
  - [ ] Navegación correcta
  - [ ] Maneja permisos

#### 4.4.4 Hook useServices
- [ ] **Funcionalidad**
  - [ ] Obtiene servicios
  - [ ] Crea servicio
  - [ ] Actualiza servicio
  - [ ] Elimina servicio
  - [ ] Maneja cache
  - [ ] Maneja errores

#### 4.4.5 Hook useUserServices
- [ ] **Funcionalidad**
  - [ ] Obtiene servicios del usuario
  - [ ] Crea servicio para usuario
  - [ ] Actualiza servicio del usuario
  - [ ] Elimina servicio del usuario
  - [ ] Maneja cache
  - [ ] Maneja errores

---

### 4.5 Gestión de Proyectos

#### 4.5.1 Componente ProjectsManager
- [ ] **Renderizado**
  - [ ] Lista de proyectos Jira
  - [ ] Proyecto activo destacado
  - [ ] Botón para cambiar proyecto activo

- [ ] **Funcionalidad**
  - [ ] Carga proyectos desde Jira
  - [ ] Muestra proyecto activo
  - [ ] Cambia proyecto activo
  - [ ] Filtra proyectos
  - [ ] Busca proyectos
  - [ ] Maneja errores de conexión con Jira

#### 4.5.2 Componente ProjectsPage
- [ ] **Renderizado**
  - [ ] Layout correcto
  - [ ] Integra ProjectsManager

- [ ] **Funcionalidad**
  - [ ] Navegación correcta

#### 4.5.3 Componente RemoteProjectsManager
- [ ] **Renderizado**
  - [ ] Lista de proyectos remotos
  - [ ] Sincronización con proyectos remotos

- [ ] **Funcionalidad**
  - [ ] Carga proyectos remotos
  - [ ] Sincroniza proyectos
  - [ ] Maneja errores

#### 4.5.4 Hook useProjects
- [ ] **Funcionalidad**
  - [ ] Obtiene proyectos
  - [ ] Establece proyecto activo
  - [ ] Obtiene proyecto activo
  - [ ] Maneja cache
  - [ ] Maneja errores

#### 4.5.5 Hook useRemoteProjects
- [ ] **Funcionalidad**
  - [ ] Obtiene proyectos remotos
  - [ ] Sincroniza proyectos
  - [ ] Maneja cache
  - [ ] Maneja errores

---

### 4.6 Gestión de Tickets

#### 4.6.1 Componente TicketsManager
- [ ] **Renderizado**
  - [ ] Lista de tickets
  - [ ] Filtros por estado
  - [ ] Búsqueda de tickets
  - [ ] Detalles del ticket

- [ ] **Funcionalidad**
  - [ ] Carga tickets
  - [ ] Filtra tickets por estado
  - [ ] Busca tickets
  - [ ] Muestra detalles del ticket
  - [ ] Habilita/deshabilita asistente en ticket
  - [ ] Actualiza estado del ticket
  - [ ] Paginación
  - [ ] Maneja errores

#### 4.6.2 Hook useTickets
- [ ] **Funcionalidad**
  - [ ] Obtiene tickets
  - [ ] Filtra tickets
  - [ ] Habilita/deshabilita asistente
  - [ ] Actualiza ticket
  - [ ] Maneja cache
  - [ ] Maneja errores

---

### 4.7 Gestión de Webhooks

#### 4.7.1 Componente WebhooksManager
- [ ] **Renderizado**
  - [ ] Lista de webhooks
  - [ ] Formulario de configuración
  - [ ] Estado de webhooks
  - [ ] Filtros de webhook

- [ ] **Funcionalidad**
  - [ ] Carga webhooks
  - [ ] Crea webhook
  - [ ] Edita webhook
  - [ ] Elimina webhook
  - [ ] Habilita/deshabilita webhook
  - [ ] Configura filtros
  - [ ] Prueba webhook
  - [ ] Valida URL de webhook
  - [ ] Maneja errores

#### 4.7.2 Hook useWebhooks
- [ ] **Funcionalidad**
  - [ ] Obtiene webhooks
  - [ ] Crea webhook
  - [ ] Actualiza webhook
  - [ ] Elimina webhook
  - [ ] Prueba webhook
  - [ ] Maneja cache
  - [ ] Maneja errores

---

### 4.8 Chat y ChatKit

#### 4.8.1 Componente ChatPage
- [ ] **Renderizado**
  - [ ] Interfaz de chat
  - [ ] Historial de mensajes
  - [ ] Input de mensaje
  - [ ] Indicadores de escritura

- [ ] **Funcionalidad**
  - [ ] Envía mensajes
  - [ ] Recibe mensajes
  - [ ] Muestra historial
  - [ ] Maneja conexión WebSocket
  - [ ] Maneja desconexión
  - [ ] Maneja errores de conexión
  - [ ] Scroll automático a último mensaje
  - [ ] Formato de mensajes

- [ ] **UX**
  - [ ] Indicadores de carga
  - [ ] Indicadores de escritura
  - [ ] Timestamps de mensajes
  - [ ] Animaciones suaves

#### 4.8.2 Componente ChatKitWidget
- [ ] **Renderizado**
  - [ ] Widget de chat flotante
  - [ ] Botón de toggle
  - [ ] Ventana de chat

- [ ] **Funcionalidad**
  - [ ] Abre/cierra widget
  - [ ] Integra con ChatKit
  - [ ] Maneja sesiones
  - [ ] Maneja errores

#### 4.8.3 Componente ChatKitTestPage
- [ ] **Renderizado**
  - [ ] Página de pruebas de ChatKit
  - [ ] Controles de prueba

- [ ] **Funcionalidad**
  - [ ] Prueba conexión
  - [ ] Prueba envío de mensajes
  - [ ] Prueba recepción de mensajes
  - [ ] Muestra logs de debug

#### 4.8.4 Componente ChatKitDebug
- [ ] **Renderizado**
  - [ ] Panel de debug
  - [ ] Información de sesión
  - [ ] Logs de eventos

- [ ] **Funcionalidad**
  - [ ] Muestra estado de sesión
  - [ ] Muestra eventos
  - [ ] Permite acciones de debug

#### 4.8.5 Hook useChatKit
- [ ] **Funcionalidad**
  - [ ] Crea sesión
  - [ ] Refresca sesión
  - [ ] Envía mensajes
  - [ ] Recibe mensajes
  - [ ] Maneja estado de conexión
  - [ ] Maneja errores

---

### 4.9 Validación de Servicios

#### 4.9.1 Componente ServiceValidationForm
- [ ] **Renderizado**
  - [ ] Formulario de validación
  - [ ] Campos requeridos
  - [ ] Botón de envío

- [ ] **Funcionalidad**
  - [ ] Crea solicitud de validación
  - [ ] Valida campos
  - [ ] Muestra estado de envío
  - [ ] Maneja errores

#### 4.9.2 Componente ServiceValidationModal
- [ ] **Renderizado**
  - [ ] Modal de validación
  - [ ] Formulario dentro del modal
  - [ ] Botones de acción

- [ ] **Funcionalidad**
  - [ ] Abre/cierra modal
  - [ ] Envía validación
  - [ ] Maneja errores
  - [ ] Cierra modal después de éxito

#### 4.9.3 Componente AdminServiceValidations
- [ ] **Renderizado**
  - [ ] Lista de solicitudes pendientes
  - [ ] Botones de aprobar/rechazar
  - [ ] Detalles de solicitud

- [ ] **Funcionalidad**
  - [ ] Carga solicitudes pendientes
  - [ ] Aprueba solicitud
  - [ ] Rechaza solicitud
  - [ ] Filtra solicitudes
  - [ ] Maneja errores

#### 4.9.4 Componente AdminServiceValidationsPage
- [ ] **Renderizado**
  - [ ] Layout correcto
  - [ ] Integra AdminServiceValidations

- [ ] **Funcionalidad**
  - [ ] Navegación correcta
  - [ ] Maneja permisos admin

#### 4.9.5 Componente UserServiceValidations
- [ ] **Renderizado**
  - [ ] Lista de validaciones del usuario
  - [ ] Estado de cada validación

- [ ] **Funcionalidad**
  - [ ] Carga validaciones del usuario
  - [ ] Muestra estado
  - [ ] Maneja errores

#### 4.9.6 Hook useServiceValidation
- [ ] **Funcionalidad**
  - [ ] Crea solicitud de validación
  - [ ] Obtiene validaciones del usuario
  - [ ] Obtiene validaciones pendientes (admin)
  - [ ] Aprueba validación (admin)
  - [ ] Rechaza validación (admin)
  - [ ] Maneja cache
  - [ ] Maneja errores

---

### 4.10 Configuración y Ajustes

#### 4.10.1 Componente SettingsPage
- [ ] **Renderizado**
  - [ ] Formulario de configuración
  - [ ] Secciones de configuración
  - [ ] Botón de guardar

- [ ] **Funcionalidad**
  - [ ] Carga configuración actual
  - [ ] Actualiza configuración
  - [ ] Valida cambios
  - [ ] Guarda cambios
  - [ ] Muestra confirmación
  - [ ] Maneja errores

#### 4.10.2 Componente TokenConfiguration
- [ ] **Renderizado**
  - [ ] Formulario de tokens
  - [ ] Campos para Jira y OpenAI
  - [ ] Botón de validar

- [ ] **Funcionalidad**
  - [ ] Guarda tokens
  - [ ] Valida tokens
  - [ ] Muestra estado de validación
  - [ ] Enmascara tokens en UI
  - [ ] Maneja errores

#### 4.10.3 Componente ChangePasswordModal
- [ ] **Renderizado**
  - [ ] Modal de cambio de contraseña
  - [ ] Campos de contraseña
  - [ ] Validación de fortaleza

- [ ] **Funcionalidad**
  - [ ] Cambia contraseña
  - [ ] Valida contraseña actual
  - [ ] Valida nueva contraseña
  - [ ] Valida confirmación
  - [ ] Muestra fortaleza de contraseña
  - [ ] Maneja errores

#### 4.10.4 Componente ServiceEndpointsModal
- [ ] **Renderizado**
  - [ ] Modal de endpoints
  - [ ] Lista de endpoints
  - [ ] Formulario de edición

- [ ] **Funcionalidad**
  - [ ] Carga endpoints
  - [ ] Edita endpoints
  - [ ] Valida URLs
  - [ ] Guarda cambios
  - [ ] Maneja errores

---

### 4.11 Configuración Inicial

#### 4.11.1 Componente InitialSetup
- [ ] **Renderizado**
  - [ ] Wizard de configuración inicial
  - [ ] Pasos del wizard
  - [ ] Indicador de progreso

- [ ] **Funcionalidad**
  - [ ] Navega entre pasos
  - [ ] Valida cada paso
  - [ ] Guarda configuración
  - [ ] Completa setup
  - [ ] Redirige después de completar
  - [ ] Maneja errores

#### 4.11.2 Hook useInitialSetup
- [ ] **Funcionalidad**
  - [ ] Verifica estado de setup
  - [ ] Completa setup
  - [ ] Valida tokens
  - [ ] Maneja errores

---

### 4.12 Organizaciones

#### 4.12.1 Componente OrganizationsAdmin
- [ ] **Renderizado**
  - [ ] Lista de organizaciones
  - [ ] Formulario de creación/edición
  - [ ] Permisos especiales

- [ ] **Funcionalidad**
  - [ ] Carga organizaciones (solo admin user 1)
  - [ ] Crea organización
  - [ ] Edita organización
  - [ ] Elimina organización
  - [ ] Valida permisos especiales
  - [ ] Maneja errores

---

### 4.13 Asistentes

#### 4.13.1 Componente AssistantsList
- [ ] **Renderizado**
  - [ ] Lista de asistentes
  - [ ] Asistente activo destacado
  - [ ] Botón para cambiar asistente

- [ ] **Funcionalidad**
  - [ ] Carga asistentes
  - [ ] Muestra asistente activo
  - [ ] Cambia asistente activo
  - [ ] Filtra asistentes
  - [ ] Maneja errores

#### 4.13.2 Hook useAssistants
- [ ] **Funcionalidad**
  - [ ] Obtiene asistentes
  - [ ] Establece asistente activo
  - [ ] Obtiene asistente activo
  - [ ] Maneja cache
  - [ ] Maneja errores

---

### 4.14 Cuentas Jira de Servicios

#### 4.14.1 Hook useServiceJiraAccounts
- [ ] **Funcionalidad**
  - [ ] Obtiene cuentas Jira del servicio
  - [ ] Crea/actualiza cuentas Jira
  - [ ] Elimina cuentas Jira
  - [ ] Maneja cache
  - [ ] Maneja errores

---

### 4.15 Layout y Navegación

#### 4.15.1 Componente Layout
- [ ] **Renderizado**
  - [ ] Header con navegación
  - [ ] Sidebar si existe
  - [ ] Footer si existe
  - [ ] Área de contenido principal

- [ ] **Funcionalidad**
  - [ ] Navegación entre páginas
  - [ ] Muestra usuario actual
  - [ ] Botón de logout
  - [ ] Menú responsive
  - [ ] Breadcrumbs si existen

#### 4.15.2 Componente ErrorBoundary
- [ ] **Funcionalidad**
  - [ ] Captura errores de renderizado
  - [ ] Muestra mensaje de error amigable
  - [ ] Permite resetear error
  - [ ] Logs errores

---

### 4.16 Utilidades y Debug

#### 4.16.1 Componente AuthDebug
- [ ] **Renderizado**
  - [ ] Información de autenticación
  - [ ] Estado del token
  - [ ] Permisos del usuario

- [ ] **Funcionalidad**
  - [ ] Muestra estado de auth
  - [ ] Permite acciones de debug
  - [ ] Solo visible en desarrollo

#### 4.16.2 Componente TailwindTest
- [ ] **Renderizado**
  - [ ] Pruebas de estilos Tailwind
  - [ ] Componentes de ejemplo

- [ ] **Funcionalidad**
  - [ ] Verifica que Tailwind funciona
  - [ ] Muestra ejemplos de componentes

---

## 5. Pruebas de Hooks Personalizados

### 5.1 useApi
- [ ] Maneja requests HTTP
- [ ] Maneja autenticación en headers
- [ ] Maneja errores
- [ ] Maneja loading states
- [ ] Maneja retry logic

### 5.2 useProfile
- [ ] Obtiene perfil del usuario
- [ ] Actualiza perfil
- [ ] Maneja cache
- [ ] Maneja errores

---

## 6. Pruebas de Integración con API

### 6.1 Autenticación
- [ ] Login exitoso
- [ ] Logout exitoso
- [ ] Refresh de token
- [ ] Manejo de token expirado

### 6.2 CRUD Operations
- [ ] Crear recursos
- [ ] Leer recursos
- [ ] Actualizar recursos
- [ ] Eliminar recursos

### 6.3 Manejo de Errores
- [ ] Errores 400 (Bad Request)
- [ ] Errores 401 (Unauthorized)
- [ ] Errores 403 (Forbidden)
- [ ] Errores 404 (Not Found)
- [ ] Errores 500 (Server Error)
- [ ] Errores de red
- [ ] Timeouts

### 6.4 Cache y Estado
- [ ] React Query cache funciona
- [ ] Invalidación de cache
- [ ] Refetch automático
- [ ] Optimistic updates

---

## 7. Pruebas de UI/UX

### 7.1 Diseño Visual
- [ ] Consistencia de colores
- [ ] Tipografía consistente
- [ ] Espaciado consistente
- [ ] Iconos correctos
- [ ] Imágenes optimizadas

### 7.2 Interacciones
- [ ] Hover states
- [ ] Focus states
- [ ] Active states
- [ ] Disabled states
- [ ] Transiciones suaves
- [ ] Animaciones apropiadas

### 7.3 Feedback al Usuario
- [ ] Loading indicators
- [ ] Success messages
- [ ] Error messages
- [ ] Warning messages
- [ ] Info messages
- [ ] Confirmations

### 7.4 Formularios
- [ ] Validación en tiempo real
- [ ] Mensajes de error claros
- [ ] Campos requeridos marcados
- [ ] Placeholders informativos
- [ ] Labels accesibles
- [ ] Help text cuando necesario

---

## 8. Pruebas de Responsividad

### 8.1 Breakpoints
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)
- [ ] Large Desktop (> 1280px)

### 8.2 Componentes Responsivos
- [ ] Layout se adapta correctamente
- [ ] Menú responsive
- [ ] Tablas responsive
- [ ] Formularios responsive
- [ ] Modales responsive
- [ ] Grids responsive

### 8.3 Navegación Mobile
- [ ] Menú hamburguesa funciona
- [ ] Navegación táctil
- [ ] Touch targets apropiados (min 44x44px)
- [ ] Scroll suave

---

## 9. Pruebas de Accesibilidad

### 9.1 ARIA Labels
- [ ] Elementos interactivos tienen labels
- [ ] Formularios tienen labels asociados
- [ ] Botones tienen texto descriptivo
- [ ] Imágenes tienen alt text

### 9.2 Navegación por Teclado
- [ ] Tab order lógico
- [ ] Focus visible
- [ ] Escape cierra modales
- [ ] Enter activa botones
- [ ] Navegación con flechas en listas

### 9.3 Contraste
- [ ] Contraste de texto suficiente (WCAG AA)
- [ ] Contraste de elementos interactivos
- [ ] Estados de hover/focus visibles

### 9.4 Screen Readers
- [ ] Contenido accesible para screen readers
- [ ] Anuncios de cambios de estado
- [ ] Landmarks apropiados

### 9.5 Herramientas
- [ ] Lighthouse accessibility score > 90
- [ ] axe DevTools sin errores críticos
- [ ] WAVE sin errores

---

## 10. Pruebas de Rendimiento

### 10.1 Carga Inicial
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Total Blocking Time < 200ms

### 10.2 Bundle Size
- [ ] Bundle principal < 200KB (gzipped)
- [ ] Code splitting implementado
- [ ] Lazy loading de componentes
- [ ] Tree shaking funcionando

### 10.3 Optimizaciones
- [ ] Imágenes optimizadas
- [ ] Lazy loading de imágenes
- [ ] Memoización de componentes
- [ ] Virtual scrolling en listas largas
- [ ] Debounce en búsquedas

### 10.4 Lighthouse Scores
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 90

---

## 11. Pruebas de Navegación

### 11.1 Rutas
- [ ] Todas las rutas son accesibles
- [ ] Rutas protegidas redirigen si no autenticado
- [ ] Rutas no encontradas muestran 404
- [ ] Breadcrumbs funcionan correctamente

### 11.2 Navegación
- [ ] Links funcionan correctamente
- [ ] Botones de navegación funcionan
- [ ] Historial del navegador funciona
- [ ] Back/Forward buttons funcionan

---

## 12. Pruebas de Estado

### 12.1 Estado Local
- [ ] useState funciona correctamente
- [ ] useReducer funciona correctamente
- [ ] Estado se mantiene durante navegación cuando corresponde
- [ ] Estado se limpia cuando corresponde

### 12.2 Estado Global
- [ ] Context API funciona
- [ ] Zustand store funciona (si se usa)
- [ ] Estado sincronizado entre componentes
- [ ] Persistencia de estado si aplica

### 12.3 Estado del Servidor
- [ ] React Query cache funciona
- [ ] Refetch en focus funciona
- [ ] Invalidación de cache funciona
- [ ] Optimistic updates funcionan

---

## 13. Pruebas de Formularios

### 13.1 Validación
- [ ] Validación en tiempo real
- [ ] Validación al submit
- [ ] Mensajes de error claros
- [ ] Prevención de submit inválido

### 13.2 Manejo de Datos
- [ ] Datos se guardan correctamente
- [ ] Datos se cargan correctamente
- [ ] Reset de formulario funciona
- [ ] Manejo de errores de servidor

### 13.3 React Hook Form
- [ ] Integración con React Hook Form
- [ ] Validación con Zod (si se usa)
- [ ] Manejo de errores
- [ ] Reset y setValue funcionan

---

## 14. Pruebas de WebSockets (si aplica)

### 14.1 Conexión
- [ ] Conexión establecida correctamente
- [ ] Reconexión automática
- [ ] Manejo de desconexión

### 14.2 Mensajes
- [ ] Envío de mensajes
- [ ] Recepción de mensajes
- [ ] Manejo de errores
- [ ] Actualización de UI en tiempo real

---

## 15. Pruebas de Compatibilidad

### 15.1 Navegadores
- [ ] Chrome (últimas 2 versiones)
- [ ] Firefox (últimas 2 versiones)
- [ ] Safari (últimas 2 versiones)
- [ ] Edge (últimas 2 versiones)

### 15.2 Dispositivos
- [ ] iOS (últimas 2 versiones)
- [ ] Android (últimas 2 versiones)
- [ ] Tablets
- [ ] Desktop

---

## 16. Pruebas de Seguridad Frontend

### 16.1 XSS
- [ ] Sanitización de inputs
- [ ] No ejecución de scripts maliciosos
- [ ] Content Security Policy

### 16.2 Tokens
- [ ] Tokens no expuestos en código
- [ ] Tokens almacenados de forma segura
- [ ] Limpieza de tokens al logout

### 16.3 Permisos
- [ ] UI oculta para usuarios sin permisos
- [ ] Validación de permisos en cliente
- [ ] Validación de permisos en servidor (no confiar solo en cliente)

---

## 17. Herramientas de Pruebas Recomendadas

- **Jest**: Framework de pruebas unitarias
- **React Testing Library**: Pruebas de componentes
- **Cypress**: Pruebas E2E
- **Playwright**: Pruebas E2E alternativo
- **Lighthouse**: Pruebas de rendimiento y accesibilidad
- **axe DevTools**: Pruebas de accesibilidad
- **Storybook**: Desarrollo y pruebas de componentes aislados
- **MSW (Mock Service Worker)**: Mocking de API

---

## 18. Criterios de Aceptación

### 18.1 Cobertura de Código
- [ ] Mínimo 80% de cobertura de código
- [ ] 100% de cobertura en componentes críticos

### 18.2 Funcionalidad
- [ ] Todas las funcionalidades principales funcionan
- [ ] 0 errores críticos en consola
- [ ] 0 warnings críticos

### 18.3 Rendimiento
- [ ] Lighthouse Performance > 90
- [ ] Bundle size dentro de límites
- [ ] Tiempos de carga aceptables

### 18.4 Accesibilidad
- [ ] Lighthouse Accessibility > 90
- [ ] 0 errores críticos de accesibilidad
- [ ] Navegación por teclado completa

### 18.5 UX
- [ ] Feedback apropiado en todas las acciones
- [ ] Mensajes de error claros
- [ ] Loading states en operaciones asíncronas

---

## 19. Checklist de Despliegue

- [ ] Todas las pruebas unitarias pasando
- [ ] Todas las pruebas de integración pasando
- [ ] Pruebas E2E de flujos críticos pasando
- [ ] Pruebas de accesibilidad pasando
- [ ] Pruebas de rendimiento pasando
- [ ] Pruebas de compatibilidad completadas
- [ ] Build de producción exitoso
- [ ] Bundle size dentro de límites
- [ ] Variables de entorno configuradas
- [ ] Documentación actualizada

---

## 20. Notas y Observaciones

- Las pruebas deben ejecutarse en diferentes navegadores y dispositivos
- Mantener datos de prueba separados de datos de producción
- Documentar todos los casos de prueba fallidos
- Revisar y actualizar este plan regularmente
- Considerar pruebas automatizadas en CI/CD
- Usar Storybook para desarrollo de componentes aislados
- Implementar pruebas visuales con herramientas como Percy o Chromatic

---

**Última actualización:** 2024  
**Próxima revisión:** Según necesidad


