import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SImage, SList, SList2, SNavigation, SText, STheme, SView } from 'servisofts-component';
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
        }).then((e) => {
            // this.setState({ data: e.data })
            // this.setState({ loading: false })
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
            // e.type = "getAll"
            Model.publicacion.Action._dispatch(e);
        }).catch(e => {

        })
    }

    Item = (obj) => {

        // return <Publicacion.Card
        //     // ref={ref => this.ref[itm.item.key] = ref}
        //     data={obj} usuario={{}} />
        const image_src = SSocket.api.repo + "publicacion/" + obj.key ?? "";
        return <>
            <SView col={"xs-12"} padding={4} style={{
                // backgroundColor: STheme.color.card,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: STheme.color.card

            }} >
                <SView flex>
                    <Publicacion.CardPost data={obj} />
                </SView>
            </SView>
            <SHr height={10} />
        </>
    }
    render() {
        let data = Model.publicacion.Action._getReducer()?.data ?? {};
        (this.state.data ?? console.log("no hay data"))
        let semana = new SDate().getFirstDayOfWeek();
        return <SView col={"xs-12"} >
            <SView row>
                <SText bold fontSize={15}> Publicaciones</SText>
            </SView>
            <SHr />
            <SView col={"xs-12"} row>
                <SList2
                    // space={10}
                    horizontal
                    order={[{ key: "fecha_on", type: "date", order: "desc" }]}
                    data={Object.values(data ?? {}).slice(0, 2)}
                    render={this.Item}
                />
                {/* {Object.values(this.state.data ?? {}).map((a, i) => this.Item())} */}
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