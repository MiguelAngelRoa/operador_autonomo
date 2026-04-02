import { AgenteState } from "../state.js";
import * as fs from "fs";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY!,
  maxOutputTokens: 2048,
  maxRetries: 3,
});

import { historial_agente_analista } from "../db.js";

export const nodoAnalista = async (state: typeof AgenteState.State) => {
  console.log("--- Agente Analista: Realizando ingesta y análisis de datos de ROAS ---");

  const raw = fs.readFileSync('datos_tienda.json', 'utf-8');
  const { campañas } = JSON.parse(raw);

  const prompt = new PromptTemplate({
    template: `
    Actúa como un Senior Data Analyst y experto en E-commerce. 
    Tu tarea es analizar el rendimiento de las campañas publicitarias 
    basándote en el ROAS (Retorno de la Inversión Publicitaria).
    
    Según tu conocimiento en los ROAS determina cuando es factible o no, de todas maneras ten en cuenta esto:

    ¿Qué pasa si el costo por clic viene bajando? ¿Qué pasa si es fin de semana? son variables que son 
    importantes para la toma de decisiones

    Datos de las campañas:
    {campañas_data}

    Debes devolver un array de objetos JSON con el siguiente esquema EXACTO:
    [{{
      "id": "ID de la campaña",
      "roas": "Número representado como string (ej: '3.50')",
      "es_rentable": "Booleano (true o false)",
      "razon": "Observación de MÁXIMO 10 palabras"
    }}]

    No incluyas explicaciones adicionales fuera del JSON. Devuelve ÚNICAMENTE el bloque JSON.
  `,
    inputVariables: ["campañas_data"]
  });

  const parser = new JsonOutputParser();
  const chain = prompt.pipe(model).pipe(parser);

  try {
    const analysisResults = await chain.invoke({
      campañas_data: JSON.stringify(campañas, null, 2)
    }) as any;

    const analizadas = analysisResults.map((result: any) => {
      const original = campañas.find((c: any) => c.id === result.id);
      return {
        campania: original,
        roas: result.roas,
        es_rentable: result.es_rentable,
        razon: result.razon
      };
    });

    // Guardar en la base de datos
    for (const item of analizadas) {
      await historial_agente_analista.create({
        id_campania: item.campania.id,
        roas: item.roas,
        es_rentable: item.es_rentable,
        razon: item.razon
      });
    }

    console.log("--- Agente Analista: Datos guardados en historial_agente_analista ---");

    return { datos_analista: analizadas };
  } catch (error) {
    console.error("Error en nodoAnalista:", error);
    return {
      datos_analista: campañas.map((c: any) => ({
        campania: c,
        roas: (c.ingresos / c.gasto).toFixed(2),
        es_rentable: (c.ingresos / c.gasto) > 2,
        razon: "Análisis básico por fallo en IA"
      }))
    };
  }
};