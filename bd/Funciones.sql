---------------------------------------CLIENTES----------------------------------------
    
CREATE OR REPLACE TRIGGER trg_auditoria_cliente
AFTER INSERT OR UPDATE OR DELETE ON CLIENTE
FOR EACH ROW
DECLARE
    v_operacion     VARCHAR2(50);
    v_id_afectado   NUMBER;
    v_antiguo       CLOB;
    v_nuevo         CLOB;
BEGIN

    IF DELETING THEN
        v_operacion := 'ELIMINAR';
        v_id_afectado := :OLD.client_id;

        v_antiguo := TO_CLOB(
            JSON_OBJECT(
                'client_id' VALUE :OLD.client_id,
                'client_cedula' VALUE :OLD.client_cedula,
                'client_nombres' VALUE :OLD.client_nombres,
                'client_apellidos' VALUE :OLD.client_apellidos,
                'client_estado' VALUE :OLD.client_estado
            )
        );

        v_nuevo := NULL;

    ELSIF UPDATING THEN

        v_operacion := 'ACTUALIZAR';
        v_id_afectado := :NEW.client_id;

        v_antiguo := TO_CLOB(
            JSON_OBJECT(
                'client_id' VALUE :OLD.client_id,
                'client_cedula' VALUE :OLD.client_cedula,
                'client_nombres' VALUE :OLD.client_nombres,
                'client_apellidos' VALUE :OLD.client_apellidos,
                'client_estado' VALUE :OLD.client_estado
            )
        );

        v_nuevo := TO_CLOB(
            JSON_OBJECT(
                'client_id' VALUE :NEW.client_id,
                'client_cedula' VALUE :NEW.client_cedula,
                'client_nombres' VALUE :NEW.client_nombres,
                'client_apellidos' VALUE :NEW.client_apellidos,
                'client_estado' VALUE :NEW.client_estado
            )
        );

    ELSIF INSERTING THEN

        v_operacion := 'REGISTRAR';
        v_id_afectado := :NEW.client_id;

        v_antiguo := NULL;

        v_nuevo := TO_CLOB(
            JSON_OBJECT(
                'client_id' VALUE :NEW.client_id,
                'client_cedula' VALUE :NEW.client_cedula,
                'client_nombres' VALUE :NEW.client_nombres,
                'client_apellidos' VALUE :NEW.client_apellidos,
                'client_estado' VALUE :NEW.client_estado
            )
        );

    END IF;

    INSERT INTO AUDITORIA (
         audi_tabla, audi_registroid, audi_operacion,
        audi_datoantig, audi_datonuevo, audi_fechregistro, audi_estado
    ) VALUES (
         'CLIENTE', v_id_afectado, v_operacion,
        v_antiguo, v_nuevo, SYSDATE, '1'
    );

END;
/

ALTER TRIGGER trg_auditoria_cliente ENABLE;


CREATE OR REPLACE PROCEDURE registrarcliente(
    p_cedula    IN VARCHAR2,
    p_nombres   IN VARCHAR2,
    p_apellidos IN VARCHAR2,
    p_direccion IN VARCHAR2,
    p_correo    IN VARCHAR2
) AS
BEGIN
    INSERT INTO CLIENTE (
         
        client_cedula, 
        client_nombres, 
        client_apellidos, 
        client_direccion, 
        client_correo, 
        client_estado, 
        client_fechregistro
    ) VALUES (
        p_cedula, 
        p_nombres, 
        p_apellidos, 
        p_direccion, 
        p_correo, 
        '1', 
        SYSDATE
    );

    -- Confirmamos la transacción
    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        -- Si ocurre cualquier error, deshacemos cambios y avisamos
        ROLLBACK;
        RAISE;
END;
/

CREATE OR REPLACE PROCEDURE actualizarcliente(
    p_id        IN NUMBER,
    p_cedula    IN VARCHAR2,
    p_nombres   IN VARCHAR2,
    p_apellidos IN VARCHAR2,
    p_direccion IN VARCHAR2,
    p_correo    IN VARCHAR2
) AS
BEGIN
    UPDATE CLIENTE
    SET 
        client_cedula    = p_cedula,
        client_nombres   = p_nombres,
        client_apellidos = p_apellidos,
        client_direccion = p_direccion,
        client_correo    = p_correo
    WHERE client_id = p_id;

    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

