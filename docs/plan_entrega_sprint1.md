# 🔱 Guía de Presentación: Sprint 1 - LUPSI

## 📋 Resumen del Sprint
**Objetivo:** Construir los cimientos seguros y la inteligencia de datos del sistema.
**Estado:** 100% Completado (Infraestructura y Lógica de Negocio).

---

## 👨‍⚕️ Presentación para el CLIENTE (El Doctor)
*Enfoque: Confianza, Orden y Visión de Futuro.*

### 1. El "Plano Anatómico" (Wireframes)
- **Qué mostrar:** Los bocetos de navegación (`MI-DES-WIR-002`).
- **Qué decir:** *"Doctor, antes de construir, hemos diseñado el camino del paciente. Así se verá el flujo desde que entra hasta que recibe su receta."*

### 2. El "Diccionario Médico de Lupsi" (Base de Datos)
- **Qué mostrar:** Una lista limpia de los datos que capturaremos (Cédula, Nombres, Recetas, Dosis).
- **Qué decir:** *"Ya hemos configurado la memoria del sistema. Lupsi ya sabe qué es una receta y qué datos del paciente son obligatorios para su seguridad legal."*

### 3. El "Filtro de Seguridad" (Validación DNI)
- **Qué mostrar:** Explica el algoritmo de validación (Módulo 10).
- **Qué decir:** *"Doctor, su base de datos estará limpia de errores. El sistema rechaza automáticamente cualquier identificación falsa antes de guardarla."*

## 👨‍🏫 Presentación para el DOCENTE (El Profesor)
*Enfoque: Calidad Técnica, Estándares y DevOps.*

### 1. Arquitectura de Monorepo y Docker
- **Evidencia:** Mostrar el `docker-compose.yml` y los `Dockerfile`.
- **Mérito:** Entorno de desarrollo 100% estandarizado y reproducible.

### 2. Lógica de Dominio y Testing
- **Evidencia:** Terminal corriendo `npm run test` para el `EcuadorianIdValidatorService`.
- **Mérito:** Implementación del algoritmo Módulo 10 con TDD (Test Driven Development).

### 3. Persistencia y Seguridad (Supabase/PostgreSQL)
- **Evidencia:** El archivo `schema.sql`.
- **Mérito:** Uso de Tipos `ENUM`, Relaciones y políticas de RLS preparadas para la privacidad médica.




### 👤 1. Perfil del Paciente (Identificación Legal)
*Esta sección garantiza que la historia clínica esté vinculada a una persona real y verificada.*

| Información | Propósito |
| :--- | :--- |
| **Nombres y Apellidos** | Identificación oficial en recetas. |
| **Cédula de Identidad** | **Validada Automáticamente:** Evita errores legales y duplicados. |
| **Teléfono Celular** | Recordatorios automáticos de citas. |
| **Correo Electrónico** | Envío de recetas e indicaciones digitales. |


### 📝 2. Módulo de Recetas e Indicaciones
*Información clave para el seguimiento del tratamiento del paciente.*

- **Medicamento:** El nombre comercial o genérico prescrito.
- **Dosis:** La cantidad exacta (ej: 500 mg, 1 tableta).
- **Frecuencia:** El intervalo de tiempo (ej: Cada 8 horas).
- **Duración:** Por cuánto tiempo (ej: 7 días, tratamiento indefinido).
- **Instrucciones Especiales:** "Tomar después de las comidas", "Evitar lácteos", etc.

### 📅 3. Gestión de Agenda Médica
*Control de flujo de pacientes en el centro médico.*

- **Fecha y Hora:** El bloque de tiempo reservado.
- **Motivo de Consulta:** Breve descripción para triaje inicial.
- **Estado de Cita:** Confirmada, Cancelada o En Espera.

