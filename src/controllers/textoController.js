// controllers/textoController.js
const { Texto } = require("../db");

// Crear o actualizar un texto
exports.createOrUpdateTexto = async (req, res) => {
  try {
    const { key, value, isHidden } = req.body; // Agregar isHidden aquí
    
    const [texto, created] = await Texto.findOrCreate({
      where: { key },
      defaults: { 
        value,
        isHidden: isHidden !== undefined ? isHidden : false // Manejar isHidden
      },
    });

    if (!created) {
      texto.value = value;
      // Solo actualizar isHidden si se proporciona en el request
      if (isHidden !== undefined) {
        texto.isHidden = isHidden;
      }
      await texto.save();
    }

    res.status(200).json(texto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los textos
exports.getTextos = async (req, res) => {
  try {
    const textos = await Texto.findAll();
    res.status(200).json(textos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener un texto por key
exports.getTextoByKey = async (req, res) => {
  try {
    const texto = await Texto.findOne({ where: { key: req.params.key } });
    if (!texto) {
      return res.status(404).json({ error: "Texto no encontrado" });
    }
    res.status(200).json(texto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un texto
exports.deleteTexto = async (req, res) => {
  try {
    const deleted = await Texto.destroy({ where: { key: req.params.key } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Texto no encontrado" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};