CREATE OR REPLACE PROCEDURE eliminarcliente(p_id IN NUMBER) 
AS
BEGIN
    UPDATE CLIENTE 
    SET client_estado = '0' 
    WHERE client_id = p_id;

    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

CREATE OR REPLACE FUNCTION listarClientesestado(p_estado IN CHAR) 
RETURN SYS_REFCURSOR 
AS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR 
        SELECT 
            client_id,        
            client_cedula,
            client_nombres,
            client_apellidos,
            client_direccion,
            client_correo,
            client_fechregistro
        FROM CLIENTE
        WHERE client_estado = p_estado;
        
    RETURN v_cursor;
END;
/

CREATE OR REPLACE VIEW vw_producto_detalle AS
SELECT 
    p.prod_id,
    p.prod_codbarra,
    p.prod_nombre,
    p.prod_descripcion,
    p.prod_precioventa,
    p.prod_preciocompra,
    p.prod_stock,
    p.prod_stockmin,
    p.prod_estado,

    -- Datos de Subcategoría
    s.subcat_id,
    s.subcat_nombre,

    -- Datos de Categoría
    c.cat_id,
    c.cat_nombre,
    
     -- Datos de proveedor
    prov.prove_id,
    prov.prove_nombre

FROM producto p
JOIN subcategoria s ON p.subcat_id = s.subcat_id
JOIN categoria c ON s.cat_id = c.cat_id
JOIN proveedor prov ON p.prove_id = prov.prove_id;


CREATE OR REPLACE TRIGGER trg_auditoria_producto
AFTER INSERT OR UPDATE OR DELETE ON PRODUCTO
FOR EACH ROW
DECLARE
    v_operacion     VARCHAR2(50);
    v_id_afectado   NUMBER;
    v_antiguo       CLOB;
    v_nuevo         CLOB;
BEGIN

    IF DELETING THEN

        v_operacion := 'ELIMINAR';
        v_id_afectado := :OLD.prod_id;

        v_antiguo := TO_CLOB(
            JSON_OBJECT(
                'prod_id'           VALUE :OLD.prod_id,
                'subcat_id'         VALUE :OLD.subcat_id,
                'prove_id'          VALUE :OLD.prove_id,
                'prod_nombre'       VALUE :OLD.prod_nombre,
                'prod_codbarra'     VALUE :OLD.prod_codbarra,
                'prod_preciocompra' VALUE :OLD.prod_preciocompra,
                'prod_precioventa'  VALUE :OLD.prod_precioventa,
                'prod_stock'        VALUE :OLD.prod_stock,
                'prod_estado'       VALUE :OLD.prod_estado
            )
        );

        v_nuevo := NULL;

    ELSIF UPDATING THEN

        v_operacion := 'ACTUALIZAR';
        v_id_afectado := :NEW.prod_id;

        v_antiguo := TO_CLOB(
            JSON_OBJECT(
                'prod_id'           VALUE :OLD.prod_id,
                'subcat_id'         VALUE :OLD.subcat_id,
                'prove_id'          VALUE :OLD.prove_id,
                'prod_nombre'       VALUE :OLD.prod_nombre,
                'prod_codbarra'     VALUE :OLD.prod_codbarra,
                'prod_preciocompra' VALUE :OLD.prod_preciocompra,
                'prod_precioventa'  VALUE :OLD.prod_precioventa,
                'prod_stock'        VALUE :OLD.prod_stock,
                'prod_estado'       VALUE :OLD.prod_estado
            )
        );

        v_nuevo := TO_CLOB(
            JSON_OBJECT(
                'prod_id'           VALUE :NEW.prod_id,
                'subcat_id'         VALUE :NEW.subcat_id,
                'prove_id'          VALUE :NEW.prove_id,
                'prod_nombre'       VALUE :NEW.prod_nombre,
                'prod_codbarra'     VALUE :NEW.prod_codbarra,
                'prod_preciocompra' VALUE :NEW.prod_preciocompra,
                'prod_precioventa'  VALUE :NEW.prod_precioventa,
                'prod_stock'        VALUE :NEW.prod_stock,
                'prod_estado'       VALUE :NEW.prod_estado
            )
        );

    ELSIF INSERTING THEN

        v_operacion := 'REGISTRAR';
        v_id_afectado := :NEW.prod_id;

        v_antiguo := NULL;

        v_nuevo := TO_CLOB(
            JSON_OBJECT(
                'prod_id'           VALUE :NEW.prod_id,
                'subcat_id'         VALUE :NEW.subcat_id,
                'prove_id'          VALUE :NEW.prove_id,
                'prod_nombre'       VALUE :NEW.prod_nombre,
                'prod_codbarra'     VALUE :NEW.prod_codbarra,
                'prod_preciocompra' VALUE :NEW.prod_preciocompra,
                'prod_precioventa'  VALUE :NEW.prod_precioventa,
                'prod_stock'        VALUE :NEW.prod_stock,
                'prod_estado'       VALUE :NEW.prod_estado
            )
        );

    END IF;


    INSERT INTO AUDITORIA (
         audi_tabla, audi_registroid, audi_operacion,
         audi_datoantig, audi_datonuevo, audi_fechregistro, audi_estado
    ) VALUES (
         'PRODUCTO', v_id_afectado, v_operacion,
         v_antiguo, v_nuevo, SYSDATE, '1'
    );

