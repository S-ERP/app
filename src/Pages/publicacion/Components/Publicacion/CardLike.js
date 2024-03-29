import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SHr, SIcon, SImage, SPage, SText, STheme, SView, SNavigation, SPopup, SLoad, SThread } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import BoxMenuLat from './BoxMenuLat';
import BoxMenuLatOtros from './BoxMenuLatOtros';
import Model from '../../../../Model';
import LikeAnimation from './LikeAnimation';
export type PublicacionLikePropsType = {
    data: any,
    usuario: any,
    onPress?: (obj) => {},
}
class CardLike extends Component<PublicacionLikePropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        // Model.usuario.Action.getAll({ force: true })
    }
    handlePress() {
        if (!this.props.onPress) return null;
        this.props.onPress(this.props.data)
    }


    render() {
        // if (!this.state.datas) return <SLoad />
        var { key_usuario, nombre } = this.props.data;
        let user = this.props.usuario ?? {}

        let cadena_detalle = user?.detalle_app;
        if (user?.detalle_app) {
            cadena_detalle = cadena_detalle.slice(0, 70)
        } else {
            cadena_detalle = ""

        }
        return (<SView
            col={"xs-12"}
            style={{
                borderRadius: 10,
                padding: 8,
                borderColor: STheme.color.darkGray,
                borderWidth: 1
            }}
            row center
            onPress={this.props.onPress}
        >
            <SView col={"xs-4"} row >
                {/* USUARIO */}
                <SView card style={{
                    width: 75,
                    height: 75,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 60,
                    overflow: "hidden"
                }}>
                    <SImage enablePreview src={SSocket.api.root + "usuario/" + key_usuario} width={"100%"} height={"100%"}
                        style={{
                            resizeMode: 'cover',
                        }}
                    />
                </SView>
            </SView>
            <SView col={"xs-8"} >
                <SView col={"xs-12"}>
                    <SView flex col={"xs-12"}>
                        <SText color={STheme.color.text} fontSize={16} bold>
                            {user?.Nombres} {user?.Apellidos}
                        </SText>
                    </SView>
                    <SHr height={2} />
                    <SText color={STheme.color.gray} fontSize={12}>
                        {cadena_detalle}
                    </SText>
                    <SHr height={2} />
                </SView>
            </SView>
        </SView>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(CardLike);