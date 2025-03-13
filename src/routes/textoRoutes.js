// routes/textoRoutes.js
const express = require("express");
const router = express.Router();
const textoController = require("../controllers/textoController");

// Definir las rutas
router.post("/", textoController.createOrUpdateTexto);
router.get("/", textoController.getTextos);
router.get("/:key", textoController.getTextoByKey);
router.delete("/:key", textoController.deleteTexto);

module.exports = router;