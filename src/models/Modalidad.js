// models/Modalidad.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Modalidad = sequelize.define("Modalidad", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.ENUM('Curso', 'Taller'), // Quita el unique de aquí
      allowNull: false
    },
    habilitado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true, // Agrega el unique como índice separado
        fields: ['nombre']
      }
    ]
  });

  return Modalidad;
};