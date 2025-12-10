import React, { Component } from 'react';
import { SDate, SHr, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from "servisofts-socket";
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import PopupCrearCliente from './Components/PopupCrearCliente';
import SIconApp from '../../Assets/SIconApp';
import label from '../ajustes/label';
import AdminsitrarHabilidades from './Components/AdministrarHabilidades';

const URL = "/crm/cliente";

export default class Perfil extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.data = {
            "apellidos": null,
            "descripcion": null,
            "distrito": null,
            "estado": 1,
            "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
            "lng": null,
            "key_empresa": "893a748e-a9ed-444c-ab13-a09b3e88626f",
            "fecha_on": "2025-12-08T22:57:28.073",
            "direccion": "Barrio Convifag Norte Calle 8",
            "fecha_nacimiento": null,
            "razon_social": "Servisofts SRL",
            "provincia": null,
            "currier": null,
            "nombres": "Servisofts SRL",
            "correo": "servisofts.srl@gmail.com",
            "nit": "454561021",
            "departamento": "Santa Cruz",
            "tipo_cliente": [
                {
                    "descripcion": "Proveedores nacionales",
                    "estado": 1,
                    "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
                    "color": "#07E91E",
                    "key_empresa": "893a748e-a9ed-444c-ab13-a09b3e88626f",
                    "key_cliente_tipo_cliente": "39b273ba-33c3-461c-9705-c59cf3cbd7fb",
                    "fecha_on": "2025-12-08T22:53:22.429",
                    "titulo": "Proveedores Nacionales",
                    "orden": null,
                    "key": "163d53ec-66d9-4eee-9fb9-97286d2ed79e"
                }
            ],
            "sexo": null,
            "telefono": "+591 75395848",
            "key_servicio": null,
            "key": "ceecb8c6-ed0e-44c0-b38f-5f9f6079d9e5",
            "lat": null
        }
    }
    onSelect = SNavigation.getParam("onSelect");


    componentDidMount() {
        // Verificar permiso de visualización
        MDL.rolesPermisos
            .getPermisoAsync({ url: URL, permiso: 'ver' })
            .then(e => {
                if (!e) {
                    // SNavigation.goBack();
                    return;
                }
                this.forceUpdate();
            })
            .catch(error => {
                console.error('Error al verificar permisos:', error);
                SNotification.send({
                    title: 'Error',
                    body: 'No se pudo verificar los permisos.',
                    time: 3000,
                    color: STheme.color.danger,
                });
            });
    }


    render() {
        return (
            <SPage title="Perfil del Cliente" >
                <SView col={"xs-12"} row padding={10}>
                    <SView col={"xs-3"} padding={5}>
                        <Resumen cliente={this.data} />
                    </SView>
                    <SView col={"xs-4.5"} padding={5} >
                        <InfoGeneral cliente={this.data} />
                    </SView>
                     <SView col={"xs-4.5"} padding={5}>
                        <Calendario cliente={this.data} />
                    </SView>
                    <SView col={"xs-4"} padding={5} height={300}>
                        <Habilidades cliente={this.data} />
                    </SView>
                    <SView col={"xs-4"} padding={5}>
                        <Horarios cliente={this.data} />
                    </SView>
                     <SView col={"xs-4"} padding={5}>
                        <CompraVentas cliente={this.data} />
                    </SView>
                </SView>


            </SPage>
        );
    }
}

const Resumen = ({ cliente }) => {
    return <SView col={"xs-12"} card center padding={15}>
        {/* <SImage src={SIconApp.direccion} style={{ width: 100, height: 100, resizeMode: "contain" }} /> */}
        <SView col="xs-12" center row>
            <SView
                style={{
                    width: 110,
                    height: 110,
                    borderRadius: 100,
                    overflow: 'hidden',
                    backgroundColor: `${STheme.color.card}66`,
                    borderWidth: 2,
                    borderColor: STheme.color.primary,
                }}
            >
                <SImage src={`${cliente?.key}?date=${new Date().getTime()}`} style={{ resizeMode: 'cover' }} />
            </SView>
        </SView>
        <SHr height={10} />
        <SText bold fontSize={18}>{cliente.razon_social}</SText>
        <SText>{cliente.nit}</SText>
        <SHr height={5} />
        <SText underLine center color={STheme.color.link}>{cliente.telefono}</SText>
        <SHr height={5} />
        <SText color={STheme.color.lightGray} fontSize={12}>{cliente.correo}</SText>
        <SHr height={5} />
    </SView>
}

