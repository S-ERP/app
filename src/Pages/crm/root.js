import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SPage, STheme } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import Components from '../../Components';
import Model from '../../Model';

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
                <MenuButtom label={"Proyecto"} url={"/crm/proyecto"} icon={<SIcon name='empresa' fill={STheme.color.text} />} />
                <MenuButtom label={"Cliente"} url={"/crm/cliente"} icon={<SIcon name='invite' fill={STheme.color.text} />} />
                <MenuButtom label={"Lead"} url={"/crm/lead"} icon={<SIcon name='addTarea' fill={STheme.color.text} />} />
                <MenuButtom label={"dashboard"} url={"/crm/dashboard"} icon={<SIcon name='addTarea' fill={STheme.color.text} />} />

            </MenuPages>

        </SPage>
    }
}
