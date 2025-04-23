//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const server = require('./src/app.js');
const { conn } = require('./src/db.js');
const express = require('express');
const cors = require('cors'); // Asegúrate de tenerlo instalado (npm install cors)
const router = require('./src/app.js'); // Ajusta esta ruta según tu estructura

const app = express();

// Middlewares esenciales
app.use(express.json());
app.use(cors());

// Rutas
app.use(router);


// Syncing all the models at once.
conn.sync({ alter: true }).then(() => {
  server.listen(3001, () => {
    console.log('%server listening at 3001'); // eslint-disable-line no-console
  });
});

// Exporta la app para Vercel
module.exports = app; // Para CommonJS
// O si usas ES Modules:
// export default app;
