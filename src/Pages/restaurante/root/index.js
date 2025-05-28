import React, { Component } from 'react';
import { View, Text } from 'react-native';
// import { AccentBar, Popups, TopBar } from '../../../Components';
import ScrollBody from './Components/ScrollBody';
import SSocket from 'servisofts-socket';
import { SDate, SHr, SLoad, SNavigation, SPage, SThread } from 'servisofts-component';
import CarritoFlotante from '../Components/CarritoFlotante';
import Carrito from '../Components/Carrito';
import Model from '../../../Model';
import TopBar from '../../../Components/TopBar';
export default class index extends Component {
    static __instance;
    static reload() {
        if (!this.__instance) return;
        this.__instance.refresh();
    }
    static TOPBAR = <>
        <TopBar type={"default"} />
    </>
    // static FOOTER = <>
    //     <AccentBar type='2' />
    // </>
    constructor(props) {
        super(props);
        this.state = {
            data: Model.empresa.Action.getSelect(),
            pendiente: false,
        };
        index.__instance = this;
        this.key_empresa = Model.empresa.Action.getKey()
    }

    componentDidMount() {
        index.__instance = this;
        this.loadData();

    }
    loadData(prevent) {

        //VERIFICANDO SI HAY PEDIDOS PENDIENTES
        const carrito = Model.carrito.Action.getState()
        var pendiente = false
        if (carrito.productos) {
            let firstItem = Object.values(carrito.productos)[0];
            if (firstItem) {
                const kr = firstItem?.data?.key_empresa;
                if (kr != this.key_empresa) {
                    // pendiente = true
                    this.setState({ pendiente: true })
                }
            }
        }


        // SSocket.sendHttpAsync(SSocket.api.root + "api", {
        //     component: "app_client",
        //     type: "explorar_nuevo",
        //     key_empresa: this.key_restaurante,
        // }).then(e => {
        //     // console.log(e);
        //     if (!e.data) return;
        //     if (!prevent) {
        //         //this.verificarFueraDeHorario(e.data[0])
        //     }
        //     this.setState({ data: e.data[0] })
        // }).catch(e => {
        //     console.error(e);
        // })
        // this.verificarFueraDeHorario(this.state.data)
        this.setState({ carrito: true })
    }


    refresh() {
        this.setState({ data: null })
        this.loadData(true)
    }
    render() {
        if (!this.state.data) return <>
            <SLoad type='skeleton' width={"100%"} height={150} />
            <SHr h={100} />
            <SLoad type='skeleton' width={"100%"} height={20} />
            <SHr h={240} />
            <SLoad type='skeleton' width={"100%"} height={20} />
            <SHr />
        </>
        return <SPage disableScroll hidden
            footer={<>
                {this.state.carrito ? <Carrito ref={ref => this.carrito = ref} key_empresa={Model.empresa.Action.getKey()} /> : null}
                <CarritoFlotante />
            </>}>
            <ScrollBody data={this.state.data} onRefresh={e => {
                this.refresh();
            }} pendiente={this.state.pendiente} />

        </SPage>
    }
}
