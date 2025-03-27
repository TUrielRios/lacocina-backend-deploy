const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Usuario = sequelize.define("Usuario", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    modalidad: {
      type: DataTypes.ENUM('Taller', 'Curso'),
      allowNull: false,
    },
    // Campos comunes
    compania: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    industriaSector: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    areaDesempeno: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Campos específicos para Taller (incógnito)
    codigoTaller: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    // Campos específicos para Curso
    nombre: {
      type: DataTypes.STRING,
      allowNull: true, // Solo requerido para Curso
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: true, // Solo requerido para Curso
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true, // Solo requerido para Curso
      validate: {
        isEmail: true,
      },
    },
    curso: {
      type: DataTypes.STRING,
      allowNull: true, // Solo requerido para Curso
    },
    cargo: {
      type: DataTypes.STRING,
      allowNull: true, // Solo requerido para Curso
    },
    // Promedios por fase
// ... (otros campos)
    validacionSocial: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null
    },
    atractivo: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null
    },
    reciprocidad: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null
    },
    autoridad: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null
    },
    autenticidad: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null
    },
    consistenciaCompromiso: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null
    },
    // ... (resto del modelo)
    // Fecha de creación
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    // Opciones adicionales del modelo
    timestamps: true,
    paranoid: true, // Para borrado lógico
  });

  // Métodos personalizados
  Usuario.prototype.generarCodigoTaller = function() {
    if (this.modalidad === 'Taller') {
      this.codigoTaller = `TALLER-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    }
  };

  return Usuario;
};