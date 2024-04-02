import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SDate, SHr, SIcon, SInput, SNavigation, SPage, SText, STheme, SUuid, SView } from 'servisofts-component';
import SList from 'servisofts-component/Component/SList2';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import ChangeColor from './Components/ChangeColor';
import { Container } from '../../Components';

const horas = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"]
const HEI = 40;
export default class dia extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.fecha = SNavigation.getParam("fecha", new SDate().toString("yyyy-MM-dd"));
        this.date = new SDate(this.fecha, "yyyy-MM-dd")
    }
    componentDidMount() {
        let semana = new SDate().getFirstDayOfWeek();
        SSocket.sendPromise({
            component: "tarea",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            fecha_inicio: this.date.toString("yyyy-MM-dd"),
            fecha_fin: this.date.toString("yyyy-MM-dd")
        }).then(e => {
            console.log(e);
            this.setState({ data: e.data })
        }).catch(e => {
            console.error(e);
        })
    }


    item(hora) {
        let color = STheme.color.gray
        return <SView col={"xs-12"} height={HEI} onPress={() => {
            // SNavigation.navigate("/tarea/new")
            let millis = 3600000
            if (this.state?.data?.new?.fecha_inicio && this.state?.data?.new?.fecha_fin) {
                let fi = new SDate(this.state?.data?.new?.fecha_inicio, "yyyy-MM-ddThh:mm:ss")
                let ff = new SDate(this.state?.data?.new?.fecha_fin, "yyyy-MM-ddThh:mm:ss")
                millis = ff.getTime() - fi.getTime();
            }
            let fi = new SDate(this.date.toString("yyyy-MM-dd") + "T" + hora + ":00", "yyyy-MM-ddThh:mm:ss")
            let data = {
                key: "new",
                fecha_inicio: fi.toString(),
                fecha_fin: fi.addMillisecond(millis).toString(),
                descripcion: this.state?.data?.new?.descripcion,
                estado: 1,
                color: "#E7E28D"
            }
            this.state.data[data.key] = data;
            this.setState({ ...this.state })
        }}>
            <SView row col={"xs-12"} >
                <SText color={color} width={50}>{hora}</SText>
                <SView flex>
                    <SHr h={1} color={color + "66"} />
                </SView>
            </SView>
        </SView>
    }
    renderTareas() {
        if (!this.state.data) return null;
        // let data = Object.values(this.state.data).map((a) => {
        //     let fi = new SDate(a.fecha_inicio, "yyyy-MM-ddThh:mm:ss");
        //     let ff = new SDate(a.fecha_fin, "yyyy-MM-ddThh:mm:ss");
        //     if (!a.fecha_fin) {
        //         ff = fi.clone().addHour(1);
        //     }
        //     a.timeDuration = ff.diffTime(ff);
        //     return a;
        // })
        // data = data.sort((a, b) => a.timeDuration > b.timeDuration ? -1 : -1)
        let data = Object.values(this.state.data)
        data.map(a => {
            let fi = new SDate(a.fecha_inicio, "yyyy-MM-ddThh:mm:ss");
            let ff = new SDate(a.fecha_fin, "yyyy-MM-ddThh:mm:ss");
            if (!a.fecha_fin) {
                ff = fi.clone().addHour(1);
            }
            a.fi = fi;
            a.ff = ff;
        })
        data = data.sort((a, b) => new SDate(a.fecha_inicio, "yyyy-MM-ddThh:mm:ss").getTime() > new SDate(b.fecha_inicio, "yyyy-MM-ddThh:mm:ss").getTime() ? 1 : -1)
        return data.map((a, i) => {
            let iy = (a.fi.toJson().hour * HEI) + (a.fi.toJson().minutes * (HEI / 60));
            let fy = (a.ff.toJson().hour * HEI) + (a.ff.toJson().minutes * (HEI / 60));
            let color = a.color ?? "";
            if (!color) {
                color = STheme.colorFromText(a.key);
            }

            let space = 0;
            let spaceY = 0;
            for (let j = 0; j < i; j++) {
                const e = data[j];
                if (a.fi.getTime() >= e.fi.getTime() && a.fi.getTime() <= e.ff.getTime()) {
                    let dist = (a.fi.getTime() - e.fi.getTime())
                    dist = (dist / 1000) / 60
                    let m = (HEI / 60) * dist;

                    if (m < 20 + e.spaceY) {
                        spaceY = 20 + e.spaceY - m;
                    }
                    space += e.space + 30;

                    console.log("Choco con una tarea antes de mi", dist, m, a.descripcion)
                    console.log(a.fi.toString(), e.fi.toString())

                }
            }
            console.log(color)
            a.space = space;
            a.spaceY = spaceY;
            return <SView height={fy - iy} backgroundColor={color + "66"} style={{
                position: "absolute",
                borderRadius: 4,
                padding: 4,
                width: a.key == "new" ? "100%" : null,
                // maxWidth: a.key == "new" ? null : 180,
                width: 200,
                // maxWidth: 180,
                // opacity: 0.6,
                top: iy,
                left: 50 + space,
                minHeight: 20,
                // borderWidth: 1,
                borderBottomWidth: 2,
                borderColor: color
                // transform: [{ translateX: 50 + space }]
            }} onPress={() => {
                if (a.key == "new") {
                    return;
                }
                SNavigation.navigate("/tarea/profile", { pk: a.key })
            }}>
                <SHr h={spaceY} />
                <SText bold fontSize={12}>{(a.descripcion ?? "").length > 0 ? a.descripcion : "Sin nombre"}</SText>

            </SView>
        })

    }

    renderPopupNewTask() {
        let obj = this.state.data.new;
        let fechai = new SDate(obj.fecha_inicio, "yyyy-MM-ddThh:mm:ss");
        let fechaf = new SDate(obj.fecha_fin, "yyyy-MM-ddThh:mm:ss");
        if (this.ihi && this.ihf) {
            if (this.ihi.getValue() != fechai.toString("hh:mm")) {
                this.ihi.setValue(fechai.toString("hh:mm"));
            }
            if (this.ihf.getValue() != fechaf.toString("hh:mm")) {
                this.ihf.setValue(fechaf.toString("hh:mm"));
            }
        }
        return <SView col={"xs-12"} height={150} card padding={8}>
            <Container>
                <SView col={"xs-12"}>
                    <ChangeColor onChange={e => {
                        this.state.data.new.color = e;
                        this.setState({ ...this.state })
                    }} />
                </SView>
                <SHr />
                <SView row col={"xs-12"}>
                    <SInput ref={ref => this.ihi = ref}
                        col={"xs-5.5"} type='hour' defaultValue={fechai.toString("hh:mm")} onChangeText={(e) => {
                            if ((e ?? "").length == 5) {
                                obj.fecha_inicio = fechai.toString("yyyy-MM-ddT") + e
                                this.setState({ ...this.state })
                            }
                        }}

                        onSubmitEditing={() => {
                            this.ihf.focus()
                        }} />
                    <SView flex center height>
                        <SText>a</SText>
                    </SView>
                    <SInput
                        ref={ref => this.ihf = ref}
                        isRequired
                        col={"xs-5.5"} type='hour' defaultValue={fechaf.toString("hh:mm")} onChangeText={(e) => {
                            if ((e ?? "").length == 5) {
                                obj.fecha_fin = fechaf.toString("yyyy-MM-ddT") + e
                                this.setState({ ...this.state })
                            }
                        }}
                        onSubmitEditing={() => {
                            if ((obj.descripcion ?? "").length <= 0) {
                                this.indesc.focus();
                            }
                        }}
                    />
                </SView>
                <SHr />
                <SView row col={"xs-12"}>
                    <SInput
                        ref={ref => this.indesc = ref}
                        isRequired={true}
                        flex type={"Text"} value={obj.descripcion}
                        placeholder={"Escriba la tarea..."}
                        autoFocus={(obj.descripcion ?? "").length <= 0}
                        placeholderTextColor={STheme.color.gray}
                        onSubmitEditing={() => {
                            this.ihi.focus()
                        }}
                        onChangeText={(e) => {
                            this.state.data.new.descripcion = e;
                            this.setState({ ...this.state })
                        }} />
                    <SView padding={8} height center onPress={() => {
                        let data = {
                            ...this.state.data.new
                        }
                        if ((data.descripcion ?? "").length <= 0) {
                            console.log("EROROEO")
                            this.indesc.verify(true)
                            return;
                        }
                        data.key_empresa = Model.empresa.Action.getSelect()?.key
                        data.key_usuario = Model.usuario.Action.getKey();
                        Model.tarea.Action.registro({
                            data: data,
                            key_usuario: Model.usuario.Action.getKey(),
                            key_empresa: Model.empresa.Action.getSelect()?.key
                        }).then((resp) => {
                            delete this.state.data.new;
                            this.state.data[resp.data.key] = resp.data;
                            this.setState({ ...this.state })
                            // SNavigation.goBack();
                        }).catch(e => {
                            console.error(e);
                        })
                    }}>
                        <SText>GUARDAR</SText>
                    </SView>
                </SView>

                <SView style={{
                    position: "absolute",
                    width: 30,
                    height: 30,
                    right: -15,
                    top: -15,
                    borderRadius: 100,
                }} onPress={() => {
                    delete this.state.data.new;
                    this.setState({ ...this.state })
                }}><SIcon name='Close' fill={STheme.color.text} />
                </SView>
            </Container>

        </SView>
    }
    render() {

        return <SPage title={"Tareas del dia"}
            footer={!this.state?.data?.new ? null : this.renderPopupNewTask()}
            disableScroll
            onRefresh={(e) => {
                this.componentDidMount();
            }}>
            <SHr />
            <SText bold fontSize={20}>{this.date.toString("dd de MONTH de yyyy")}</SText>
            <SHr />
            <SView col={"xs-12"} flex>
                <ScrollView>
                    <SList
                        data={horas}
                        space={0}
                        render={this.item.bind(this)}
                    />
                    {this.renderTareas()}
                </ScrollView>

            </SView>

        </SPage>
    }
}
