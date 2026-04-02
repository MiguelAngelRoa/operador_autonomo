export interface Campania {
    id: string,
    product: string,
    gasto: number,
    ingresos: number,
    estado: string
}

export interface DataAnalista {
    campania: Campania,
    roas: string,
    es_rentable: boolean,
    razon: string
}

export interface DataOperador {
    campania_id: string,
    dejar_en_pausa: boolean,
    mensaje: string,
    nombre_producto: string
}

export interface Sugerencia {
    titulo: string,
    copy: string
}

export interface DataCreativo {
    nombre_producto: string,
    analisis_fallo: string,
    sugerencias: Sugerencia[]
}