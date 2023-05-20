import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SHr, SIcon, SList, SLoad, SMath, SNavigation, SPage, SText, STheme, SView, SUuid, SExcel } from 'servisofts-component';
import { MenuButtom } from 'servisofts-rn-roles_permisos';
import Model from '../../Model';
import usuario from '../usuario';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            select: {
                "Vigente": true,
                "Vencido": true,
                "Ejecucion": true,
                "Castigado": true,
            },
        };
        this.onSelect = SNavigation.getParam("onSelect");
    }

    componentDidMount() {
        Model.compra_venta.Action.getDeudaProveedores().then(e => {
            this.setState({ data: e.data })
        })
    }

    renderExportExcel() {
        return <SExcel data={this.state.data} header={[
            { key: "usuario.CI", label: "CI", type: "s", style: { width: 100 } },
            { key: "usuario.Nombres", label: "Nombre", type: "s", style: { width: 100 } },
            { key: "usuario.Apellidos", label: "Apellidos", type: "s", style: { width: 100 } },
            { key: "estado", label: "Estado", type: "s", style: { width: 100 } },
            { key: "primer_cuota", label: "F. primer cuota", type: "s", style: { width: 100 } },
            { key: "ultima_cuota", label: "F. ultima cuota", type: "s", style: { width: 100 } },
            { key: "monto", label: "Monto", type: "n", style: { width: 100 } },
            { key: "cantidad", label: "Cantidad", type: "n", style: { width: 100 } },
            { key: "dias", label: "Dias de mota", type: "n", style: { width: 100 } },

        ]} >
            <SView card center height width={100}>
                <SText>Exportar</SText>
            </SView>
        </SExcel>
    }
    render_data() {
        let usuarios = Model.usuario.Action.getAll();
        if (!this.state.data || !usuarios) return <SList key={SUuid()} data={new Array(10).fill(1)} render={a => <SLoad type='skeleton' col={"xs-12"} height={50} />} />
        // if (!this.state.data) return <SLoad />
        Object.values(this.state.data).map(a => a.usuario = usuarios[a.key_usuario])
        return <SList
            key={SUuid()}
            buscador
            data={this.state.data}
            limit={30}
            filter={a => Object.keys(this.state.select).includes(a.estado)}
            render={(obj) => {
                return <SView col={"xs-12"} card style={{
                    padding: 8
                }} onPress={() => {
                    SNavigation.navigate("/cobranza/carrito_de_cuotas", {
                        nit: obj.usuario.CI,
                        key_proveedor: obj.key_usuario,
                        onSelect: (obj) => {
                            if (this.onSelect) {
                                SNavigation.goBack();
                                this.onSelect(obj);
                            }
                        }
                    });
                }}>
                    <SText fontSize={18} bold>{obj.usuario.Nombres} {obj.usuario.Apellidos}</SText>
                    <SHr />
                    <SText fontSize={14} color={STheme.color.lightGray}>Monto de la deuda:{"\t"} Bs.{SMath.formatMoney(obj.monto, 2, ".")}</SText>
                    <SText fontSize={14} color={STheme.color.lightGray}># Cuotas pendientes{"\t"} {obj.cantidad}</SText>
                    <SText fontSize={14} color={this.getColor(obj.estado)}>{obj.estado}</SText>
                </SView>
            }}
        />
    }

    optionItem({ key, label, color }) {
        if (key == "Exportar") return this.renderExportExcel();
        var select = !!this.state.select[key]
        return <>
            <SView height center card style={{
                paddingLeft: 8,
                paddingRight: 8,
                opacity: select ? 1 : 0.5,
                backgroundColor: color + "88"
            }} onPress={() => {

                if (!select) {
                    this.state.select[key] = true;
                } else {
                    delete this.state.select[key];
                }
                this.setState({ ...this.state })
            }} row>
                {!select ? null : <> <SIcon name={"Close"} width={12} height={12} fill={STheme.color.text} /> <SView width={8} /></>}
                <SText>{label}</SText>
            </SView>
            <SView width={4} />
        </>
    }
    getColor(type) {
        switch (type) {
            case "Vigente": return STheme.color.succes;
            case "Vencido": return STheme.color.warning;
            case "Ejecucion": return STheme.color.danger;
            case "Castigado": return STheme.color.danger;
        }
    }
    renderLista() {
        return <SView col={"xs-12"} height={38} row>
            <SList
                horizontal
                data={[
                    { key: "Exportar", label: "Exportar" },
                    { key: "Vigente", label: "Vigente", color: STheme.color.success },
                    { key: "Vencido", label: "Vencido", color: STheme.color.warning },
                    { key: "Ejecucion", label: "Ejecucion", color: STheme.color.danger },
                    { key: "Castigado", label: "Castigado", color: STheme.color.danger }
                ]}
                render={data => this.optionItem(data)}
            />
            {/* {this.renderExportExcel()} */}
            {/* <SView width={4} />
            {this.optionItem({ key: "Vigente", label: "Vigente", color: STheme.color.success })}
            {this.optionItem({ key: "Vencido", label: "Vencido", color: STheme.color.warning })}
            {this.optionItem({ key: "Ejecucion", label: "Ejecucion", color: STheme.color.danger })}
            {this.optionItem({ key: "Castigado", label: "Castigado", color: STheme.color.danger })} */}
        </SView>
    }
    render() {
        return (
            <SPage title={'Cuentas por pagar'} onRefresh={()=>{
                Model.usuario.Action.CLEAR();
                this.componentDidMount();
            }}>
                <SView col={"xs-12"} center>
                    <SView col={"xs-11 sm-10 md-8 lg-6 xl-4"} center>
                        <SHr />
                        {this.renderLista()}
                        <SHr />
                        {this.render_data()}
                    </SView>
                </SView>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);