-- LOCAL (Minimarket)
CREATE TABLE LOCAL (
    local_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    local_nombre      VARCHAR2(100) NOT NULL,
    local_ruc         VARCHAR2(13) NOT NULL,
    local_telefono    VARCHAR2(10) NOT NULL,
    local_direccion   VARCHAR2(100),
    local_estado      CHAR(1) DEFAULT '1' CHECK (local_estado IN ('0','1')) NOT NULL,
    local_fechregistro DATE DEFAULT SYSDATE
);

-- CATEGORIA
CREATE TABLE CATEGORIA (
    cat_id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cat_nombre       VARCHAR2(70) NOT NULL,
    cat_descripcion  VARCHAR2(100) ,
    cat_estado       CHAR(1) DEFAULT '1' CHECK (cat_estado IN ('0','1')) NOT NULL,
    cat_fechregistro DATE DEFAULT SYSDATE
);

-- SUBCATEGORIA
CREATE TABLE SUBCATEGORIA (
    subcat_id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subcat_nombre       VARCHAR2(70) NOT NULL,
    subcat_descripcion  VARCHAR2(100) ,
    cat_id              NUMBER,
    subcat_estado       CHAR(1) DEFAULT '1' CHECK (subcat_estado IN ('0','1')) NOT NULL,
    subcat_fechregistro DATE DEFAULT SYSDATE
);

-- PROVEEDOR
CREATE TABLE PROVEEDOR (
    prove_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    prove_ruc         VARCHAR2(13) NOT NULL UNIQUE,
    prove_nombre      VARCHAR2(70) NOT NULL,
    prove_telefono    VARCHAR2(10) NOT NULL,
    prove_correo       VARCHAR2(50),
    prove_direccion   VARCHAR2(100),
    prove_descripcion VARCHAR2(100),
    prove_estado      CHAR(1) DEFAULT '1' CHECK (prove_estado IN ('0','1')) NOT NULL,
    prove_fechregistro DATE DEFAULT SYSDATE
);

-- CLIENTE
CREATE TABLE CLIENTE (
    client_id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_cedula       VARCHAR2(13) NOT NULL UNIQUE,
    client_nombres      VARCHAR2(70) NOT NULL,
    client_apellidos    VARCHAR2(70) NOT NULL,
    client_direccion    VARCHAR2(100),
    client_correo       VARCHAR2(50),
    client_telefono     VARCHAR2(10),
    client_estado       CHAR(1) DEFAULT '1' CHECK (client_estado IN ('0','1')) NOT NULL,
    client_fechregistro DATE DEFAULT SYSDATE
);

-- ROL
CREATE TABLE ROL (
    rol_id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rol_nombre       VARCHAR2(70) NOT NULL,
    rol_estado       CHAR(1) DEFAULT '1' CHECK (rol_estado IN ('0','1')) NOT NULL,
    rol_fechregistro DATE DEFAULT SYSDATE
);

-- PERMISO
CREATE TABLE PERMISO (
    perm_id             NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    perm_nombre         VARCHAR2(70) NOT NULL,
    perm_recurso_tabla  VARCHAR2(70),
    perm_recurso_accion VARCHAR2(70),
    perm_estado         CHAR(1) DEFAULT '1' CHECK (perm_estado IN ('0','1')) NOT NULL,
    perm_fechregistro   DATE DEFAULT SYSDATE
);

-- USUARIO
CREATE TABLE USUARIO (
    user_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_nombres     VARCHAR2(70) NOT NULL,
    user_apellidos   VARCHAR2(70) NOT NULL,
    user_username    VARCHAR2(70) NOT NULL UNIQUE,
    user_contrasenia VARCHAR2(100) NOT NULL,
    user_correo      VARCHAR2(50),
    user_estado      CHAR(1) DEFAULT '1' CHECK (user_estado IN ('0','1')) NOT NULL,
    user_fechregistro DATE DEFAULT SYSDATE
);

-- PRODUCTO
CREATE TABLE PRODUCTO (
    prod_id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    prod_codbarra     VARCHAR2 (13),
    prod_nombre       VARCHAR2(50) NOT NULL,
    prod_descripcion  VARCHAR2(70),
    prod_precioventa  NUMBER(10, 2) NOT NULL,
    prod_preciocompra  NUMBER(10, 2) NOT NULL,
    prod_stock        NUMBER(10, 2) NOT NULL,
    prod_stockmin     NUMBER(10, 2) NOT NULL,
    prod_margenpg    NUMBER(5, 2),
    subcat_id         NUMBER NOT NULL,
    prove_id          NUMBER ,
    prod_estado       CHAR(1) DEFAULT '1' CHECK (prod_estado IN ('0','1')) NOT NULL,
    prod_fechregistro DATE DEFAULT SYSDATE
    prod_umedida      VARCHAR2(10)
);


-- ==============================================
-- 3. TABLAS INTERMEDIAS
-- ==============================================

