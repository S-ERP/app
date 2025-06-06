import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SPage, SText, STheme } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import Components from '../../Components';
import Model from '../../Model';
import SIconApp from '../../Assets/SIconApp';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return <SPage title={'CRM'}>
            {/* <SHr height={32} />
   <Components.Container>
    <Components.empresa.Select disabled />
   </Components.Container>
   <SHr height={32} /> */}

            <SHr />
            <MenuPages
                key_empresa={Model.empresa.Action.getKey()}
                path={"/crm/"} permiso={"ver"}>
                <SHr />
                <SText>{"Administracion"}</SText>
                <SHr />
                <MenuButtom label={"tipo movimiento lead"} url={"/crm/tipoMovimientoLead"} icon={<SIconApp name='Ajustes' fill={STheme.color.text} />} />
                <MenuButtom label={"Proyecto"} url={"/crm/proyecto"} icon={<SIcon name='empresa' fill={STheme.color.text} />} />
                <MenuButtom label={"Cliente"} url={"/crm/cliente"} icon={<SIcon name='invite' fill={STheme.color.text} />} />
                <MenuButtom label={"Graficos"} url={"/crm/graficos"} icon={<SIconApp name='pinchito' fill={STheme.color.text} />} />
                <SHr />
                <SText>{"Ventas"}</SText>
                <SHr />
                {/* <MenuButtom label={"dashboard"} url={"/crm/dashboard"} icon={<SIcon name='addTarea' fill={STheme.color.text} />} /> */}
                <MenuButtom label={"DashBoard Venta"} url={"/crm/dashboard2"} icon={<SIconApp name='menuAll' fill={STheme.color.text} />} />
                <MenuButtom label={"Lead"} url={"/crm/lead"} icon={<SIcon name='addTarea' fill={STheme.color.text} />} />
                <MenuButtom label={"Llamar"} url={"/crm/llamar"} icon={<SIconApp name='microfono' fill={STheme.color.text} />} />
                <SHr />
                <SHr />
                <SText>{"Delivery"}</SText>
                <SHr />
                <MenuButtom label={"DashBoard Delivery"} url={"/crm/dashboardDelivery"} icon={<SIconApp name='menuAll' fill={STheme.color.text} />} />
            </MenuPages>

        </SPage>
    }
}
