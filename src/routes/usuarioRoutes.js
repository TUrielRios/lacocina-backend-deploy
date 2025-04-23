const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");

// Rutas para usuarios
router.post("/", usuarioController.createUsuario);
router.get("/taller", usuarioController.getUsuariosTaller);
router.get("/curso", usuarioController.getUsuariosCurso);
router.get("/estadisticas", usuarioController.getEstadisticas);
router.put("/:id", usuarioController.updateUsuario); // Nueva ruta para actualizar
router.delete("/:id", usuarioController.deleteUsuario);
router.delete("/", usuarioController.deleteMultipleUsuarios);


module.exports = router;