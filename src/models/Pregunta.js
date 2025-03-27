// models/Pregunta.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Pregunta", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phase: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    modalidad: {
      type: DataTypes.ENUM('Taller', 'Curso'), // Solo permite estos dos valores
      allowNull: false,
      defaultValue: 'Curso', // Valor por defecto
    }
  });

}
