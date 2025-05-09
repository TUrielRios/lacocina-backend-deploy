const { Router } = require('express');
const preguntaRoutes = require('./preguntasRoutes');
const textoRoutes = require('./textoRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const codigoAccesoRoutes = require('./codigoAccesoRoutes');
const desplegableRoutes = require('./desplegableRoutes');

const app = Router();

// Configurar los routers
app.use('/preguntas', preguntaRoutes);
app.use('/textos', textoRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/codigos-acceso', codigoAccesoRoutes);
app.use('/desplegables', desplegableRoutes);

module.exports = app;