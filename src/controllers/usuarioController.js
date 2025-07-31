const { Usuario, RespuestaPregunta, Pregunta, sequelize } = require("../db")
const { Op } = require("sequelize")

// Crear usuario con respuestas individuales (compatible con formato anterior)
exports.createUsuario = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const { modalidad, mensajeFeedback, respuestas, ...userData } = req.body

    // Validar campos según modalidad
    if (modalidad === "Taller") {
      // Generar código único para taller (incógnito)
      userData.codigoTaller = `TALLER-${Math.random().toString(36).substr(2, 8).toUpperCase()}`

      // Eliminar campos que no deben estar para Taller
      delete userData.nombre
      delete userData.apellido
      delete userData.email
      delete userData.curso
      delete userData.cargo
    } else if (modalidad === "Curso") {
      // Validar campos requeridos para Curso
      const requiredFields = ["nombre", "apellido", "email", "curso", "cargo"]
      const missingFields = requiredFields.filter((field) => !userData[field])

      if (missingFields.length > 0) {
        await transaction.rollback()
        return res.status(400).json({
          error: `Faltan campos requeridos para Curso: ${missingFields.join(", ")}`,
        })
      }
    } else {
      await transaction.rollback()
      return res.status(400).json({ error: "Modalidad inválida" })
    }

    // Validar campos comunes requeridos
    const commonRequiredFields = ["compania", "industriaSector", "sector", "areaDesempeno"]
    const missingCommonFields = commonRequiredFields.filter((field) => !userData[field])

    if (missingCommonFields.length > 0) {
      await transaction.rollback()
      return res.status(400).json({
        error: `Faltan campos requeridos: ${missingCommonFields.join(", ")}`,
      })
    }

    // Calcular promedios por fase si se proporcionan respuestas individuales
    const promediosPorFase = {}
    if (respuestas && Array.isArray(respuestas)) {
      // Agrupar respuestas por fase
      const respuestasPorFase = {}

      for (const respuesta of respuestas) {
        const { preguntaId, puntuacion, fase } = respuesta

        if (!respuestasPorFase[fase]) {
          respuestasPorFase[fase] = []
        }
        respuestasPorFase[fase].push(puntuacion)
      }

      // Calcular promedios
      for (const [fase, puntuaciones] of Object.entries(respuestasPorFase)) {
        const promedio = puntuaciones.reduce((sum, p) => sum + p, 0) / puntuaciones.length

        // Mapear nombres de fases a campos del modelo
        const mapeoFases = {
          validacionSocial: "validacionSocial",
          atractivo: "atractivo",
          reciprocidad: "reciprocidad",
          autoridad: "autoridad",
          autenticidad: "autenticidad",
          consistenciaCompromiso: "consistenciaCompromiso",
        }

        if (mapeoFases[fase]) {
          promediosPorFase[mapeoFases[fase]] = Number.parseFloat(promedio.toFixed(2))
        }
      }
    }

    // Crear usuario con promedios calculados
    const nuevoUsuario = await Usuario.create(
      {
        modalidad,
        mensajeFeedback,
        ...userData,
        ...promediosPorFase,
      },
      { transaction },
    )

    // Guardar respuestas individuales si se proporcionan
    if (respuestas && Array.isArray(respuestas)) {
      const respuestasParaGuardar = respuestas.map((respuesta) => ({
        usuarioId: nuevoUsuario.id,
        preguntaId: respuesta.preguntaId,
        puntuacion: respuesta.puntuacion,
        fase: respuesta.fase,
      }))

      await RespuestaPregunta.bulkCreate(respuestasParaGuardar, { transaction })
    }

    await transaction.commit()
    res.status(201).json(nuevoUsuario)
  } catch (error) {
    await transaction.rollback()
    console.error("Error creando usuario:", error)
    res.status(400).json({ error: error.message })
  }
}

