// routes/modalidadRoutes.js
const express = require("express");
const router = express.Router();
const Modalidad = require("../models/Modalidad");

// Obtener todas las modalidades
router.get("/", async (req, res) => {
  try {
    const modalidades = await Modalidad.findAll();
    res.json(modalidades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar estado (para el admin)
router.put("/:id", async (req, res) => {
  try {
    const modalidad = await Modalidad.findByPk(req.params.id);
    if (!modalidad) return res.status(404).json({ error: "Modalidad no encontrada" });
    
    modalidad.habilitado = req.body.habilitado;
    await modalidad.save();
    
    res.json(modalidad);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;