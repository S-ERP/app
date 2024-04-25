import React, { Component } from 'react';;
import { SHr, SNavigation, SPage, STheme, SView, SText, SLoad, SInput, SDate, SMath } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { PlanDeCuentasTable } from 'servisofts-rn-contabilidad';
import FechasBetween from '../../Components/FechasBetween';
import Model from '../../Model';
// import { PlanDeCuentasTable } from 'servisofts-rn-contabilidad'

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ano: 2023,
            fecha_inicio: "2023-01-01",
            fecha_fin: "2023-12-31"
        }
    }

    componentDidMount() {


    }
    getData() {
        this.empresa = Model.empresa.Action.getSelect();
        if (!this.empresa) return null;
        if (this.state.loading) return null;
        if (this.state.data) return this.state.data;
        this.setState({ loading: "cargando..." });
        Model.asiento_contable_detalle.Action.getByFecha({
            fecha_inicio: this.state.fecha_inicio,
            fecha_fin: this.state.fecha_fin,
            key_empresa: this.empresa.key
        }).then(resp => {
            this.setState({ loading: false, data: resp.data });
        }).catch(e => {
            this.setState({ loading: false });
        })
        return null;
    }

    loadData() {
        if (!this.getData()) return <SLoad />
        let arr_data = Object.values(this.state.data);
        return <PlanDeCuentasTable width={800} itemProps={{ underline: true }}
            allowExport
            close
            excelName={`SUMAS_Y_SALDOS_CALISTENIA_${this.state.fecha_inicio}_${this.state.fecha_fin}`}
            excelHeaders={[
                { key: "debe", label: "debe", type: "s", style: { width: 100 } },
                { key: "haber", label: "haber", type: "s", style: { width: 100 } },
                { key: "total", label: "total", type: "n", z: "#,##0.00", style: { width: 100 } },
            ]}
            renderData={(obj) => {
                return {
                    // debe: SMath.formatMoney(arr_data.find(o => o.codigo === obj.codigo).debe ?? 0, 2, ","),
                    // haber: SMath.formatMoney(arr_data.find(o => o.codigo === obj.codigo).haber ?? 0, 2, ","),
                    debe: arr_data.find(o => o.codigo === obj.codigo).debe,
                    haber: arr_data.find(o => o.codigo === obj.codigo).haber,
                    total: Model.cuenta_contable.Action.calcular_debe_haber(arr_data.find(o => o.codigo === obj.codigo))
                }
                // return <SView row>
                //     <SView width={110} center><SText color={STheme.color.lightGray} col={"xs-12"} style={{ alignItems: 'flex-end', }} >{ }</SText></SView>
                //     <SView width={110} center><SText color={STheme.color.lightGray} col={"xs-12"} style={{ alignItems: 'flex-end', }} >{SMath.formatMoney(arr_data.find(o => o.codigo === obj.codigo).haber ?? 0)}</SText></SView>
                // </SView>
            }}
        />
    }
    render() {

        return (<SPage title={"Sumas y saldos"} disableScroll center>
            <SView col={"xs-12"} center>
                <FechasBetween
                    fecha_inicio={new SDate().toString("yyyy") + "-01-01"}
                    fecha_fin={new SDate().toString("yyyy") + "-12-31"}
                    onChange={(fecha_inicio, fecha_fin) => {
                        this.state.fecha_inicio = fecha_inicio;
                        this.state.fecha_fin = fecha_fin;
                        this.state.data = null;
                        this.getData();
                        this.setState({ ...this.state })
                    }} />
            </SView>
            <SView col={"xs-12"} flex center>
                {this.loadData()}
            </SView>
        </SPage>)
    }
}
export default connect(index);