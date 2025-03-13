// routes/preguntaRoutes.js
const express = require("express");
const router = express.Router();
const preguntaController = require("../controllers/preguntaController");

// Definir las rutas
router.post("/", preguntaController.createPregunta);
router.get("/", preguntaController.getPreguntas);
router.get("/:id", preguntaController.getPreguntaById);
router.put("/:id", preguntaController.updatePregunta);
router.delete("/:id", preguntaController.deletePregunta);

module.exports = router;