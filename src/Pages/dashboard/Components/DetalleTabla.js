import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SPageMenu from '../../Components/SPageMenu';
import { DinamicTableSQL } from 'servisofts-table/DinamicTableSQL';
import MDL from '../../MDL';
import { SDate, SIcon, SLanguage, SNavigation, SNotification, SPage, SPopup, SStorage, SText, STheme, SView } from 'servisofts-component';
import Config from '../../Config';
import SIconApp from '../../Assets/SIconApp';
import ExpedicionEstado from '../../Components/ExpedicionEstado';
import FiltroTabla from '../../Components/FiltroTabla';
import { DinamicTable } from 'servisofts-table';

const StorageGetItem = (key) => {
    return new Promise((resolve, reject) => {
        SStorage.getItem(key, (resp) => {
            if (!resp) reject("No existe el item");
            resolve(JSON.parse(resp));
        })
    })
}

export default class DetalleTabla extends Component {

    static openPopup = (props: { F_Descarga?: any, lUsuario_id?: any, valor: any, estado: any, tipo: "gestor" | null, fecha_inicio?: string, fecha_fin?: string }) => {
        SPopup.open({
            key: "popup_detalleTabla",
            content: <SView col={"xs-12"}
                style={{
                    maxheight: 620,
                    maxHeight: "100%",
                    // maxWidth: 1280,
                    borderRadius: 4,
                    borderWidth: 1,
                    overflow: "hidden",
                    borderColor: STheme.color.lightGray + "66",
                }}
                height={620} padding={10}
                withoutFeedback backgroundColor={STheme.color.background}>
                <DetalleTabla {...props} />
            </SView>
        })
    }
    // static PERMISO = "ver"
    constructor(props) {
        super(props);
        this.state = {
        };
        this.F_Descarga = this.props.F_Descarga ?? SNavigation.getParam("F_Descarga", false);
        this.valor = this.props.valor ?? SNavigation.getParam("valor", false);
        this.estado = this.props.estado ?? SNavigation.getParam("estado", false);

        console.log("F_Descarga", this.F_Descarga);
        console.log("valor", this.valor);
        console.log("estado", this.estado);


    }

    validarFecha = (fecha_) => {
        let fecha = new Date(fecha_);
        if (!isNaN(fecha.getTime())) {
            let opcionesFecha = { day: '2-digit', month: '2-digit', year: '2-digit' };
            let opcionesHora = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            };
            let fechaFormateada = new Intl.DateTimeFormat('es-ES', opcionesFecha).format(fecha);
            let horaFormateada = new Intl.DateTimeFormat('es-ES', opcionesHora).format(fecha);
            return !fecha_ ? "" : `${fechaFormateada} ${horaFormateada}`;
        } else {
            return "";
        }
    }

    // loadExportState = async (instance) => {
    //     const exportState = JSON.parse(JSON.stringify(instance.getExportState()))
    //     console.log("exportState", exportState);

    //     const ver_madres = MDL.usuario.getPermiso({ url: URLPAGE, code: "ver_madres" })
    //     const ver_hijas = MDL.usuario.getPermiso({ url: URLPAGE, code: "ver_hijas" })

    //     if (!ver_madres && !!ver_hijas) {
    //         exportState.filters.push({
    //             col: "cantidad_hijas",
    //             type: "number",
    //             operator: "<=",
    //             value: 0
    //         })
    //     } else if (!!ver_madres && !ver_hijas) {
    //         exportState.filters.push({
    //             col: "cantidad_hijas",
    //             type: "number",
    //             operator: ">",
    //             value: 0
    //         })
    //     } else if (!ver_madres && !ver_hijas) {

    //         throw new Error("No tienes permisos para ver expediciones");

    //     }
    //     const permiso_ver = MDL.usuario.getPermisoColumEstado({ url: URLPAGE, })

    //     exportState.filters.push({
    //         col: "sDescripcion",
    //         type: "string",
    //         operator: "contains",
    //         value: permiso_ver
    //     })
    //     console.log("permiso_ver", permiso_ver);

    //     if (MDL.usuario.session.restrictions.key_clients) {
    //         if (MDL.usuario.session.restrictions.key_clients.length > 0) {
    //             exportState.filters.push({
    //                 col: "lCliente_id",
    //                 type: "string",
    //                 operator: "=",
    //                 value: MDL.usuario.session.restrictions.key_clients
    //             })
    //         }
    //     }
    //     if (MDL.usuario.session.restrictions.key_transportistas) {
    //         if (MDL.usuario.session.restrictions.key_transportistas.length > 0) {
    //             exportState.filters.push({
    //                 col: "lTransportista_id",
    //                 type: "string",
    //                 operator: "=",
    //                 value: MDL.usuario.session.restrictions.key_transportistas
    //             })
    //         }
    //     }
    //     return exportState;
    // }

    render() {
        const colorOrigen = STheme.color.success + "33";
        const colorDestino = STheme.color.danger + "33";
        const e = {
            data: {
                sDescripcion: "ANUNCIADA",
            }

        }
        const wrap = true;
        // return <SPageMenu disableScroll>
        return <SPage preventBack disableScroll title={"Detalle"}
        // icon={<SIcon name='Mpizarra' fill={STheme.color.text} />}
        // navBarContent={<SView flex row>
        //     <SView flex />
        //     <FiltroTabla
        //         type='expedicion_abiertas'
        //         ref={ref => this.filtro = ref}
        //         getDinamicTable={() => this.table} />
        //     <SView width={8} />
        //     {/* <ExpedicionEstado style={e.textStyle} estado={e.data} /> */}
        // </SView>}
        >
            <SView col={"xs-12"} row center>
                <SView col={"xs-6"} center>
                    <SText color={STheme.color.text} fontSize={12} >POPUP</SText>
                </SView>
                <SView col={"xs-6"} center>
                    <SText color={STheme.color.text} fontSize={12} >AQUI</SText>
                </SView>
            </SView>
        </SPage>
    }
}
