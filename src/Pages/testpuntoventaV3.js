import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SDate, SDatePicker, SHr, SImage, SInput, SLoad, SMath, SNavigation, SNotification, SPage, SSPiner, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
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
import SIconApp from '../Assets/SIconApp';
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



export default class testpuntoventaV3 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: MDtest1
            // text: MDtest2
        };
    }


    detalle() {
        return (
            <SView col={"xs-12"} center>
                <SText fontSize={16} color='white'>Detalle del producto</SText>
                <SHr />
                <SView col={"xs-12"} row>
                    {propductosComputacion.slice(0, 4).map((item, index) => (
                        <SView col={"xs-12"} row>

                            <SView key={`prod-${index}`} col={"xs-10"} style={{ padding: 4 }}>
                                <SText fontSize={10} color='white'>{item.name}</SText>
                                <SText fontSize={8} color='white'>
                                    {SMath.formatMoney(1, 2)} Und x ${SMath.formatMoney(item.price, 2)}/Unds
                                </SText>

                            </SView>

                            <SView flex center border='red' style={{ padding: 4 }}>
                                <SText fontSize={9} color='blue'>$ {SMath.formatMoney((1 * item?.price), 2)}</SText>
                            </SView>
                        </SView>

                    ))}
                </SView>
            </SView>
        );
    }



    subtotal() {
        return (
            <SView col={"xs-12"} center backgroundColor={STheme.color.card} >
                <SView col={"xs-12"} row style={{ justifyContent: "flex-end", padding: 8 }}>
                    <SText fontSize={14} bold color='white'>TOTAL: $ {SMath.formatMoney(500, 2)}</SText>
                    <SHr />
                    <SText fontSize={8} color='white'>Iva: $ {SMath.formatMoney(500, 2)}</SText>
                    <SHr height={0.5} />
                    <SText fontSize={8} color='white'>its: $ {SMath.formatMoney(500, 2)}</SText>
                </SView>
            </SView>
        );
    }

    puntdd() {
        return (<SView col={"xs-12"} center backgroundColor={STheme.color.gray} >
            <SView col={"xs-11"} row style={{ justifyContent: "flex-end", padding: 8 }}>

                {/* <SView col={"xs-12"} row center style={{ justifyContent: "flex-end", padding: 8 }}><SText fontSize={14} bold color='white'>Punto de Venta</SText> </SView> */}


                <SView col={"xs-5"} height={42} row center style={{ borderColor: "red", borderRadius: 4, borderWidth: 1 }}>
                    <SText fontSize={10} bold color='white'>Puntos ganado</SText>
                    <SHr height={0.5} />

                    <SText fontSize={8} bold color='green'>+113</SText>
                </SView>

                <SView flex />


                <SView col={"xs-5"} height={42} row center style={{ borderColor: "red", borderRadius: 4, borderWidth: 1 }}>
                    <SText fontSize={10} bold color='white'>nuevo total</SText>
                    <SHr height={0.5} />

                    <SText fontSize={8} bold color='green'>+3203</SText>
                </SView>



            </SView>
        </SView>

        );
    }
    configurationPunto() {
        return (<SView col={"xs-12"} center backgroundColor={STheme.color.card} >
            <SView col={"xs-12"} row  >

                {/* <SView col={"xs-12"} row center style={{ justifyContent: "flex-end", padding: 8 }}><SText fontSize={14} bold color='white'>Punto de Venta</SText> </SView> */}

                <SView col={"xs-12"} row  >


                    <SView flex border='red' center row height={50}  >
                        <SIconApp name='Reload' width={18} height={18} stroke={STheme.color.barcode} />
                        <SText fontSize={12} bold color={STheme.color.barcode}>  Reembolso</SText>
                    </SView>
                    <SView flex border='red' center row height={50}>
                        <SIconApp name='menuAll' width={18} height={18} fill={STheme.color.barcode} />
                        <SText fontSize={12} bold color={STheme.color.barcode} >  Nota del cliente</SText>
                    </SView>
                    <SView flex border='red' center row height={50}>

                        <SIconApp name='barcode' width={18} height={18} fill={STheme.color.barcode} />
                        <SText fontSize={12} bold color={STheme.color.barcode} >  Ingresar código</SText>
                    </SView>
                </SView>


                <SView col={"xs-12"} row>
                    <SView flex border='red' center row height={50}>
                        <SIconApp name='campana' width={18} height={18} stroke={STheme.color.barcode} />
                        <SText fontSize={12} bold color={STheme.color.barcode} >  Reiniciar programas</SText>
                    </SView>
                    <SView flex border='red' center row height={50}>
                        <SIconApp name='tarealabel' width={18} height={18} fill={STheme.color.barcode} />
                        <SText fontSize={12} bold color={STheme.color.barcode} >  Recompensa</SText>
                    </SView>
                    <SView flex border='red' center row height={50}>
                        <SIconApp name='Engranaje' width={18} height={18} fill={STheme.color.barcode} />
                        <SText fontSize={12} bold color={STheme.color.barcode} >  Cotización/Pedido</SText>
                    </SView>
                </SView>




            </SView>
        </SView>

        );
    }




    tecladonumeral() {
        const teclasFinal = [
            "1", "2", "3", "QtY",
            "4", "5", "6", "% Desc",
            "7", "8", "9", "Precio",
            "+", "0", ".", "Cancelar"
        ];

        return (
            <SView col={"xs-12"} center backgroundColor={STheme.color.card}>
                <SView col={"xs-12"} row>
                    {/* Info lateral */}
                    <SView col={"xs-4"}>
                        <SView border="red" center row height={50}>
                            <SText fontSize={12} bold color={STheme.color.barcode}>usuario ricky</SText>
                        </SView>
                        <SView flex border="red" center row>
                            <SText fontSize={12} bold color={STheme.color.barcode}>Pago</SText>
                        </SView>
                    </SView>

                    {/* Teclado numérico */}
                    <SView col={"xs-8"}>
                        {[0, 1, 2, 3].map((filaIdx) => (
                            <SView key={filaIdx} col={"xs-12"} row>
                                {[0, 1, 2, 3].map((colIdx) => {
                                    const index = filaIdx * 4 + colIdx;
                                    const valor = teclasFinal[index];
                                    return (
                                        <SView
                                            key={index}
                                            flex
                                            center
                                            row
                                            height={50}
                                            backgroundColor={STheme.color.card}
                                            style={{ borderWidth: 1, borderColor: "red" }}
                                            onPress={() => {
                                                console.log("Presionado:", valor);
                                                alert(`Presionado: ${valor}`);
                                            }}
                                        >
                                            <SText fontSize={12} bold color={STheme.color.barcode}>
                                                {valor}
                                            </SText>
                                        </SView>
                                    );
                                })}
                            </SView>
                        ))}
                    </SView>
                </SView>
            </SView>
        );
    }






    pintarProductos() {
        return (
            <SView col={"xs-12"} center>
                <SText fontSize={16} color='white'>Detalle del producto</SText>
                <SHr />
                <SView col={"xs-12"} row>
                    {propductosComputacion.map((item, index) => (
                        <SView col={"xs-2.3"} row center border='red' style={{ padding: 4 }}

                            onPress={() => {
                                alert("Producto seleccionado: " + item.name);
                            }}


                        >

                            <SView col={"xs-12"} center >
                                <SImage
                                    key={`prod-${index}`}
                                    src={"https://pcihnd.com/cdn/shop/files/706070.png?v=1740761042&width=1946"}
                                    // src={item.image}
                                    style={{ width: 150, height: 150, borderRadius: 4 }}
                                    resizeMode='cover'
                                />
                            </SView>
                            <SView key={`prod-${index}`} col={"xs-10"}  >
                                <SText fontSize={16} color='white'>{item.name}</SText>
                                <SText fontSize={14} color='white'>$ {SMath.formatMoney(item.price, 2)} bs</SText>
                            </SView>
                        </SView>
                    ))}
                </SView>
            </SView>
        );
    }

    render() {

        return <SPage disableScroll hidden>


            <SView col={"xs-12"} center backgroundColor={STheme.color.card} style={{ padding: 8, borderRadius: 4 }}>

                <SText fontSize={16} color='white'>Servisofts</SText>
            </SView>

            <SView flex backgroundColor='transparent' row>

                <SView col={"xs-4"} backgroundColor='transparent'>

                    <SView col={"xs-12"} center backgroundColor={STheme.color.card} style={{ padding: 8, borderRadius: 4 }}>
                        {this.detalle()}
                    </SView>

                    <SView flex />

                    <SView col={"xs-12"} center backgroundColor={STheme.color.card} style={{ padding: 8, borderRadius: 4 }}>


                        {this.subtotal()}
                        {this.puntdd()}
                        {this.configurationPunto()}
                        {this.tecladonumeral()}
                    </SView>
                </SView>



                <SView col={"xs-8"} border='blue'>
                    {this.pintarProductos()}
                </SView>
            </SView>

        </SPage>
    }
}
