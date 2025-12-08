export interface InVenta {

    venta_id: number,
	venta_horafecha: string,
	venta_iva: number,
    venta_subiva: number,
	venta_total:number,
	local_id:number,
    cliente_id:number,
    user_id:number,
    venta_descripcion:string

}


export interface InDetalleVenta {

    detv_id: number,
    venta_id:number,
    prod_id:number,
	detv_cantidad: number,
	detv_subtotal: number,
	detv_estado:number,
}

export interface InVentaCompleto {

    venta_id: number,
	venta_horafecha: string,
	venta_iva: number,
    venta_subiva: number,
	venta_total:number,
	local_id:number,
    cliente_id:number,
    user_id:number,
    venta_descripcion:string,
    detalle_venta : InDetalleVenta[]
}