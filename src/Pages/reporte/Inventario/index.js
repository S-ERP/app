import { Component } from 'react';
import { SHr, SList, SLoad, SPage, SText, SView } from 'servisofts-component';
import Model from '../../../Model';
import { connect } from 'react-redux';
import Container from '../../../Components/Container';


class index extends Component {
    constructor(props) {
        super(props);
    }
    getData() {
        var sucursales = Model.sucursal.Action.getAll();
        var almacenes = Model.almacen.Action.getAll();
        var _productos = Model.producto.Action.getAll();
        var modelos = Model.modelo.Action.getAll();
        var tipo_producto = Model.tipo_producto.Action.getAll();
        if (!sucursales) return null;
        if (!almacenes) return null;
        if (!_productos) return null;
        if (!modelos) return null;
        if (!tipo_producto) return null;
        var productos = {};
        console.log(_productos)
        Object.values(_productos).map((pro) => {
            pro.modelo = modelos[pro.key_modelo];
            productos[pro.key] = pro;
        })

        var sucursalFinal = {}
        Object.values(sucursales).map((obj) => {
            var almacenes_data = Model.almacen.Action.getAllBy({
                key_sucursal: obj.key
            })
            Object.values(almacenes_data).map((almacen) => {
                almacenes_data[almacen.key].tipo_producto = {}
                var alm_pro = Object.values(productos).filter(o => o.key_almacen == almacen.key);
                Object.values(tipo_producto).map((tp) => {
                    var arr = Object.values(alm_pro).filter(o => o?.modelo?.key_tipo_producto == tp.key)
                    tp.productos = arr
                    almacenes_data[almacen.key].tipo_producto[tp.key] = { ...tp };
                })
                almacenes_data[almacen.key].tipo_producto["sin_tipo"] = {
                    key: "sin_tipo",
                    descripcion: "Sin tipo de producto",
                    productos: Object.values(alm_pro).filter(o => o?.modelo?.key_tipo_producto == null)
                }
            })
            obj.almacenes = almacenes_data;
            sucursalFinal[obj.key] = obj;
        })
        return sucursalFinal
    }



    renderTipoProducto(tp) {
        var disponibles = tp.productos.filter(o => !o.key_cliente)
        var vendidas = tp.productos.filter(o => !!o.key_cliente)
        return <SView col={"xs-12"}>
            <SText>( {disponibles.length} )  {tp.descripcion}</SText>
        </SView>
    }
    renderAlmacen(almacen) {
        return <SView>
            <SText>{almacen.descripcion}</SText>
            <SHr />
            <SHr />
            <SList
                data={almacen.tipo_producto}
                render={(o) => this.renderTipoProducto(o)}
            />
        </SView>

    }
    $item(obj) {
        return <SView col={"xs-12"} card style={{
            padding: 8
        }}>
            <SText>{obj.descripcion}</SText>
            <SHr />
            <SList
                data={obj.almacenes}
                render={(o) => this.renderAlmacen(o)}
            />
        </SView>
    }
    render() {
        let data = this.getData();
        if (!data) return <SLoad />
        return <SPage >
            <Container>
                <SView col={"xs-12"} height>
                    <SList data={data}
                        render={this.$item.bind(this)} />
                </SView>
            </Container>
        </SPage>
    }


}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);
