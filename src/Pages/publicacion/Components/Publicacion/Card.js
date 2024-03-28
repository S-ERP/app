import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SHr, SIcon, SImage, SPage, SText, STheme, SView, SNavigation, SPopup, SLoad, SThread } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import BoxMenuLat from './BoxMenuLat';
import BoxMenuLatOtros from './BoxMenuLatOtros';
import Model from '../../../../Model';
import LikeAnimation from './LikeAnimation';
import ImagePub from './ImagePub';
import TextWithLink from '../TextWithLink';
import SVideo from '../SVideo';
export type PublicacionPropsType = {
    data: any,
    usuario: any,
    onPress?: (obj) => {},
    onLike?: (obj) => any,
    disLike?: (obj) => any,
}
class index extends Component<PublicacionPropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {

        // SSocket.sendPromise({
        //     ...Model.usuario.info,
        //     "component": "usuario",
        //     "type": "getAllKeys",
        //     "estado": "cargando",
        //     "keys": [this.props.data?.key_usuario]
        // }).then((e) => {
        //     if (e.estado != "exito") return;
        //     this.setState({ usuario: e.data[this.props.data?.key_usuario]?.usuario })
        // }).catch((e) => {
        //     console.error(e)
        // })
    }

    handleClosed() {
        if (this.video_ref) {
            this.video_ref.pause()
        }
    }

    handleOpen() {
        if (this.video_ref) {
            this.video_ref.play()
        }
    }
    handlePress() {
        if (!this.props.onPress) return null;
        this.props.onPress(this.props.data)
        // this.props.onPress(this.props.usuario)
    }

    renderAuthor() {
        var key_usuario = Model.usuario.Action.getKey();
        // let user = Model.usuario.Action.getByKey(this.props.data?.key_usuario);

        let user = this.props.usuario ?? {}
        return <SView col={"xs-12"} row height={50} center onPress={() => {
            SNavigation.navigate("/perfil/client", { pk: this.props.data?.key_usuario })
        }}>
            <SView width={50} height style={{
                justifyContent: "center"
            }} >
                <SView style={{
                    backgroundColor: STheme.color.card, borderRadius: 100, width: 40, height: 40, overflow: "hidden"
                }}>
                    <SImage src={SSocket.api.root + "usuario/" + this.props.data?.key_usuario + "?date=" + (new Date().getTime() / (1000 * 60)).toFixed(0)} style={{
                        resizeMode: "cover"
                    }} />
                </SView>
            </SView>
            <SView flex height style={{
                justifyContent: "center"
            }} >
                <SText bold>{user?.Nombres} {user?.Apellidos}</SText>
            </SView>
            <SView width={30} center onPress={() => {
                SPopup.open({ key: "menuLat", content: (key_usuario == this.props?.data?.key_usuario) ? <BoxMenuLat datas={this.props?.data} /> : <BoxMenuLatOtros datas={this.props.data} /> });
            }} >
                <SIcon name={"MenuLat"} fill={STheme.color.text} width={24} height={24} />
                <SView width={5} />
            </SView>
        </SView>
    }

    handleLike = () => {
        this.likeanim.start();
        Model.publicacion_like.Action.registro({
            key_usuario: Model.usuario.Action.getKey(),
            key_publicacion: this.props.data.key,
        }).then((e) => {
            if (this.props.onLike) {
                this.props.onLike(this.props.data)
            }
            Model.publicacion.Action._dispatch({
                component: "publicacion",
                type: "onLike",
                key_publicacion: this.props.data.key,
                key_usuario: Model.usuario.Action.getKey(),
                cantidad: 1,
            })
        }).catch((error) => {
            console.error(error)
        });
    }
    renderImage() {
        // const image_src = Model.publicacion._get_image_download_path(SSocket.api, this.props.data.key ?? "");
        const image_src = SSocket.api.repo + "publicacion/" + this.props.data.key ?? "";
        return <SView col={"xs-12"} colSquare activeOpacity={1}
            style={{
                backgroundColor: "#66666622",
                zIndex: 999,
                // minHeight: 300,
            }}
            center
            onPress={() => {
                if (!Model.usuario.Action.getKey()) return SNavigation.navigate("/login")
                if (!this.nclick) this.nclick = 1
                else this.nclick++;
                new SThread(250, "double", true).start(() => {
                    if (this.nclick >= 2) {
                        console.log("Double")
                        this.handleLike()
                    } else {
                        console.log("single")
                    }
                    this.nclick = 0;
                })
            }}>

            {this.props?.data?.tipo == "video" ? <SVideo ref={ref => this.video_ref = ref} src={image_src + ".mp4"} poster={image_src} /> : <ImagePub src={image_src} />}

            {/* <SImage src={image_src} style={{
                resizeMode: "contain"
                // resizeMode: "cover"
            }} /> */}
            {Model.usuario.Action.getKey() ? <LikeAnimation ref={ref => this.likeanim = ref} /> : null}
        </SView>
    }
    handlePressHeart = () => {
        if (this.props.data.mylike) {
            Model.publicacion_like.Action.dislike({
                key_usuario: Model.usuario.Action.getKey(),
                key_publicacion: this.props.data.key,
            }, this.props.disLike)
        } else {
            this.handleLike()
        }
    }
    renderActions() {
        const size = 28;

        return <SView col={"xs-12"} row height={size} center>
            <SView width={size} height
                onPress={() => {
                    Model.usuario.Action.getKey() ? this.handlePressHeart(this) : SNavigation.navigate("/login")
                }}
            >
                {this.props.data.mylike ? <SIcon name={'Heart'} height={24} fill={STheme.color.danger} /> : <SIcon name={'Heart'} height={24} fill={"none"} stroke={STheme.color.text} />}
            </SView>
            <SView width={size / 2} />
            {/* <SText>{</SText> */}
            <SView width={size} height onPress={() => {
                Model.usuario.Action.getKey() ? SNavigation.navigate("/publicacion/comments", { pk: this.props.data.key }) : SNavigation.navigate("/login")

            }}>
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
            <TextWithLink>{this.props.data.descripcion}</TextWithLink>
        </SView>
    }
    renderLikes() {
        return <SView col={"xs-12"} onPress={() => {
            Model.usuario.Action.getKey() ?
                SNavigation.navigate("/publicacion/likes", { pk: this.props.data.key })
                :
                SNavigation.navigate("/login")
        }}>
            <SText bold>{(this.props?.data?.likes ?? 0) + " Me gusta"}</SText>
        </SView>
    }
    renderComments() {
        return <SView col={"xs-12"}>
            <SText bold color={STheme.color.lightGray}>{"Ver 1 comentario"}</SText>
        </SView>
    }
    mostrarFechaAtras(fecha) {
        var fechaActual = new Date();
        var fechaPasada = new SDate(fecha, "yyyy-MM-ddThh:mm:ss");

        // Diferencia en milisegundos entre las dos fechas
        var diferencia = fechaActual.getTime() - fechaPasada.getTime();

        // Cálculo de las diferencias en segundos, minutos, horas, días, semanas, meses y años
        var segundos = Math.floor(diferencia / 1000);
        var minutos = Math.floor(diferencia / (1000 * 60));
        var horas = Math.floor(diferencia / (1000 * 60 * 60));

        var dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        var semanas = Math.floor(dias / 7);
        var meses = Math.floor(dias / 30);
        var anios = Math.floor(dias / 365);

        // Mostrar la fecha en base a la diferencia calculada

        if (segundos < 60) {
            return "Hace instantes";

        } else if (minutos < 60) {
            if (minutos <= 1) {
                return "Hace " + minutos + " minuto";
            } else {
                return "Hace " + minutos + " minutos";
            }

        } else if (horas < 24) {
            if (horas <= 1) {
                return "Hace " + horas + " hora";
            } else {
                return "Hace " + horas + " horas";
            }

        } else if (dias < 7) {
            if (dias <= 1) {
                return "Hace " + dias + " día";
            } else {
                return "Hace " + dias + " días";
            }
        } else if (semanas < 4) {
            if (semanas <= 1) {
                return "Hace " + semanas + " semana";
            } else {
                return "Hace " + semanas + " semanas";
            }

        } else if (meses < 12) {
            if (meses <= 1) {
                return "Hace " + meses + " mes";
            } else {
                return "Hace " + meses + " meses";
            }
        } else {
            if (anios <= 1) {
                return "Hace " + anios + " año";
            } else {
                return "Hace " + anios + " años";
            }
        }
    }
    renderFecha() {
        return <SText fontSize={12} color={STheme.color.gray}>{this.mostrarFechaAtras(this.props?.data?.fecha_on)}</SText>
    }
    renderComentarios() {
        if (this.props.data.comentarios != 0) return <SView onPress={() => { SNavigation.navigate("/publicacion/comments", { pk: this.props.data.key }) }}>
            {/* {(this.props.data.comentarios != 0) ? <SHr height={4} /> : null} */}
            <SHr height={4} />
            <SText fontSize={14} color={STheme.color.gray}>{(this.props.data.comentarios != 0) ? "Ver todos los comentarios" : ""}</SText>
        </SView>
    }
    render() {
        return (<SView col={"xs-12"} >
            {/* <SText>{JSON.stringify(this.props.data)}</SText> */}
            {this.renderAuthor()}
            <SHr h={8} />
            {this.renderImage()}
            <SHr h={16} />
            {this.renderActions()}
            <SHr h={8} />
            {this.renderLikes()}
            <SHr />
            {this.renderTitle()}
            {this.renderComentarios()}
            <SHr height={4} />
            {this.renderFecha()}

            <SHr height={20} />
        </SView >
        );
    }
}
// const initStates = (state) => {
//     return { state }
// };
// export default connect(initStates)(index);
export default index;