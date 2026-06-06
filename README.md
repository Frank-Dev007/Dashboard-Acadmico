# 🎓 Dashboard Académico (PWA)

¡Bienvenido al proyecto **Dashboard Académico**! Este es un sistema web diseñado para visualizar, analizar y dar seguimiento al rendimiento académico de estudiantes, proporcionando herramientas clave para estudiantes, docentes y administradores. El proyecto está construido bajo una arquitectura de monorrepisorio y configurado como una aplicación web progresiva (PWA).

---

## 🚀 Estructura del Proyecto

El proyecto se divide en dos módulos independientes:

1. **`backend/`**: Servidor API RESTful construido con Node.js, Express y Sequelize ORM que se comunica con una base de datos MySQL.
2. **`Dashboard-Academico-PWA-main/`**: Cliente frontend desarrollado con React, TypeScript, Vite y Tailwind CSS, configurado como PWA.

---

## 🛠️ Tecnologías Utilizadas

### Frontend (Cliente PWA)
- **Framework & Runtime**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Visualización de Datos**: [Recharts](https://recharts.org/) (para gráficos y analíticas)
- **Componentes UI**: Primitivas accesibles de [Radix UI](https://www.radix-ui.com/) y [Lucide React](https://lucide.dev/) para iconos
- **Ruteo & Estado**: React Router DOM, almacenamiento persistente local (`localStorage`)

### Backend (Servidor API)
- **Framework & Runtime**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Base de Datos & ORM**: [MySQL](https://www.mysql.com/) + [Sequelize ORM](https://sequelize.org/)
- **Seguridad**: Hash de contraseñas con [bcrypt](https://www.npmjs.com/package/bcrypt)
- **Procesamiento de Archivos**: Subida de archivos con [multer](https://www.npmjs.com/package/multer) y lectura de datos con [csv-parser](https://www.npmjs.com/package/csv-parser) y [xlsx](https://www.npmjs.com/package/xlsx)
- **Integraciones**: Mapeo y caché para sincronización con la API de Moodle

---

## 🎯 Arquitectura y Roles del Sistema

El frontend cuenta con un sistema de rutas protegidas por roles con las siguientes vistas implementadas:

*   **Estudiante (`/student/*`)**:
    *   **Dashboard**: Resumen general de calificaciones e información del curso.
    *   **Performance (Rendimiento)**: Análisis del avance curricular y calificaciones.
    *   **Participation (Participación)**: Estadísticas de interactividad en clases.
    *   **Habits (Hábitos)**: Registro de hábitos de estudio y organización del tiempo.
    *   **Alertas**: Mensajes y notificaciones sobre tareas pendientes o rendimiento en riesgo.
*   **Docente (`/teacher/*`)**:
    *   **Dashboard**: Monitoreo de cursos activos y métricas grupales.
    *   **Activities (Actividades)**: Creación y seguimiento de tareas escolares.
    *   **Evaluations (Evaluaciones)**: Control de calificaciones de los estudiantes.
    *   **Risk Map (Mapa de Riesgo)**: Visualización y detección temprana de estudiantes en riesgo de reprobar o desertar.
    *   **Reports (Reportes)**: Exportación y análisis estadístico por curso.
*   **Administrador (`/admin/*`)**:
    *   **Dashboard**: Estadísticas generales del uso del sistema.
    *   **Users (Usuarios)**: Gestión del personal (creación, edición y baja de usuarios).
    *   **Bulk Upload (Carga Masiva)**: Importación de datos a través de archivos Excel/CSV para poblar cursos e información de estudiantes.
    *   **Settings (Configuración)**: Parámetros del sistema.
    *   **Reports (Reportes)**: Reportes a nivel institucional.

---

## 🔧 Requisitos Previos

Asegúrate de tener instalado en tu máquina:
- **Node.js** (versión 18 o superior recomendada)
- **NPM** (incluido con Node.js)
- **MySQL** (ejecutándose localmente o en un servidor externo)

---

## ⚙️ Configuración y Despliegue

### 1. Configuración del Backend

1. Navega al directorio del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno creando un archivo `.env` en la raíz de `backend/` (si no existe, usa la siguiente configuración base):
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=tu_contraseña_mysql
   DB_NAME=dashboard_academico
   DB_PORT=3306
   PORT=4000
   ```
4. Crea la base de datos en tu servidor MySQL:
   ```sql
   CREATE DATABASE dashboard_academico;
   ```
5. Inicia el servidor en modo desarrollo (con recarga automática usando Nodemon):
   ```bash
   npm run dev
   ```
   *Nota: Sequelize sincronizará automáticamente el esquema de base de datos (`sequelize.sync({ alter: true })`) la primera vez que se inicie.*

---

### 2. Configuración del Frontend (PWA)

1. Abre una nueva terminal en la raíz del proyecto y navega al directorio del frontend:
   ```bash
   cd Dashboard-Academico-PWA-main
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo local usando Vite:
   ```bash
   npm run dev
   ```
4. Abre tu navegador e ingresa a la dirección indicada por Vite (normalmente `http://localhost:3000`).

*Nota: Por defecto, el frontend se conecta al backend en `http://localhost:4000`, configurado en `src/service/api.js`.*

---

## 📝 Notas de Desarrollo y Limitaciones actuales

- **Autenticación**: El inicio de sesión actual en `auth.controller.js` utiliza comparación de contraseñas de texto plano, mientras que los endpoints de creación de usuarios utilizan `bcrypt`. 
- **Mock Data**: Algunos dashboards y vistas del cliente utilizan datos locales simulados (Mock Data). Los desarrollos futuros deben ir conectando e implementando las peticiones a la API en `src/service/api.js`.
- Para obtener detalles técnicos avanzados de integración y arquitectura, consulta el archivo [CLAUDE.md](file:///c:/Users/Frank/Desktop/UNIVERSIDAD/6to%20SEM/Ingenieria%20de%20Sfotware/Proyecto/PROYECTO%20DASHBOARD%20ACADEMICO/DASH%20ACAD/CLAUDE.md) en la raíz del repositorio.