END;
/

CREATE OR REPLACE PROCEDURE registrarproducto(
    p_id_subcat     IN NUMBER,
    p_nombre        IN VARCHAR2,
    p_codbarra      IN VARCHAR2, -- Nuevo parámetro
    p_descripcion   IN VARCHAR2,
    p_preciocompra  IN NUMBER,   -- Nuevo parámetro
    p_precioventa   IN NUMBER,
    p_stock         IN NUMBER,
    p_stock_min     IN NUMBER
) AS
BEGIN
    INSERT INTO PRODUCTO (
        subcat_id,
        prod_nombre,
        prod_codbarra,      -- Nuevo campo
        prod_descripcion,
        prod_preciocompra,  -- Nuevo campo
        prod_precioventa,
        prod_stock,
        prod_stockmin,
        prod_estado,
        prod_fechregistro,
        prove_id
    ) VALUES (
        p_id_subcat,
        p_nombre,
        p_codbarra,
        p_descripcion,
        p_preciocompra,
        p_precioventa,
        p_stock,
        p_stock_min,
        '1',
        SYSDATE,
        1
    );

    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

CREATE OR REPLACE PROCEDURE actualizarproducto(
    p_prod_id       IN NUMBER,
    p_id_subcat     IN NUMBER,
    p_nombre        IN VARCHAR2,
    p_codbarra      IN VARCHAR2, -- Nuevo parámetro
    p_descripcion   IN VARCHAR2,
    p_preciocompra  IN NUMBER,   -- Nuevo parámetro
    p_precioventa   IN NUMBER,
    p_stock         IN NUMBER,
    p_stock_min     IN NUMBER
) AS
BEGIN
    UPDATE PRODUCTO
    SET 
        subcat_id         = p_id_subcat,
        prod_nombre       = p_nombre,
        prod_codbarra     = p_codbarra,      -- Actualizamos código
        prod_descripcion  = p_descripcion,
        prod_preciocompra = p_preciocompra,  -- Actualizamos precio compra
        prod_precioventa  = p_precioventa,
        prod_stock        = p_stock,
        prod_stockmin     = p_stock_min
    WHERE prod_id = p_prod_id;

    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

CREATE OR REPLACE PROCEDURE eliminarproducto(p_id IN NUMBER) 
AS
BEGIN
    UPDATE PRODUCTO 
    SET prod_estado = '0' 
    WHERE prod_id = p_id;

    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-----------------------------------------VENTAS--------------------

--AGREGAR LA COLUMNA DE descripcion
-- venta_estado = defecto '1'

