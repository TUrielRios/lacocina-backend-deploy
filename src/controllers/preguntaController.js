// controllers/preguntaController.js
const {Pregunta} = require("../db");

// Crear una pregunta
exports.createPregunta = async (req, res) => {
  try {
    const { text, category, phase } = req.body;
    const nuevaPregunta = await Pregunta.create({ text, category, phase });
    res.status(201).json(nuevaPregunta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todas las preguntas
exports.getPreguntas = async (req, res) => {
  try {
    const preguntas = await Pregunta.findAll();
    res.status(200).json(preguntas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener una pregunta por ID
exports.getPreguntaById = async (req, res) => {
  try {
    const pregunta = await Pregunta.findByPk(req.params.id);
    if (!pregunta) {
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }
    res.status(200).json(pregunta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar una pregunta
exports.updatePregunta = async (req, res) => {
  try {
    const { text, category, phase } = req.body;
    const [updated] = await Pregunta.update(
      { text, category, phase },
      { where: { id: req.params.id } }
    );
    if (updated) {
      const updatedPregunta = await Pregunta.findByPk(req.params.id);
      res.status(200).json(updatedPregunta);
    } else {
      res.status(404).json({ error: "Pregunta no encontrada" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar una pregunta
exports.deletePregunta = async (req, res) => {
  try {
    const deleted = await Pregunta.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Pregunta no encontrada" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};