import React, { useEffect } from "react";

import MDL from "../../MDL";
import CarritoItem from "./CarritoItem";

export default class CarritoVenta extends React.Component {
    state = {
        open: false,
    }
    handleChange = () => {
        // const items = MDL.carrito.carrito_compra.items;
        const items = MDL.carrito.carrito_venta.items;
        this.setState({
            open: items.length > 0
        })
    }
    componentDidMount(): void {

        MDL.carrito.addEventListener("handleChange", this.handleChange.bind(this))
    }
    componentWillUnmount(): void {
        MDL.carrito.removeEventListener(this.handleChange.bind(this))
    }
    render() {
        if (!this.state.open) return null;
        return <CarritoItem />
    }
}