CREATE OR REPLACE PROCEDURE REGISTRAR_VENTA_COMPLETA (
    p_local_id        IN NUMBER,
    p_cliente_id      IN NUMBER,
    p_user_id         IN NUMBER,
    p_monto           IN NUMBER,
    p_iva             IN NUMBER,
    p_subiva          IN NUMBER,
    p_descripcion     IN VARCHAR2,
    p_detalles_json   IN CLOB,
    p_respuesta       OUT CLOB
) AS
    v_venta_id    NUMBER;
BEGIN
    /* 1. Insertar cabecera sin enviar el ID */
    INSERT INTO VENTA (
        local_id,
        client_id,
        user_id,
        venta_horafecha,
        venta_total,
        venta_iva,
        venta_subiva,
        venta_descripcion
    ) VALUES (
        p_local_id,
        p_cliente_id,
        p_user_id,
        SYSDATE,
        p_monto,
        p_iva,
        p_subiva,
        p_descripcion
    )
    RETURNING venta_id INTO v_venta_id;

    /* 2. Procesar detalles */
    FOR r IN (
        SELECT *
        FROM JSON_TABLE(
            p_detalles_json,
            '$[*]' COLUMNS (
                prod_id        NUMBER PATH '$.prod_id',
                cantidad       NUMBER PATH '$.detv_cantidad',
                subtotal       NUMBER PATH '$.detv_subtotal'
            )
        )
    ) LOOP

        -- Insertar detalle (ID autogenerado)
        INSERT INTO DETALLE_VENTA (
            venta_id,
            prod_id,
            detv_cantidad,
            detv_subtotal,
            detv_estado
        ) VALUES (
            v_venta_id,
            r.prod_id,
            r.cantidad,
            r.subtotal,
            1
        );

        -- Descontar stock
        UPDATE PRODUCTO
        SET prod_stock = prod_stock - r.cantidad
        WHERE prod_id = r.prod_id;

        -- Registrar movimiento
        INSERT INTO MOVIMIENTO_STOCK (
            movi_stock_tipomov,
            movi_stock_cantidad,
            prod_id,
            user_id,
            movi_stock_referenciadoc
        ) VALUES (
            'SALIDA_VENTA',
            r.cantidad,
            r.prod_id,
            p_user_id,
            'VENTA-' || v_venta_id
        );

    END LOOP;

    /* 3. Construir JSON de salida */
    p_respuesta := JSON_OBJECT(
        'status' VALUE 'OK',
        'venta_id' VALUE v_venta_id,
        'message' VALUE 'Venta registrada correctamente'
    );

    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_respuesta := JSON_OBJECT(
            'status' VALUE 'ERROR',
            'message' VALUE SQLERRM
        );
END;
/

-------ADFADSFADSF


CREATE OR REPLACE VIEW VW_VENTAS AS
SELECT
    v.venta_id,
    v.venta_horafecha,
    (
      SELECT SUM(d.detv_cantidad)
      FROM DETALLE_VENTA d
      WHERE d.venta_id = v.venta_id
    ) AS total_items,
    v.venta_total,
    v.venta_iva,
        v.venta_subiva,

    l.local_nombre,
    c.client_cedula,
    c.client_nombres || ' ' ||c.client_apellidos as clientenombre,
    u.user_nombres   || ' ' ||u.user_apellidos  as usuarionombre,
    v.venta_descripcion,
    v.venta_estadoregistro

FROM VENTA v
JOIN CLIENTE c ON v.client_id = c.client_id
JOIN USUARIO u ON v.user_id = u.user_id
JOIN LOCAL l ON v.local_id = l.local_id ;


CREATE OR REPLACE VIEW VW_DETALLE_VENTA AS
SELECT
    d.detv_id,
    d.venta_id,
    d.prod_id,
    p.prod_nombre,
    p.prod_precioventa,
    d.detv_cantidad,
    d.detv_subtotal
FROM DETALLE_VENTA d
JOIN PRODUCTO p ON d.prod_id = p.prod_id;


