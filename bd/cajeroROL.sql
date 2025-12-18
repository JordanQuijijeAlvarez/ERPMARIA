INSERT INTO rol (rol_nombre)
VALUES ('CAJERO');

INSERT INTO rol_permiso (rol_id, perm_id)
SELECT
    r.rol_id,
    p.perm_id
FROM rol r
JOIN permiso p
    ON (
        -- LECTURA
        (p.perm_recurso_tabla = 'LOCAL'            AND p.perm_recurso_accion = 'READ') OR
        (p.perm_recurso_tabla = 'PRODUCTO'         AND p.perm_recurso_accion = 'READ') OR
        (p.perm_recurso_tabla = 'CLIENTE'          AND p.perm_recurso_accion = 'READ') OR
        (p.perm_recurso_tabla = 'VENTA'            AND p.perm_recurso_accion = 'READ') OR
        (p.perm_recurso_tabla = 'DETALLE_VENTA'    AND p.perm_recurso_accion = 'READ') OR
        (p.perm_recurso_tabla = 'MOVIMIENTO_STOCK' AND p.perm_recurso_accion = 'READ') OR
        (p.perm_recurso_tabla = 'AUDITORIA'        AND p.perm_recurso_accion = 'READ') OR

        -- ESCRITURA
        (p.perm_recurso_tabla = 'VENTA'             AND p.perm_recurso_accion = 'WRITE') OR
        (p.perm_recurso_tabla = 'DETALLE_VENTA'     AND p.perm_recurso_accion = 'WRITE') OR
        (p.perm_recurso_tabla = 'CLIENTE'           AND p.perm_recurso_accion = 'WRITE') OR
        (p.perm_recurso_tabla = 'MOVIMIENTO_STOCK'  AND p.perm_recurso_accion = 'WRITE')
    )
WHERE r.rol_nombre = 'CAJERO';

COMMIT;

SELECT r.rol_nombre,
       p.perm_recurso_tabla,
       p.perm_recurso_accion
FROM rol r
JOIN rol_permiso rp ON rp.rol_id = r.rol_id
JOIN permiso p ON p.perm_id = rp.perm_id
WHERE r.rol_nombre = 'CAJERO'
ORDER BY p.perm_recurso_tabla, p.perm_recurso_accion;

CREATE OR REPLACE PROCEDURE cambiar_rol_usuario (
    p_user_id IN usuario_rol.user_id%TYPE,
    p_rol_id  IN usuario_rol.rol_id%TYPE
) AS
BEGIN

    -- 1. Desactivar roles actuales del usuario
    UPDATE usuario_rol
    SET user_rol_estado = 0
    WHERE user_id = p_user_id
      AND user_rol_estado = 1;

    -- 2. Asignar nuevo rol
    INSERT INTO usuario_rol (
        user_id,
        rol_id,
        user_rol_estado
    ) VALUES (
        p_user_id,
        p_rol_id,
        1
    );

    COMMIT;

END cambiar_rol_usuario;
/