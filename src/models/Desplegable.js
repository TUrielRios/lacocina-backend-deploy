const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Desplegable", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoria: {
      type: DataTypes.ENUM('curso','compania','industriaSector','sector', 'areaDesempeno', 'cargo'),
      allowNull: false,
    },
    valor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orden: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });
};