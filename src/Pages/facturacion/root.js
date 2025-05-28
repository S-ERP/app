import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SImage, SPage } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import SSocket from 'servisofts-socket';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
 
    render() {
        return <SPage title={"Facturacion"}>
            <SHr/>
            <MenuPages path='/facturacion/'>
                {/* <MenuButtom label='Puntos de ventas' url='/facturacion/puntos_de_ventas' icon={<SIcon name='Ajustes'/>}/> */}
                {/* <MenuButtom label='Emitir' url='/facturacion/emitir' icon={<SIcon name='Ingreso'/>}/> */}
                <MenuButtom label='Emitir' url='/facturacion/create' icon={<SIcon name='Ingreso'/>}/>
                <MenuButtom label='Libro de ventas' url='/facturacion/libro_ventas' icon={<SIcon name='Excel'/>}/>
                <MenuButtom label='Libro de ventas Antiguo' url='/facturacion/libro_ventas2' icon={<SIcon name='Excel'/>}/>
                <SHr h={50}/>
                <MenuButtom label='Importar XML' url='/facturacion/importar' icon={<SImage src={require("../../Assets/png/xls.png")}/>}/>
                <MenuButtom label='Anular CUF' url='/facturacion/anular_cuf' icon={<SIcon name={"Egreso"}/>}/>
                <MenuButtom label='Ajustes' url='/facturacion/ajustes' icon={<SIcon name='Ajustes'/>}/>

            </MenuPages>
        </SPage>
    }
}
