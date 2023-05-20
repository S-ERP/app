import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SHr, SIcon, SList, SLoad, SMath, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import Components from '../../Components';
import Model from '../../Model';
import CajaClose from './Components/CajaClose';
// import CajaNoPuntoVenta from './Components/CajaNoPuntoVenta';
// import CajaNoSucursal from './Components/CajaNoSucursal';
import CajaOpen from './Components/CajaOpen';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key_caja: SNavigation.getParam("key_caja", "")
        };
    }

    render_data() {
        var activa = Model.caja.Action.getActiva();
        if (!activa) {
            return <SLoad />
        }
        if (activa.key) {
            this.state.caja = activa;
            var punto_venta = Model.punto_venta.Action.getByKey(activa.key_punto_venta, activa.key_sucursal); //TODO
            var sucursal = Model.sucursal.Action.getByKey(activa.key_sucursal);
            var data = Model.caja.Action.getByKey(this.state.caja.key)
            if (!data || !sucursal || !punto_venta) return <SLoad />
            // console.log("Entro aca");
            if (!this.state.sucursal || !this.state.punto_venta) {
                this.state.sucursal = sucursal;
                this.state.punto_venta = punto_venta;
                this.setState({ ...this.state });
                return <SLoad />
            }
            return <CajaOpen data={data} sucursal={this.state.sucursal} punto_venta={this.state.punto_venta} />
        }
        if (!this.state.sucursal) return <SText fontSize={12} color={STheme.color.lightGray}>Seleccione la sucursal para continuar.</SText>
        if (!this.state.punto_venta) return <SText fontSize={12} color={STheme.color.lightGray}>Seleccione el punto de venta para continuar.</SText>
        if (this.state.punto_venta.key_sucursal != this.state.sucursal.key) {
            delete this.state.punto_venta;
            delete this.state.caja;
            this.setState({ ...this.state })
            return <SLoad />
        }
        if (!this.state.caja) {
            Model.caja.Action.getLast({ key_punto_venta: this.state.punto_venta?.key }).then(r => {
                this.setState({ caja: r.data });
            })
            return <SText>{"cargando last caja"}</SText>
        }
        if (!this.state.caja.key) {
            return <CajaClose data={this.state.caja} sucursal={this.state.sucursal} punto_venta={this.state.punto_venta} />
        }
        if (this.state.caja.fecha_cierre) {
            return <CajaClose data={this.state.caja} sucursal={this.state.sucursal} punto_venta={this.state.punto_venta} />
        }
        if (this.state.caja.key_punto_venta != this.state.punto_venta.key) {
            this.state.caja = null;
            this.setState({ ...this.state })
            return <SLoad />
        }
        console.log(this.state.caja)
        var data = Model.caja.Action.getByKey(this.state.caja.key)
        if (!data) return <SLoad />
        return <CajaOpen data={data} key_punto_venta={this.state.punto_venta?.key} sucursal={this.state.sucursal} punto_venta={this.state.punto_venta} />
    }

    render_inputs() {
        var key_usuario = Model.usuario.Action.getKey();
        var isMyCaja = key_usuario == this.state?.caja?.key_usuario
        if (this.state.punto_venta && this.state.sucursal) {
            if (this.state?.punto_venta?.key_sucursal != this.state?.sucursal?.key) {
                delete this.state.punto_venta;
                delete this.state.caja;
                this.setState({ ...this.state })
                return <SLoad />
            }
        }

        // if (!this.state.sucursal) return <SLoad />
        // if (!this.state.punto_venta) return <SLoad />
        return <SView col={"xs-11 sm-10 md-8 lg-6 xl-4"}>
            <Components.empresa.sucursal.Select value={this.state.sucursal} onChange={obj => this.setState({ sucursal: obj })} disabled={isMyCaja} />
            <SHr />
            <Components.empresa.punto_venta.Select value={this.state.punto_venta} onChange={obj => this.setState({ punto_venta: obj })} key_sucursal={this.state.sucursal?.key} disabled={isMyCaja} />
        </SView>
    }

    render_activa() {
        var activa = Model.caja.Action.getActiva();
        if (!activa) return <SLoad />
        return <SText>{JSON.stringify(activa)}</SText>
    }
    getLast() {
        if (this.state?.last?.key_punto_venta != this.state?.punto_venta?.key) {
            this.state.last = null;
        }
        if (this.state.last) return this.state.last;
        if (this.state.loading) return null;
        this.setState({ loading: true })
        Model.caja.Action.getLast({ key_punto_venta: this.state.punto_venta.key }).then(resp => {
            this.state.last = {
                key_punto_venta: this.state.punto_venta.key,
                ...resp.data
            };
            this.setState({ loading: false })
        }).catch(e => {
            this.setState({ loading: false })
        })
    }
    renderCajaOpen(key_caja) {
        var data = Model.caja.Action.getByKey(key_caja)
        // var punto_venta = Model.punto_venta.Action.getByKey(caja.key_punto_venta, { key_sucursal: caja.key_sucursal }); //TODO
        // var sucursal = Model.sucursal.Action.getByKey(caja.key_sucursal);
        // if (!data || !sucursal || !punto_venta) return <SLoad />
        if (!data) return <SLoad />
        // this.state.sucursal = sucursal;
        // this.state.punto_venta = punto_venta;
        // this.state.caja = data;

        return <CajaOpen data={data} sucursal={this.state.sucursal} punto_venta={this.state.punto_venta} />
    }
    render_estado() {
        var caja = {};

        var activa = Model.caja.Action.getActiva();
        if (!activa) return <SLoad />
        if (activa.key) {
            caja = activa;
        }
        if (caja.key && !caja.fecha_cierre) {
            return this.renderCajaOpen(caja.key)
        }
        if (!this.state.sucursal) return this.render_inputs()
        if (!this.state.punto_venta) return this.render_inputs()

        var last = this.getLast();
        if (!last) return <SLoad />

        if (last.key && !last.fecha_cierre) {
            return <>
                {this.render_inputs()}
                {this.renderCajaOpen(last.key)}
            </>
        }
        return <>
            {this.render_inputs()}
            <CajaClose data={caja} sucursal={this.state.sucursal} punto_venta={this.state.punto_venta} />
        </>
    }
    render() {
        return (
            <SPage title={'Cajas'}>
                <SView col={"xs-12"} center>
                    {this.render_estado()}
                </SView>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);