CREATE OR REPLACE VIEW vw_venta_completa AS
SELECT 
    -- Datos de Cabecera (Venta)
    v.venta_id,
    v.venta_horafecha,
    v.venta_subiva,
    v.venta_iva,
    v.venta_total,
    v.venta_descripcion,
    
    -- Datos del Cliente
    c.client_id AS cliente_id,
    c.client_cedula AS cliente_cedula,
    c.client_nombres AS cliente_nombres, -- O CONCAT(c.nombres, ' ', c.apellidos)
    c.client_direccion AS cliente_direccion,
    
    -- Datos del Detalle
    d.detv_id,
    d.detv_cantidad,
    d.detv_subtotal,
    d.detv_estado,
    
    -- Datos del Producto
    p.prod_id,
    p.prod_nombre,
    p.prod_codbarra,
    p.prod_precioventa AS detv_precio_unitario -- O el precio histórico guardado en detalle

FROM venta v
JOIN cliente c ON v.client_id = c.client_id
JOIN detalle_venta d ON v.venta_id = d.venta_id
JOIN producto p ON d.prod_id = p.prod_id;


CREATE OR REPLACE PROCEDURE ACTUALIZAR_VENTA_COMPLETA (
    p_venta_id        IN NUMBER,  -- Nuevo parámetro obligatorio
    p_local_id        IN NUMBER,
    p_cliente_id      IN NUMBER,
    p_user_id         IN NUMBER,
    p_monto           IN NUMBER,
    p_iva             IN NUMBER,
    p_subiva          IN NUMBER,
    p_descripcion     IN VARCHAR2,
    p_detalles_json   IN CLOB,
    p_respuesta       OUT CLOB
) AS
BEGIN
    /* =======================================================
       PASO 1: REVERTIR STOCK DE LA VENTA ANTERIOR
       (Devolvemos los productos al estante antes de borrar)
       ======================================================= */
    FOR r_old IN (
        SELECT prod_id, detv_cantidad 
        FROM DETALLE_VENTA 
        WHERE venta_id = p_venta_id
    ) LOOP
        -- 1.1 Devolver stock (SUMAR)
        UPDATE PRODUCTO
        SET prod_stock = prod_stock + r_old.detv_cantidad
        WHERE prod_id = r_old.prod_id;

        -- 1.2 Registrar movimiento de corrección (ENTRADA)
        INSERT INTO MOVIMIENTO_STOCK (
            movi_stock_tipomov,
            movi_stock_cantidad,
            prod_id,
            user_id,
            movi_stock_referenciadoc
        ) VALUES (
            'ENTRADA_CORRECCION', -- O 'REVERSO_VENTA'
            r_old.detv_cantidad,
            r_old.prod_id,
            p_user_id,
            'CORREC-VENTA-' || p_venta_id
        );
    END LOOP;

    /* =======================================================
       PASO 2: ELIMINAR DETALLES ANTIGUOS
       ======================================================= */
    DELETE FROM DETALLE_VENTA WHERE venta_id = p_venta_id;

    /* =======================================================
       PASO 3: ACTUALIZAR CABECERA DE VENTA
       ======================================================= */
    UPDATE VENTA SET
        local_id = p_local_id,
        client_id = p_cliente_id, -- Ojo: en tu tabla es client_id
        user_id = p_user_id,
        venta_total = p_monto,
        venta_iva = p_iva,
        venta_subiva = p_subiva,
        venta_descripcion = p_descripcion,
        venta_horafecha = SYSDATE -- Actualizamos la fecha de edición
    WHERE venta_id = p_venta_id;

    /* =======================================================
       PASO 4: PROCESAR NUEVOS DETALLES (Igual que en Registrar)
       ======================================================= */
    FOR r IN (
        SELECT *
        FROM JSON_TABLE(
            p_detalles_json,
            '$[*]' COLUMNS (
                prod_id        NUMBER PATH '$.prod_id',
                cantidad       NUMBER PATH '$.detv_cantidad',
                subtotal       NUMBER PATH '$.detv_subtotal'
            )
        )
    ) LOOP

        -- 4.1 Insertar nuevo detalle
        INSERT INTO DETALLE_VENTA (
            venta_id,
            prod_id,
            detv_cantidad,
            detv_subtotal,
            detv_estado
        ) VALUES (
            p_venta_id,
            r.prod_id,
            r.cantidad,
            r.subtotal,
            1
        );

        -- 4.2 Descontar nuevo stock (RESTAR)
        UPDATE PRODUCTO
        SET prod_stock = prod_stock - r.cantidad
        WHERE prod_id = r.prod_id;

        -- 4.3 Registrar nuevo movimiento (SALIDA)
        INSERT INTO MOVIMIENTO_STOCK (
            movi_stock_tipomov,
            movi_stock_cantidad,
            prod_id,
            user_id,
            movi_stock_referenciadoc
        ) VALUES (
            'SALIDA_VENTA',
            r.cantidad,
            r.prod_id,
            p_user_id,
            'VENTA-' || p_venta_id
        );

    END LOOP;

    /* =======================================================
       PASO 5: RESPUESTA EXITOSA
       ======================================================= */
    p_respuesta := JSON_OBJECT(
        'status' VALUE 'OK',
        'venta_id' VALUE p_venta_id,
        'message' VALUE 'Venta actualizada y stock ajustado correctamente'
    );

    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_respuesta := JSON_OBJECT(
            'status' VALUE 'ERROR',
            'message' VALUE SQLERRM
        );