// Función helper para organizar respuestas por fase
const organizarRespuestasPorFase = (respuestas) => {
  const respuestasPorFase = {}

  respuestas.forEach((respuesta) => {
    const fase = respuesta.fase

    if (!respuestasPorFase[fase]) {
      respuestasPorFase[fase] = {
        preguntas: [],
        promedio: 0,
        totalPuntos: 0,
        cantidadPreguntas: 0,
      }
    }

    respuestasPorFase[fase].preguntas.push({
      preguntaId: respuesta.preguntaId,
      textoPregunta: respuesta.pregunta.text,
      puntuacion: respuesta.puntuacion,
      categoria: respuesta.pregunta.category,
    })

    respuestasPorFase[fase].totalPuntos += respuesta.puntuacion
    respuestasPorFase[fase].cantidadPreguntas += 1
  })

  // Calcular promedios por fase
  Object.keys(respuestasPorFase).forEach((fase) => {
    const faseData = respuestasPorFase[fase]
    faseData.promedio = Number.parseFloat((faseData.totalPuntos / faseData.cantidadPreguntas).toFixed(2))

    // Ordenar preguntas por ID
    faseData.preguntas.sort((a, b) => a.preguntaId - b.preguntaId)
  })

  return respuestasPorFase
}

// Obtener todos los usuarios de Taller (compatible con datos existentes)
exports.getUsuariosTaller = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      where: { modalidad: "Taller" },
      attributes: [
        "id",
        "compania",
        "industriaSector",
        "sector",
        "areaDesempeno",
        "codigoTaller",
        "validacionSocial",
        "atractivo",
        "reciprocidad",
        "autoridad",
        "autenticidad",
        "consistenciaCompromiso",
        "mensajeFeedback",
        "createdAt",
      ],
      include: [
        {
          model: RespuestaPregunta,
          as: "respuestas",
          required: false, // LEFT JOIN para incluir usuarios sin respuestas individuales
          include: [
            {
              model: Pregunta,
              as: "pregunta",
              attributes: ["id", "text", "category", "phase", "modalidad"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    // Procesar usuarios para manejar ambos formatos
    const usuariosProcessed = usuarios.map((usuario) => {
      const usuarioData = usuario.toJSON()

      // Si tiene respuestas individuales, organizarlas por fase
      if (usuarioData.respuestas && usuarioData.respuestas.length > 0) {
        const respuestasPorFase = organizarRespuestasPorFase(usuarioData.respuestas)

        return {
          ...usuarioData,
          respuestas: undefined,
          respuestasPorFase: respuestasPorFase,
          tieneRespuestasIndividuales: true,
          promediosCalculados: {
            validacionSocial: respuestasPorFase.validacionSocial?.promedio || null,
            atractivo: respuestasPorFase.atractivo?.promedio || null,
            reciprocidad: respuestasPorFase.reciprocidad?.promedio || null,
            autoridad: respuestasPorFase.autoridad?.promedio || null,
            autenticidad: respuestasPorFase.autenticidad?.promedio || null,
            consistenciaCompromiso: respuestasPorFase.consistenciaCompromiso?.promedio || null,
          },
        }
      } else {
        // Usuario con formato anterior (solo promedios)
        return {
          ...usuarioData,
          respuestas: undefined,
          respuestasPorFase: null,
          tieneRespuestasIndividuales: false,
          promediosCalculados: {
            validacionSocial: usuarioData.validacionSocial,
            atractivo: usuarioData.atractivo,
            reciprocidad: usuarioData.reciprocidad,
            autoridad: usuarioData.autoridad,
            autenticidad: usuarioData.autenticidad,
            consistenciaCompromiso: usuarioData.consistenciaCompromiso,
          },
        }
      }
    })

    res.status(200).json(usuariosProcessed)
  } catch (error) {
    console.error("Error obteniendo usuarios taller:", error)
    res.status(400).json({ error: error.message })
  }
}

// Obtener todos los usuarios de Curso (compatible con datos existentes)
exports.getUsuariosCurso = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      where: { modalidad: "Curso" },
      attributes: [
        "id",
        "nombre",
        "apellido",
        "email",
        "curso",
        "compania",
        "industriaSector",
        "sector",
        "areaDesempeno",
        "cargo",
        "validacionSocial",
        "atractivo",
        "reciprocidad",
        "autoridad",
        "autenticidad",
        "consistenciaCompromiso",
        "mensajeFeedback",
        "createdAt",
      ],
      include: [
        {
          model: RespuestaPregunta,
          as: "respuestas",
          required: false, // LEFT JOIN para incluir usuarios sin respuestas individuales
          include: [
            {
              model: Pregunta,
              as: "pregunta",
              attributes: ["id", "text", "category", "phase", "modalidad"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    // Procesar usuarios para manejar ambos formatos
    const usuariosProcessed = usuarios.map((usuario) => {
      const usuarioData = usuario.toJSON()

      // Si tiene respuestas individuales, organizarlas por fase
      if (usuarioData.respuestas && usuarioData.respuestas.length > 0) {
        const respuestasPorFase = organizarRespuestasPorFase(usuarioData.respuestas)

        return {
          ...usuarioData,
          respuestas: undefined,
          respuestasPorFase: respuestasPorFase,
          tieneRespuestasIndividuales: true,
          promediosCalculados: {
            validacionSocial: respuestasPorFase.validacionSocial?.promedio || null,
            atractivo: respuestasPorFase.atractivo?.promedio || null,
            reciprocidad: respuestasPorFase.reciprocidad?.promedio || null,
            autoridad: respuestasPorFase.autoridad?.promedio || null,
            autenticidad: respuestasPorFase.autenticidad?.promedio || null,
            consistenciaCompromiso: respuestasPorFase.consistenciaCompromiso?.promedio || null,
          },
        }
      } else {
        // Usuario con formato anterior (solo promedios)
        return {
          ...usuarioData,
          respuestas: undefined,
          respuestasPorFase: null,
          tieneRespuestasIndividuales: false,
          promediosCalculados: {
            validacionSocial: usuarioData.validacionSocial,
            atractivo: usuarioData.atractivo,
            reciprocidad: usuarioData.reciprocidad,
            autoridad: usuarioData.autoridad,
            autenticidad: usuarioData.autenticidad,
            consistenciaCompromiso: usuarioData.consistenciaCompromiso,
          },
        }
      }
    })

    res.status(200).json(usuariosProcessed)
  } catch (error) {
    console.error("Error obteniendo usuarios curso:", error)
    res.status(400).json({ error: error.message })
  }
}

// Obtener un usuario específico con sus respuestas organizadas por fase
exports.getUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const usuario = await Usuario.findByPk(id, {
      include: [
        {
          model: RespuestaPregunta,
          as: "respuestas",
          required: false,
          include: [
            {
              model: Pregunta,
              as: "pregunta",
              attributes: ["id", "text", "category", "phase", "modalidad"],
            },
          ],
        },
      ],
    })

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    const usuarioData = usuario.toJSON()

    // Si tiene respuestas individuales, organizarlas por fase
    if (usuarioData.respuestas && usuarioData.respuestas.length > 0) {
      const respuestasPorFase = organizarRespuestasPorFase(usuarioData.respuestas)

      const usuarioConRespuestasOrganizadas = {
        ...usuarioData,
        respuestas: undefined,
        respuestasPorFase: respuestasPorFase,
        tieneRespuestasIndividuales: true,
        promediosCalculados: {
          validacionSocial: respuestasPorFase.validacionSocial?.promedio || null,
          atractivo: respuestasPorFase.atractivo?.promedio || null,
          reciprocidad: respuestasPorFase.reciprocidad?.promedio || null,
          autoridad: respuestasPorFase.autoridad?.promedio || null,
          autenticidad: respuestasPorFase.autenticidad?.promedio || null,
          consistenciaCompromiso: respuestasPorFase.consistenciaCompromiso?.promedio || null,
        },
      }

      res.status(200).json(usuarioConRespuestasOrganizadas)
    } else {
      // Usuario con formato anterior (solo promedios)
      const usuarioConFormatoAnterior = {
        ...usuarioData,
        respuestas: undefined,
        respuestasPorFase: null,
        tieneRespuestasIndividuales: false,
        promediosCalculados: {
          validacionSocial: usuarioData.validacionSocial,
          atractivo: usuarioData.atractivo,
          reciprocidad: usuarioData.reciprocidad,
          autoridad: usuarioData.autoridad,
          autenticidad: usuarioData.autenticidad,
          consistenciaCompromiso: usuarioData.consistenciaCompromiso,
        },
      }

      res.status(200).json(usuarioConFormatoAnterior)
    }
  } catch (error) {
    console.error("Error obteniendo usuario:", error)
    res.status(400).json({ error: error.message })
  }
}

// Obtener estadísticas de promedios
exports.getEstadisticas = async (req, res) => {
  try {
    const estadisticas = await Usuario.findAll({
      attributes: [
        "modalidad",
        [sequelize.fn("AVG", sequelize.col("validacionSocial")), "avgValidacionSocial"],
        [sequelize.fn("AVG", sequelize.col("atractivo")), "avgAtractivo"],
        [sequelize.fn("AVG", sequelize.col("reciprocidad")), "avgReciprocidad"],
        [sequelize.fn("AVG", sequelize.col("autoridad")), "avgAutoridad"],
        [sequelize.fn("AVG", sequelize.col("autenticidad")), "avgAutenticidad"],
        [sequelize.fn("AVG", sequelize.col("consistenciaCompromiso")), "avgConsistenciaCompromiso"],
      ],
      group: ["modalidad"],
    })

    res.status(200).json(estadisticas)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Actualizar usuario (mantener funcionalidad existente)
exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const allowedFields = [
      "validacionSocial",
      "atractivo",
      "reciprocidad",
      "autoridad",
      "autenticidad",
      "consistenciaCompromiso",
      "mensajeFeedback",
    ]

    const filteredUpdate = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key]
        return obj
      }, {})

    const promedios = [
      "validacionSocial",
      "atractivo",
      "reciprocidad",
      "autoridad",
      "autenticidad",
      "consistenciaCompromiso",
    ]

    for (const [key, value] of Object.entries(filteredUpdate)) {
      if (promedios.includes(key) && (value < 1 || value > 10)) {
        return res.status(400).json({
          error: `El promedio de ${key} debe estar entre 1 y 10`,
        })
      }
    }

    const [updated] = await Usuario.update(filteredUpdate, {
      where: { id },
    })

    if (updated) {
      const updatedUsuario = await Usuario.findByPk(id)
      res.status(200).json(updatedUsuario)
    } else {
      res.status(404).json({ error: "Usuario no encontrado" })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Actualizar solo el feedback de un usuario
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params
    const { mensajeFeedback } = req.body

    if (!mensajeFeedback) {
      return res.status(400).json({ error: "El mensaje de feedback es requerido" })
    }

    const [updated] = await Usuario.update({ mensajeFeedback }, { where: { id } })

    if (updated) {
      res.status(200).json({ success: true })
    } else {
      res.status(404).json({ error: "Usuario no encontrado" })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Borrar un usuario por ID
exports.deleteUsuario = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params

    // Eliminar respuestas asociadas primero (si existen)
    await RespuestaPregunta.destroy({
      where: { usuarioId: id },
      transaction,
    })

    const deleted = await Usuario.destroy({
      where: { id },
      transaction,
    })

    if (deleted) {
      await transaction.commit()
      res.status(200).json({ message: "Usuario eliminado correctamente" })
    } else {
      await transaction.rollback()
      res.status(404).json({ error: "Usuario no encontrado" })
    }
  } catch (error) {
    await transaction.rollback()
    res.status(400).json({ error: error.message })
  }
}

// Borrar múltiples usuarios por IDs
exports.deleteMultipleUsuarios = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const { ids } = req.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      await transaction.rollback()
      return res.status(400).json({ error: "Se requiere un array de IDs válido" })
    }

    // Eliminar respuestas asociadas primero (si existen)
    await RespuestaPregunta.destroy({
      where: { usuarioId: ids },
      transaction,
    })

    const deleted = await Usuario.destroy({
      where: { id: ids },
      transaction,
    })

    await transaction.commit()
    res.status(200).json({
      message: `${deleted} usuario(s) eliminado(s) correctamente`,
    })
  } catch (error) {
    await transaction.rollback()
    res.status(400).json({ error: error.message })
  }
}
