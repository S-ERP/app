import React, { Component } from 'react';;
import { connect } from 'react-redux';
import { SDate, SHr, SIcon, SInput, SLoad, SMath, SNavigation, SPage, SPopup, STable2, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../Model';

class index extends Component {
    constructor(props) {
        super(props);

        this.params = SNavigation.getAllParams();
        this.state = {
            title: "Libro mayor",
            // func: "reporte_ventas_vendedores",
            // params: [`'${this.params.fecha_inicio}'`, `'${this.params.fecha_fin}'`],
            // params: [`'\${servicio.key}'`, `'${this.params.fecha_inicio}'`, `'${this.params.fecha_fin}'`],
        };
    }
    componentDidMount() {
        // this.setState({ loading: false, error: null, data: require("./data.json") });
        this.getData(this.params);
    }

    getLista() {

        if (this.state.error) return <SText color={STheme.color.danger}>{JSON.stringify(this.state.error)}</SText>
        if (!this.state.data) return <SLoad type='skeleton' col={"xs-12"} height />

        const PropsAll = {
            width: 120, center: true,
        }
        const PropsMoney = {
            sumar: true,
            renderTotal: a => SMath.formatMoney(a ?? 0, 2, "."),
            render: (a) => SMath.formatMoney(a, 2, ".")
        }
        return <STable2
            limit={30}
            data={this.state.data}
            cellStyle={{
                fontSize: 12,
                height: 40,
            }}
            header={[
                // { key: "index", label: "#" },
                { key: "fecha", ...PropsAll },
                // { key: "codigo", ...PropsAll },
                {
                    key: "-codigo", label: "codigo", ...PropsAll,
                    renderExcel: (a) => { return a.codigo },
                    component: (c) => {
                        return <SText underLine fontSize={12} color={STheme.color.link} onPress={() => {
                            SNavigation.navigate("/contabilidad/asiento_contable/profile", {
                                pk: c.key_asiento,

                            })
                        }}>{c.codigo}</SText>
                    }
                },
                { key: "tipo", ...PropsAll },
                { key: "glosa", width: 220 },
                { key: "debe", ...PropsAll, ...PropsMoney },
                { key: "haber", ...PropsAll, ...PropsMoney },
                { key: "-saldo", label: "saldo", ...PropsAll, ...PropsMoney, render: (a) => SMath.formatMoney(a.debe - a.haber) },
                // {
                //     key: "codigo_cuenta", ...PropsAll, component: (c) => {
                //         return <SText underLine fontSize={12} color={STheme.color.link} onPress={() => {
                //             SNavigation.navigate("/contabilidad/mayores", {
                //                 codigo: c
                //             })
                //         }}>{c}</SText>
                //     }
                // },
                // { key: "descripcion_cuenta", width: 220 },


            ]}
        />
    }
    getData({ mes, codigo }) {
        if (!mes) {
            if (this.input_mes) {
                mes = this.input_mes.getValue();
            }
            if (!mes) {
                if (!mes) {
                    mes = this.state.mes;
                }
                this.setState({ error: "No hay mes" })
                return null;
            }
        }
        if (!codigo) {
            codigo = this.state.codigo;
        }
        if (!codigo) {
            this.setState({ error: "No hay codigo" })
            return null;
        }
        if (mes == this.state.mes && codigo == this.state.codigo) {
            return null;
        }
        console.log(mes, codigo)
        this.state.mes = mes;
        this.state.codigo = codigo;
        var fecha = new SDate(mes, "yyyy-MM");
        var fecha_inicio = fecha.toString("yyyy-MM-dd");
        fecha.addMonth(1);
        fecha.addDay(-1);
        var fecha_fin = fecha.toString("yyyy-MM-dd");

        this.setState({ loading: "cargando", error: null, data: null });
        SSocket.sendPromise({
            service: "contabilidad",
            component: "reporte",
            type: "getLibroMayor",
            key_empresa: this.params.key_empresa,
            fecha_inicio: fecha_inicio,
            fecha_fin: fecha_fin,
            codigo: codigo
        }).then(resp => {
            let neto = { debe: 0, haber: 0 };
            resp.data.map(a => {
                neto.debe += a.debe;
                neto.haber += a.haber;
            })
            this.setState({ loading: false, error: null, data: resp.data, saldo: resp.saldo, neto: neto });
        }).catch(e => {
            this.setState({ loading: false, error: e.error });
        })
    }
    renderItem({ lavel, val }) {
        return <SView col={"xs-12"} row>
            <SText width={100}>{lavel}</SText>
            <SText width={100} style={{ alignItems: 'flex-end', }}>{SMath.formatMoney(val)}</SText>
        </SView>
    }
    renderHeader = () => {
        let gestion = Model.gestion.Action.getSelect();
        if (!gestion) return <SLoad />
        console.log(gestion)
        return <SView col={"xs-12"} height={120} padding={8}>
            <SView col={"xs-12"} row>
                <SText>Cuenta: </SText>
                <SView width={120}>
                    <SInput defaultValue={this.params.codigo} onChangeText={(val) => {
                        this.getData({
                            codigo: val
                        })
                    }} />
                </SView>
                <SView width={8} />
                <SText>Fecha: </SText>
                <SView width={120}>
                    {/* <SInput defaultValue={this.params.codigo} /> */}
                    <SInput ref={ref => this.input_mes = ref} type='date_my' defaultValue={this.params.mes ?? new SDate(gestion.fecha).toString("yyyy-MM")} onChangeText={(val) => {
                        this.getData({
                            mes: val,
                            codigo: this.params.codigo
                        })
                    }} />
                </SView>

            </SView>

            {/* <SText>F.I.: {this.params.fecha_inicio}</SText> */}
            {/* <SText>F.F.: {this.params.fecha_fin}</SText> */}
            <SHr />
            <SView col={"xs-12"} row>
                {this.renderItem({ lavel: "SALDO INCIAL:", val: (this.state?.saldo?.debe ?? 0) - (this.state?.saldo?.haber ?? 0) })}
                {this.renderItem({ lavel: "NETO:", val: (this.state?.neto?.debe ?? 0) - (this.state?.neto?.haber ?? 0) })}
                {this.renderItem({ lavel: "SALDO FINAL:", val: ((this.state?.saldo?.debe ?? 0) - (this.state?.saldo?.haber ?? 0)) + ((this.state?.neto?.debe ?? 0) - (this.state?.neto?.haber ?? 0)) })}
            </SView>

            {/* <SText>{"TIC MAYOR:"}</SText>
            <SText>{"CUENTA:"}</SText> */}
        </SView>
    }
    render() {
        return <SPage title={this.state.title} center disableScroll>
            {this.renderHeader()}
            <SView col={"xs-12"} flex>
                {this.getLista()}
            </SView>
        </SPage>
    }
}

const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);