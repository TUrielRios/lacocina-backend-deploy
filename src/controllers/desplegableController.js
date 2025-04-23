const { Desplegable, sequelize } = require("../db");

// Obtener todas las opciones de una categoría
exports.getOpciones = async (req, res) => {
  try {
    const { categoria } = req.params;
    
    const opciones = await Desplegable.findAll({
      where: { categoria },
      order: [['orden', 'ASC']],
      attributes: ['id', 'valor', 'orden']
    });
    
    res.status(200).json(opciones);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Agregar nueva opción
exports.addOpcion = async (req, res) => {
  try {
    const { categoria, valor } = req.body;
    
    // Obtener el máximo orden actual para esta categoría
    const maxOrden = await Desplegable.max('orden', {
      where: { categoria }
    });
    
    const nuevaOpcion = await Desplegable.create({
      categoria,
      valor,
      orden: maxOrden + 1 || 0
    });
    
    res.status(201).json(nuevaOpcion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar opción
exports.updateOpcion = async (req, res) => {
  try {
    const { id } = req.params;
    const { valor } = req.body;
    
    const [updated] = await Desplegable.update(
      { valor },
      { where: { id } }
    );
    
    if (updated) {
      const opcionActualizada = await Desplegable.findByPk(id);
      res.status(200).json(opcionActualizada);
    } else {
      res.status(404).json({ error: "Opción no encontrada" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar opción
exports.deleteOpcion = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    // Primero obtenemos la opción para saber su categoría y orden
    const opcion = await Desplegable.findByPk(id, { transaction });
    if (!opcion) {
      await transaction.rollback();
      return res.status(404).json({ error: "Opción no encontrada" });
    }
    
    // Eliminamos la opción
    await Desplegable.destroy({ 
      where: { id },
      transaction
    });
    
    // Actualizamos el orden de las opciones restantes
    await Desplegable.decrement('orden', {
      where: {
        categoria: opcion.categoria,
        orden: { [sequelize.Op.gt]: opcion.orden }
      },
      transaction
    });
    
    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};

// Reordenar opciones
exports.reordenarOpciones = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { categoria } = req.params;
    const { opciones } = req.body; // Array de IDs en el nuevo orden
    
    // Verificar que todas las opciones pertenecen a la misma categoría
    const count = await Desplegable.count({
      where: {
        id: opciones,
        categoria
      },
      transaction
    });
    
    if (count !== opciones.length) {
      await transaction.rollback();
      return res.status(400).json({ error: "Algunas opciones no pertenecen a la categoría especificada" });
    }
    
    // Actualizar el orden de cada opción
    await Promise.all(opciones.map(async (id, index) => {
      await Desplegable.update(
        { orden: index },
        { where: { id }, transaction }
      );
    }));
    
    await transaction.commit();
    res.status(200).json({ mensaje: "Opciones reordenadas correctamente" });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};

// Inicializar desplegables con valores por defecto
exports.inicializarDesplegables = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // Eliminar todas las opciones existentes
    await Desplegable.destroy({ where: {}, transaction });
    
    // Valores por defecto
    const valoresPorDefecto = [
      // Industria/Sector
      { categoria: 'industriaSector', valor: 'Tecnología / Software', orden: 0 },
      { categoria: 'industriaSector', valor: 'Servicios Financieros', orden: 1 },
      { categoria: 'industriaSector', valor: 'Educación / Academia', orden: 2 },
      { categoria: 'industriaSector', valor: 'Salud / Farmacia', orden: 3 },
      { categoria: 'industriaSector', valor: 'Cosmética', orden: 4 },
      { categoria: 'industriaSector', valor: 'Turismo', orden: 5 },
      { categoria: 'industriaSector', valor: 'Alimentación y Bebidas', orden: 6 },
      { categoria: 'industriaSector', valor: 'Moda / Indumentaria', orden: 7 },
      { categoria: 'industriaSector', valor: 'Energía', orden: 8 },
      { categoria: 'industriaSector', valor: 'Consultoría', orden: 9 },
      { categoria: 'industriaSector', valor: 'Gobierno / ONGs', orden: 10 },
      { categoria: 'industriaSector', valor: 'Entretenimiento / Medios', orden: 11 },
      { categoria: 'industriaSector', valor: 'Transporte / Logística', orden: 12 },
      { categoria: 'industriaSector', valor: 'Automotriz', orden: 13 },
      { categoria: 'industriaSector', valor: 'Construcción / Infraestructura', orden: 14 },
      { categoria: 'industriaSector', valor: 'Agricultura', orden: 15 },
      { categoria: 'industriaSector', valor: 'Decoración / Hogar', orden: 16 },
      { categoria: 'industriaSector', valor: 'Higiene / Bienestar', orden: 17 },
      { categoria: 'industriaSector', valor: 'Otro', orden: 18 },
      
      // Área de Desempeño
      { categoria: 'areaDesempeno', valor: 'Directorio', orden: 0 },
      { categoria: 'areaDesempeno', valor: 'Administración/Finanzas', orden: 1 },
      { categoria: 'areaDesempeno', valor: 'Comercial/Ventas', orden: 2 },
      { categoria: 'areaDesempeno', valor: 'Marketing', orden: 3 },
      { categoria: 'areaDesempeno', valor: 'Diseño/Comunicación', orden: 4 },
      { categoria: 'areaDesempeno', valor: 'Recursos Humanos', orden: 5 },
      { categoria: 'areaDesempeno', valor: 'Legales', orden: 6 },
      { categoria: 'areaDesempeno', valor: 'Investigación y desarrollo', orden: 7 },
      { categoria: 'areaDesempeno', valor: 'Ingeniería de planta', orden: 8 },
      { categoria: 'areaDesempeno', valor: 'Otro', orden: 9 },
      
      // Cargo/Posición
      { categoria: 'cargo', valor: 'CEO / Fundador', orden: 0 },
      { categoria: 'cargo', valor: 'Director(a) de marketing', orden: 1 },
      { categoria: 'cargo', valor: 'Director(a) de comunicación', orden: 2 },
      { categoria: 'cargo', valor: 'Gerente de producto', orden: 3 },
      { categoria: 'cargo', valor: 'Gerente de marca', orden: 4 },
      { categoria: 'cargo', valor: 'Consultor(a)', orden: 5 },
      { categoria: 'cargo', valor: 'Emprendedor(a)', orden: 6 },
      { categoria: 'cargo', valor: 'Diseñador(a)', orden: 7 },
      { categoria: 'cargo', valor: 'Community manager', orden: 8 },
      { categoria: 'cargo', valor: 'Freelancer', orden: 9 },
      { categoria: 'cargo', valor: 'Académico / Docente', orden: 10 },
      { categoria: 'cargo', valor: 'Estudiante', orden: 11 },
      { categoria: 'cargo', valor: 'Otro', orden: 12 }
    ];
    
    // Insertar valores por defecto
    await Desplegable.bulkCreate(valoresPorDefecto, { transaction });
    
    await transaction.commit();
    res.status(200).json({ mensaje: "Desplegables inicializados con valores por defecto" });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};