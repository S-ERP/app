import DPA, { connect } from 'servisofts-page';
import { Parent } from ".."
import { SExcel, SExcelReader, SHr, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../../Model';
import Item from "../item"
class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_servicio", "key_sucursal"],
            item: Item
        });
        this.params = SNavigation.getAllParams();
    }

    componentDidMount() {

    }
    $allowBack() {
        return true;
    }
    $allowEdit() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    $allowDelete() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" })
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk);
    }


    getExportar() {
        if (!this.state.modelo) return <SText
            style={{
                padding: 8
            }}
            onPress={() => {
                SNavigation.navigate("/productos/modelo", {
                    onSelect: (item) => {
                        this.setState({ modelo: item })
                    },
                })
            }} >Modelo no seleccionado, volver.</SText>
        var inventario_dato = Model.inventario_dato.Action.getAllByKeyTipoProducto(this.state.modelo?.key_tipo_producto)
        if (!inventario_dato) return <SLoad />
        let producto = {
            modelo: this.state.modelo.descripcion,
            descripcion: this.params.descripcion,
            observacion: "",
            precio_compra: this.params.precio_compra,
            precio_venta: 0,
            precio_venta_credito: 0,
            key_almacen: this.params.key_almacen,
            key_modelo: this.state.modelo.key,
            key_compra_venta_detalle: this.params.key_compra_venta_detalle
        }

        let headers = [];
        Object.values(inventario_dato).map(itm => {
            headers.push({ key: itm.descripcion, label: itm.descripcion, style: { width: 200 } })
            producto[itm.descripcion] = "";
        })

        return <SView col={"xs-12"} center>
            <SHr />
            <SExcel data={new Array(this.params.cantidad).fill(producto)}
                header={[
                    { key: "modelo", label: "modelo", style: { width: 200 } },
                    { key: "descripcion", label: "descripcion", style: { width: 200 } },
                    { key: "observacion", label: "observacion", style: { width: 200 } },
                    { key: "precio_compra", label: "precio_compra", style: { width: 200 } },
                    { key: "precio_venta", label: "precio_venta", style: { width: 200 } },
                    { key: "precio_venta_credito", label: "precio_venta_credito", style: { width: 200 } },
                    ...headers,
                    { key: "key_almacen", label: "key_almacen", style: { width: 200 } },
                    { key: "key_modelo", label: "key_modelo", style: { width: 200 } },
                    { key: "key_compra_venta_detalle", label: "key_compra_venta_detalle", style: { width: 200 } },

                ]}
            >
                <SText fontSize={18} underLine>Click para exportar</SText>
            </SExcel>
        </SView>
    }
    getImportar() {
        return <SView>
            <SExcelReader
                onSubmit={(data, callback) => {
                    this.setState({ loading: true, error: "" })
                    Model.producto.Action.registroExcel({ data: data }).then((resp) => {
                        // Model.inventario.Action.CLEAR();
                        Model.compra_venta_detalle.Action.CLEAR();
                        Model.producto.Action.CLEAR();
                        SNavigation.goBack();
                        this.setState({ loading: false, error: "" })
                        callback()
                    }).catch(e => {
                        callback()
                        this.setState({ loading: false, error: "Error en el fomato excel, mas informacion en `https://github.com/servisofts/darmotos/wiki/Importar-productos-de-manera-masiva`" })
                    })
                }}
                onError={e => {
                    this.setState({ loading: false, error: "Error en el fomato excel, mas informacion en `https://github.com/servisofts/darmotos/wiki/Importar-productos-de-manera-masiva`" })
                }}
            />
        </SView>
    }
    $footer() {
        return <SView col={"xs-12"} center>
            <SHr />
            <SText justify color={STheme.color.lightGray}>{"Para el almacenamiento de tus productos a través un archivo Excel. Primero, debes elegir un modelo que se ajuste a los productos que deseas almacenar. Una vez que hayas seleccionado el modelo, podrás descargar el archivo Excel correspondiente. Luego, deberás completar los datos de los productos en el archivo Excel descargado y guardarlo con las modificaciones realizadas. Finalmente, podrás cargar el archivo modificado en el siguiente campo o input para que podamos procesar los datos de tus productos."}</SText>
            <SHr height={30} />
            {/* <SText col={"xs-12"} justify>key_compra_venta_detalle: {this.params.key_compra_venta_detalle}</SText> */}
            {/* <SText>key_almacen: {this.params.key_almacen}</SText> */}
            <SText fontSize={18} bold>{this.params.descripcion}</SText>
            <SHr />
            <SView col={"xs-12"} row>
                <SText>Precio de compra: </SText><SView flex /><SText fontSize={18}>Bs. {SMath.formatMoney(this.params.precio_compra)}</SText>
            </SView>
            <SHr h={1} color={STheme.color.card} />
            <SHr />
            <SView col={"xs-12"} row>
                <SText>Cantidad: </SText><SView flex /><SText fontSize={18}>{this.params.cantidad}</SText>
            </SView>
            <SHr h={1} color={STheme.color.card} />
            <SHr />
            <SView col={"xs-12"} row>
                <SText>Modelo: </SText><SView flex /><SText fontSize={18}>{this.state?.modelo?.descripcion ?? "--"}</SText>
            </SView>
            <SHr h={1} color={STheme.color.card} />
            <SHr />
            {this.getExportar()}
            <SHr />

            <SText color={STheme.color.danger}>{this.state?.error}</SText>
            {this.getImportar()}
        </SView>
    }
}
export default connect(index);