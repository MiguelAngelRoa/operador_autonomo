import { Sequelize, DataTypes } from 'sequelize';
import * as dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD!, {
    host: process.env.DB_HOST,
    dialect: 'mysql' as const,
    logging: false
} as any);

// Tabla para el agente analista
export const historial_agente_analista = sequelize.define('historial_agente_analista', {
    id_campania: {
        type: DataTypes.STRING,
        allowNull: false
    },
    roas: {
        type: DataTypes.STRING,
        allowNull: false
    },
    es_rentable: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    razon: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    tableName: 'historial_agente_analista',
    timestamps: true
});

// Tabla para el agente operador
export const historial_agente_operador = sequelize.define('historial_agente_operador', {
    campania_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dejar_en_pausa: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    mensaje: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    nombre_producto: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'historial_agente_operador',
    timestamps: true
});

// Tabla para el agente creativo
export const historial_agente_creativo = sequelize.define('historial_agente_creativo', {
    nombre_producto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    analisis_fallo: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sugerencias: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'historial_agente_creativo',
    timestamps: true
});

export const dbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('--- DB: Conexión establecida con éxito ---');
        await sequelize.sync({ alter: true });
        console.log('--- DB: Tablas sincronizadas ---');
    } catch (error) {
        console.error('--- DB: Error al conectar:', error);
    }
};
