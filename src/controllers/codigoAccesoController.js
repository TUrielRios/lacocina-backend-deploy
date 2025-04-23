const { sequelize, CodigoAcceso } = require("../db");


// Generar código aleatorio (para códigos generales)
const generarCodigoAleatorio = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Crear o actualizar código único por tipo
exports.crearActualizarCodigo = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { codigo, tipo } = req.body;
    
    // Validaciones
    if (tipo === 'admin' && !codigo) {
      await transaction.rollback();
      return res.status(400).json({ error: "Debe proporcionar un código para acceso de admin" });
    }
    
    // Eliminar código existente del mismo tipo
    await CodigoAcceso.destroy({
      where: { tipo },
      transaction
    });
    
    // Crear nuevo código
    const codigoFinal = tipo === 'general' && !codigo ? generarCodigoAleatorio() : codigo;
    
    const nuevoCodigo = await CodigoAcceso.create({
      codigo: codigoFinal,
      tipo,
      es_personalizado: !!codigo
    }, { transaction });
    
    await transaction.commit();
    res.status(201).json(nuevoCodigo);
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};

// Obtener códigos actuales
exports.obtenerCodigos = async (req, res) => {
  try {
    const codigos = await CodigoAcceso.findAll();
    res.status(200).json(codigos);
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