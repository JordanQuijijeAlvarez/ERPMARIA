const oracledb = require('oracledb');
require('dotenv').config();

// Configuración simple de conexión Oracle
const dbConfig = {
  user: process.env.ORC_DB_USER,
  password: process.env.ORC_DB_PASSWORD,
  connectString: process.env.ORC_DB_CONNECT_STRING
};

// Función simple para obtener conexión
async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    return connection;
  } catch (err) {
    console.error('Error conectando a Oracle:', err);
    throw err;
  }
}

module.exports = {
  getConnection,
  oracledb
};;