// controllers/preguntaController.js
const {Pregunta, sequelize} = require("../db");
const { Sequelize } = require('sequelize');


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
exports.fixQuestionCounts = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // Paso 1: Contar preguntas
    const counts = {
      originalCurso: await Pregunta.count({ where: { modalidad: 'Curso' }, transaction }),
      originalTaller: await Pregunta.count({ where: { modalidad: 'Taller' }, transaction })
    };

    // Paso 2: Eliminar excedentes (versión corregida)
    if (counts.originalCurso > 60) {
      const preguntasAConservar = await Pregunta.findAll({
        attributes: ['id'],
        where: { modalidad: 'Curso' },
        order: [['id', 'ASC']],
        limit: 60,
        transaction
      });
      
      await Pregunta.destroy({
        where: {
          modalidad: 'Curso',
          id: {
            [Sequelize.Op.notIn]: preguntasAConservar.map(p => p.id)
          }
        },
        transaction
      });
    }

    if (counts.originalTaller > 60) {
      const preguntasAConservar = await Pregunta.findAll({
        attributes: ['id'],
        where: { modalidad: 'Taller' },
        order: [['id', 'ASC']],
        limit: 60,
        transaction
      });
      
      await Pregunta.destroy({
        where: {
          modalidad: 'Taller',
          id: {
            [Sequelize.Op.notIn]: preguntasAConservar.map(p => p.id)
          }
        },
        transaction
      });
    }

    // Paso 3: Completar preguntas Taller si faltan
    const currentTallerCount = await Pregunta.count({ where: { modalidad: 'Taller' }, transaction });
    if (currentTallerCount < 60) {
      const needed = 60 - currentTallerCount;
      const baseQuestions = await Pregunta.findAll({
        where: { modalidad: 'Curso' },
        order: [['id', 'ASC']],
        limit: needed,
        transaction
      });

      await Promise.all(
        baseQuestions.map(q => 
          Pregunta.create({
            text: q.text,
            category: q.category,
            phase: q.phase,
            modalidad: 'Taller'
          }, { transaction })
        )
      );
    }

    await transaction.commit();

    res.status(200).json({
      message: 'Preguntas corregidas exitosamente',
      counts: {
        curso: await Pregunta.count({ where: { modalidad: 'Curso' } }),
        taller: await Pregunta.count({ where: { modalidad: 'Taller' } })
      }
    });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      error: 'Error al corregir preguntas',
      details: error.message
    });
  }
};