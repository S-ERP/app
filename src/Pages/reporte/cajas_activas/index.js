import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SHr, SImage, SList, SLoad, SMath, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Container from '../../../Components/Container';
import Model from '../../../Model';
import SSocket from 'servisofts-socket'
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {

    }

    loadData() {
        this.data = Model.caja.Action.getAll();
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
            <SView flex>
                <SText>{usuario.Nombres} {usuario.Apellidos}</SText>
                <SHr />
                {/* <SText>{key_punto_venta}</SText> */}
                <SText>Apertura el {new SDate(fecha_on).toString("DAY dd de MON, hh:mm")}</SText>
                {/* <SText>{JSON.stringify(obj)}</SText> */}
            </SView>
        </SView>
    }
    render() {
        if (!this.loadData()) return <SLoad />
        return (
            <SPage title={'Cajas activas'}>
                <Container>
                    <SList
                        buscador
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