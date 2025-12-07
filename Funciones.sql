---------------------------------------CLIENTES----------------------------------------


CREATE SEQUENCE seq_general
    START WITH 1
    INCREMENT BY 1
    NOCACHE;
    
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


------------------------------ PRODUCTOS ----------------------------------------------------------------


select * from productos;
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
    p_id_prov       IN NUMBER,
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
        prove_id,
        prod_nombre,
        prod_codbarra,      -- Nuevo campo
        prod_descripcion,
        prod_preciocompra,  -- Nuevo campo
        prod_precioventa,
        prod_stock,
        prod_stockmin,
        prod_estado,
        prod_fechregistro
    ) VALUES (
        p_id_subcat,
        p_id_prov,
        p_nombre,
        p_codbarra,
        p_descripcion,
        p_preciocompra,
        p_precioventa,
        p_stock,
        p_stock_min,
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


