const { Usuario, sequelize } = require("../db");

// Crear usuario con validación de campos según modalidad
exports.createUsuario = async (req, res) => {
  try {
    const { modalidad, ...userData } = req.body;
    
    // Validar campos según modalidad
    if (modalidad === 'Taller') {
      // Generar código único para taller (incógnito)
      userData.codigoTaller = `TALLER-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      
      // Eliminar campos que no deben estar para Taller
      delete userData.nombre;
      delete userData.apellido;
      delete userData.email;
      delete userData.curso;
      delete userData.cargo;
    } else if (modalidad === 'Curso') {
      // Validar campos requeridos para Curso
      const requiredFields = ['nombre', 'apellido', 'email', 'curso', 'cargo'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Faltan campos requeridos para Curso: ${missingFields.join(', ')}` 
        });
      }
    } else {
      return res.status(400).json({ error: "Modalidad inválida" });
    }

    // Validar campos comunes requeridos
    const commonRequiredFields = ['compania', 'industriaSector', 'areaDesempeno'];
    const missingCommonFields = commonRequiredFields.filter(field => !userData[field]);
    
    if (missingCommonFields.length > 0) {
      return res.status(400).json({ 
        error: `Faltan campos requeridos: ${missingCommonFields.join(', ')}` 
      });
    }

    // Validar promedios
    const promedios = [
      'validacionSocial', 'atractivo', 'reciprocidad',
      'autoridad', 'autenticidad', 'consistenciaCompromiso'
    ];
    
    for (const promedio of promedios) {
      if (userData[promedio] && (userData[promedio] < 1 || userData[promedio] > 10)) {
        return res.status(400).json({ 
          error: `El promedio de ${promedio} debe estar entre 1 y 10` 
        });
      }
    }

    const nuevoUsuario = await Usuario.create({
      modalidad,
      ...userData
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los usuarios de Taller (solo código y promedios)
exports.getUsuariosTaller = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      where: { modalidad: 'Taller' },
      attributes: [
        'id',
        'compania',
        'industriaSector',
        'areaDesempeno',
        'codigoTaller',
        'validacionSocial',
        'atractivo',
        'reciprocidad',
        'autoridad',
        'autenticidad',
        'consistenciaCompromiso',
        'createdAt'
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los usuarios de Curso
exports.getUsuariosCurso = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      where: { modalidad: 'Curso' },
      attributes: [
        'id',
        'nombre',
        'apellido',
        'email',
        'curso',
        'compania',
        'industriaSector',
        'areaDesempeno',
        'cargo',
        'validacionSocial',
        'atractivo',
        'reciprocidad',
        'autoridad',
        'autenticidad',
        'consistenciaCompromiso',
        'createdAt'
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener estadísticas de promedios
exports.getEstadisticas = async (req, res) => {
  try {
    const estadisticas = await Usuario.findAll({
      attributes: [
        'modalidad',
        [sequelize.fn('AVG', sequelize.col('validacionSocial')), 'avgValidacionSocial'],
        [sequelize.fn('AVG', sequelize.col('atractivo')), 'avgAtractivo'],
        [sequelize.fn('AVG', sequelize.col('reciprocidad')), 'avgReciprocidad'],
        [sequelize.fn('AVG', sequelize.col('autoridad')), 'avgAutoridad'],
        [sequelize.fn('AVG', sequelize.col('autenticidad')), 'avgAutenticidad'],
        [sequelize.fn('AVG', sequelize.col('consistenciaCompromiso')), 'avgConsistenciaCompromiso']
      ],
      group: ['modalidad']
    });
    
    res.status(200).json(estadisticas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar promedios de un usuario
exports.updateUsuario = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Validar que solo se actualicen campos permitidos
      const allowedFields = [
        'validacionSocial',
        'atractivo',
        'reciprocidad',
        'autoridad',
        'autenticidad',
        'consistenciaCompromiso'
      ];
      
      // Filtrar campos no permitidos
      const filteredUpdate = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {});
  
      // Validar rangos de los promedios (1-10)
      for (const [key, value] of Object.entries(filteredUpdate)) {
        if (value && (value < 1 || value > 10)) {
          return res.status(400).json({ 
            error: `El promedio de ${key} debe estar entre 1 y 10` 
          });
        }
      }
  
      const [updated] = await Usuario.update(filteredUpdate, {
        where: { id }
      });
  
      if (updated) {
        const updatedUsuario = await Usuario.findByPk(id);
        res.status(200).json(updatedUsuario);
      } else {
        res.status(404).json({ error: "Usuario no encontrado" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

// Borrar un usuario por ID
exports.deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Usuario.destroy({
      where: { id }
    });

    if (deleted) {
      res.status(200).json({ message: "Usuario eliminado correctamente" });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Borrar múltiples usuarios por IDs
exports.deleteMultipleUsuarios = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Se requiere un array de IDs válido" });
    }

    const deleted = await Usuario.destroy({
      where: { id: ids }
    });

    res.status(200).json({ 
      message: `${deleted} usuario(s) eliminado(s) correctamente` 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};