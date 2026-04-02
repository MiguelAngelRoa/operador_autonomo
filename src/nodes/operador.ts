import { AgenteState } from "../state.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY!,
    maxOutputTokens: 2048,
    maxRetries: 3,
});


import { historial_agente_operador } from "../db.js";

export const nodoOperador = async (state: typeof AgenteState.State) => {
    console.log("--- Agente operador: Realizando toma de decisiones en base a la data del analista ---");
    const analisis = state.datos_analista;

    const prompt = new PromptTemplate({
        template: `
            En base a los datos que te estoy dando del analista, necesito que actues como un Agente 
            Operador experto en E-commerce y Decision Making, 
            que tome la iniciativa en si pausar una campaña o subir el presupuesto,
            
            entonces en ese caso, estos son los datos del analista:
            {analisis}

            el resultado tiene que venir en un array de JSON, y es un resultado por cada una de 
            las campañas tiene que tener la siguiente estructura:
 
            {{
                "campania_id": "Id de la campaña que viene de los datos del analista, meramente para tener un registro",
                "dejar_en_pausa": "Dato de tipo booleano que indica si se tiene que dejar en pausa o no",
                "mensaje": "Los mensajes son 'Pausar Campaña (id de la campaña) por ROAS negativo' en caso de que sugieras que no es rentable o 'Subir presupuesto a (id de la campaña)' en caso de que sugieras que si es rentable",
                "nombre_producto": "nombre del producto en string, meramente para tenerlo en cuenta"
            }}
            
        `,
        inputVariables: ["analisis"]
    });

    const parser = new JsonOutputParser();
    const chain = prompt.pipe(model).pipe(parser);

    try {
        const operatorResults = await chain.invoke({
            analisis: JSON.stringify(analisis, null, 2)
        }) as any;

        const finalResult = operatorResults.map((result: any) => {
            return {
                campania_id: result.campania_id,
                dejar_en_pausa: result.dejar_en_pausa,
                mensaje: result.mensaje,
                nombre_producto: result.nombre_producto
            }
        });

        // Guardar en la base de datos
        for (const item of finalResult) {
            await historial_agente_operador.create(item);
        }

        console.log("--- Agente Operador: Datos guardados en historial_agente_operador ---");

        return { datos_operador: finalResult }
    } catch (error: any) {
        throw new Error('Error en nodo operador: ' + (error.message || error));
    }
};