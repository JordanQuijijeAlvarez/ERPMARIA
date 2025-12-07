export interface InProducto {
    prod_id: number,	
	prod_codbarra: string,
	prod_nombre: string,
	prod_descripcion: string,
	prod_precioventa: number,
	prod_preciocompra:number,
	prod_stock: number,
	prod_stockmin:number,
	subcat_id:number
	    //estado: string,
    //usuario:string,
    //fecha_registro:string;
}

export interface InProductoDetalle {
    prod_id: number,	
	prod_codbarra: string,
	prod_nombre: string,
	prod_descripcion: string,
	prod_precioventa: number,
	prod_stock: number,
	prod_stockmin:number,
	subcat_id:number,
	subcat_nombre:string,
	cat_id: number,
	cat_nombre :string,
	prov_id:number,
	prov_nombre:string,
	prov_estado:number,
	prov_preciocompra:number
    //estado: string,
    //usuario:string,
}