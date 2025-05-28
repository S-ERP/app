import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SHr, SIcon, SImage, SMath, SPage, SSwitch, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Restaurante from '.';
import Precio from './Precio';
export type RestauranteCardPropsType = {
    data: any,
    onPress?: (obj) => {},
}
class index extends Component<RestauranteCardPropsType> {
    constructor(props) {
        super(props);
        this.state = {
            time: new SDate().toString("yyyy-MM-dd hh:mm")
        };
    }

    render_foto_perfil(close) {
        var { key } = this.props.data;
        return <SView width={50} height={50} style={{
            left: 8,
            borderRadius: 100,
            overflow: "hidden",
            position: "absolute",
            borderColor: STheme.color.secondary,
            borderWidth: 1,
        }} card>
            <SImage src={SSocket.api.root + "restaurante/.128_" + key + "?date=" + this.state.time} style={{
                resizeMode: "cover"
            }} />
        </SView>
    }

    render_portada(close) {
        var { key, nombre } = this.props.data;
        return <SView col={"xs-12"} height={100} backgroundColor={STheme.color.card}>
            <SImage src={SSocket.api.root + "restaurante/portada/.512_" + key + "?date=" + this.state.time} style={{
                resizeMode: "cover"
            }} />
            {!close ? null : <SView style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundColor: "#666666",
                opacity: 0.5
            }}>

            </SView>}
        </SView>
    }

    handlePress() {
        if (!this.props.onPress) return null;
        this.props.onPress(this.props.data)
    }

    renderCalificacion() {
        var { calificacion, fecha_on } = this.props.data;
        if (fecha_on) {
            const dif = new SDate(fecha_on).diffTime(new SDate())
            if (dif <= 1000 * 60 * 60 * 24 * 15) {
                return <SView col={"xs-12"} row height={20} center style={{
                    position: "absolute",
                    top: 25,
                    left: 2
                }}>
                    <SView width={70} />
                    <SView height={12} width={16} center style={{
                        // backgroundColor: STheme.color.accent,
                        // borderBottomLeftRadius: 4,
                        // borderBottomRightRadius: 4,
                    }} >
                        <SIcon name={"restaurantenuevo"} fill={STheme.color.primary} />
                    </SView>
                    <SView width={2} />
                    <SText fontSize={11} bold color={STheme.color.primary}>{"NUEVO"}</SText>
                    <SView flex />
                </SView>
            }
        }
        return <SView col={"xs-12"} row height={15} center style={{
            position: "absolute",
            top: 24,
            left: 3
        }}>
            <SView width={70} />
            <SView height={15} width={15} center style={{
                backgroundColor: STheme.color.accent,
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 4,
                paddingBottom: 1
            }} >
                <SView height={12} width={10}>
                    <SIcon name={"Estrella"} fill={STheme.color.white} />
                </SView>
            </SView>
            <SView width={2} />
            <SText fontSize={11} color={STheme.color.text}>{calificacion ?? 5.0}</SText>
            <SView flex />
        </SView>
    }

    render() {
        var { key, nombre, horario, distancia, cantidad_pedidos, tapeke_deshabilitado } = this.props.data;
        // horario.precio_original = 100.22
        let horario_txt = "Hoy";
        let isClose = (this.props.data?.horario?.fecha != new SDate().toString("yyyy-MM-dd"))
        if (isClose) {
            const Shorario = new SDate(this.props.data?.horario?.fecha, "yyyy-MM-dd");
            horario_txt = Shorario.toString("DAY")
        }
        // console.log(this.props.data)
        let cantidad = horario?.cantidad - cantidad_pedidos;
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
                onPress={isClose ? null : (!this.props.onPress ? null : this.handlePress.bind(this))}>

                {this.render_portada(isClose)}
                <SView col={"xs-12"} height style={{
                    position: "absolute"
                }}>
                    <SView col={"xs-12"} height={88}>

                    </SView>
                    <SView row center>
                        <SView width={50} />
                        <SView flex height={24} row center backgroundColor={isClose ? STheme.color.lightGray : STheme.color.primary}
                            style={{
                                borderTopRightRadius: 8,
                                borderBottomRightRadius: 8,
                                paddingLeft: 22.,
                                alignContent: 'center',
                            }}>
                            <SText col={"xs-12"} font={'Montserrat-Bold'} color={STheme.color.secondary}>{(nombre).slice(0, 40)}</SText>
                        </SView>
                        <SView width={20} />
                        {/* <SText col={"xs-12"} >{this.props?.data?.indice_sort}</SText> */}
                        {this.render_foto_perfil(isClose)}
                        {this.renderCalificacion()}
                    </SView>
                    <SView col={"xs-12"} flex center row>
                        <SView style={{
                            justifyContent: "center",
                            paddingLeft: 8
                        }}>
                            {/* <Restaurante.ProximoHorario data={this.props.data} /> */}
                            {/* <SView col={"xs-12"} row>
                                <SIcon name='Ihorario' height={13.5} width={13.5} />
                                <SView width={5} />
                                <SText fontSize={12}>HORARIO</SText>
                            </SView> */}
                            <SText font={'Montserrat-SemiBold'} fontSize={11}>{horario_txt}</SText>
                            <SText font={'Montserrat-SemiBold'} fontSize={14} >
                                {horario?.hora_inicio} - {horario?.hora_fin}
                            </SText>
                            <SView style={{ width: 84, borderColor: isClose ? STheme.color.lightGray : STheme.color.primary, borderBottomWidth: 3 }}></SView>
                        </SView>

                        <SView flex height center>
                            <SHr h={18} />
                            <SView col row center>
                                <SIcon name='Idistancia' height={13.5} width={13.5} />
                                <SView width={5} />
                                <SText font={'Montserrat-SemiBold'}>{distancia + " Km"}</SText>
                            </SView>
                        </SView>

                        {(!cantidad || !!tapeke_deshabilitado) ? <SView flex /> : <Precio horario={horario} />}
                        <SView width={8} />
                    </SView>
                </SView>

                <Restaurante.Favorito data={this.props.data} style={{
                    position: "absolute",
                    top: 2, right: 4
                }} />
                {(!cantidad || !!tapeke_deshabilitado) ? null : <Restaurante.Disponibles cantidad={horario.cantidad - cantidad_pedidos} style={{
                    position: "absolute",
                    top: 8, left: 4
                }} />}
                {!isClose ? null : <Restaurante.Cerrado style={{
                    position: "absolute",
                    top: 8, left: 4
                }} />}
                {/* <SText>{JSON.stringify(this.props.data)}</SText> */}
            </SView>

        );
    }
}
export default (index);