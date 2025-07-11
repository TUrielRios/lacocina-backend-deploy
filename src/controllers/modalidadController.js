// controllers/modalidadController.js
const { Modalidad } = require('../db');

exports.getAllModalidades = async (req, res) => {
  try {
    const modalidades = await Modalidad.findAll();
    res.json(modalidades);
  } catch (err) {
    res.status(500).json({ 
      error: 'Error al obtener modalidades',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.updateModalidad = async (req, res) => {
  try {
    const modalidad = await Modalidad.findByPk(req.params.id);
    if (!modalidad) {
      return res.status(404).json({ error: "Modalidad no encontrada" });
    }
    
    const { habilitado } = req.body;
    
    // Validar el campo habilitado
    if (typeof habilitado !== 'boolean') {
      return res.status(400).json({ error: "El campo 'habilitado' debe ser un booleano" });
    }
    
    modalidad.habilitado = habilitado;
    await modalidad.save();
    
    res.json(modalidad);
  } catch (err) {
    res.status(500).json({ 
      error: 'Error al actualizar modalidad',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.createModalidad = async (req, res) => {
  try {
    const { nombre, habilitado } = req.body;
    
    // Validaciones
    if (!nombre || !['Curso', 'Taller'].includes(nombre)) {
      return res.status(400).json({ error: "Nombre debe ser 'Curso' o 'Taller'" });
    }
    
    const modalidad = await Modalidad.create({ 
      nombre,
      habilitado: habilitado !== undefined ? habilitado : true // Default true
    });
    
    res.status(201).json(modalidad);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: `${req.body.nombre} ya existe` });
    }
    res.status(500).json({ 
      error: 'Error al crear modalidad',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.createInitialModalidades = async () => {
  try {
    const count = await Modalidad.count();
    if (count === 0) {
      await Modalidad.bulkCreate([
        { nombre: 'Curso', habilitado: true },
        { nombre: 'Taller', habilitado: true }
      ]);
      console.log('Modalidades iniciales creadas');
    }
  } catch (error) {
    console.error('Error al crear modalidades iniciales:', error);
  }
};