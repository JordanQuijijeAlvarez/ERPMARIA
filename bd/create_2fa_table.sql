-- Tabla para almacenar configuración de autenticación de dos factores (2FA)
CREATE TABLE USUARIO_2FA (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id NUMBER NOT NULL,
    secret_2fa VARCHAR2(100),
    enabled NUMBER(1) DEFAULT 0,
    last_used_code VARCHAR2(10),
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_2fa FOREIGN KEY (usuario_id) REFERENCES USUARIO(user_id) ON DELETE CASCADE,
    CONSTRAINT uk_usuario_2fa UNIQUE (usuario_id)
);

-- Índice para búsquedas rápidas por usuario
CREATE INDEX idx_usuario_2fa_usuario_id ON USUARIO_2FA(usuario_id);

-- Comentarios para documentación
COMMENT ON TABLE USUARIO_2FA IS 'Almacena los secretos y configuración de autenticación de dos factores para usuarios';
COMMENT ON COLUMN USUARIO_2FA.usuario_id IS 'ID del usuario (referencia a USUARIO.codigo)';
COMMENT ON COLUMN USUARIO_2FA.secret_2fa IS 'Secreto base32 para generar códigos TOTP';
COMMENT ON COLUMN USUARIO_2FA.enabled IS '1 si 2FA está activo, 0 si está deshabilitado';
COMMENT ON COLUMN USUARIO_2FA.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN USUARIO_2FA.updated_at IS 'Fecha de última actualización';
