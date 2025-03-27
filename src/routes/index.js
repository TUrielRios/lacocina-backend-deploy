const { Router } = require('express');
const preguntaRoutes = require('./preguntasRoutes');
const textoRoutes = require('./textoRoutes');
const usuarioRoutes = require('./usuarioRoutes'); // Agregar la nueva ruta
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');


const app = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
app.use('/preguntas', preguntaRoutes);
//Aqui debajo crear los textos a editar
app.use('/textos', textoRoutes);
//usuarios
app.use('/usuarios', usuarioRoutes); // Agregar la nueva ruta


module.exports = app;