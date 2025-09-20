import React from "react";
import { SHr, SIcon, SImage, SLoad, SNavigation, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";
import SSocket from "servisofts-socket";
import FloatButtom from "../../../Components/FloatButtom";
import SIconApp from "../../../Assets/SIconApp";
import PopupCrearSucursal from "./Components/PopupCrearSucursal";
import Pizarra from "../../../Components/Pizarra/Pizarra";
import PizarraNodo from "../../../Components/Pizarra/PizarraNodo";
import Puerto from "../../../Components/Pizarra/Puerto";
import Recargar from "../../../Components/Recargar";
import PopupCrearPuntoVenta from "./Components/PopupCrearPuntoVenta";
import PopupCrearAlmacen from "../../inventario/almacen/Components/PopupCrearAlmacen";
import SIconEmpresa, { buildIconEmpresa, inconParams } from "../../../Assets/SIconEmpresa";

export default class configIcon extends React.Component {

    componentDidMount() {

        MDL.rolesPermisos.getPermisoAsync({ url: "/empresa/configIcon", permiso: "ver" }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
                return;
            }
        }).catch(e => {
            console.error(e);
        })

        this.loadData();
        MDL.erp.addServerListener({
            key: "config_2_almacen_editar",
            component: "almacen",
            type: "editar",
            key_empresa: MDL.empresa.select?.key,
            callback: (data) => {
                this.loadData();
            }
        })
    }
    componentWillUnmount() {
        MDL.erp.removeServerListener({
            key: "config_2_almacen",
        })
    }
    loadData = async () => {
        MDL.empresa._full = null;
        this.empresa = await MDL.empresa.getFull();
        this.almancenes = await MDL.inventario.getAllAlmacen();
        this.empresa.sucursales.map(e => {
            e.almacenes = this.almancenes.filter(almacen => almacen.key_sucursal == e.key);
        })
        this.forceUpdate();
    }
    render() {
        console.log("render", inconParams);
        const empresa = this.empresa;
        if (!empresa) return <SLoad />
        const space = 300;
        return <SPage title={"Configurar íconos"} >
            <SView col={"xs-12"} center row>
                <SView col={"xs-11.5 sm-10 md-8"} >
                    <SHr height={40} />
                    <SText bold fontSize={14} >Elije los íconos de tu preferencia:</SText>
                    <SHr height={20} />
                    <SView col={"xs-12"}>
                        {/* <SIconEmpresa type='editar' /> */}
                        {Object.entries(inconParams).map(([categoria, items]) => (
                            <SView col={"xs-12"} row >
                                <SView col={"xs-9"} row card padding={10} style={{ marginBottom: 8 }}>
                                    <SText fontSize={15} bold capitalize>{categoria}</SText>
                                    <SHr height={8} />
                                    {items.map(item => (
                                        <SView width={75} center style={{
                                            marginBottom: 8,
                                        }}>
                                            <SView
                                                onPress={() => {

                                                }}
                                                row
                                                width={40}
                                                height={40}
                                                center
                                                backgroundColor={STheme.color.background}
                                                style={{ borderRadius: 8 }}
                                            >
                                                {/* <SIconEmpresa type={item} />  */}
                                                {/* <SIconApp name={buildIconEmpresa(item)} width={24} height={24} /> */}
                                                {/* <SIcon name={item} width={24} height={24} fill={STheme.color.text} stroke={STheme.color.text} /> */}
                                                <SIcon name={item} width={24} height={24} fill={STheme.color.text} />

                                            </SView>
                                            <SHr height={4} />
                                            <SText col="xs-12" center numberOfLines={1} >{item}</SText>
                                        </SView>
                                    ))}
                                </SView>
                                <SView col={"xs-0.5"} />
                                <SView col={"xs-2.5"} row card padding={10} style={{ marginBottom: 8 }}>
                                    <SText fontSize={14} bold capitalize justify>Seleccionado:</SText>
                                    <SHr height={8} />
                                    <SView col={"xs-12"} center>
                                        <SView
                                            onPress={() => {

                                            }}
                                            row
                                            width={50}
                                            height={50}
                                            center
                                            backgroundColor={STheme.color.background}
                                            style={{ borderRadius: 8, padding: 6 }}
                                        >
                                            <SIconEmpresa type={categoria} />
                                        </SView>
                                    </SView>
                                </SView>
                            </SView>
                        ))}
                    </SView>

                </SView>
            </SView>
            <SHr height={30} />
        </SPage >
    }
}