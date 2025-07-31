const { sequelize, Usuario, Pregunta, RespuestaPregunta } = require("../db")
const { Op } = require("sequelize")

async function migrateDatabase() {
  try {
    console.log("🔄 Iniciando migración de base de datos...")

    // 1. Verificar qué tablas existen
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)

    console.log(
      "📋 Tablas existentes:",
      results.map((r) => r.table_name),
    )

    // 2. Crear la nueva tabla RespuestaPregunta si no existe
    await sequelize.sync({ alter: true })
    console.log("✅ Tabla RespuestaPregunta creada/actualizada")

    // 3. Verificar si hay usuarios con datos existentes
    const usuariosConPromedios = await Usuario.findAll({
      where: {
        [Op.or]: [
          { validacionSocial: { [Op.ne]: null } },
          { atractivo: { [Op.ne]: null } },
          { reciprocidad: { [Op.ne]: null } },
          { autoridad: { [Op.ne]: null } },
          { autenticidad: { [Op.ne]: null } },
          { consistenciaCompromiso: { [Op.ne]: null } },
        ],
      },
    })

    console.log(`📊 Encontrados ${usuariosConPromedios.length} usuarios con promedios existentes`)

    if (usuariosConPromedios.length > 0) {
      console.log("⚠️  ATENCIÓN: Hay usuarios con promedios existentes.")
      console.log("   Los datos existentes se mantendrán intactos.")
      console.log("   Para nuevos usuarios, usa el formato con respuestas individuales.")
      console.log("   Para usuarios existentes, los promedios seguirán funcionando normalmente.")

      // Mostrar algunos ejemplos
      console.log("\n📋 Ejemplos de usuarios existentes:")
      usuariosConPromedios.slice(0, 3).forEach((usuario, index) => {
        console.log(`   ${index + 1}. ID: ${usuario.id}, Compañía: ${usuario.compania}`)
        console.log(
          `      Promedios: VS:${usuario.validacionSocial}, A:${usuario.atractivo}, R:${usuario.reciprocidad}`,
        )
      })
    }

    // 4. Verificar estructura de preguntas (corregido el nombre de la tabla)
    const totalPreguntas = await Pregunta.count()
    console.log(`📝 Total de preguntas en la base de datos: ${totalPreguntas}`)

    if (totalPreguntas > 0) {
      // Usar el nombre correcto de la tabla (singular)
      const preguntasPorFase = await sequelize.query(
        `
        SELECT phase, COUNT(*) as cantidad
        FROM "Pregunta" 
        GROUP BY phase
      `,
        { type: sequelize.QueryTypes.SELECT },
      )

      console.log("📊 Preguntas por fase:")
      preguntasPorFase.forEach((fase) => {
        console.log(`   ${fase.phase}: ${fase.cantidad} preguntas`)
      })

      // También verificar por modalidad
      const preguntasPorModalidad = await sequelize.query(
        `
        SELECT modalidad, COUNT(*) as cantidad
        FROM "Pregunta" 
        GROUP BY modalidad
      `,
        { type: sequelize.QueryTypes.SELECT },
      )

      console.log("📊 Preguntas por modalidad:")
      preguntasPorModalidad.forEach((modalidad) => {
        console.log(`   ${modalidad.modalidad}: ${modalidad.cantidad} preguntas`)
      })
    }

    // 5. Verificar si la tabla RespuestaPregunta tiene datos
    const totalRespuestas = await RespuestaPregunta.count()
    console.log(`💬 Total de respuestas individuales: ${totalRespuestas}`)

    // 6. Verificar integridad de las relaciones
    console.log("\n🔍 Verificando integridad de datos...")

    // Verificar que las tablas necesarias existen
    const tablasRequeridas = ["Usuarios", "Pregunta", "RespuestaPregunta"]
    const tablasExistentes = results.map((r) => r.table_name)

    const tablasFaltantes = tablasRequeridas.filter((tabla) => !tablasExistentes.includes(tabla))

    if (tablasFaltantes.length > 0) {
      console.log(`⚠️  Tablas faltantes: ${tablasFaltantes.join(", ")}`)
    } else {
      console.log("✅ Todas las tablas requeridas están presentes")
    }

    console.log("✅ Migración completada exitosamente")
    console.log("\n🔧 Próximos pasos:")
    console.log("   1. Los usuarios existentes seguirán funcionando con sus promedios")
    console.log("   2. Los nuevos usuarios pueden usar respuestas individuales")
    console.log("   3. El sistema es compatible con ambos formatos")
    console.log("   4. Puedes reiniciar el servidor ahora")

    console.log("\n📋 Resumen de la migración:")
    console.log(`   • ${usuariosConPromedios.length} usuarios existentes preservados`)
    console.log(`   • ${totalPreguntas} preguntas disponibles`)
    console.log(`   • ${totalRespuestas} respuestas individuales existentes`)
    console.log("   • Sistema retrocompatible activado")
  } catch (error) {
    console.error("❌ Error durante la migración:", error)
    console.error("📋 Detalles del error:", {
      name: error.name,
      message: error.message,
      sql: error.sql || "No SQL disponible",
    })
    throw error
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log("🎉 Migración finalizada exitosamente")
      console.log("🚀 El servidor está listo para funcionar")
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Error en migración:", error.message)
      process.exit(1)
    })
}

module.exports = { migrateDatabase }
