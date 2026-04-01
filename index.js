const express = require('express');
const app = express();
const { agente_analista, agente_operador,agente_creativo } = require('./agents');

const PORT = 3000;

app.use(express.json());

app.get('/api/roas', (req, res) => {
    try {
        let campanias_analizadas = agente_analista();

        res.json({
            campañas: campanias_analizadas
        });
    } catch (error) {
        res.status(500).json({ error: "Error al procesar los datos de la tienda" });
    }
});

app.get('/api/agente_operador', async (req, res) => {
    try {
        let data = await agente_operador();

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Error al procesar los datos del agente operador" });
    }
})

app.get('/api/agente_creativo', async (req, res) => {
    try {
        let data = await agente_creativo();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});