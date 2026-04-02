# 🤖 Operador Autónomo de Marketing

Este es un sistema de agentes inteligentes diseñado para optimizar campañas de e-commerce de forma autónoma. Utiliza IA (Google Gemini 1.5 Flash) y un grafo de estados (LangGraph) para analizar datos, tomar decisiones de presupuesto y generar contenido creativo.

## 🚀 ¿Cómo funciona?

El sistema funciona como una "línea de ensamblaje" donde cada agente (nodo) realiza una tarea específica y pasa el resultado al siguiente.

### El Flujo de Trabajo (Grafo):
1.  **Agente Analista:** Lee los datos de `datos_tienda.json`, calcula el ROAS y determina si una campaña es rentable. Guarda el análisis en la base de datos.
2.  **Agente Operador:** Recibe el análisis y decide qué acción tomar (escalar presupuesto, pausar campaña o mantenerla igual).
3.  **Agente Creativo:** Para las campañas que no van bien, genera 3 nuevos ángulos de venta y copies publicitarios para intentar mejorar los resultados.
4.  **Finalización:** El sistema consolida todo el proceso y guarda un reporte JSON en la carpeta `outputs/`.

## 🛠️ Tecnologías Utilizadas
*   **Node.js & TypeScript:** Entorno de ejecución y lenguaje.
*   **LangGraph.js:** Para la orquestación de los agentes y el manejo de estados.
*   **Google Gemini 1.5 Flash:** El "cerebro" detrás de los análisis y la creación de contenido.
*   **Sequelize (SQLite):** Para que el agente tenga "memoria" a largo plazo guardando sus procesos en una base de datos.

## ⚙️ Configuración

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz con tu API Key de Google:
    ```env
    GEMINI_API_KEY=Tu_Api_Key_Aqui
    DB_NAME=nombre_db
    DB_USER=user_db
    DB_PASSWORD=password_db
    DB_HOST=host_db
    ```
3.  **Datos de entrada:**
    El archivo `datos_tienda.json` contiene la información de las campañas que el agente va a procesar.
