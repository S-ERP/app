import { Text, Vibration, View } from 'react-native'
import React, { Component } from 'react'
import { SButtom, SHr, SImage, SInput, SList, SMath, SNavigation, SPopup, SText, STheme, SView, Upload } from 'servisofts-component'
import SSocket from 'servisofts-socket'
import Cantidad from '../../../Components/Cantidad'
import CantidadSubProducto from './CantidadSubProducto'


class Categoria extends Component {

  state = {
    detalle: {}
  }

  save() {
    this.props.onChange(this.state);
    this.setState({ ...this.state })
  }


  ref_cantidad = {}
  handlePressItem = (sub_producto_detalle) => {
    Vibration.vibrate(300)

    if (this.props.data.cantidad_seleccion <= 1) {
      if (this.state.detalle[sub_producto_detalle.key]) {
        delete this.state.detalle[sub_producto_detalle.key];
      } else {
        this.state.detalle = {}
        this.state.detalle[sub_producto_detalle.key] = {
          key_sub_producto_detalle: sub_producto_detalle.key,
          precio: sub_producto_detalle.precio,
          nombre: sub_producto_detalle.nombre,
          cantidad: 1
        }
      }
      this.save();
    } else {
      if (this.ref_cantidad[sub_producto_detalle.key]) {
        const tr = this.ref_cantidad[sub_producto_detalle.key];
        this.ref_cantidad[sub_producto_detalle.key].show((!tr?.state?.cantidad ? 1 : tr?.state?.cantidad))
      }
    }

  }

  getSelector = (sub_producto_detalle) => {
    if (this.props.data.cantidad_seleccion <= 1) {
      // const isSelect = (this.state?.select?.key == sub_producto_detalle.key)
      const isSelect = this.state.detalle[sub_producto_detalle.key];
      return <SView key={sub_producto_detalle.key} style={{
        width: 22,
        height: 22,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: STheme.color.gray,
        backgroundColor: !!isSelect ? STheme.color.primary : "transparent"
      }} >

      </SView>
    }

    let cant = 0;
    Object.values(this.state.detalle).filter(a => a.key_sub_producto_detalle != sub_producto_detalle.key).map(x => cant += x.cantidad);
    let limit = (this.props.data.cantidad_seleccion - cant);


    return <CantidadSubProducto ref={ref => this.ref_cantidad[sub_producto_detalle.key] = ref} disabled={limit <= 0} limit={limit <= 1 ? 1 : limit} onChange={(cantidad) => {



      this.state.detalle[sub_producto_detalle.key] = {
        key_sub_producto_detalle: sub_producto_detalle.key,
        precio: sub_producto_detalle.precio,
        nombre: sub_producto_detalle.nombre,
        cantidad: cantidad
      }

      cant = 0;
      Object.values(this.state.detalle).map(x => cant += x.cantidad);
      if (this.props.data.cantidad_seleccion - cant < 0) {
        SPopup.alert("Alcanzaste el limite de seleccion.");
        delete this.state.detalle[sub_producto_detalle.key]
        this.save();
        return 0;
      }
      this.save();
      return cantidad;
    }} />
    return <Cantidad data={producto} limit={this.props.data.cantidad_seleccion} />
  }

  producto = (producto) => {
    if (!producto) return null;
    return <SView col={"xs-12"} center onPress={this.handlePressItem.bind(this, producto)}>
      <SView col={"xs-12"} row center>
        <SView flex height>
          <SText fontSize={14}>{producto?.nombre}</SText>
          <SText fontSize={10} color={STheme.color.gray}>{producto?.descripcion}</SText>
        </SView>
        <SView style={{
          alignItems: "flex-end"
        }} width={120}>
          {/* <SText>{JSON.stringify(this.state.detalle[producto.key])}</SText> */}
          {this.getSelector(producto)}
          {!producto?.precio ? null : <SText flex bold fontSize={14} >+ Bs. {SMath.formatMoney(producto?.precio ?? 0)}</SText>}
        </SView>
      </SView>
      <SHr h={4} />
      <SHr h={1} color={STheme.color.lightGray} />
    </SView>
  }
  render() {
    let categoria = this.props.data;
    this.state.nombre = categoria.nombre;
    this.state.descripcion = categoria.descripcion;
    this.state.cantidad_seleccion = categoria.cantidad_seleccion;
    this.state.key_sub_producto = categoria.key;

    return <SView col={"xs-12"} card center padding={4}>
      <SHr />
      <SView col={"xs-12"} >
        <SText font='Montserrat-Bold' fontSize={20} color={STheme.color.text}>{categoria.nombre}</SText>
        <SText fontSize={10} color={STheme.color.gray}>{categoria.descripcion}</SText>
        {categoria.cantidad_seleccion == 1
          ? <SText fontSize={10} color={STheme.color.gray}>{`(Elegí ${categoria.cantidad_seleccion} opción)`}</SText>
          : <SText fontSize={10} color={STheme.color.gray}>{`(Elegí ${categoria.cantidad_seleccion} opciones)`}</SText>
        }

        <SText fontSize={10} color={STheme.color.danger}>{this.props.error}</SText>
      </SView>
      <SHr height={8} />
      <SList
        flex
        order={[{ key: "index", order: "asc" }]}
        filter={a => a.estado > 0}
        data={categoria.sub_producto_detalles}
        space={12}
        render={this.producto.bind(this)}
      />
    </SView >
  }
}



export default class ListaSubProductos extends Component {
  state = {
    categorias: {},
    errores: {}
  }

  save() {
    if (this.props.onChange) {
      this.props.onChange(this.state)
    }
  }
  getValue() {
    return this.state;
  }

  setError(key_sub_producto, error) {
    this.state.errores[key_sub_producto] = error;
    this.setState({ ...this.state })
  }
  render() {
    return <SView col={"xs-12"} center  >
      <SList
        scrollEnabled={false}
        data={this.props.data}
        order={[{ key: "index", order: "asc" }]}
        filter={a => a.estado > 0}
        render={(categoria) => <Categoria data={categoria} error={this.state.errores[categoria.key]} onChange={(e) => {
          this.state.categorias[categoria.key] = e
          this.save();
        }} />}
      />
    </SView>
  }
}