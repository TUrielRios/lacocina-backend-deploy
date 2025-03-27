// controllers/preguntaController.js
const {Pregunta, sequelize} = require("../db");

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


// Corregir duplicación de preguntas
exports.fixDuplicatedQuestions = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // Paso 1: Eliminar preguntas Taller existentes (por si hay)
    await Pregunta.destroy({
      where: { modalidad: 'Taller' },
      transaction
    });

    // Paso 2: Obtener preguntas originales (Curso)
    const originalQuestions = await Pregunta.findAll({
      where: { modalidad: 'Curso' },
      order: [['id', 'ASC']],
      limit: 60,
      transaction
    });

    if (originalQuestions.length !== 60) {
      await transaction.rollback();
      return res.status(400).json({
        error: `Se esperaban 60 preguntas originales, se encontraron ${originalQuestions.length}`
      });
    }

    // Paso 3: Crear versiones Taller
    const newQuestions = await Promise.all(
      originalQuestions.map(question => 
        Pregunta.create({
          text: question.text,
          category: question.category,
          phase: question.phase,
          modalidad: 'Taller'
        }, { transaction })
      )
    );

    await transaction.commit();
    
    res.status(200).json({
      message: 'Preguntas corregidas exitosamente',
      deletedTallerQuestions: originalQuestions.length,
      createdTallerQuestions: newQuestions.length,
      totalCursoQuestions: originalQuestions.length,
      totalTallerQuestions: newQuestions.length
    });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      error: 'Error al corregir preguntas',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};