import React, { Component } from 'react';
import { connect } from 'react-redux';

import { SButtom, SHr, SIcon, SImage, SList, SLoad, SNavigation, SPage, SScrollView2, SText, STheme, SView } from 'servisofts-component';
import { BottomNavigator, Container, Publicacion } from './Components';
import Model from '../../Model';
import SSocket from 'servisofts-socket'
class likes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            usuarios: {}
        };
        this.pk = SNavigation.getParam("pk");
    }

    componentDidMount() {
        this.setState({ loading: true });
        Model.publicacion_like.Action.getAllPromise(this.pk).then(e => {
            this.setState({ loading: false, data: e.data });

            const arr = Object.values(e.data)
            let userKeys = arr.map(val => val.key_usuario);
            const uniqueArr = [...new Set(userKeys)];
            SSocket.sendPromise({
                ...Model.usuario.info,
                "component": "usuario",
                "type": "getAllKeys",
                "estado": "cargando",
                "keys": uniqueArr
            }).then((e) => {
                if (e.estado != "exito") return;
                this.setState({ usuarios: e.data })
            }).catch((e) => {
                console.error(e)
            })
        }).catch(e => {
            this.setState({ loading: false, error: e });
        })
    }
    render_with_data() {
        if (!this.state.data) return <SLoad />
        return <SList
            buscador
            initSpace={10}
            space={10}
            data={this.state.data}
            render={(data) => {
                return <Publicacion.CardLike data={data}
                    usuario={this.state?.usuarios[data?.key_usuario]?.usuario}
                    onPress={() => {
                        SNavigation.navigate("/perfil/client", { pk: data?.key_usuario })
                    }}
                />
            }}
        />
    }

    render() {
        return (
            <SPage
                // footer={this.footer()}
                onRefresh={(resolve) => {
                    this.componentDidMount();
                    resolve()
                }}
                hidden
            >
                <SView style={{ width: "100%", height: 50, }} row >
                    <SView width={50} height padding={12} onPress={() => {
                        SNavigation.goBack();
                    }}>
                        <SIcon name='Back' fill={STheme.color.text} />
                    </SView>
                    <SView flex height center>
                        <SText center fontSize={18} bold>Me gusta</SText>
                    </SView>
                    <SView width={50} height>

                    </SView>
                </SView>
                <SHr h={1} color={STheme.color.card} />
                <Container>
                    <SHr height={15} />
                    {this.render_with_data()}
                </Container>
            </SPage>
        );
    }

    // footer() {
    //     return <BottomNavigator url={"/sucursal"} />
    // }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(likes);