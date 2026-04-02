import { AgenteState } from "../state.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY!,
    maxOutputTokens: 2048,
    maxRetries: 3,
});

import { historial_agente_creativo } from "../db.js";

export const nodoCreativo = async (state: typeof AgenteState.State) => {
    const campañasPausadas = state.datos_operador.filter(d => d.dejar_en_pausa);

    if (campañasPausadas.length === 0) {
        console.log("--- Agente Creativo: No hay campañas pausadas para analizar ---");
        return { datos_creativo: [] };
    }

    console.log("--- Agente Creativo: Generando nuevos ángulos de venta para campañas pausadas ---");

    const prompt = new PromptTemplate({
        template: `
            Actúa como un copywriter experto en E-commerce y Director Creativo. 
            Tu objetivo es proponer nuevos ángulos de venta para productos cuyas campañas han sido pausadas por bajo rendimiento.

            CAMPANIAS PAUSADAS:
            {campañas_pausadas}

            Para cada producto, genera un análisis breve del posible fallo y proporciona 3 sugerencias creativas (Título y Copy).

            FORMATO DE SALIDA (DEBES RESPONDER ÚNICAMENTE CON UN ARRAY JSON):
            [{{
                "nombre_producto": "nombre del producto",
                "analisis_fallo": "breve explicación del fallo",
                "sugerencias": [
                    {{ "titulo": "Ángulo de venta 1", "copy": "Texto publicitario persuasivo" }},
                    {{ "titulo": "Ángulo de venta 2", "copy": "Texto publicitario persuasivo" }},
                    {{ "titulo": "Ángulo de venta 3", "copy": "Texto publicitario persuasivo" }}
                ]
            }}]
        `,
        inputVariables: ["campañas_pausadas"]
    });

    const parser = new JsonOutputParser();
    const chain = prompt.pipe(model).pipe(parser);

    try {
        const sugerenciasFinales = await chain.invoke({
            campañas_pausadas: JSON.stringify(campañasPausadas, null, 2)
        }) as any[];

        for (const item of sugerenciasFinales) {
            await historial_agente_creativo.create({
                nombre_producto: item.nombre_producto,
                analisis_fallo: item.analisis_fallo,
                sugerencias: item.sugerencias
            });
        }

        console.log("--- Agente Creativo: Datos guardados en historial_agente_creativo ---");

        return { datos_creativo: sugerenciasFinales };
    } catch (error: any) {
        console.error("Error en nodoCreativo:", error);
        return { datos_creativo: [] };
    }
};