const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const routes = require('./routes/index.js');
const cors = require('cors');

require('./db.js');

const server = express();

server.name = 'API';

server.use(bodyParser.urlencoded({ extended: true }));
// Middleware para agregar encabezados de seguridad a todas las respuestas
server.use((req, res, next) => {
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY'); // o 'SAMEORIGIN' según tu preferencia
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Content-Security-Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'");


  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

server.use(bodyParser.json());
server.use(cookieParser());
server.use(morgan('dev'));

// Utilizar solo cors sin configuración manual adicional
server.use(cors({ origin: '*', credentials: true }));

server.use('/', routes);

// Error catching endware.
server.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;