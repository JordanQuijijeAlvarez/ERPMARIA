--1
CREATE OR REPLACE VIEW VW_ALERTAS_PRECIOS AS
SELECT 
    prod_id,
    prod_nombre,
    prod_codbarra,
    prod_stock,
    prod_preciocompra, -- Costo Promedio
    prod_precioventa,  -- Precio Venta Actual
    
    -- Mostramos el margen configurado (Si es nulo, asumimos 30% por defecto)
    NVL(PROD_MARGENPG, 30) as margen_configurado,

    -- CÁLCULO DINÁMICO DEL PRECIO SUGERIDO
    -- Fórmula: Costo * (1 + (Margen / 100))
    -- Ejemplo: $10 * (1 + 0.30) = $13.00
    ROUND(prod_preciocompra * (1 + (NVL(PROD_MARGENPG, 30) / 100)), 2) as precio_sugerido,
    
    -- Diferencia monetaria actual
    ROUND(prod_preciocompra - prod_precioventa, 2) as perdida_unitaria

FROM PRODUCTO
-- LA CONDICIÓN DE ALERTA AHORA ES MÁS EXACTA:
-- 1. Si estamos perdiendo dinero (Precio Venta < Costo)
-- 2. O si el Precio de Venta actual es MENOR al Precio Sugerido por su propio margen
WHERE prod_preciocompra >= prod_precioventa 
   OR prod_precioventa < (prod_preciocompra * (1 + (NVL(PROD_MARGENPG, 30) / 100)));

--2
CREATE OR REPLACE VIEW VW_COMPRAS AS 
  SELECT
    c.compra_id,
    c.compra_horafecha,
    c.compra_montototal,
    c.compra_iva,
    c.compra_subiva,
    c.compra_estado,          -- 1 Activo, 0 Anulado
    c.compra_estadoregistro,  -- 'P' Pendiente, 'R' Recibido
    l.local_nombre,
    p.prove_ruc,
    p.prove_id,
    p.prove_nombre,
    u.user_nombres || ' ' || u.user_apellidos as usuarionombre
FROM COMPRA c
JOIN PROVEEDOR p ON c.prove_id = p.prove_id
JOIN USUARIO u ON c.user_id = u.user_id
JOIN LOCAL l ON c.local_id = l.local_id;
--3
CREATE OR REPLACE  VIEW VW_DETALLE_COMPRA AS 
  SELECT
    d.detc_id,
    d.compra_id,
    d.prod_id,
    p.prod_nombre,
    p.prod_codbarra,
    d.detc_cantidad,
    d.detc_preciouni, -- Costo al que se compró
    d.detc_subtotal
FROM DETALLE_COMPRA d
JOIN PRODUCTO p ON d.prod_id = p.prod_id;
--4
CREATE OR REPLACE VIEW VW_DETALLE_VENTA AS 
  SELECT
    d.detv_id,
    d.venta_id,
    d.prod_id,
    p.prod_nombre,
    
    -- TRUCO MAESTRO:
    -- Calculamos el precio real de ese momento (Subtotal / Cantidad)
    -- Y le ponemos el alias "prod_precioventa"
    -- Así tu Angular mostrará el precio histórico sin cambiar ni una línea de código.
    ROUND(d.detv_subtotal / NULLIF(d.detv_cantidad, 0), 2) AS prod_precioventa,

    d.detv_cantidad,
    d.detv_subtotal

FROM DETALLE_VENTA d
JOIN PRODUCTO p ON d.prod_id = p.prod_id;
--5
CREATE OR REPLACE  VIEW VW_GRAFICO_FINANZAS AS 
  SELECT 
    -- Suma de Ventas del mes actual
    (SELECT NVL(SUM(venta_total), 0) 
     FROM VENTA 
     WHERE venta_estado = '1' 
     AND TRUNC(venta_horafecha, 'MM') = TRUNC(SYSDATE, 'MM')) as total_ingresos,
     
    -- Suma de Compras del mes actual (Asegúrate que tu tabla COMPRA tenga fecha)
    (SELECT NVL(SUM(compra_montototal), 0) 
     FROM COMPRA 
     WHERE compra_estadoregistro != '0' -- Asumiendo 0 es anulada
     AND TRUNC(compra_horafecha, 'MM') = TRUNC(SYSDATE, 'MM')) as total_gastos