-- USUARIO_ROL
CREATE TABLE USUARIO_ROL (
    user_rol_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id              NUMBER NOT NULL,
    rol_id               NUMBER NOT NULL,
    user_rol_estado      CHAR(1) DEFAULT '1' CHECK (user_rol_estado IN ('0','1')),
    user_rol_fechregistro DATE DEFAULT SYSDATE
);

-- ROL_PERMISO
CREATE TABLE ROL_PERMISO (
    rol_perm_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rol_id               NUMBER NOT NULL,
    perm_id              NUMBER NOT NULL,
    rol_perm_estado      CHAR(1) DEFAULT '1' CHECK (rol_perm_estado IN ('0','1')),
    rol_perm_fechregistro DATE DEFAULT SYSDATE,
    
    CONSTRAINT uk_rol_perm UNIQUE (rol_id, perm_id)
);


-- AUDITORIA
CREATE TABLE AUDITORIA (
    audi_id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    audi_tabla        VARCHAR2(50),
    audi_registroid   NUMBER,
    audi_operacion    VARCHAR2(50),
    audi_datoantig    CLOB,
    audi_datonuevo    CLOB,
    user_id           NUMBER,
    audi_estado       CHAR(1) DEFAULT '1' CHECK (audi_estado IN ('0','1')),
    audi_fechregistro DATE DEFAULT SYSDATE
);

-- MOVIMIENTO_STOCK
CREATE TABLE MOVIMIENTO_STOCK (
    movi_stock_id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    movi_stock_tipomov       VARCHAR2(50),
    movi_stock_cantidad      NUMBER(10, 2),
    movi_stock_antes         NUMBER(10, 2),
    movi_stock_despues       NUMBER(10, 2),
    movi_stock_referenciadoc VARCHAR2(50),
    movi_stock_estado        CHAR(1) DEFAULT '1' CHECK (movi_stock_estado IN ('0','1')),
    movi_stock_fechregistro  DATE DEFAULT SYSDATE,
    user_id                  NUMBER,
    prod_id                  NUMBER
);


-- ==============================================
-- 4. TABLAS TRANSACCIONALES
-- ==============================================

-- VENTA
CREATE TABLE VENTA (
    venta_id             NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    venta_horafecha      DATE NOT NULL,
    venta_iva            NUMBER NOT NULL,
    venta_Subtiva        NUMBER NOT NULL,
    venta_total          NUMBER(10, 2) NOT NULL,
    venta_estado         CHAR(1) CHECK (venta_estado IN ('0','1')) NOT NULL,
    venta_estadoregistro CHAR(1) DEFAULT '1' CHECK (venta_estadoregistro IN ('0','1')) NOT NULL,
    venta_fechregistro   DATE DEFAULT SYSDATE,
    venta_descripcion    VARCHAR2(150),
    user_id              NUMBER NOT NULL,
    local_id             NUMBER NOT NULL,
    client_id            NUMBER NOT NULL
);

-- DETALLE_VENTA
CREATE TABLE DETALLE_VENTA (
    detv_id              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    detv_cantidad        NUMBER NOT NULL,
    detv_subtotal        NUMBER(10, 2) NOT NULL,
    detv_estado          CHAR(1) CHECK (detv_estado IN ('0','1')) NOT NULL,
    detv_estadoregistro  CHAR(1) DEFAULT '1' CHECK (detv_estadoregistro IN ('0','1')) NOT NULL,
    detv_fechregistro    DATE DEFAULT SYSDATE,
    venta_id             NUMBER NOT NULL,
    prod_id              NUMBER NOT NULL
);

-- COMPRA
CREATE TABLE COMPRA (
    compra_id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    compra_horafecha     DATE NOT NULL,
    compra_montototal    NUMBER(10, 2) NOT NULL,
    compra_iva           NUMBER NOT NULL,
    compra_subiva           NUMBER NOT NULL,
    compra_descripcion   VARCHAR2(150),
    compra_estado        CHAR(1) CHECK (compra_estado IN ('0','1')) NOT NULL,
    compra_estadoregistro CHAR(1) DEFAULT '1' CHECK (compra_estadoregistro IN ('0','1')) NOT NULL,
    compra_fechregistro  DATE DEFAULT SYSDATE,
    local_id             NUMBER NOT NULL,
    prove_id             NUMBER NOT NULL,
    user_id              NUMBER NOT NULL

);

-- DETALLE_COMPRA
CREATE TABLE DETALLE_COMPRA (
    detc_id              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    detc_cantidad        NUMBER(10, 2) NOT NULL,
    detc_preciouni      NUMBER(10, 2) NOT NULL,
    detc_subtotal        NUMBER(10, 2) NOT NULL,
    detc_estado          CHAR(1) CHECK (detc_estado IN ('0','1')) NOT NULL,
    detc_estadoregistro  CHAR(1) DEFAULT '1' CHECK (detc_estadoregistro IN ('0','1')) NOT NULL,
    detc_fechregistro    DATE DEFAULT SYSDATE,
    prod_id              NUMBER NOT NULL,
    compra_id            NUMBER NOT NULL
);

