import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SIcon, SList, SLoad, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import PButtom3 from '../../../Components/PButtom3';
import { ScrollView, ScrollView as ScrollViewGesture } from 'react-native-gesture-handler';
import PHr from '../../../Components/PHr';


export default class Actividades extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    componentDidMount() {
        let semana = new SDate().getFirstDayOfWeek();
        let hoy = new SDate();
        SSocket.sendPromise({
            component: "tarea",
            type: "cantidad",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            fecha_inicio: semana.toString("yyyy-MM-dd"),
            fecha_fin: semana.addDay(6).toString("yyyy-MM-dd")
        }).then(e => {
            console.log(e);
            this.setState({ data: e.data })
        }).catch(e => {
            console.error(e);
        })

        console.log("hoyyyyyyyyyyyy")
        console.log(hoy.toString("yyyy-MM-dd"));
        SSocket.sendPromise({
            component: "tarea",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            fecha_inicio: hoy.toString("yyyy-MM-dd"),
            fecha_fin: hoy.toString("yyyy-MM-dd")
        }).then(e => {
            console.log(e);
            this.setState({ dataTareasMiasHoy: e.data })
        }).catch(e => {
            console.error(e);
        })
    }

    addOpcion = (icon, label, navigate) => {
        return <SView flex style={{ alignItems: "flex-end" }} onPress={() => SNavigation.navigate(navigate)} >
            <SView center row card width={105} height={25}>
                <SIcon name={icon} width={13} fill={STheme.color.text} />
                <SView width={4} />
                <SText fontSize={12} center >{label}</SText>
            </SView>
        </SView>
    }

    addFirtsActis = () => {
        if (!this.state.dataTareasMiasHoy) return <SLoad />;
        let day = new SDate();
        let a = this.state.dataTareasMiasHoy;
        console.log("aaaaaaa");
        console.log(a);
        var user;
        return Object.values(this.state.dataTareasMiasHoy).map((dato, i) => {
            user = Model.usuario.Action.getByKey(dato.key_usuario)
            //  user = this.state?.usuarios[dato.key_usuario]?.usuario;
            console.log("usuario", dato.key_usuario);
            console.log(user);
            console.log("iiiiiiiiiiiiiii")
            console.log(i)
            if (i > 4) return null;
            return <>
                <SView col={"xs-12 "} style={{ padding: 5, }} row>
                    <SView col={"xs-12 "} style={{ padding: 5, backgroundColor: STheme.color.card }} onPress={() => SNavigation.navigate("/tarea/profile", { pk: dato.key })} row>

                        <SView col={"xs-2 "} row center>
                            <SView width={20} height={20} style={{ borderRadius: 100, backgroundColor: a?.estado == 2 ? "#7C57E0" : STheme.color.success, overflow: "hidden", padding: 5 }}>
                                <SIcon name='tareaclose' fill={STheme.color.text} />
                            </SView>
                        </SView>
                        <SView col={"xs-10"} style={{ padding: 3 }} row center>
                            <SView col={"xs-12 sm-9 md-9 lg-9 xl-9 xxl-9"} >
                                <SText bold fontSize={10} color={STheme.color.text}>{dato.descripcion}</SText>
                            </SView>
                            {/* <SText fontSize={12} color={STheme.color.gray}>{`#${dato.numero ?? 1} creado hace ${new SDate(dato.fecha_on, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())} por ${user?.Nombres ?? ""} ${user?.Apellidos ?? ""}`}</SText> */}
                            {/* <SText fontSize={9} color={STheme.color.gray}>{`#${dato.numero ?? 1} creado hace ${new SDate(dato.fecha_on, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())} `}</SText> */}
                            <SView col={"xs-12 sm-3 md-3 lg-3 xl-3 xxl-3"} style={{ alignItems: "flex-end" }} >
                                <SText fontSize={9} color={STheme.color.gray}>{`#${dato.numero ?? 1} creado hace ${new SDate(dato.fecha_on, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())} `}</SText>
                                {/* <SView flex /> */}
                            </SView>
                        </SView>
                    </SView >
                </SView >
                {/* {(i < 4) ? <SHr h={2} color={STheme.color.card} /> : null} */}
            </>
        }
        )
    }


    Item = (obj, i, day) => {

        let dia = day.clone();
        dia.addDay(i);

        let cantidad = 0;
        if (this.state.data) {
            let objcant = this.state?.data[dia.toString("yyyy-MM-dd")];
            if (objcant) {
                cantidad = objcant.cantidad;
            }
        }

        return <SView key={"Actividad" + i} padding={4} flex height={85} onPress={() => {
            SNavigation.navigate("/tarea/dia", { fecha: dia.toString("yyyy-MM-dd") })
        }}>
            <SView flex style={{
                backgroundColor: STheme.color.card,
                borderRadius: 16,
                ...(!dia.isCurDate() ? {} : {
                    borderWidth: 1,
                    borderColor: STheme.color.text
                })
            }} padding={4} center>
                <SText color={STheme.color.text} fontSize={14}>{dia.getDayOfWeekJson().textSmall}</SText>
                <SHr />
                <SText color={STheme.color.text} fontSize={18} bold>{dia.toString("dd")}</SText>
                {!cantidad ? null :
                    <SView style={{
                        position: "absolute",
                        width: 20,
                        height: 20,
                        backgroundColor: STheme.color.danger,
                        borderRadius: 100,
                        bottom: -4,
                        right: -4,
                    }} center>
                        <SText fontSize={10} center color={"#fff"}>{cantidad}</SText>
                    </SView>
                }
            </SView>
            {/* {!dia.isCurDate() ? null :
                <SView center width={15} height={15} style={{ position: "absolute", bottom: 0, right: 0, borderRadius: 45 }} backgroundColor={STheme.color.danger}>
                    <SText fontSize={8} color={STheme.color.white} >5</SText>
                </SView>
            } */}
        </SView>
    }
    render() {
        let semana = new SDate().getFirstDayOfWeek();
        let now = new SDate();
        let ultimasActis = 0;
        if (this.state.dataTareasMiasHoy && Object.keys(this.state.dataTareasMiasHoy).length !== 0) {
            // El objeto no está vacío
            ultimasActis = 1;
        }

        return <SView col={"xs-12"} >
            <SHr height={20} />
            <SView col={"xs-12"} row >
                <SText bold fontSize={15}> Actividades</SText>
                {this.addOpcion("addTarea", "Ver más", "/tarea")}
            </SView>
            <SHr />
            <SView col={"xs-12"} row>
                {new Array(7).fill(0).map((a, i) => this.Item(a, i, semana))}
            </SView>
            <SHr height={10} />
            {(ultimasActis == 0) ? <SText fontSize={15} center>No se han registrado actividades el día de hoy</SText> :
                <SView col={"xs-12"} row card padding={8}>
                    <SView col={"xs-12 sm-3 md-3 lg-3 xl-3 xxl-3"} padding={8} center>
                        <SText bold fontSize={13} center> Últimas Actividades</SText>
                        <SHr height={10} />
                        <SView backgroundColor={STheme.color.card} center style={{ padding: 8, }} row>
                            <SText style={{textTransform:"uppercase"}}  fontSize={18}> {now.getMonthJson().text}</SText>
                            <PHr />
                            <SText bold fontSize={28}> {now.toString("dd")}</SText>
                            <SHr />
                            <SText  fontSize={12}> {now.getDayOfWeekJson().text}</SText>
                        </SView>
                    </SView>
                    <SView col={"xs-12 sm-9 md-9 lg-9 xl-9 xxl-9"} row>
                        {this.addFirtsActis()}
                    </SView>
                    
                </SView>
            }
            <SHr height={15} />
        </SView>
    }
}
