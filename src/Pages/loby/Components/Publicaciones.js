import React, { Component } from 'react';
import { SHr, SList2, SNavigation, SText, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import { Publicacion } from '../../publicacion/Components';
import { connect } from 'react-redux';

class Publicaciones extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 0,
            limit: 2
        };

    }
    componentDidMount() {
        SSocket.sendPromise({
            component: "publicacion",
            type: "getAll",
            pagina: this.state.page,
            limit: this.state.limit,
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        }).then((e) => {
            if (!e.data) {
                return;
            }
            if (Object.values(e.data).length <= 0) {
                this.state.end = true;
                return;
            }
            e.data = {
                ...Model.publicacion.Action._getReducer()?.data ?? {},
                ...e.data
            }
            Model.publicacion.Action._dispatch(e);
        }).catch(e => {
            console.error(e);
        })
    }

    Item = (obj) => {
        return <Publicacion.Card data={obj} />
    }
    render() {
        let data = Model.publicacion.Action._getReducer()?.data ?? {};
        return <SView col={"xs-12"} >
            <SView row>
                <SText bold fontSize={15}> Publicaciones</SText>
            </SView>
            <SHr />
            <SView col={"xs-12"} row>
                <SList2
                    horizontal
                    order={[{ key: "fecha_on", type: "date", order: "desc" }]}
                    data={Object.values(data ?? {}).slice(0, 2)}
                    render={this.Item}
                />
            </SView>
            <SHr height={15} />
            <SView col={"xs-12"} center card height={50} onPress={() => SNavigation.navigate("/publicacion")}>
                <SText >VER MÁS PUBLICACIONES</SText>
            </SView>
        </SView>
    }
}

const initStates = (state) => {
    return { state }
};
export default connect(initStates)(Publicaciones);
