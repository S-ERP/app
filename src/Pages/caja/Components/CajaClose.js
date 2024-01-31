import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SDate, SHr, SIcon, SInput, SList, SLoad, SMath, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import Container from '../../../Components/Container';

class CajaClose extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {

    }
    getLast() {
        if (this.state?.last?.key_punto_venta != this.props?.punto_venta?.key) {
            this.state.last = null;
        }
        if (this.state.last) return this.state.last;
        if (this.state.loading) return null;
        this.setState({ loading: true })
        Model.caja.Action.getLast({ key_punto_venta: this.props.punto_venta.key }).then(resp => {
            this.state.last = {
                key_punto_venta: this.props.punto_venta.key,
                ...resp.data
            };
            this.setState({ loading: false })
        }).catch(e => {
            this.setState({ loading: false })
        })
    }
    getMontoEnCaja() {
        return <SView card style={{
            padding: 16,
            paddingLeft: 32,
            paddingRight: 32
        }}>
            <SText fontSize={20}>Bs. {SMath.formatMoney(this.last?.monto_cierre ?? 0)}</SText>
        </SView>
    }
    render() {
        if (!this.props.sucursal) return <SLoad />
        if (!this.props.punto_venta) return <SLoad />
        this.last = this.getLast();
        if (!this.last) return <SLoad />
        // if (!this.last.fecha_cierre) return <SText>La caja esta abierta</SText>
        return (<SView col={"xs-12"}>
            <SView center col={"xs-12"}>
                <SHr />
                <SText>LA CAJA ESTA CERRADA</SText>
                <SHr height={18} />
                <SView center>
                    {this.getMontoEnCaja()}
                    <SText color={STheme.color.lightGray}>Efectivo en caja</SText>
                </SView>
                <SHr height={18} />
                <Container>
                    <SInput ref={ref => this.fecha_ref = ref} type={"date"} label={"Fecha"} defaultValue={new SDate().toString("yyyy-MM-dd")} />
                </Container>
                <SHr height={18} />
                <SButtom type='danger' onPress={() => {
                    this.setState({ loading: true })
                    let fecha = this.fecha_ref.getValue();
                    Model.caja.Action.registro({
                        data: {
                            key_punto_venta: this.props.punto_venta.key,
                            key_sucursal: this.props.sucursal.key,
                            fraccionar_moneda: !!this.props.punto_venta.fraccionar_moneda,
                            fecha: fecha
                        },
                        key_usuario: Model.usuario.Action.getKey()
                    }).then((e) => {
                        this.setState({ loading: false })
                        console.log(e);
                    }).catch((e) => {
                        this.setState({ loading: false })
                        SPopup.alert(e?.error)
                        console.error(e);
                    })
                }}>OPEN</SButtom>
            </SView>
            <SHr />
            {/* <TipoPagoSelect /> */}
        </SView>
        );
    }
}

export default (CajaClose);