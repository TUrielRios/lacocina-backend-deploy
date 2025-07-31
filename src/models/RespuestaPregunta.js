const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const RespuestaPregunta = sequelize.define(
    "RespuestaPregunta",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // Removemos las referencias por ahora para evitar problemas de orden
      },
      preguntaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // Removemos las referencias por ahora para evitar problemas de orden
      },
      puntuacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 10,
        },
      },
      fase: {
        type: DataTypes.STRING,
        allowNull: false, // Para facilitar consultas
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["usuarioId", "preguntaId"], // Un usuario solo puede responder una vez cada pregunta
        },
      ],
    },
  )

  return RespuestaPregunta
}
