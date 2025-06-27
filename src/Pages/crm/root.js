import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SPage, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import Components from '../../Components';
import Model from '../../Model';
import SIconApp from '../../Assets/SIconApp';
import MDL from '../../MDL';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        MDL.rolesPermisos.loadPermissions().then(() => {
            this.forceUpdate();
        })
    }

    render() {
        return <SPage title={'CRM'}  >
            {/* <SHr height={32} />
   <Components.Container>
    <Components.empresa.Select disabled />
   </Components.Container>
   <SHr height={32} /> */}

            <SHr  h={32}/>
            <MenuPages
                key_empresa={Model.empresa.Action.getKey()}
                path={"/crm/"}
                permiso={"ver"}
            >
                <SHr />
                <SText fontSize={20}>DashBoard</SText>
                <SHr height={20} />

                <MenuButtom
                    label="Dashboard General"
                    url="/crm/dashboard"
                    icon={<SIconApp name='crmdashboardgeneral' fill={"#333"} />}
                />
                {/* <MenuButtom
                    label="Tipo Movimiento Lead"
                    url="/crm/tipoMovimientoLead"
                    icon={<SIconApp name='crmmovimiento' fill={"#333"} />}
                /> */}
                {/* <MenuButtom
                    label="Proyecto"
                    url="/crm/proyecto"
                    icon={<SIcon name='crmdproyecto' fill={"#333"} />}
                /> */}
                {/* <MenuButtom
                    label="Cliente"
                    url="/crm/cliente"
                    icon={<SIcon name='crmcliente' fill={"#333"} />}
                /> */}


                {/* <SHr height={20} />
                <SText fontSize={20}>Ventas</SText>
                <SHr height={20} /> */}

                <MenuButtom
                    label="Dashboard de Ventas"
                    url="/crm/dashboard"
                    params={{ type: "ventas" }}
                    icon={<SIconApp name='crmdashboardgeneral' fill={"#333"} />}
                />
                {/* <MenuButtom
                    label="Leads"
                    url="/crm/lead"
                    icon={<SIcon name='crmllleads' fill={"#333"} />}
                /> */}


                {/* <SHr height={20} />
                <SText fontSize={20}>Delivery</SText>
                <SHr height={20} /> */}

                <MenuButtom
                    label="Dashboard de Delivery"
                    url="/crm/dashboard"
                    params={{ type: "delivery" }}
                    icon={<SIconApp name='crmdashboardgeneral' fill={"#333"} />}
                />


                {/* <SHr height={20} />
                <SText fontSize={20}>WhatsApp</SText>
                <SHr height={20} /> */}

                <MenuButtom
                    label="Dashboard de WhatsApp"
                    url="/crm/dashboard"
                    params={{ type: "whatsapp", startState: "enviando_whatsapp" }}
                    icon={<SIconApp name='crmdashboardgeneral' fill={"#333"} />}
                />

                {/* <MenuButtom
                    label="Llamadas"
                    url="/crm/llamar"
                    icon={<SIconApp name='crmllamada' fill={"#333"} />}
                /> */}

               
                {/* <MenuButtom
                    label="Mensajes masivos"
                    url="/crm/masivo"
                    icon={<SIconApp name='whatsapp' fill={"#333"} />}
                /> */}
            </MenuPages>

        </SPage>
    }
}
