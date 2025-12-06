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


