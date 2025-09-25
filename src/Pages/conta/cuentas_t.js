import React from "react";
import { SHr, SLoad, SMath, SNavigation, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import { Dimensions, ScrollView } from "react-native";
import CuentaT from "./Components/CuentaT";
import Pizarra from "../../Components/Pizarra/Pizarra";
import PizarraNodo from "../../Components/Pizarra/PizarraNodo";
import Recargar from "../../Components/Recargar";

export default class cuentas_t extends React.Component {
    state = {
        data: null
    }
    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: "/conta/cuentas_t", permiso: "ver" }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
                return;
            }
        }).catch(e => {
            console.error(e);
        })
        this.loadData();
    }
    async loadData() {
        try {
            const data = await MDL.contabilidad.reporte_libro_diario();

            const empresa = await MDL.empresa.getFull();
            const monedas = empresa.monedas;
            const moneda_base = monedas.find(a => a.tipo == "base");
            const cuentas = {};
            data.map(det => {
                if (!cuentas[det.key_cuenta_contable]) {
                    cuentas[det.key_cuenta_contable] = []
                }

                det.moneda = monedas.find(a => a.key == det.key_moneda)
                det.moneda_base = moneda_base

                cuentas[det.key_cuenta_contable].push(det);
            })
            console.log(cuentas);
            const arr = Object.values(cuentas);
            arr.sort((a, b) => a[0].cuenta_contable.codigo.localeCompare(b[0].cuenta_contable.codigo));
            this.setState({ data: arr });
            return data;
        } catch (error) {
            console.log(error);
            throw error
        }
    }
    render() {
        const spaces = {
            x: 270,
            y: 270,
        }
        const params = {
            startX: -((((Dimensions.get("window").width - 50) - spaces.x) / 2)),
            // startY: -((Dimensions.get("window").height / 2) - 50 - (spaces.y / 2)),
            startY: -(((Dimensions.get("window").height - 50) - spaces.y) / 2),
        }
        const indices = {

        }
        if (!this.state.data) return <SLoad />
        return <SPage title={"Cuentas T"} disableScroll>
            <Pizarra id="cuentas_t" hiddeMiniMapa startType="select" exponentDeRedondeoDeMovimiento={20}>
                {this.state.data.map((detalle, i) => {
                    const cuenta = detalle[0].cuenta_contable
                    if (!indices[cuenta.tipo]) {
                        indices[cuenta.tipo] = { x: 0, y: Object.keys(indices).length };
                    } else {
                        indices[cuenta.tipo].x++;
                    }
                    return <PizarraNodo id={cuenta.codigo} x={params.startX + (indices[cuenta.tipo].x * spaces.x)} y={params.startY + (indices[cuenta.tipo].y * spaces.y)}
                        style={{
                            padding: 0,
                        }} >
                        <CuentaT detalle={detalle} />
                    </PizarraNodo>
                })}
            </Pizarra>
            <SView style={{
                position: "absolute",
                left: 10,
                bottom: 10,
            }} >
                <Recargar onFinish={() => {
                    this.loadData();
                }} />
            </SView>
        </SPage >
        return <SPage title={"Cuentas T"}>
            <SView col={"xs-12"} row padding={8} >
                {this.state.data.map((detalle, i) => {
                    return <CuentaT detalle={detalle} />
                })}
            </SView>
        </SPage>
    }
}