FROM DUAL;
--6
CREATE OR REPLACE  VIEW VW_GRAFICO_TOP_PRODUCTOS AS 
  SELECT "PROD_NOMBRE","CANTIDAD_TOTAL" FROM (
    SELECT 
        p.prod_nombre,
        SUM(d.detv_cantidad) as cantidad_total
    FROM DETALLE_VENTA d
    JOIN PRODUCTO p ON d.prod_id = p.prod_id
    WHERE d.detv_estado = '1' -- Solo detalles válidos
    GROUP BY p.prod_nombre
    ORDER BY SUM(d.detv_cantidad) DESC
) WHERE ROWNUM <= 5;
--7
CREATE OR REPLACE VIEW  VW_KPI_VENTAS_DIA AS 
  SELECT 
    -- Total vendido hoy
    NVL(SUM(CASE WHEN TRUNC(VENTA_HORAFECHA) = TRUNC(SYSDATE) THEN venta_total ELSE 0 END), 0) as venta_hoy,
    -- Total vendido ayer (para calcular tendencia)
    NVL(SUM(CASE WHEN TRUNC(VENTA_HORAFECHA) = TRUNC(SYSDATE - 1) THEN venta_total ELSE 0 END), 0) as venta_ayer,
    -- Cantidad de facturas hoy
    COUNT(CASE WHEN TRUNC(VENTA_HORAFECHA) = TRUNC(SYSDATE) THEN 1 END) as transacciones_hoy
FROM VENTA 
WHERE venta_estado = '1';
--8
CREATE OR REPLACE   VIEW VW_PRODUCTO_DETALLE AS 
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
--9
CREATE OR REPLACE   VIEW VW_PRODUCTOS_SIN_MOVIMIENTO AS 
  SELECT 
    p.prod_id,
    p.prod_nombre,
    p.prod_stock,
    p.prod_preciocompra,
    -- Cuánto dinero tienes congelado en este producto
    (p.prod_stock * p.prod_preciocompra) as dinero_congelado,
    -- Última fecha de movimiento (si existe)
    (SELECT MAX(movi_stock_fechregistro) 
     FROM MOVIMIENTO_STOCK m 
     WHERE m.prod_id = p.prod_id) as ultima_actividad
FROM PRODUCTO p
WHERE p.prod_stock > 0
  AND p.prod_id NOT IN (
      -- Subquery: Productos que SÍ se han movido (Salidas) en los últimos 30 días
      SELECT DISTINCT prod_id 
      FROM MOVIMIENTO_STOCK 
      WHERE movi_stock_tipomov LIKE '%SALIDA%' -- O 'VENTA'
      AND movi_stock_fechregistro >= SYSDATE - 30
  );
--10
CREATE OR REPLACE   VIEW VW_STOCK_BAJO AS 
  SELECT 
    prod_id,
    prod_nombre,
    prod_codbarra,
    prod_stock,
    PROD_STOCKMIN,
    prod_preciocompra,
    -- Sugerencia: Comprar lo que falta para llegar al mínimo + un margen (ej: 10 unidades extra)
    (PROD_STOCKMIN - prod_stock) + 10 AS cantidad_sugerida
FROM PRODUCTO
WHERE prod_stock <= PROD_STOCKMIN
  AND prod_estado = '1';
--11
CREATE OR REPLACE  VIEW  VW_USUARIO_ROL  AS 
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
    ON r.rol_id = ur.rol_id;
--12
CREATE OR REPLACE  VIEW VW_VENTA_COMPLETA  AS 
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
--13
CREATE OR REPLACE  VIEW  VW_VENTAS AS 
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
JOIN LOCAL l ON v.local_id = l.local_id;

--14
CREATE OR REPLACE VIEW VW_VENTAS_DIARIAS_GENERAL AS 
  SELECT 
    TO_CHAR(venta_horafecha, 'Day') as dia_nombre,
    TRUNC(venta_horafecha) as fecha,
    SUM(venta_total) as total_vendido
FROM VENTA
WHERE venta_estado = '1'
GROUP BY TO_CHAR(venta_horafecha, 'Day'), TRUNC(venta_horafecha)
ORDER BY TRUNC(venta_horafecha);