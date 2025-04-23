const { Router } = require('express');
const router = Router();
const {
  generarCodigo,
  validarCodigo,
  usarCodigo,
  listarCodigos,
  eliminarCodigo
} = require('../controllers/codigoAccesoController');

// Generar nuevo código
router.post('/', generarCodigo);

// Validar código
router.post('/validar', validarCodigo);

// Marcar código como usado
router.post('/usar', usarCodigo);

// Listar todos los códigos
router.get('/', listarCodigos);

// Eliminar código
router.delete('/:id', eliminarCodigo);

module.exports = router;