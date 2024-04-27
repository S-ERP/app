import React, { Component } from 'react';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SHr, SList, SLoad, SText, SView, SImage } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket';

class index extends DPA.item {
    constructor(props) {
        super(props, {
            Parent: Parent,
            // row:false
        });
    }
    $getData() {
        var data = super.$getData();
        var marca = Model.marca.Action.getByKey(data.key_marca);
        var tipo_producto = Model.tipo_producto.Action.getByKey(data.key_tipo_producto);
        // if (!marca) return null;
        // if (!tipo_producto && data.key_tipo_producto) return null;
        data.marca = marca;
        data.tipo_producto = tipo_producto;
        return data;
    }
    $render() {
        let item = super.$render();
        // if (!this.data?.marca?.key) return null;
        // if (!this.data?.tipo_producto?.key) return null;
        return item;
    }

    getImages() {
        var size = 22;
        return <SView col={"xs-12"} row>
            <SView card width={size} height={size} style={{ overflow: 'hidden', }}>
                <SImage src={Model.tipo_producto._get_image_download_path(SSocket.api, this.data?.tipo_producto?.key)} style={{ resizeMode: "cover" }} />
            </SView>
            <SView width={4} />
            <SView card width={size} height={size} style={{ overflow: 'hidden', }}>
                <SImage src={Model.marca._get_image_download_path(SSocket.api, this.data?.marca?.key)} style={{ resizeMode: "cover" }} />
            </SView>
        </SView>
    }
    $renderContent() {
        return <SView col={"xs-12"}>
            <SHr h={4} />
            <SText fontSize={18} bold> {this.data.descripcion}</SText>
            <SHr h={4} />
            {this.getImages()}
            <SHr h={4} />
            {/* {this.buildLabel({ label: "Tipo", value: this.data.descripcion })} */}
            {this.buildLabel({ label: "Tipo", value: this.data.tipo_producto?.descripcion })}
            {this.buildLabel({ label: "Marca", value: this.data.marca?.descripcion })}
            {/* {super.$renderContent()} */}
            

        </SView>
    }
}
export default connect(index);