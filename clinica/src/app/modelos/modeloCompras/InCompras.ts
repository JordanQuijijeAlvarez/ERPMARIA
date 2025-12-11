export interface InCompra {

    compra_id: number,
	compra_horafecha: string,
	compra_iva: number,
    compra_subiva: number,
	compra_montototal:number,
	local_id:number,
    prove_id:number,
    user_id:number,
    compra_descripcion:string,
    compra_estadoregistro:string

}


export interface InDetalleCompra {

    detc_id?: number,
    compra_id:number,
    prod_id:number,
	detc_cantidad: number,
	detc_subtotal: number,
	detc_estado:number,
}

export interface InCompraCompleto {

    compra_id: number,
	compra_horafecha: string,
	compra_iva: number,
    compra_subiva: number,
	compra_total:number,
	local_id:number,
    prove_id:number,
    user_id:number,
    compra_descripcion:string,
    detalle_compra : InDetalleCompra[]
}