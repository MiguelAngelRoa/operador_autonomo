const fs = require('fs');
const { historial_agente_operador, dbConnection } = require('./db');
require('dotenv').config();


const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const punto_equilibrio_saludable = 4;

/**
 * Data ingestion,
 * camapañas con los roas analizados para saber si es rentable o no
 * @returns json
 */
const agente_analista = () => {
    const data = JSON.parse(fs.readFileSync('datos_tienda.json', 'utf8'));

    const campania_roas = data.campañas.reduce((acc, campaña) => {
        let roas = (campaña.ingresos / campaña.gasto).toFixed(2);

        let campañaAnalizada = {
            ...campaña,
            roas: parseFloat(roas),
            rentable: roas >= punto_equilibrio_saludable ? "rentable" : "no_rentable"
        }

        acc.campañasAnalizadas.push(campañaAnalizada);

        return acc;
    }, { campañasAnalizadas: [] });

    return campania_roas.campañasAnalizadas;
}

/**
 * Decision making
 * toma decisiones en base al analisis del agente correspondiente
 */
const agente_operador = async () => {
    try {
        await dbConnection();

        let data_analisis = agente_analista();

        let result = data_analisis.map((c) => {
            let dejar_en_pausa = false;

            dejar_en_pausa = c.rentable === "no_rentable";

            return {
                "campaña": c.id,
                "dejar_en_pausa": dejar_en_pausa,
                "message": dejar_en_pausa
                    ? "Pausar campaña " + c.id + " por ROAS negativo"
                    : "Subir presupuesto a " + c.id,
                "nombre_producto": c.producto
            }
        })

        // Guardamos cada decisión en el historial de la base de datos
        for (let r of result) {
            await historial_agente_operador.create({
                campaña_id: r.campaña,
                dejar_en_pausa: r.dejar_en_pausa,
                mensaje: r.message,
                nombre_producto: r.nombre_producto
            });
        }

        console.log(`Se han guardado ${result.length} decisiones en el historial.`);
        return result;
    } catch (error) {
        console.error('Existe un error en el agente operador: ' + error.message);
        throw new Error(error.message);
    }
}

/**
 * Genera copywriting para los angulos deventa de la campaña que está perdiendo
 */
const agente_creativo = async () => {
    try {
        let data = await agente_operador();

        let resultPromises = data.map(async (d) => {
            if (d.dejar_en_pausa) {
                let model = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    generationConfig: {
                        responseMimeType: "application/json",
                    }
                });

                const prompt = `
                    Actúa como un experto en Copywriting y Marketing.
                    Tu tarea es generar 3 ángulos de venta para el producto: "${d.nombre_producto}".
                    Cada ángulo debe ser creativo y persuasivo.
                    
                    DEBES devolver ÚNICAMENTE un objeto JSON con el siguiente esquema:
                    {
                        "producto": "nombre del producto",
                        "angulos_venta": [
                            { "titulo": "string", "copy": "string" },
                            { "titulo": "string", "copy": "string" },
                            { "titulo": "string", "copy": "string" }
                        ]
                    }
                `;

                let maxRetries = 3;
                let attempt = 0;

                while (attempt < maxRetries) {
                    try {
                        const result = await model.generateContent(prompt);
                        
                        // Parseamos el texto JSON recibido desde Gemini
                        return { 
                            campaña_id: d.campaña,
                            creatividades: JSON.parse(result.response.text()) 
                        };
                    } catch (apiError) {
                        attempt++;
                        console.warn(`[⚠️ Alerta] Falló el intento ${attempt} para la campaña ${d.campaña}: ${apiError.message}`);
                        
                        if (attempt >= maxRetries) {
                            console.error(`[❌ Error] No se pudo generar contenido para la campaña ${d.campaña} después de ${maxRetries} intentos.`);
                            return {
                                campaña_id: d.campaña,
                                error: "No se pudieron generar los ángulos de venta por fallos reiterados en la API de Gemini."
                            };
                        }
                        
                        // Espera progresiva antes del siguiente intento (1s, 2s...)
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    }
                }

            }
            return null;
        });

        // Esperamos a que todas las peticiones a Gemini terminen
        let rawResult = await Promise.all(resultPromises);
        
        // Filtramos las campañas que no estaban en pausa (que retornaron null)
        let finalResult = rawResult.filter(r => r !== null);

        return finalResult;
    } catch (error) {
        throw new Error('Existe un error en el agente creativo: ' + error.message);
    }
}

module.exports = { agente_analista, agente_operador, agente_creativo };