import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SHr, SImage, SList, SLoad, SMath, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import Container from '../../../Components/Container';
import Model from '../../../Model';
import SSocket from 'servisofts-socket'
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.params = SNavigation.getAllParams();
    }

    componentDidMount() {
        Model.caja.Action.historico_cajas({ fecha_inicio: this.params.fecha_inicio, fecha_fin: this.params.fecha_fin }).then(resp => {
            this.setState({ data: resp.data });
        })
    }

    loadData() {
        // this.data = Model.caja.Action.getAll();
        this.data = this.state.data;
        this.usuarios = Model.usuario.Action.getAll();

        this.puntos_venta = Model.punto_venta.Action.getAll({})
        if (!this.data) return false;
        if (!this.usuarios) return false;
        return true;
    }
    Item(obj) {
        var { key_usuario, fecha_on, fecha_cierre, key_punto_venta, faccionar_moneda, key } = obj;
        var usuario = this.usuarios[key_usuario];
        return <SView col={"xs-12"} card style={{
            padding: 8
        }} onPress={() => {
            SNavigation.navigate("/caja", { key_caja: key })
        }} row>
            <SView width={50} style={{ padding: 4 }}>
                <SImage src={Model.usuario._get_image_download_path(SSocket.api, key_usuario)} />
            </SView>
            <SView flex style={{
                padding: 4
            }}>
                <SText font='OpenSans-Bold'>{usuario.Nombres} {usuario.Apellidos}</SText>
                <SHr />
                {/* <SText>{key_punto_venta}</SText> */}
                <SText color={STheme.color.lightGray}>Apertura el {new SDate(fecha_on).toString("yyyy, DAY dd de MON, hh:mm")}</SText>
                <SText color={STheme.color.lightGray}>Cierre el {new SDate(fecha_cierre).toString("yyyy, DAY dd de MON, hh:mm")}</SText>
                {/* <SText>{JSON.stringify(obj)}</SText> */}
            </SView>
        </SView>
    }
    render() {
        if (!this.loadData()) return <SLoad />

        return (
            <SPage title={'Cajas historicos'}>
                <Container>
                    <SList
                        buscador
                        order={[{ key: "fecha_on", order: "desc", type: "date" }]}
                        data={this.data}
                        render={this.Item.bind(this)} />
                </Container>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);