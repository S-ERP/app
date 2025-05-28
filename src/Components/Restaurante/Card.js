import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SImage, SMath, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Restaurante from '.';
export type RestauranteCardPropsType = {
    data: any,
    onPress?: (obj) => {},
}
class index extends Component<RestauranteCardPropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render_foto_perfil() {
        var { key } = this.props.data;
        return <SView width={50} height={50} style={{
            left: 8,
            borderRadius: 100,
            overflow: "hidden",
            position: "absolute",
            borderColor: STheme.color.secondary,
            borderWidth: 1,
        }} card>
            <SImage src={SSocket.api.root + "restaurante/" + key + "?date=" + new Date().getTime()} style={{
                resizeMode: "cover"
            }} />
        </SView>
    }
    render_portada() {
        var { key, nombre } = this.props.data;
        return <SView col={"xs-12"} height={100} backgroundColor={STheme.color.card}>
            <SImage src={SSocket.api.root + "restaurante/portada/" + key + "?date=" + new Date().getTime()} style={{
                resizeMode: "cover"
            }} />
        </SView>
    }
    handlePress() {
        if (!this.props.onPress) return null;
        this.props.onPress(this.props.data)
    }
    render() {
        var { key, nombre, proximo_horario, distancia } = this.props.data;

        return (
            <SView
                width={320}
                // col={"xs-11"}
                height={186}
                style={{
                    borderRadius: 16,
                    borderColor: "#AAAAAA22",
                    borderWidth: 2,
                    borderTopWidth: 0,
                    borderBottomWidth: 3,
                    marginTop: 8,
                    overflow: "hidden"
                }}
                activeOpacity={1}
                {...this.props}
                onPress={!this.props.onPress ? null : this.handlePress.bind(this)}>
                {this.render_portada()}
                <SView col={"xs-12"} height style={{
                    position: "absolute"
                }}>
                    <SView col={"xs-12"} height={88}>

                    </SView>
                    <SView row center>
                        <SView width={50} />
                        <SView flex height={24} row center backgroundColor={STheme.color.primary} style={{
                            borderTopRightRadius: 8,
                            borderBottomRightRadius: 8,
                            paddingLeft: 12
                        }}>
                            <SText col={"xs-12"} color={STheme.color.secondary}>{(nombre).slice(0, 30)}</SText>
                        </SView>
                        <SView width={20} />
                        {this.render_foto_perfil()}
                    </SView>
                    <SView col={"xs-12"} flex row>
                        <SView flex height style={{
                            justifyContent: "center",
                            paddingLeft: 8
                        }}>
                            {/* <Restaurante.ProximoHorario data={this.props.data} /> */}
                            <SHr height={10} />
                            {/* <SView col={"xs-12"} row>
                                <SIcon name='Ihorario' height={13.5} width={13.5} />
                                <SView width={5} />
                                <SText fontSize={12}>HORARIO</SText>
                            </SView> */}

                            <SText fontSize={11}>{proximo_horario?.extraData?.text}</SText>
                            <SText fontSize={14} >
                                {proximo_horario?.extraData?.hora_inicio} - {proximo_horario?.extraData?.hora_fin}
                            </SText>
                            <SView style={{ width: 84, borderColor: "#FA790E", borderBottomWidth: 3 }}></SView>
                        </SView>
                        <SView flex height center>
                            <SView col row center>
                                <SIcon name='Idistancia' height={13.5} width={13.5} />
                                <SView width={5} />
                                <SText>{distancia + " Km"}</SText>
                            </SView>

                        </SView>
                        <SView flex height center>
                            <SText>{"Bs " + SMath.formatMoney(proximo_horario?.pack?.precio ?? 0)}</SText>
                        </SView>
                    </SView>
                </SView>
                <Restaurante.Favorito data={this.props.data} style={{
                    position: "absolute",
                    top: 2, right: 4
                }} />
                <Restaurante.Disponibles cantidad={proximo_horario?.pack?.cantidad_disponible } style={{
                    position: "absolute",
                    top: 8, left: 4
                }} />
                {/* <SText>{JSON.stringify(this.props.data)}</SText> */}
            </SView>

        );
    }
}
export default (index);