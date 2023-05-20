import React, { Component } from 'react';
import { SHr, SImage, SList, SLoad, SNavigation, SPopup, SScrollView2, SScrollView3, SText, STheme, SUuid, SView } from 'servisofts-component';
import { connect } from 'react-redux';
import Model from '../../../../Model';
import SSocket from "servisofts-socket"
import { SCharts } from 'servisofts-charts'
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    componentDidMount() {
    }
    loadData() {
        this.productos = Model.producto.Action.getAll({});
        this.modelos = Model.modelo.Action.getAll({});
        this.almacenes = Model.almacen.Action.getAll({});
        this.sucursales = Model.sucursal.Action.getAll({});
        this.tipo_producto = Model.tipo_producto.Action.getAll({});
        if (!this.almacenes) return;
        if (!this.productos) return;
        if (!this.modelos) return;
        if (!this.sucursales) return;
        if (!this.tipo_producto) return;
        this.maximo = 0;
        this.productos_en_almacen = {};
        Object.values(this.productos).map(producto => {
            if (!this.productos_en_almacen[producto.key_almacen]) {
                this.productos_en_almacen[producto.key_almacen] = {};
            }
            let modelo = this.modelos[producto.key_modelo]
            if (!this.productos_en_almacen[producto.key_almacen][modelo.key_tipo_producto]) {
                this.productos_en_almacen[producto.key_almacen][modelo.key_tipo_producto] = [];
            }
            this.productos_en_almacen[producto.key_almacen][modelo.key_tipo_producto].push(producto);

            if (this.productos_en_almacen[producto.key_almacen].length > this.maximo) this.maximo = this.productos_en_almacen[producto.key_almacen].length;

        })
        return true;
    }
    render_grafico() {
        var props_imp = {
            col: "xs-12",
            card: true,
            margin: 4,
            height: 300,
        }
        if (!this.loadData()) return <SLoad type='skeleton' {...props_imp} />
        if (!this.almacenes) return;
        if (!this.productos_en_almacen) return;
        return Object.values(this.almacenes).map(almacen => {
            if (!this.productos_en_almacen[almacen.key]) return;
            var data = [];
            let cantidad = 0;
            Object.keys(this.productos_en_almacen[almacen.key]).map((key_tipo_producto) => {
                let tp = this.productos_en_almacen[almacen.key][key_tipo_producto];
                let tipo_producto = this.tipo_producto[key_tipo_producto];
                let cant = (tp ?? []).length
                cantidad += cant;
                data.push({ key: almacen.key, val: cant, color: tipo_producto?.color })
            })
            return <SView col={"xs-6 sm-4 md-3 lg-2 xl-1.5"} padding={8} center onPress={() => {
                SPopup.confirm({
                    title: "Esta seguro que quiere salir del DashBoard?",
                    message: "Se le enviara a la lista de productos de este almacen.",
                    onPress: () => { SNavigation.navigate("/inventario/almacen/profile/productos", { pk: almacen.key }) }
                })
            }}>
                <SView col={"xs-12"} colSquare center >
                    <SCharts
                        type='torta'
                        // stroke={STheme.color.text}
                        // strokeWidth={2}
                        data={data}
                        fill={STheme.color.card}
                    />
                    <SView style={{
                        position: "absolute",
                        borderRadius: 100,
                        backgroundColor: STheme.color.background,
                    }} col={"xs-4"} center colSquare>
                        <SText style={{
                            fontSize: 18,
                        }} bold center>{cantidad}</SText>
                    </SView>

                </SView>
                <SView height={28}>
                    <SText bold center fontSize={12}>{this.sucursales[almacen.key_sucursal].descripcion}</SText>
                    <SText center fontSize={12} color={STheme.color.lightGray}>{almacen.descripcion}</SText>
                </SView>
            </SView>
        })

    }

    renderDetalle() {
        if (!this.loadData()) return <SLoad type='skeleton' col={"xs-12"} height={50} />
        return <SView col={"xs-12"} >
            <SList data={this.tipo_producto} space={0} horizontal render={(obj) => {
                return <SView row center padding={4}>
                    <SView width={20} height={20} borderRadius={4} backgroundColor={obj.color}></SView>
                    <SView width={4} />
                    <SView width={20} height={20} borderRadius={4} backgroundColor={obj.color} style={{
                        overflow: "hidden"
                    }}>
                        <SImage src={Model.tipo_producto._get_image_download_path(SSocket.api, obj.key)} />
                    </SView>
                    <SView width={4} />
                    <SText bold>{obj.descripcion}</SText>
                    <SView width={8} />
                </SView>
            }} />
        </SView>
    }
    render() {
        return <SView col={"xs-12"} center >
            <SText col={"xs-12"} center bold color={STheme.color.lightGray}>Grafico de almacenes.</SText>
            <SHr />
            {this.renderDetalle()}
            <SHr />
            <SView row col={"xs-12"}>
                {this.render_grafico()}
            </SView>
        </SView>
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);