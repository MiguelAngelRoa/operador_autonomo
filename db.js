const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: true
    }
);

// Crea la tabla para el agente operador
const historial_agente_operador = sequelize.define('historial_agente_operador', {
    campaña_id: {
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
    timestamps: true
});

// Para conectar con la base de datos
const dbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('¡Conexión establecida con éxito mediante Sequelize!');

        await sequelize.sync({ alter: true });
        console.log('Tablas sincronizadas en Laragon.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
};

module.exports = { sequelize, historial_agente_operador, dbConnection };