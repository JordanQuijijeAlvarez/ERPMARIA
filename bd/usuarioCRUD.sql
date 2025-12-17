CREATE OR REPLACE PROCEDURE registrar_usuario (
    p_user_nombres      IN usuario.user_nombres%TYPE,
    p_user_apellidos    IN usuario.user_apellidos%TYPE,
    p_user_username     IN usuario.user_username%TYPE,
    p_user_contrasenia  IN usuario.user_contrasenia%TYPE,
    p_user_correo       IN usuario.user_correo%TYPE,
    p_rol_id            IN usuario_rol.rol_id%TYPE
) AS
    v_user_id usuario.user_id%TYPE;
BEGIN

    INSERT INTO usuario (
        user_nombres,
        user_apellidos,
        user_username,
        user_contrasenia,
        user_correo,
        user_estado
    ) VALUES (
        p_user_nombres,
        p_user_apellidos,
        p_user_username,
        p_user_contrasenia,
        p_user_correo,
        1
    )
    RETURNING user_id INTO v_user_id;

    INSERT INTO usuario_rol (
        user_id,
        rol_id
    ) VALUES (
        v_user_id,
        p_rol_id
    );

    COMMIT;

END registrar_usuario;
/


CREATE OR REPLACE PROCEDURE actualizar_usuario (
    p_user_id           IN usuario.user_id%TYPE,
    p_user_nombres      IN usuario.user_nombres%TYPE,
    p_user_apellidos    IN usuario.user_apellidos%TYPE,
    p_user_username     IN usuario.user_username%TYPE,
    p_user_contrasenia  IN usuario.user_contrasenia%TYPE,
    p_user_correo       IN usuario.user_correo%TYPE
) AS
BEGIN

    UPDATE usuario
    SET
        user_nombres     = p_user_nombres,
        user_apellidos   = p_user_apellidos,
        user_username    = p_user_username,
        user_contrasenia = p_user_contrasenia,
        user_correo      = p_user_correo
    WHERE user_id = p_user_id;

    COMMIT;

END actualizar_usuario;
/


CREATE OR REPLACE PROCEDURE eliminar_usuario (
    p_user_id IN usuario.user_id%TYPE
) AS
BEGIN

    UPDATE usuario
    SET 
        user_estado = 0
    WHERE user_id = p_user_id;
    COMMIT;

END eliminar_usuario;
/

CREATE OR REPLACE PROCEDURE activar_usuario (
    p_user_id IN usuario.user_id%TYPE
) AS
BEGIN

    UPDATE usuario
    SET 
        user_estado = 1
    WHERE user_id = p_user_id;
    COMMIT;

END activar_usuario;
/

CREATE OR REPLACE TRIGGER trg_auditoria_usuario
AFTER INSERT OR UPDATE OR DELETE ON usuario
FOR EACH ROW
DECLARE
    v_operacion     VARCHAR2(50);
    v_id_afectado   NUMBER;
    v_antiguo       CLOB;
    v_nuevo         CLOB;
BEGIN

    IF DELETING THEN

        v_operacion   := 'ELIMINAR';
        v_id_afectado := :OLD.user_id;

        v_antiguo := TO_CLOB(
            JSON_OBJECT(
                'user_id' VALUE :OLD.user_id,
                'user_nombres' VALUE :OLD.user_nombres,
                'user_apellidos' VALUE :OLD.user_apellidos,
                'user_username' VALUE :OLD.user_username,
                'user_correo' VALUE :OLD.user_correo,
                'user_estado' VALUE :OLD.user_estado
            )
        );

        v_nuevo := NULL;

    ELSIF UPDATING THEN

        v_operacion   := 'ACTUALIZAR';
        v_id_afectado := :NEW.user_id;

        v_antiguo := TO_CLOB(
            JSON_OBJECT(
                'user_id' VALUE :OLD.user_id,
                'user_nombres' VALUE :OLD.user_nombres,
                'user_apellidos' VALUE :OLD.user_apellidos,
                'user_username' VALUE :OLD.user_username,
                'user_correo' VALUE :OLD.user_correo,
                'user_estado' VALUE :OLD.user_estado
            )
        );

        v_nuevo := TO_CLOB(
            JSON_OBJECT(
                'user_id' VALUE :NEW.user_id,
                'user_nombres' VALUE :NEW.user_nombres,
                'user_apellidos' VALUE :NEW.user_apellidos,
                'user_username' VALUE :NEW.user_username,
                'user_correo' VALUE :NEW.user_correo,
                'user_estado' VALUE :NEW.user_estado
            )
        );

    ELSIF INSERTING THEN

        v_operacion   := 'REGISTRAR';
        v_id_afectado := :NEW.user_id;

        v_antiguo := NULL;

        v_nuevo := TO_CLOB(
            JSON_OBJECT(
                'user_id' VALUE :NEW.user_id,
                'user_nombres' VALUE :NEW.user_nombres,
                'user_apellidos' VALUE :NEW.user_apellidos,
                'user_username' VALUE :NEW.user_username,
                'user_correo' VALUE :NEW.user_correo,
                'user_estado' VALUE :NEW.user_estado
            )
        );

    END IF;

    INSERT INTO AUDITORIA (
        audi_tabla,
        audi_registroid,
        audi_operacion,
        audi_datoantig,
        audi_datonuevo,
        audi_fechregistro,
        audi_estado
    ) VALUES (
        'USUARIO',
        v_id_afectado,
        v_operacion,
        v_antiguo,
        v_nuevo,
        SYSDATE,
        '1'
    );

END;
/


ALTER TRIGGER trg_auditoria_usuario ENABLE;
