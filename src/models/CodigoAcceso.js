const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("CodigoAcceso", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    tipo: {
      type: DataTypes.ENUM('general', 'admin'),
      allowNull: false,
    },
    usado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_uso: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    es_personalizado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  });
};