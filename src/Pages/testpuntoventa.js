import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SDate, SDatePicker, SHr, SInput, SLoad, SNavigation, SNotification, SPage, SSPiner, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
// import STextPlay from '../Components/STextPlay';
// import Container from '../Components/Container';
// import SMD from '../SMD';
import MDtest1 from '../SMD/MDtest1';
// import MDtest2 from '../SMD/MDtest2';
// import SwipeableView from '../Components/SwipeableView';
// import Loby from "./loby/root"
// import Publicaciones from "./publicacion/root"
// import Menu from './menu';
import MenuDragable from '../Components/MenuDragable';
import Model from '../Model';
// import MultipageMenu from '../Components/MultipageMenu';
import SSocket from 'servisofts-socket';
import DataBase from '../DataBase';
// import { Trigger } from 'servisofts-db';
// import { Image } from 'react-native';

const propductosComputacion = [
    {
        "id": 1,
        "name": "Corner Desk Left Sit",
        "image": "/placeholder.svg?height=200&width=200",
        "price": 97.75,
        "currency": "$",
        "category": "desks",
        "stock": 15,
        "description": "Escritorio esquinero izquierdo ergonómico"
    },
    {
        "id": 2,
        "name": "Corner Desk Right Sit",
        "image": "/placeholder.svg?height=200&width=200",
        "price": 169.05,
        "currency": "$",
        "category": "desks",
        "stock": 12,
        "description": "Escritorio esquinero derecho ergonómico"
    },
    {
        "id": 3,
        "name": "Customizable Desk (Custom, White)",
        "image": "/placeholder.svg?height=200&width=200",
        "price": 920.46,
        "currency": "$",
        "category": "desks",
        "stock": 8,
        "description": "Escritorio personalizable blanco"
    },
    {
        "id": 4,
        "name": "Customizable Desk (Custom, Black)",
        "image": "/placeholder.svg?height=200&width=200",
        "price": 862.50,
        "currency": "$",
        "category": "desks",
        "stock": 10,
        "description": "Escritorio personalizable negro"
    },
    {
        "id": 5,
        "name": "Customizable Desk (Custom, Wood)",
        "image": "/placeholder.svg?height=200&width=200",
        "price": 862.50,
        "currency": "$",
        "category": "desks",
        "stock": 6,
        "description": "Escritorio personalizable madera"
    },
    {
        "id": 6,
        "name": "Customizable Desk (Steel, Black)",
        "image": "/placeholder.svg?height=200&width=200",
        "price": 862.50,
        "currency": "$",
        "category": "desks",
        "stock": 14,
        "description": "Escritorio acero negro"
    },
    {
        "id": 7,
        "name": "Customizable Desk (Steel, White)",
        "image": "/placeholder.svg?height=200&width=200",
        "price": 862.50,
        "currency": "$",
        "category": "desks",
        "stock": 9,
        "description": "Escritorio acero blanco"
    },
    {
        "id": 8,
        "name": "Desk Combination",
        "image": "/placeholder.svg?height=200&width=200",
        "price": 517.50,
        "currency": "$",
        "category": "desks",
        "stock": 11,
        "description": "Combinación de escritorio modular"
    },
    {
        "id": 9,
        "name": "Four Person Desk",
        "image": "/placeholder.svg?height=200&width=200",
        "price": 2702.50,
        "currency": "$",
        "category": "desks",
        "stock": 3,
        "description": "Escritorio para cuatro personas"
    },
    {
        "id": 10,
        "name": "Large Desk",
        "image": "/placeholder.svg?height=200&width=200",
        "price": 2068.85,
        "currency": "$",
        "category": "desks",
        "stock": 5,
        "description": "Escritorio grande ejecutivo"
    },
    {
        "id": 11,
        "name": "Office Chair Premium",
        "image": "/placeholder.svg?height=200&width=200",
        "price": 299.99,
        "currency": "$",
        "category": "chairs",
        "stock": 20,
        "description": "Silla de oficina premium ergonómica"
    },
];



export default class testpuntoventa extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: MDtest1
            // text: MDtest2
        };
    }


    detalle() {
        return <SView col={"xs-12"} center>
            <SView col={"xs-11"} center>
                <SText fontSize={20} color='white'>Detalle del producto</SText>
                <SHr />
                <SView col={"xs-12"} row>
                    {propductosComputacion.map((item, index) => {
                        return <SView key={index} col={"xs-6"} center>
                            <SView style={{ width: 100, height: 100, borderRadius: 50, overflow: "hidden" }}>
                                {/* <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> */}
                            <SText fontSize={16} color='white'>{item.name}</SText>
                            <SText fontSize={16} color='white'>{item.stock}.00 Units x {item.precio}/Units</SText>
                            </SView>


                            <SText fontSize={14} color='white'>{item.stock * item.precio}</SText>
                        </SView>;
                    })}
                </SView>
            </SView>
        </SView>
    }

    render() {

        return <SPage disableScroll hidden>


            <SView col={"xs-12"} center backgroundColor='transparent' row>

                <SView col={"xs-4"} row center backgroundColor='yellow'>

                    {this.detalle()}
                    {/* <SView flex center backgroundColor='yellow'>
                        <SText fontSize={20} color='white'>Punto de Venta</SText>

                    </SView>
                    <SView col={"xs-4"} center backgroundColor='yellow'>
                        <SText fontSize={20} color='white'>Punto de Venta</SText>
                        <SText fontSize={20} color='white'>Punto de Venta</SText>
                    </SView> */}
                </SView>


                <SView col={"xs-8"} center border='blue'>
                    <SText fontSize={20} color='white'>Subgrupos de platos</SText>

                </SView>
            </SView>

        </SPage>
    }
}
