# Operador Autónomo - Agentes de IA

Este proyecto es una prueba de concepto de un sistema multi-agente construido con Node.js y Express. Este "Operador Autónomo" evalúa el rendimiento (ROAS) de campañas de marketing, toma decisiones para pausar o escalar presupuestos, guarda historiales de decisiones en una base de datos MySQL mediante Sequelize, y finalmente, para las campañas de bajo rendimiento, genera creativamente nuevos ángulos de venta utilizando la inteligencia artificial de Gemini (Google).

## 🚀 Tecnologías Principales
*   **Node.js & Express**: Servidor y creación de API RESTful.
*   **Sequelize & MySQL**: ORM para gestión de base de datos e historiales.
*   **Google Generative AI (Gemini)**: Creación dinámica de copy y ángulos de venta.

## 🛠 Instalación y Configuración

### 2. Base de Datos (MySQL)
Necesitas un servidor MySQL corriendo localmente (por ejemplo a través de Laragon, XAMPP o Docker).
Asegúrate de crear una base de datos vacía llamada `prueba_node` (o el nombre que prefieras si lo configuras diferente en tu entorno local). Sequelize creará las tablas requeridas automáticamente al iniciar el proyecto.

### 3. Configurar Variables de Entorno (.env)
Has de crear un archivo `.env` en la raíz de tu proyecto para configurar los secretos.

Puedes utilizar el archivo de ejemplo proporcionado:
```bash
cp .env.example .env
```

**Estructura del `.env`:**
```env
# Configuración MySQL
DB_HOST=localhost
DB_NAME=prueba_node
DB_USER=root
DB_PASSWORD=root

# API Keys
GEMINI_API_KEY=tu_api_key_de_gemini_aqui
```

## 💻 Uso de la Aplicación

Para iniciar tu servidor en modo desarrollo con auto-recarga usando `nodemon`, ejecuta:
```bash
npm run dev
```

El servidor estará escuchando por defecto en el puerto `3000`.

### Endpoints Principales

1.  **Ingesta y Análisis de Rentabilidad (ROAS)**
    **`GET /api/roas`**
    Lee datos un archivo externo (`datos_tienda.json`), calcula el ROAS de cada campaña y devuelve cuales son consideradas rentables (ROAS >= 4).

2.  **Agente Operador y Auditoría**
    **`GET /api/agente_operador`**
    Toma decisiones automáticas según la rentabilidad de las campañas. Lo guarda permanentemente en la base de datos (tabla `historial_agente_operadors`) indicando si es necesario pausar la campaña por ROAS negativo o aumentar el presupuesto.

3.  **Agente Creativo (IA Generativa - Gemini)**
    **`GET /api/agente_creativo`**
    Identifica todas aquellas campañas en pausa, se conecta con la IA Generativa `gemini-2.5-flash` y devuelve en formato JSON `3` ideas nuevas e innovadoras de ángulos de venta (con título y copy) para los productos que no se están vendiendo. Este sistema incluye un control con reintentos automáticos (Backoff Retries) en caso de fallos en la IA.
