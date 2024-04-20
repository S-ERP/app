import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SPage, SLoad, SView, SList, SText, SImage, SHr, STheme } from 'servisofts-component';
import Model from '../../Model';
import Container from "../../Components/Container"
import { connect } from 'react-redux';
import SSocket from "servisofts-socket"
import SwipeableListItem from '../../Components/SwipeableListItem';
class catalogo extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    getData() {
        var data = Model.producto.Action.getAll();
        var marcas = Model.marca.Action.getAll();
        var modelos = Model.modelo.Action.getAll();
        var tipo_productos = Model.tipo_producto.Action.getAll();
        if (!data) return null;
        if (!modelos) return null;
        if (!marcas) return null;
        if (!tipo_productos) return null;
        let arr_productos = Object.values(data);

        const arr_modelos = Object.values(modelos);
        arr_modelos.map(model => {
            model.marca = marcas[model.key_marca];
            model.tipo_producto = tipo_productos[model.key_tipo_producto];
            let cantidad = 0;
            model.cantidad_sin_compra = 0;
            arr_productos.filter(p => p.key_modelo == model.key && !data.key_cliente && !p.precio_compra).map(a => {
                model.cantidad_sin_compra += (a.cantidad ?? 0);
            })
            arr_productos.filter(p => p.key_modelo == model.key && !data.key_client && p.precio_compra > 0).map(a => {
                cantidad += (a.cantidad ?? 0)
            })
            model.cantidad = cantidad;
        })

        return arr_modelos;
    }

    getImages(obj) {
        var size = 22;
        return <SView col={"xs-12"} row>
            <SView card width={size} height={size} style={{ overflow: 'hidden', }}>
                <SImage src={Model.tipo_producto._get_image_download_path(SSocket.api, obj.tipo_producto?.key)} style={{ resizeMode: "cover" }} />
            </SView>
            <SView width={4} />
            <SView card width={size} height={size} style={{ overflow: 'hidden', }}>
                <SImage src={Model.marca._get_image_download_path(SSocket.api, obj.marca?.key)} style={{ resizeMode: "cover" }} />
            </SView>
            <SView width={4} />
            <SView card width={size} height={size} style={{ overflow: 'hidden', }}>
                <SImage src={Model.modelo._get_image_download_path(SSocket.api, obj?.key)} style={{ resizeMode: "cover" }} />
            </SView>
        </SView>
    }
    renderData() {
        this.data = this.getData();
        if (!this.data) return <SLoad />


        return <SView col={"xs-12"}>
            <SList data={this.data}
                buscador
                render={(obj) => {
                    return <SwipeableListItem>
                        <SView col={"xs-12"} card padding={8}>
                            {this.getImages(obj)}
                            <SText fontSize={12}>{obj?.tipo_producto?.descripcion}</SText>
                            <SText fontSize={12}>{obj?.marca?.descripcion}</SText>
                            <SText bold fontSize={16}>{obj.descripcion}</SText>
                            <SHr />
                            <SText color={STheme.color.lightGray} fontSize={12}>Cantidad con precio de compra: {obj.cantidad}</SText>
                            <SText color={STheme.color.lightGray} fontSize={12}>Cantidad sin precio de compra: {obj.cantidad_sin_compra}</SText>
                        </SView >
                    </SwipeableListItem>
                }}
            />
        </SView>
        // return <SView col={"xs-12"}>
        //     <SList data={this.data}
        //         buscador
        //         render={(obj) => {
        //             return <SwipeableListItem>
        //                 <SView col={"xs-12"} card padding={8}>
        //                     {this.getImages(obj)}
        //                     <SText fontSize={12}>{obj?.tipo_producto?.descripcion}</SText>
        //                     <SText fontSize={12}>{obj?.marca?.descripcion}</SText>
        //                     <SText bold fontSize={16}>{obj.descripcion}</SText>
        //                     <SHr />
        //                     <SText color={STheme.color.lightGray} fontSize={12}>Cantidad con precio de compra: {obj.cantidad}</SText>
        //                     <SText color={STheme.color.lightGray} fontSize={12}>Cantidad sin precio de compra: {obj.cantidad_sin_compra}</SText>
        //                 </SView >
        //             </SwipeableListItem>
        //         }}
        //     />
        // </SView>

    }
    render() {
        return <SPage title={"Catalogo"}>
            <Container>
                {this.renderData()}
            </Container>
        </SPage>
    }
}

//make this component available to the app
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(catalogo);