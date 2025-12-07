export interface InProducto {
    prod_id: number,	
	prod_codbarras: string,
	prod_nombre: string,
	prod_descripcion: string,
	prod_preciov: number,
	prod_preciocompra:number,
	prod_stock: number,
	prod_stock_min:number,
	prod_subcategoria:number
	    //estado: string,
    //usuario:string,
    //fecha_registro:string;
}

export interface InProductoDetalle {
    prod_id: number,	
	prod_codbarras: string,
	prod_nombre: string,
	prod_descripcion: string,
	prod_preciov: number,
	prod_stock: number,
	prod_stock_min:number,
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