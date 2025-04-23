const { Router } = require('express');
const router = Router();
const {
  getOpciones,
  addOpcion,
  updateOpcion,
  deleteOpcion,
  reordenarOpciones,
  inicializarDesplegables
} = require('../controllers/desplegableController');

// Obtener opciones de una categoría
router.get('/:categoria', getOpciones);

// Agregar nueva opción
router.post('/', addOpcion);

// Actualizar opción
router.put('/:id', updateOpcion);

// Eliminar opción
router.delete('/:id', deleteOpcion);

// Reordenar opciones
router.post('/:categoria/reordenar', reordenarOpciones);

// Inicializar con valores por defecto (solo para desarrollo/administración)
router.post('/inicializar', inicializarDesplegables);

module.exports = router;