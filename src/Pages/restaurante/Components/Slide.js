import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { SDate, SIcon, SImage, SText, SThread, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';

export default class Slide extends Component {
    state = {
        index: 0,
    }

    onRefresh(){
        this.componentDidMount();
    }
    componentDidMount() {
        SSocket.sendPromise({
            component: "restaurante_slider",
            type: "getAll",
            key_restaurante: this.props.key_restaurante
        }).then(e => {
            this.state.data = Object.values(e.data);
            this.state.data.sort((a, b) => a.index - b.index)
            this.setState({ ...this.state })
            this.isrun = true;
            this.next(0);
        }).catch(e => {

        })

    }
    componentWillUnmount() {
        this.isrun = false;
    }
    next(i = 1) {
        if (!this.isrun) return;
        const item = this.state.data[this.state.index]
        if (!item) return;
        if (this.state.index + i >= this.state.data.length) {
            this.state.index = 0;
        } else if (this.state.index + i < 0) {
            this.state.index = this.state.data.length - 1;
        } else {
            this.state.index += i;
        }
        this.setState({ index: this.state.index })
        new SThread(item.tiempo ?? 5000, "pasar_img", true).start(() => {

            this.next();
        })

    }
    render() {
        if (!this.state.data) return null;
        const item = this.state.data[this.state.index]
        return <SView col={"xs-12"} height >
            <SView col="xs-12" flex>
                <SImage src={SSocket.api.root + "restaurante_slider/.512_" + item?.key +"?date="+new SDate().toString("yyyy-MM-ddThh:mm")} />
                <SView row col={"xs-12"} height style={{
                    position: "absolute",
                }}>
                    <SView col={"xs-2.5"} style={{
                        height: "100%",
                    }} onPress={() => {
                        this.next(-1);
                    }} center>
                        <SImage src={require("../../../Assets/img/BOTON_SLIDE.png")} style={{
                            width: 30,
                            transform: [{ rotate: "180deg" }]
                        }} />
                        {/* <SIcon width={20} name='Arrow' /> */}
                    </SView>
                    <SView flex></SView>
                    <SView col={"xs-2.5"} style={{
                        height: "100%",
                    }} onPress={() => {
                        this.next();
                    }} center>
                        <SImage src={require("../../../Assets/img/BOTON_SLIDE.png")} style={{
                            width: 30,
                        }} />
                    </SView>
                </SView>
            </SView>
            <SView padding={4} center>
                <SText fontSize={11}>{item?.descripcion}</SText>
            </SView>
        </SView>
    }
}