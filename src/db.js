const { Sequelize } = require("sequelize")
const fs = require("fs")
const path = require("path")
require("pg")
const {} = process.env
const sequelize = new Sequelize(
  "postgresql://postgres:MIAHOrTByrziEdIHkAvCznuLHnynpeTa@trolley.proxy.rlwy.net:25773/railway",
  {
    logging: false, // set to console.log to see the raw SQL queries
    native: false, // lets Sequelize know we can use pg-native for ~30% more speed
  },
)
const basename = path.basename(__filename)

const modelDefiners = []

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, "/models"))
  .filter((file) => file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js")
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)))
  })

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize))
// Capitalizamos los nombres de los modelos ie: product => Product
const entries = Object.entries(sequelize.models)
const capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]])
sequelize.models = Object.fromEntries(capsEntries)

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { Pregunta, Texto, Usuario, CodigoAcceso, Desplegable, Modalidad, RespuestaPregunta } = sequelize.models

// Relaciones - Las definimos después de que todos los modelos estén cargados
if (Usuario && RespuestaPregunta) {
  Usuario.hasMany(RespuestaPregunta, { foreignKey: "usuarioId", as: "respuestas" })
  RespuestaPregunta.belongsTo(Usuario, { foreignKey: "usuarioId", as: "usuario" })
}

if (Pregunta && RespuestaPregunta) {
  Pregunta.hasMany(RespuestaPregunta, { foreignKey: "preguntaId", as: "respuestas" })
  RespuestaPregunta.belongsTo(Pregunta, { foreignKey: "preguntaId", as: "pregunta" })
}

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,
  sequelize, // para importart la conexión { conn } = require('./db.js');
}
