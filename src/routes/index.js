const { Router } = require('express');
const preguntaRoutes = require('./preguntasRoutes');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');


const app = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
app.use('/preguntas', preguntaRoutes);


module.exports = app;