END;
 



 ----------------------------------PROVEEDOR -----------------------------------------------


 -- =============================================
-- 1. TRIGGER DE AUDITORÍA PARA PROVEEDORES
-- =============================================
CREATE OR REPLACE TRIGGER trg_auditoria_proveedor
AFTER INSERT OR UPDATE OR DELETE ON PROVEEDOR
FOR EACH ROW
DECLARE
    v_operacion     VARCHAR2(50);
    v_id_afectado   NUMBER;
    v_antiguo       CLOB;
    v_nuevo         CLOB;
BEGIN

    IF DELETING THEN
        v_operacion := 'ELIMINAR';
        v_id_afectado := :OLD.prove_id;

        v_antiguo := TO_CLOB(
            JSON_OBJECT(
                'prove_id'          VALUE :OLD.prove_id,
                'prove_ruc'         VALUE :OLD.prove_ruc,
                'prove_nombre'      VALUE :OLD.prove_nombre,
                'prove_telefono'    VALUE :OLD.prove_telefono,
                'prove_correo'      VALUE :OLD.prove_correo,
                'prove_direccion'   VALUE :OLD.prove_direccion,
                'prove_descripcion' VALUE :OLD.prove_descripcion,
                'prove_estado'      VALUE :OLD.prove_estado
            )
        );

        v_nuevo := NULL;

    ELSIF UPDATING THEN

        v_operacion := 'ACTUALIZAR';
        v_id_afectado := :NEW.prove_id;

        v_antiguo := TO_CLOB(
            JSON_OBJECT(
                'prove_id'          VALUE :OLD.prove_id,
                'prove_ruc'         VALUE :OLD.prove_ruc,
                'prove_nombre'      VALUE :OLD.prove_nombre,
                'prove_telefono'    VALUE :OLD.prove_telefono,
                'prove_correo'      VALUE :OLD.prove_correo,
                'prove_direccion'   VALUE :OLD.prove_direccion,
                'prove_descripcion' VALUE :OLD.prove_descripcion,
                'prove_estado'      VALUE :OLD.prove_estado
            )
        );

        v_nuevo := TO_CLOB(
            JSON_OBJECT(
                'prove_id'          VALUE :NEW.prove_id,
                'prove_ruc'         VALUE :NEW.prove_ruc,
                'prove_nombre'      VALUE :NEW.prove_nombre,
                'prove_telefono'    VALUE :NEW.prove_telefono,
                                'prove_correo'      VALUE :NEW.prove_correo,

                'prove_direccion'   VALUE :NEW.prove_direccion,
                'prove_descripcion' VALUE :NEW.prove_descripcion,
                'prove_estado'      VALUE :NEW.prove_estado
            )
        );

    ELSIF INSERTING THEN

        v_operacion := 'REGISTRAR';
        v_id_afectado := :NEW.prove_id;

        v_antiguo := NULL;

        v_nuevo := TO_CLOB(
            JSON_OBJECT(
                'prove_id'          VALUE :NEW.prove_id,
                'prove_ruc'         VALUE :NEW.prove_ruc,
                'prove_nombre'      VALUE :NEW.prove_nombre,
                'prove_telefono'    VALUE :NEW.prove_telefono,
                                'prove_correo'      VALUE :NEW.prove_correo,

                'prove_direccion'   VALUE :NEW.prove_direccion,
                'prove_descripcion' VALUE :NEW.prove_descripcion,
                'prove_estado'      VALUE :NEW.prove_estado
            )
        );

    END IF;

    -- Insertamos sin el ID (asumiendo IDENTITY en la tabla AUDITORIA)
    INSERT INTO AUDITORIA (
        audi_tabla, audi_registroid, audi_operacion,
        audi_datoantig, audi_datonuevo, audi_fechregistro, audi_estado
    ) VALUES (
        'PROVEEDOR', v_id_afectado, v_operacion,
        v_antiguo, v_nuevo, SYSDATE, '1'
    );

