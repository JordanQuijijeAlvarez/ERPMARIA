------------------------------------------------------------
-- 1. CREAR ROL ADMINISTRADOR
------------------------------------------------------------
INSERT INTO ROL (rol_nombre)
VALUES ('ADMINISTRADOR');

COMMIT;


------------------------------------------------------------
-- 2. CREAR PERMISOS (READ/WRITE) PARA TODAS LAS TABLAS
--    EXCEPTO AUDITORIA -> SOLO READ
------------------------------------------------------------
BEGIN
    FOR rec IN (
        SELECT tabla FROM (
            SELECT 'LOCAL' tabla FROM dual UNION ALL
            SELECT 'CATEGORIA' FROM dual UNION ALL
            SELECT 'SUBCATEGORIA' FROM dual UNION ALL
            SELECT 'PROVEEDOR' FROM dual UNION ALL
            SELECT 'CLIENTE' FROM dual UNION ALL
            SELECT 'USUARIO' FROM dual UNION ALL
            SELECT 'ROL' FROM dual UNION ALL
            SELECT 'PERMISO' FROM dual UNION ALL
            SELECT 'USUARIO_ROL' FROM dual UNION ALL
            SELECT 'ROL_PERMISO' FROM dual UNION ALL
            SELECT 'PRODUCTO' FROM dual UNION ALL
            SELECT 'MOVIMIENTO_STOCK' FROM dual UNION ALL
            SELECT 'VENTA' FROM dual UNION ALL
            SELECT 'DETALLE_VENTA' FROM dual UNION ALL
            SELECT 'COMPRA' FROM dual UNION ALL
            SELECT 'DETALLE_COMPRA' FROM dual
        )
    ) LOOP
        INSERT INTO PERMISO (perm_nombre, perm_recurso_tabla, perm_recurso_accion)
        VALUES ('READ_' || rec.tabla, rec.tabla, 'READ');

        INSERT INTO PERMISO (perm_nombre, perm_recurso_tabla, perm_recurso_accion)
        VALUES ('WRITE_' || rec.tabla, rec.tabla, 'WRITE');
    END LOOP;

    -- Permiso especial SOLO lectura para AUDITORIA
    INSERT INTO PERMISO (perm_nombre, perm_recurso_tabla, perm_recurso_accion)
    VALUES ('READ_AUDITORIA', 'AUDITORIA', 'READ');
END;
/

COMMIT;


------------------------------------------------------------
-- 3. ASIGNAR TODOS LOS PERMISOS AL ROL ADMINISTRADOR
------------------------------------------------------------
DECLARE
    v_rol_id NUMBER;
BEGIN
    SELECT rol_id INTO v_rol_id 
    FROM ROL 
    WHERE rol_nombre = 'ADMINISTRADOR';

    INSERT INTO ROL_PERMISO (rol_id, perm_id)
    SELECT v_rol_id, perm_id
    FROM PERMISO;
END;
/

COMMIT;


------------------------------------------------------------
-- 4. CREAR USUARIO "kenneth"
------------------------------------------------------------
INSERT INTO USUARIO (
    user_nombres, user_apellidos, user_username, 
    user_contrasenia, user_correo
) VALUES (
    'Kenneth', 'Administrador', 'kenneth',
    '123456', NULL
);

COMMIT;


------------------------------------------------------------
-- 5. ASIGNAR ROL ADMINISTRADOR AL USUARIO KENNETH
------------------------------------------------------------
DECLARE 
    v_user_id NUMBER;
    v_rol_id  NUMBER;
BEGIN
    SELECT user_id INTO v_user_id
    FROM USUARIO
    WHERE user_username = 'kenneth';

    SELECT rol_id INTO v_rol_id
    FROM ROL
    WHERE rol_nombre = 'ADMINISTRADOR';

    INSERT INTO USUARIO_ROL (user_id, rol_id)
    VALUES (v_user_id, v_rol_id);
END;
/

COMMIT;

