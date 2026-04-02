import { Annotation } from "@langchain/langgraph";
import { Campania, DataAnalista, DataCreativo, DataOperador } from "./types.js";

export const AgenteState = Annotation.Root({
  campanias: Annotation<Campania[]>(),
  datos_analista: Annotation<DataAnalista[]>(),
  datos_operador: Annotation<DataOperador[]>(),
  datos_creativo: Annotation<DataCreativo[]>()
});