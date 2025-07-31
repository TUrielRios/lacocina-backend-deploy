const express = require("express");
const router = express.Router();
const {
  trainNicolo,
  getEntrenamientoNicolo,
  analyzeWithNicolo,
} = require("../controllers/nicoloController");

// Ruta para entrenar a Nicolo
router.post("/train", trainNicolo);

// Ruta para obtener el entrenamiento actual
router.get("/train", getEntrenamientoNicolo);

// Ruta para generar análisis
router.post("/analyze", analyzeWithNicolo);

module.exports = router;
