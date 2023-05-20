import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SHr, SIcon, SList, SLoad, SMath, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import Components from '../../Components';
import Model from '../../Model';
import CajaClose from './Components/CajaClose';
import CajaOpen from './Components/CajaOpen';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key_caja: SNavigation.getParam("key_caja") ?? SNavigation.getParam("pk")
        };
        this.params = SNavigation.getAllParams();
    }
    render_inputs({ disabled }) {
        // var key_usuario = Model.usuario.Action.getKey();
        // var isMyCaja = key_usuario == this.state?.caja?.key_usuario
        if (this.state.punto_venta && this.state.sucursal) {

            if (this.state?.punto_venta?.key_sucursal != this.state?.sucursal?.key) {
                delete this.state.punto_venta;
                delete this.state.caja;
                this.setState({ ...this.state })
                return <SLoad />
            }
        }
        return <SView col={"xs-11 sm-10 md-8 lg-6 xl-4"}>
            <SHr />
            <Components.empresa.sucursal.Select value={this.state.sucursal} onChange={obj => this.setState({ sucursal: obj })} disabled={disabled} />
            <SHr />
            <Components.empresa.punto_venta.Select value={this.state.punto_venta} onChange={obj => this.setState({ punto_venta: obj })} key_sucursal={this.state.sucursal?.key} disabled={disabled} />
            <SHr />
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
    renderCajaOpen(data) {
        if (data.key_usuario != Model.usuario.Action.getKey()) {
            var permiso = Model.usuarioPage.Action.getPermiso({ url: "/caja", permiso: "ver_caja_otro_usuario" });
            if (!permiso) return <SText color={STheme.color.danger}>Lo sentimos, no tienes permisos para ver las cajas de otros usuarios.</SText>
        }
        // var data = Model.caja.Action.getByKey(key_caja)
        // var punto_venta = Model.punto_venta.Action.getByKey(caja.key_punto_venta, { key_sucursal: caja.key_sucursal }); //TODO
        // var sucursal = Model.sucursal.Action.getByKey(caja.key_sucursal);
        // if (!data || !sucursal || !punto_venta) return <SLoad />
        if (!data) return <SLoad />
        // this.state.sucursal = sucursal;
        // this.state.punto_venta = punto_venta;
        // this.state.caja = data;

        return <CajaOpen data={data} sucursal={this.state.sucursal} punto_venta={this.state.punto_venta} />
    }
    getCajaByKey(key_caja) {
        if (this.state.loading) return null;
        if (this.state.caja_by_key) return this.state.caja_by_key;
        this.setState({ loading: true });
        Model.caja.Action.get_caja_by_key({ key_caja: key_caja }).then((r) => {
            this.setState({ loading: false, caja_by_key: r.data });
        }).catch(e => {
            this.setState({ loading: false });
        })
        return null;
    }
    render_estado() {
        var caja = {};
        if (this.params?.key_caja) {

            caja = this.getCajaByKey(this.params?.key_caja);
            if (!caja) return <SLoad />
            if (!caja.key) return <SLoad />
            if (!caja.key_sucursal) return <SLoad />
            if (this.state.loading) return <SLoad />;
            // caja = Model.caja.Action.getByKey(this.params?.key_caja);
        } else {
            var activa = Model.caja.Action.getActiva();
            if (!activa) return <SLoad />
            if (activa.key) {
                caja = activa;
            }
        }



        if (caja.key) {
            this.state.punto_venta = Model.punto_venta.Action.getByKey(caja.key_punto_venta, { key_sucursal: caja.key_sucursal }); //TODO
            if (!this.state.punto_venta) return <SLoad />
            this.state.sucursal = Model.sucursal.Action.getByKey(caja.key_sucursal);
            if (!this.state.sucursal) return <SLoad />
            return <>
                {this.render_inputs({ disabled: true })}
                <SHr />
                {this.renderCajaOpen(caja)}
            </>
        }
        if (!this.state.sucursal) return this.render_inputs({})
        if (!this.state.punto_venta) return this.render_inputs({})

        if (caja.fecha_cierre) {
            return <>
                {this.render_inputs({})}
                <SHr />
                {this.renderCajaOpen(caja)}
            </>
        }
        var last = this.getLast();
        if (!last) return <SLoad />

        if (last.key && !last.fecha_cierre) {
            return <>
                {this.render_inputs({})}
                <SHr />
                {this.renderCajaOpen(last)}
            </>
        }
        return <>
            {this.render_inputs({})}
            <SHr />
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