-- Tabla para gestionar sesiones activas
CREATE TABLE IF NOT EXISTS sesiones_activas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    token_jti VARCHAR(255) UNIQUE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    device_fingerprint VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (usuario_id) REFERENCES usuario(codigo) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_id ON sesiones_activas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_token_jti ON sesiones_activas(token_jti);
CREATE INDEX IF NOT EXISTS idx_sesiones_active ON sesiones_activas(is_active);
CREATE INDEX IF NOT EXISTS idx_sesiones_expires ON sesiones_activas(expires_at);

-- Función para limpiar sesiones expiradas automáticamente
CREATE OR REPLACE FUNCTION limpiar_sesiones_expiradas()
RETURNS void AS $$
BEGIN
    DELETE FROM sesiones_activas 
    WHERE expires_at < NOW() OR is_active = false;
END;
$$ LANGUAGE plpgsql;

-- Opcional: Configurar limpieza automática (ejecutar manualmente cuando sea necesario)
-- SELECT limpiar_sesiones_expiradas();
