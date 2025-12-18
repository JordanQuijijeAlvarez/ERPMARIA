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