const { CodigoAcceso } = require("../db");

// Generar un nuevo código de acceso
exports.generarCodigo = async (req, res) => {
  try {
    const { tipo } = req.body;
    
    // Generar un código aleatorio de 8 caracteres
    const codigo = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const nuevoCodigo = await CodigoAcceso.create({
      codigo,
      tipo
    });
    
    res.status(201).json(nuevoCodigo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Validar un código de acceso
exports.validarCodigo = async (req, res) => {
  try {
    const { codigo } = req.body;
    
    const codigoEncontrado = await CodigoAcceso.findOne({
      where: { codigo }
    });
    
    if (!codigoEncontrado) {
      return res.status(404).json({ valido: false, mensaje: "Código no encontrado" });
    }
    
    if (codigoEncontrado.usado) {
      return res.status(400).json({ valido: false, mensaje: "Código ya utilizado" });
    }
    
    res.status(200).json({
      valido: true,
      tipo: codigoEncontrado.tipo,
      mensaje: "Código válido"
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Marcar código como usado
exports.usarCodigo = async (req, res) => {
  try {
    const { codigo } = req.body;
    
    const [updated] = await CodigoAcceso.update(
      { usado: true, fecha_uso: new Date() },
      { where: { codigo } }
    );
    
    if (updated) {
      res.status(200).json({ mensaje: "Código marcado como usado" });
    } else {
      res.status(404).json({ error: "Código no encontrado" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Listar todos los códigos
exports.listarCodigos = async (req, res) => {
  try {
    const codigos = await CodigoAcceso.findAll({
      order: [['fecha_creacion', 'DESC']]
    });
    res.status(200).json(codigos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un código
exports.eliminarCodigo = async (req, res) => {
  try {
    const deleted = await CodigoAcceso.destroy({ 
      where: { id: req.params.id } 
    });
    
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Código no encontrado" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};