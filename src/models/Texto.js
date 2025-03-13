// models/Texto.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Texto", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });
};