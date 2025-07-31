const { Router } = require('express');
const preguntaRoutes = require('./preguntasRoutes');
const textoRoutes = require('./textoRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const codigoAccesoRoutes = require('./codigoAccesoRoutes');
const desplegableRoutes = require('./desplegableRoutes');
const modalidadRoutes = require('./modalidadRoutes');
const iaRoutes = require('./iaRoutes'); // Importar las rutas de IA
const nicoloRoutes = require('./nicoloRoutes'); // Importar las rutas de Nicolo

const app = Router();

// Configurar los routers
app.use('/preguntas', preguntaRoutes);
app.use('/textos', textoRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/codigos-acceso', codigoAccesoRoutes);
app.use('/desplegables', desplegableRoutes);
app.use('/modalidades', modalidadRoutes);
app.use('/ia', iaRoutes); // Usar las rutas de IA
app.use('/nicolo', nicoloRoutes); // Usar las rutas de Nicolo

module.exports = app;