const InfoGeneral = ({ cliente }) => {
    return <SView col={"xs-12"} card padding={15} height>
        <SView width={30} height={30} style={{
            position: "absolute",
            top: 5,
            right: 5,
        }}
            onPress={() => {

            }} center>
            <SIcon name='crmeditar' width={20} height={20} fill={STheme.color.text} />
        </SView>
        <SText bold fontSize={16}>Información General</SText>
        <SHr height={10} />
        <SView col={"xs-12"} row>
            <SView col={"xs-6"}>
                <SText color={STheme.color.lightGray}>Nombres:</SText>
                <SText>{cliente.nombres ?? "---"}</SText>
            </SView>
            <SView col={"xs-6"}>
                <SText color={STheme.color.lightGray}>Apellidos:</SText>
                <SText>{cliente.apellidos ?? "---"}</SText>
            </SView>
        </SView>
        <SHr height={10} />
        <SView col={"xs-12"} row>
            <SView col={"xs-6"}>
                <SText color={STheme.color.lightGray}>Teléfono:</SText>
                <SText>{cliente.telefono ?? "---"}</SText>
            </SView>
            <SView col={"xs-6"}>
                <SText color={STheme.color.lightGray}>Correo:</SText>
                <SText>{cliente.correo ?? "---"}</SText>
            </SView>
        </SView>
        <SHr height={10} />
        <SView col={"xs-12"}>
            <SText color={STheme.color.lightGray}>Dirección:</SText>
            <SText>{cliente.direccion ?? "---"}</SText>
        </SView>
        <SHr height={10} />
        <SView col={"xs-12"} row>
            <SView col={"xs-6"}>
                <SText color={STheme.color.lightGray}>Razón social:</SText>
                <SText>{cliente.razon_social ?? "---"}</SText>
            </SView>
            <SView col={"xs-6"}>
                <SText color={STheme.color.lightGray}>Nit:</SText>
                <SText>{cliente.nit ?? "---"}</SText>
            </SView>
        </SView>
    </SView>
}

const Habilidades = ({ cliente }) => {
    return <SView col={"xs-12"} card padding={15} height>
        <SView width={30} height={30} style={{
            position: "absolute",
            top: 5,
            right: 5,
        }}
            onPress={() => {
                SPopup.open({
                    key: "popup_habilidades",
                    // content: <AdministrarHabilidades cliente={cliente} />
                })
            }} center>
            <SIcon name='crmeditar' width={20} height={20} fill={STheme.color.text} />
        </SView>
        <SText bold fontSize={16}>Habilidades</SText>
        <SHr height={10} />
        {/* <DinamicTable
            data={MDL.habilidad.getAllByCliente(cliente.key)}
            limit={10}
            orderBy={"orden"}
            order={"asc"}
            columns={[
                { key: "index", label: "#", width: 40, data: e => e.index + 1 },
                { key: "nombre", label: "Nombre", width: 200, data: e => e.nombre },
                { key: "nivel", label: "Nivel", width: 100, data: e => e.nivel },
            ]}
        /> */}
    </SView>
}

const Horarios = ({ cliente }) => {
    return <SView col={"xs-12"} card padding={15} height>
        <SView width={30} height={30} style={{
            position: "absolute",
            top: 5,
            right: 5,
        }}
            onPress={() => {
                SPopup.open({
                    key: "popup_habilidades",
                    // content: <AdministrarHabilidades cliente={cliente} />
                })
            }} center>
            <SIcon name='crmeditar' width={20} height={20} fill={STheme.color.text} />
        </SView>
        <SText bold fontSize={16}>Horarios de atención</SText>
        <SHr height={10} />
    </SView>
}

const Calendario = ({ cliente }) => {
    return <SView col={"xs-12"} card padding={15} height>
        <SText bold fontSize={16}>Calendario</SText>
        <SHr height={10} />
    </SView>
}

const CompraVentas = ({ cliente }) => {
    return <SView col={"xs-12"} card padding={15} height>
        <SText bold fontSize={16}>Compra / Venta</SText>
        <SHr height={10} />
    </SView>
}

