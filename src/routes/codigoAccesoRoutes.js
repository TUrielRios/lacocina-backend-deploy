const { Router } = require('express');
const router = Router();
const {
  crearActualizarCodigo,
  obtenerCodigos,
  validarCodigo,
  usarCodigo
} = require('../controllers/codigoAccesoController');

// Crear o actualizar código (reemplaza el anterior si existe)
router.post('/', crearActualizarCodigo);

// Obtener códigos actuales (solo habrá 2 como máximo)
router.get('/', obtenerCodigos);

// Validar código
router.post('/validar', validarCodigo);

// Marcar código como usado
router.post('/usar', usarCodigo);

module.exports = router;