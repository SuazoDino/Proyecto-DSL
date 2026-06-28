# CodeLAB – Proyecto Colaborativo
## Sistema de Gestión de Inventario con Consultas SQL Dinámicas
**Especificación: DSL / Motor de consultas de datos relacionales**  
Universidad Nacional de Ingeniería – Escuela Profesional de Ingeniería de Software

---

## 1.a. Enunciado de Caso de Uso (Use Case Specification)

**Nombre del Caso de Uso:** Realizar Consulta SQL Dinámica sobre el Inventario  
**ID:** UC-001  
**Actor Principal:** Usuario del sistema (Administrador / Analista)

### Precondiciones:
- El usuario debe estar autenticado en el sistema con un rol asignado (admin o viewer).
- La base de datos de inventario debe estar inicializada con al menos una tabla de productos.

### Postcondiciones:
- El sistema ejecuta la consulta SQL generada y muestra los resultados en pantalla.
- Los resultados pueden ser visualizados en forma de tabla o gráfico, y exportados en el formato deseado.

---

## 1.b. User Story (Historia de Usuario)

**Título:** Consulta visual de inventario mediante SQL dinámico

**AS a:** Administrador de inventario

**I want:** Construir consultas SQL de forma visual usando un formulario interactivo, sin necesidad de escribir SQL manualmente

**So that:** Pueda obtener reportes personalizados del inventario de manera rápida y sin conocimientos avanzados de bases de datos

### Criterios de Aceptación:
- El sistema debe generar una consulta SQL válida a partir de los filtros seleccionados por el usuario en el formulario.
- Antes de ejecutar la consulta, el sistema debe validarla y mostrar un mensaje de error si es inválida.
- Los resultados deben mostrarse tanto en tabla como en al menos un tipo de gráfico (barras o torta).
- El usuario con rol "viewer" solo puede hacer consultas de lectura (SELECT); el "admin" puede realizar todas las operaciones.
- El sistema debe permitir exportar los resultados en al menos un formato (CSV o PDF).

---

## 2. Criterios de Diseño

### 2.a. Arquitectura WEB

El proyecto sigue una arquitectura **cliente-servidor de tres capas**:

| Capa | Responsabilidad | Tecnología |
|---|---|---|
| Frontend | Interfaz de usuario, formulario de consultas, gráficos | React |
| Backend | API REST, lógica de negocio, validación SQL | Node.js + Express |
| Base de datos | Almacenamiento del inventario | SQLite |

**Flujo general:**
1. El usuario selecciona filtros en el formulario (Frontend).
2. El Frontend genera la consulta SQL y la envía al Backend.
3. El Backend valida la consulta y la ejecuta contra la base de datos.
4. El resultado se devuelve al Frontend y se muestra en tabla/gráfico.

### 2.b. DSL utilizado
El DSL del proyecto es **SQL** (Structured Query Language), embebido dentro de JavaScript (script.js).  
SQL es un lenguaje de dominio específico para consultar y manipular bases de datos relacionales. Se genera dinámicamente desde la interfaz web en lugar de ser escrito a mano por el usuario.

---

## 3. Stack Tecnológico

- **Frontend:** React + CSS/SCSS
- **Backend:** Node.js + Express
- **Base de datos:** SQLite (desarrollo) / PostgreSQL (producción)
- **Visualización:** Chart.js o Recharts
- **Exportación:** jsPDF / PapaParse (CSV)

---

## 4. Integrantes del Proyecto

| N° | Nombre | Rol |
|---|---|---|
| 1 | Dino Paul Roel Suazo Zanabria | ... |
| 2 | Farid Paolo Zamudio Sanchez | ... |
| 3 | Luis Angel Vargas Ponce | ... |
| 4 | Yazid Elio Fernandez Dueñas | ... |
