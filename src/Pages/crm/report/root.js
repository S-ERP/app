import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SPage, SText } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import Model from '../../../Model';
import SIconApp from '../../../Assets/SIconApp';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return <SPage title={'CRM Reportes'} disableScroll>

            <SHr height={20} />
            <SText fontSize={20}>Modulo Reportes</SText>
            <SHr height={20} />

            <MenuPages
                key_empresa={Model.empresa.Action.getKey()}
                path={"/crm/report/"}
                permiso={"ver"}
            >
                <MenuButtom
                    label="Usuarios - Leads Confirmados"
                    url="/crm/reporteconfirmado"
                    params={{ type: "whatsapp", startState: "enviando_whatsapp" }}
                    icon={<SIconApp name='crmdashboarddelivery' fill={"#333"} />}
                />

                <MenuButtom
                    label="Usuarios - states total"
                    url="/crm/reporteusuariosstate"
                    params={{ type: "whatsapp", startState: "enviando_whatsapp" }}
                    icon={<SIconApp name='crmdashboarddelivery' fill={"#333"} />}
                />

                <MenuButtom
                    label="Gráficos"
                    url="/crm/graficos"
                    icon={<SIconApp name='crmgraficos' fill={"#333"} />}
                />

                <MenuButtom
                    label="vendedor"
                    url="/crm/infovendedor"
                    icon={<SIconApp name='crmgraficos' fill={"#333"} />}
                />
            </MenuPages>
        </SPage>
    }
}
