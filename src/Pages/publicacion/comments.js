import React, { Component } from 'react';
import { connect } from 'react-redux';
import { KeyboardAvoidingView, Platform, Keyboard, ScrollView, View, TextInput } from 'react-native'
import { SNavigation, SNativeModules, SView, STheme, SIcon, SHr, SImage, SText, SList } from 'servisofts-component';
import Model from '../../Model';
import SSocket from 'servisofts-socket'
class comments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            usuarios: {}
        };
        this.pk = SNavigation.getParam("pk");
    }



    componentDidMount() {
        SNativeModules.setSoftInputMode("adjustResize")
        this.setState({ loading: true });
        Model.publicacion_comentario.Action.getAllPromise(this.pk).then(e => {
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
    componentWillUnmount() {
        SNativeModules.setSoftInputMode("adjustPan")
    }

    render() {
        return (<View style={{ flex: 1 }} >
            <SView style={{ width: "100%", height: 50, }} row >
                <SView width={50} height padding={12} onPress={() => {
                    SNavigation.goBack();
                }}>
                    <SIcon name='Back' fill={STheme.color.text} />
                </SView>
                <SView flex height center>
                    <SText center fontSize={18} bold>Comentarios</SText>
                </SView>
                <SView width={50} height>

                </SView>
            </SView>
            <SHr h={1} color={STheme.color.card} />
            <KeyboardAvoidingView
                keyboardVerticalOffset={20}
                enabled
                behavior={Platform.OS === "ios" ? "padding" : null}
                style={{ flex: 1 }}
            >
                <SView col={'xs-12'} flex activeOpacity={1}>
                    <ScrollView ref={ref => { this.scrollView = ref }}
                        onContentSizeChange={() => {
                            this.scrollView.scrollToEnd({ animated: false })
                        }}>
                        <SHr height={8} />
                        <SList data={this.state.data}
                            space={32}
                            render={(obj) => {
                                // let user = Model.usuario.Action.getByKey(obj.key_usuario)
                                let user = this.state?.usuarios[obj.key_usuario]?.usuario;
                                return <SView col={"xs-12"}>

                                    <SHr />
                                    <SView col={"xs-12"} row>
                                        <SView width={8} />
                                        <SView width={40} height={40} style={{
                                            backgroundColor: STheme.color.card,
                                            borderRadius: 100,
                                            overflow: "hidden"
                                        }}
                                            onPress={() => { SNavigation.navigate("/perfil/client", { pk: obj.key_usuario }) }}
                                        >
                                            <SImage src={Model.usuario._get_image_download_path(SSocket.api, obj.key_usuario)} />
                                        </SView>
                                        <SView width={16} />
                                        <SView flex onPress={() => { SNavigation.navigate("/perfil/client", { pk: obj.key_usuario }) }}>
                                            <SText fontSize={14} bold>{user?.Nombres} {user?.Apellidos}</SText>
                                            <SHr h={8} />
                                            <SText fontSize={16}>{obj.descripcion}</SText>
                                        </SView>
                                        <SView width={40} center height>
                                            <SIcon width={20} name={"Heart"} stroke={STheme.color.card} />
                                        </SView>
                                    </SView>
                                    <SHr />
                                </SView>
                            }}
                        />
                        <SHr height={8} />
                    </ScrollView>
                </SView>
                <SHr h={1} color={STheme.color.card} />
                <Footer pk={this.pk}
                    onRegister={(obj) => {
                        if (this.state.data) {
                            this.state.data[obj.key] = obj;
                            this.setState({ ...this.state })
                        }
                    }}
                    onFocus={() => {
                        this.scrollView.scrollToEnd({ animated: false })
                    }} />
            </KeyboardAvoidingView>
        </View>);
    }

}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(comments);

class Footer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            size: 50,
            space: 4,
            height: 0,
            text: "",
        };

    }
    enviar() {
        // var txt = this.chat_inp.getValue();
        var txt = this.state.text
        if (!txt) return;
        if (!txt.length) return;
        // this.chat_inp.setValue("");
        this.state.text = "";
        this.state.height = 0;
        this.setState({ loading: true })
        Model.publicacion_comentario.Action.registro({
            data: {
                descripcion: txt,
                observacion: "",
                key_publicacion: this.props.pk,
            },
            key_usuario: Model.usuario.Action.getKey(),
        }).then((resp) => {
            if (this.props.onRegister) this.props.onRegister(resp.data)
            this.setState({ loading: false })
            console.log(resp);
        }).catch((e) => {
            this.setState({ loading: false })
            console.error(e);
        })

    }
    render() {
        // if (!this.props.data.mi_chat_usuario) return null;
        let maxHeight = 140;
        return <SView col={"xs-12"}>
            <SHr />
            <SView row col={"xs-12"} padding={this.state.space}>
                <SView height style={{
                    alignItems: "center",
                    justifyContent: "flex-end",
                }}>
                    <SView center onPress={this.enviar.bind(this)} style={{
                        width: this.state.size,
                        height: this.state.size,
                        borderRadius: 100,
                        overflow: 'hidden',
                    }}>
                        <SImage src={Model.usuario._get_image_download_path(SSocket.api, Model.usuario.Action.getKey())} />
                    </SView>
                </SView>
                <SView width={this.state.space * 3} />
                <TextInput style={{
                    flex: 1,
                    color: STheme.color.text,
                    borderRadius: 30,
                    overflow: "hidden",
                    height: Math.max(this.state.size, (this.state?.height ?? 0) > maxHeight ? maxHeight : this.state?.height),
                    borderWidth: 1,
                    borderColor: STheme.color.card,
                    padding: 4,
                    paddingTop: 14,
                    paddingStart: 12,
                    fontSize: 16,
                    justifyContent: "center",

                }}
                    value={this.state.text}
                    placeholder='Agrega un comentario...'
                    placeholderTextColor={STheme.color.card}
                    multiline={true}
                    onFocus={this.props.onFocus}
                    onChangeText={(text) => {
                        this.setState({ text })
                    }}
                    onContentSizeChange={(event) => {
                        // if (event.nativeEvent.contentSize.height) {
                        this.setState({ height: event.nativeEvent.contentSize.height })
                        // }
                    }}


                />
                <SView width={this.state.space * 3} />
                <SView height style={{
                    alignItems: "center",
                    justifyContent: "flex-end",
                }}>
                    <SView center onPress={this.enviar.bind(this)} style={{
                        width: this.state.size,
                        height: this.state.size,
                    }}>
                        <SIcon name='MessageSend' fill={STheme.color.text} width={30} />
                        {/* <SText>{"SEND"}</SText> */}
                    </SView>
                </SView>
            </SView>
            <SHr />
        </SView>
    }
}
