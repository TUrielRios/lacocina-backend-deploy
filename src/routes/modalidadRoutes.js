// routes/modalidadRoutes.js
const express = require('express');
const router = express.Router();
const modalidadController = require('../controllers/modalidadController');

// GET /modalidades - Obtener todas las modalidades
router.get('/', modalidadController.getAllModalidades);

// PUT /modalidades/:id - Actualizar una modalidad
router.put('/:id', modalidadController.updateModalidad);
router.post('/', modalidadController.createModalidad);

module.exports = router;