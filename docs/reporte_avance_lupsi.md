# Reporte de Avance: Sistema Web Progresivo LUPSI

En base al documento de **Definición de Historias de Usuario y Trazabilidad por Sprint (V1.1)**, a continuación se detalla el estado actual del proyecto:

## 📊 Resumen Ejecutivo
El proyecto se encuentra finalizando el **Sprint 1 (Infraestructura base y modelado de datos)**. Se han establecido los cimientos técnicos necesarios para habilitar las historias de usuario funcionales (US-01 a US-05).

---

## 🛠️ Estado del Sprint 1: Infraestructura Base
| Tarea del Backlog Técnico | Estado | Observación |
| :--- | :---: | :--- |
| **Repositorios GitHub & CI/CD** | 🟡 | Estructura de monorepo lista; CI/CD básico no detectado aún. |
| **Modelado Esquema Relacional (PostgreSQL/Supabase)** | ✅ | Archivo `schema.sql` completo con tipos ENUM, tablas base y políticas RLS. |
| **Configuración Proyecto Supabase** | 🟡 | Esquema definido, falta integración de variables de entorno y Auth. |
| **Inicialización NestJS + Docker** | 🟡 | NestJS inicializado; Dockerfile/Compose pendiente de configuración. |
| **Inicialización Angular PWA + Tailwind** | 🟡 | Proyecto Angular con Service Worker listo; Tailwind pendiente de instalar. |
| **Implementación `EcuadorianIdValidatorService`** | ✅ | Algoritmo Módulo 10 implementado y probado (`.spec.ts`). |

---

## 📋 Trazabilidad de Historias de Usuario (US)
El avance sobre las necesidades del negocio es el siguiente:

### **US-01: Registro y Validación Oficial (Paciente)**
- **Estado de Lógica**: ✅ **Completado**. El validador matemático (`Módulo 10`) está listo.
- **Estado de Implementación**: 🏗️ **Pendiente**. Falta la integración con el flujo de registro (JWT y persistencia).

### **US-02: Agendamiento de Citas Síncrono (Paciente)**
- **Estado de Base de Datos**: ✅ **Completado**. La restricción `no_overlapping_appointments` ya existe a nivel de BD para evitar "Double Booking".
- **Estado de Implementación**: 🏗️ **Pendiente** (Planeado para Sprint 3).

### **US-03: Visualización de Agenda Administrativa (Recepcionista)**
- **Estado de Base de Datos**: ✅ **Completado**. Tabla `appointments` vinculada a `profiles` lista para lectura.
- **Estado de Implementación**: 🏗️ **Pendiente** (Planeado para Sprint 3).

### **US-04: Digitalización de Expedientes en Nube (Médico)**
- **Estado de Base de Datos**: ✅ **Completado**. Tabla `medical_records` definida con soporte para `document_url` (Cloudinary).
- **Estado de Implementación**: 🏗️ **Pendiente** (Planeado para Sprint 4).

### **US-05: Restricción de Privacidad y Data Médica (Centro)**
- **Estado de Seguridad**: 🟡 **En Progreso**. Las políticas de **Row Level Security (RLS)** y **RBAC** ya están escritas en el SQL (`schema.sql`), restringiendo el acceso a historias clínicas solo a pacientes y doctores.
- **Estado de Backend**: 🏗️ **Pendiente**. Falta aplicar el control de roles en los controladores de NestJS.

---

## 🚀 Próximas Acciones (Sprint 2 en adelante)
1. **Configuración de Docker**: Crear `Dockerfile` y `docker-compose.yml` para estandarizar el entorno.
2. **Integración Supabase Auth**: Configurar `Passport` y `JWT` en el backend para habilitar el registro (US-01).
3. **Instalación de TailwindCSS**: Configurar los estilos en el frontend para la UI premium requerida.
4. **Desarrollo del IAM Module**: Implementar los Guards de roles (RBAC) basados en las políticas ya definidas.

> [!NOTE]
> La base de datos es el componente más avanzado al momento, con las reglas de negocio críticas (choque de citas, validación de DNI y privacidad RLS) ya modeladas matemáticamente.
