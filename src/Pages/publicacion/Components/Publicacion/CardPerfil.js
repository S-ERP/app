import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SHr, SIcon, SImage, SPage, SText, STheme, SView, SNavigation, SPopup, SLoad } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import BoxMenuLat from './BoxMenuLat';
import BoxMenuLatOtros from './BoxMenuLatOtros';
import Model from '../../../../Model';
export type CardPerfilPropsType = {
    data: any,
    usuario: any,
    onPress?: (obj) => {},
}
class index extends Component<CardPerfilPropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    handlePress() {
        if (!this.props.onPress) return null;

        this.props.onPress(this.props.data)
        // this.props.onPress(this.props.usuario)
    }

    renderAuthor() {
        // var key_usuario = Model.usuario.Action.getKey() ?? null;
        var key_usuario = Model.usuario.Action.getKey();
        // let user = Model.usuario.Action.getByKey(this.props.data.key_usuario);
        // if (!user) return null
        // let user = this.props.usuario;
        let user = {}
        return <SView col={"xs-12"} row height={50} center>
            <SView width={50} height center >
                <SView style={{
                    backgroundColor: STheme.color.card, borderRadius: 100, width: 40, height: 40, overflow: "hidden"
                }}>
                    <SImage src={Model.usuario._get_image_download_path(SSocket.api, this.props.data.key_usuario)} style={{
                        resizeMode: "cover"
                    }} />
                </SView>
            </SView>
            <SView flex height style={{
                justifyContent: "center"
            }}>
                <SText bold>{user?.Nombres} {user?.Apellidos}</SText>
            </SView>
            <SView width={30} center onPress={() => {
                SPopup.open({ key: "menuLat", content: (key_usuario == this.props.data.key_usuario) ? <BoxMenuLat datas={this.props.data} /> : <BoxMenuLatOtros datas={this.props.data} /> });
            }} >
                <SIcon name={"MenuLat"} fill={STheme.color.text} width={24} height={24} />
                <SView width={5} />
            </SView>
        </SView>
    }
    renderImage() {
        const image_src = SSocket.api.repo + "publicacion/" + this.props.data.key ?? "";
        return <SView col={"xs-12"} colSquare onPress={() => {
            SNavigation.navigate("/publicacion/post", { pk: this.props.data.key })
        }}>
            <SImage src={image_src} style={{
                resizeMode: "cover"
            }} />
        </SView>
    }
    renderActions() {
        const size = 28;
        return <SView col={"xs-12"} row height={size} center>
            <SView width={size} height>
                <SIcon name={'Heart'} height={24} fill={STheme.color.text} />
            </SView>
            <SView width={size / 2} />
            <SView width={size} height>
                <SIcon name={'Comment'} height={24} fill={STheme.color.text} />
            </SView>
            <SView flex />
            {/* <SView width={size/2} />
            <SView width={size} height>
                <SIcon name={'Heart'} fill={STheme.color.text} />
            </SView>
            <SView flex />
            <SView width={size} height>
                <SIcon name={'Comment'} fill={STheme.color.text} />
            </SView> */}
        </SView>
    }
    renderTitle() {
        return <SView col={"xs-12"}>
            <SText>{this.props.data.descripcion}</SText>
        </SView>
    }
    renderLikes() {
        return <SView col={"xs-12"}>
            <SText bold>{"0 Me gusta"}</SText>
        </SView>
    }
    renderComments() {
        return <SView col={"xs-12"}>
            <SText bold color={STheme.color.lightGray}>{"Ver 1 comentario"}</SText>
        </SView>
    }
    render() {
        return (<SView {...this.props} style={{ borderWidth: 1, borderColor: STheme.color.primary }}>
            {/* <SText>{JSON.stringify(this.props.data)}</SText> */}
            {/* {this.renderAuthor()} */}
            {this.renderImage()}
            {/* <SHr height={1} /> */}
            {/* <SHr h={16} />
            {this.renderActions()}
            <SHr h={16} />
            {this.renderLikes()}
            <SHr /> */}
            {/* {this.renderTitle()} */}
            {/* {this.renderComments()} */}
            {/* <SHr /> */}
        </SView >
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);