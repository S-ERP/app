import React from "react";
import MDL from "../../MDL";
import CarritoItem from "./CarritoItem";
export default class CarritoVenta extends React.Component {
    
    state = { open: false, }
    
    handleChange = () => {
        const items = MDL.carrito.carrito_venta.items;
        this.setState({ open: items.length > 0 })
    }
    
    componentDidMount(): void {
        MDL.carrito.addEventListener("handleChange", this.handleChange)
    }
    
    componentWillUnmount(): void {
        MDL.carrito.removeEventListener(this.handleChange)
    }
    
    render() {
        if (!this.state.open) return null;
        return <CarritoItem />
    }
}
