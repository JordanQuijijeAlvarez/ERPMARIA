const pool = require('./configuracion/db');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    try {
        console.log('🚀 Iniciando configuración de base de datos...');
        
        // Leer el script SQL
        const sqlScript = fs.readFileSync(
            path.join(__dirname, 'configuracion', 'create_sessions_table.sql'), 
            'utf8'
        );
        
        // Ejecutar el script
        await pool.query(sqlScript);
        
        console.log('✅ Tabla de sesiones activas creada exitosamente');
        console.log('✅ Índices creados exitosamente');
        console.log('✅ Función de limpieza creada exitosamente');
        
        // Verificar que la tabla existe
        const checkTableQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'sesiones_activas'
        `;
        
        const result = await pool.query(checkTableQuery);
        
        if (result.rows.length > 0) {
            console.log('✅ Verificación: Tabla sesiones_activas existe');
        } else {
            console.log('❌ Error: No se pudo verificar la tabla');
        }
        
        console.log('\n🎉 Base de datos configurada correctamente!');
        console.log('\nAhora puedes:');
        console.log('1. Iniciar tu servidor con: npm start o node server.js');
        console.log('2. Probar el login y logout mejorados');
        console.log('3. Verificar que los tokens copiados ya no funcionan');
        
    } catch (error) {
        console.error('❌ Error configurando la base de datos:', error);
        console.log('\nPosibles soluciones:');
        console.log('1. Verificar que PostgreSQL esté ejecutándose');
        console.log('2. Verificar las credenciales de la base de datos en .env');
        console.log('3. Verificar que tengas permisos para crear tablas');
    } finally {
        await pool.end();
    }
}

// Ejecutar solo si este archivo se ejecuta directamente
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };
