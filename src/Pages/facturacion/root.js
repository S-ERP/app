import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SIcon, SPage } from 'servisofts-component';
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
            <MenuPages path='/facturacion/'>
                <MenuButtom label='Ajustes' url='/facturacion/ajustes' icon={<SIcon name='Ajustes'/>}/>
                <MenuButtom label='Emitir' url='/facturacion/emitir' icon={<SIcon name='Ingreso'/>}/>
                <MenuButtom label='Libro de ventas' url='/facturacion/libro_ventas' icon={<SIcon name='Excel'/>}/>
            </MenuPages>
        </SPage>
    }
}
