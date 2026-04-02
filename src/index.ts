import * as dotenv from 'dotenv';
dotenv.config();

import { StateGraph, START, END } from "@langchain/langgraph";
import { AgenteState } from "./state.js";
import { nodoAnalista } from "./nodes/analista.js";
import { nodoOperador } from "./nodes/operador.js";
import { nodoCreativo } from "./nodes/creativo.js"

const workflow = new StateGraph(AgenteState)
  .addNode("analista", nodoAnalista)
  .addNode("operador", nodoOperador)
  .addNode("creativo", nodoCreativo)

  // Aristas
  .addEdge(START, "analista")
  .addEdge("analista", "operador")
  .addEdge("operador", "creativo")

  // Arista final
  .addEdge("creativo", END);

// Compilar el grafo
const app = workflow.compile();

import { dbConnection } from "./db.js";

(async () => {
    try {
        await dbConnection();
        const initialState = {
            campanias: [],
            datos_analista: [],
            datos_operador: [],
            datos_creativo: []
        };
        const finalState = await app.invoke(initialState);
        console.log("✅ Ejecución completada. Estado final:");
        console.dir(finalState, { depth: null });
    } catch (error) {
        console.error("Error durante la ejecución del grafo:", error);
    }
})();