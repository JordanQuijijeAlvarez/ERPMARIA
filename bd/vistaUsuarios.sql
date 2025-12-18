CREATE OR REPLACE VIEW VW_USUARIO_ROL AS
SELECT
    u.user_id,
    u.user_nombres,
    u.user_apellidos,
    u.user_username,
    u.user_contrasenia,
    r.rol_id,
    r.rol_nombre,
    u.user_correo,
    u.user_estado
FROM usuario u
JOIN usuario_rol ur
    ON u.user_id = ur.user_id AND ur.user_rol_estado = 1
JOIN rol r
    ON r.rol_id = ur.rol_id