--SESIONES_ACTIVAS
CREATE TABLE SESIONES_ACTIVAS (
    sesion_id        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id       NUMBER NOT NULL,
    session_uuid     VARCHAR2(50) NOT NULL,
    token_jti        VARCHAR2(50) NOT NULL,
    user_agent       VARCHAR2(400),
    ip_address       VARCHAR2(50),
    device_fingerprint VARCHAR2(100),
    created_at       DATE DEFAULT SYSDATE,
    last_activity    DATE DEFAULT SYSDATE,
    expires_at       DATE NOT NULL,
    is_active        NUMBER(1) DEFAULT 1 CHECK (is_active IN (0,1))
);

-- ==============================================
-- 5. CLAVES FORÁNEAS
-- ==============================================

ALTER TABLE SUBCATEGORIA ADD CONSTRAINT fk_subcat_cat 
FOREIGN KEY (cat_id) REFERENCES CATEGORIA(cat_id);

ALTER TABLE PRODUCTO ADD CONSTRAINT fk_prod_subcat 
FOREIGN KEY (subcat_id) REFERENCES SUBCATEGORIA(subcat_id);

ALTER TABLE PRODUCTO ADD CONSTRAINT fk_prod_prove 
FOREIGN KEY (prove_id) REFERENCES PROVEEDOR(prove_id);

ALTER TABLE USUARIO_ROL ADD CONSTRAINT fk_ur_user 
FOREIGN KEY (user_id) REFERENCES USUARIO(user_id);

ALTER TABLE USUARIO_ROL ADD CONSTRAINT fk_ur_rol 
FOREIGN KEY (rol_id) REFERENCES ROL(rol_id);

ALTER TABLE ROL_PERMISO ADD CONSTRAINT fk_rp_rol 
FOREIGN KEY (rol_id) REFERENCES ROL(rol_id);

ALTER TABLE ROL_PERMISO ADD CONSTRAINT fk_rp_perm 
FOREIGN KEY (perm_id) REFERENCES PERMISO(perm_id);

ALTER TABLE AUDITORIA ADD CONSTRAINT fk_audi_user 
FOREIGN KEY (user_id) REFERENCES USUARIO(user_id);

ALTER TABLE MOVIMIENTO_STOCK ADD CONSTRAINT fk_ms_prod 
FOREIGN KEY (prod_id) REFERENCES PRODUCTO(prod_id);

ALTER TABLE MOVIMIENTO_STOCK ADD CONSTRAINT fk_ms_user 
FOREIGN KEY (user_id) REFERENCES USUARIO(user_id);

ALTER TABLE VENTA ADD CONSTRAINT fk_vta_user 
FOREIGN KEY (user_id) REFERENCES USUARIO(user_id);

ALTER TABLE VENTA ADD CONSTRAINT fk_vta_local 
FOREIGN KEY (local_id) REFERENCES LOCAL(local_id);

ALTER TABLE VENTA ADD CONSTRAINT fk_vta_clien 
FOREIGN KEY (client_id) REFERENCES CLIENTE(client_id);

ALTER TABLE DETALLE_VENTA ADD CONSTRAINT fk_detv_vta 
FOREIGN KEY (venta_id) REFERENCES VENTA(venta_id);

ALTER TABLE DETALLE_VENTA ADD CONSTRAINT fk_detv_prod 
FOREIGN KEY (prod_id) REFERENCES PRODUCTO(prod_id);

ALTER TABLE COMPRA ADD CONSTRAINT fk_comp_local 
FOREIGN KEY (local_id) REFERENCES LOCAL(local_id);

ALTER TABLE COMPRA ADD CONSTRAINT fk_comp_prove 
FOREIGN KEY (prove_id) REFERENCES PROVEEDOR(prove_id);

ALTER TABLE COMPRA ADD CONSTRAINT fk_comp_user 
FOREIGN KEY (user_id) REFERENCES USUARIO(user_id);

ALTER TABLE DETALLE_COMPRA ADD CONSTRAINT fk_detc_prod 
FOREIGN KEY (prod_id) REFERENCES PRODUCTO(prod_id);

ALTER TABLE DETALLE_COMPRA ADD CONSTRAINT fk_detc_comp 
FOREIGN KEY (compra_id) REFERENCES COMPRA(compra_id);

ALTER TABLE SESIONES_ACTIVAS ADD CONSTRAINT fk_sesiones_user 
FOREIGN KEY (usuario_id) REFERENCES USUARIO(user_id);

COMMIT;


--se agrego el campo compra_descripcion y compra_subiva 

---ejecutar una sola vez;



  --ALERTA se agrego el campo prod_margenpg a la tabla producto para guardar el margen de ganancia por producto


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



  -- 1. Eliminar la restricción antigua (usando el nombre exacto que te dio el error)
ALTER TABLE COMPRA DROP CONSTRAINT SYS_C007985;

-- 2. Agregar la nueva restricción con los estados ampliados
ALTER TABLE COMPRA ADD CONSTRAINT CK_COMPRA_ESTADO 
CHECK (compra_estadoregistro IN ('P', 'R', '0', '1'));

-- 3. Establecer un valor por defecto para que no llegue NULL nunca
ALTER TABLE COMPRA MODIFY (compra_estadoregistro DEFAULT 'P');