END;
/

ALTER TRIGGER trg_auditoria_proveedor ENABLE;


-- =============================================
-- 2. PROCEDIMIENTOS CRUD
-- =============================================

-- Registrar Proveedor
CREATE OR REPLACE PROCEDURE registrarproveedor(
    p_ruc           IN VARCHAR2,
    p_nombre        IN VARCHAR2,
    p_telefono      IN VARCHAR2,
    p_correo        IN VARCHAR2,
    p_direccion     IN VARCHAR2,
    p_descripcion   IN VARCHAR2
) AS
BEGIN
    INSERT INTO PROVEEDOR (
        prove_ruc, 
        prove_nombre, 
        prove_telefono, 
        prove_direccion, 
                        prove_correo   ,
        prove_descripcion, 
        prove_estado, 
        prove_fechregistro
    ) VALUES (
        p_ruc, 
        p_nombre, 
        p_telefono, 
        p_correo,
        p_direccion, 
        p_descripcion, 
        '1', 
        SYSDATE
    );

    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Actualizar Proveedor
CREATE OR REPLACE PROCEDURE actualizarproveedor(
    p_id            IN NUMBER,
    p_ruc           IN VARCHAR2,
    p_nombre        IN VARCHAR2,
    p_telefono      IN VARCHAR2,
    p_correo        IN VARCHAR2,
    p_direccion     IN VARCHAR2,
    p_descripcion   IN VARCHAR2
) AS
BEGIN
    UPDATE PROVEEDOR
    SET 
        prove_ruc         = p_ruc,
        prove_nombre      = p_nombre,
        prove_telefono    = p_telefono,
        prove_correo      = p_correo,  
        prove_direccion   = p_direccion,
        prove_descripcion = p_descripcion
    WHERE prove_id = p_id;

    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Eliminar Proveedor (Lógico)
CREATE OR REPLACE PROCEDURE eliminarproveedor(p_id IN NUMBER) 
AS
BEGIN
    UPDATE PROVEEDOR 
    SET prove_estado = '0' 
    WHERE prove_id = p_id;

    COMMIT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- =============================================
-- 3. FUNCIÓN DE LISTADO
-- =============================================

CREATE OR REPLACE FUNCTION listarproveedoresestado(p_estado IN CHAR) 
RETURN SYS_REFCURSOR 
AS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR 
        SELECT 
            prove_id,        
            prove_ruc,
            prove_nombre,
            prove_telefono,
            prove_correo,
            prove_direccion,
            prove_descripcion,
            prove_fechregistro
        FROM PROVEEDOR
        WHERE prove_estado = p_estado;
        
    RETURN v_cursor;
END;
/


-- =============================================
-- 3. FUNCIÓN DE LISTADO
-- =============================================

CREATE OR REPLACE FUNCTION listarproveedoresrucestado(p_ruc in VARCHAR2,p_estado IN CHAR) 
RETURN SYS_REFCURSOR 
AS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR 
        SELECT 
            prove_id,        
            prove_ruc,
            prove_nombre,
            prove_telefono,
            prove_correo,
            prove_direccion,
            prove_descripcion,
            prove_fechregistro
        FROM PROVEEDOR
        WHERE prove_estado = p_estado and prove_ruc=p_ruc;
        
    RETURN v_cursor;
END;
/