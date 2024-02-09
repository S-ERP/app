import { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SIcon, SInput, SLoad, SMath, SNavigation, SPage, SPopup, STable2, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../Model';

class index extends Component {
    constructor(props) {
        super(props);

        this.params = SNavigation.getAllParams();
        this.state = {
            title: "Libro diario " + this.params.fecha_inicio + " " + this.params.fecha_fin,
            // func: "reporte_ventas_vendedores",
            // params: [`'${this.params.fecha_inicio}'`, `'${this.params.fecha_fin}'`],
            // params: [`'\${servicio.key}'`, `'${this.params.fecha_inicio}'`, `'${this.params.fecha_fin}'`],
        };
    }
    componentDidMount() {
        // this.setState({ loading: false, error: null, data: require("./data.json") });
        this.getData();
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
                { key: "codigo_asiento", ...PropsAll },
                { key: "tipo", ...PropsAll },
                { key: "fecha", ...PropsAll },
                {
                    key: "codigo_cuenta", ...PropsAll, component: (c) => {
                        return <SText underLine fontSize={12} color={STheme.color.link} onPress={() => {
                            SNavigation.navigate("/contabilidad/mayores", {
                                codigo: c,
                                key_empresa: this.params.key_empresa,
                                mes: new SDate(this.params.fecha_inicio, "yyyy-MM-dd").toString("yyyy-MM")
                            })
                        }}>{c}</SText>
                    }
                },
                { key: "descripcion_cuenta", width: 220 },
                { key: "glosa", width: 220 },
                { key: "debe", ...PropsAll, ...PropsMoney },
                { key: "haber", ...PropsAll, ...PropsMoney },

            ]}
        />
    }
    getData() {

        this.setState({ loading: "cargando", error: null, data: null });
        SSocket.sendPromise({
            service: "contabilidad",
            component: "reporte",
            type: "getLibroDiario",
            ...this.params
        }).then(resp => {
            this.setState({ loading: false, error: null, data: resp.data });
        }).catch(e => {
            this.setState({ loading: false, error: e.error });
        })
    }
    renderHeader = () => {
        return <SView col={"xs-12"} height={80}>
            <SInput defaultValue={this.params.codigo} width={120} />
            <SText>{"TIC MAYOR:"}</SText>
            <SText>{"CUENTA:"}</SText>
        </SView>
    }
    render() {
        return <SPage title={this.state.title} center disableScroll>
            {/* {this.renderHeader()} */}
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