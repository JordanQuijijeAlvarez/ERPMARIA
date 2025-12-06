const pool = require('../../configuracion/db');

exports.getRolesActivos = async (req, res) => {
    const query = 'SELECT * FROM listarRoles()';

    try {
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getRolId = async (req, res) => {
    const { id } = req.params;  // Obtenemos el ID desde los parámetros de la URL
  
    try {
      const query = 'SELECT * FROM listarrolID($1)';  // Llamada a la función listarrolesID
      const result = await pool.query(query, [id]); // Ejecutamos la consulta pasándole el ID
  
      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);  // Devolvemos los datos encontrados
      } else {
        res.status(404).json({ message: 'Rol no encontrado' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };
  