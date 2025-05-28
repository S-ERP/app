import { FlatList, Text, View } from 'react-native'
import React, { Component } from 'react'
import { SButtom, SHr, SIcon, SImage, SInput, SList, SMath, SNavigation, SPopup, SText, STheme, SView, Upload } from 'servisofts-component'
import SSocket from 'servisofts-socket'
import Cantidad from '../../../Components/Cantidad'
import Model from '../../../Model'
import CarritoFlotante from './CarritoFlotante'
import select from 'servisofts-component/Component/SInput2/types/select'
import Animated from 'react-native-reanimated'

export default class ListaProductos extends Component {
  state = {

    edad_confirmada: false,
    selected: "",
    key_categoria: "",
    // pendiente: false,
  }

  componentDidMount() {


    //VERIFICANDO SI HAY PEDIDOS PENDIENTES
    // const carrito = Model.carrito.Action.getState()
    // if (carrito.productos) {
    //   let firstItem = Object.values(carrito.productos)[0];
    //   if (firstItem) {
    //     const kr = firstItem?.data?.key_restaurante;
    //     if (kr != this.props.key_restaurante) {
    //       this.setState({ pendiente: true })
    //     }
    //   }
    // }



    SSocket.sendPromise({
      component: "restaurante",
      // type: "getAllCategoriasYProductos",
      type: "getCategoriasProductosDetalle",
      key_restaurante: this.props.key_restaurante,
    }).then((e) => {

      this.setState({ key_categoria: e.data[0].key })
      this.setState({ selected: e.data[0].nombre })

      let mayor_edad = false;
      Object.values(e.data).map(cat => {
        cat.productos.map(a => {
          if (a.mayor_edad) {
            mayor_edad = true;
          }
        })
      })
      // const carrito = Model?.carrito?.Action.getState().productos ?? {};
      // Object.values(carrito).map(a => {
      //   const { cantidad, key_producto, data } = a;
      //   if (key_producto == "tapeke") {

      //   } else {

      //     let prd = null;
      //     e.data.map(z => {
      //       const prd2 = z.productos.find(y => y.key == key_producto);
      //       if (prd2) {
      //         prd = prd2;
      //       }
      //     })
      //     if (!prd || !prd?.estado || !prd?.habilitado) {
      //       Model.carrito.Action.removeItem(key_producto)
      // SPopup.open({
      //   key: key_producto,
      //   content: <SView width={300} padding={32} backgroundColor='#fff' style={{ borderRadius: 8 }} row center>
      //     <SView width={50} height={50} card>
      //       <SImage src={SSocket.api.root + "producto/" + key_producto} />
      //     </SView>
      //     <SView width={8} />
      //     <SText flex>El producto {data?.nombre} fue removido del carrito por que ya no esta disponible.</SText>
      //   </SView>
      // })
      // }
      // }
      // })

      if (!mayor_edad || this.state.edad_confirmada) {
        let dataOk = []
        //guardando todos los productos
        let dataProductosAll = e.data.flatMap(item => item.productos);
        //adicionando categoria Todos con sus productos
        e.data.unshift({ estado: 1, nombre: "Todos", key: "todos", productos: dataProductosAll })
        this.setState({ data: e.data })

        return
      };
      let sefue = false;
      SPopup.confirm({
        title: "¿Confirmas que tienes 18 años o más?",
        onPress: () => {
          this.setState({ data: e.data, edad_confirmada: true })
        },
        onClose: () => {
          if (sefue) return;
          sefue = true;
          SNavigation.goBack();
        }
      }
      );
    }).catch(e => {
      console.error(e);
    })
  }

  Capitalize(str) {
    const lowerCaseText = str.toLowerCase();
    return lowerCaseText.charAt(0).toUpperCase() + lowerCaseText.slice(1);
  }

  onRefresh() {
    this.componentDidMount();
  }

  renderLabelOferta(lbl) {
    if (!lbl) return;
    return <SView width={180} height={50}
    // style={{ position: "absolute", left: 0, bottom: 8 }}
    >
      {/* <SIcon name={"PrecioOriginalBottom"} /> */}
      <SImage src={require("../../../Assets/img/Banner_p.png")} />
      <SView style={{
        position: "absolute",
        right: 10,
        top: 12,
        transform: [{ rotate: "-3deg" }]
      }}>
        <SView width={105} height={26} center>
          <SText fontSize={12} color={"#fff"} bold>{lbl}</SText>

        </SView>
      </SView>
    </SView>
  }

  renderPrecio(producto) {
    const { descuento_monto, descuento_porcentaje, precio, label_oferta } = producto;
    if (!descuento_monto && !descuento_porcentaje) {
      return <SText flex bold fontSize={16} >Bs. {SMath.formatMoney(producto.precio)}</SText>
    }
    return <SView center>
      <SView height={20} center>
        {/* <SText flex bold fontSize={16} >{SMath.formatMoney(producto.descuento_monto)}</SText> */}
        {/* <SText flex bold fontSize={16} >{SMath.formatMoney(producto.descuento_porcentaje)}</SText> */}
        <SImage style={{
          width: 60
        }} src={require("../../../Assets/img/Banner_p_line.png")} />
        <SView style={{
          position: "absolute",
        }} >
          <SText style={{ alignItems: 'flex-end', color: STheme.color.grayTapeke, fontSize: 13 }} >{"Bs. " + SMath.formatMoney(precio ?? 0)}</SText>
        </SView>

      </SView>
      <SText flex bold fontSize={16} >Bs. {SMath.formatMoney(precio - (precio * descuento_porcentaje) - descuento_monto)}</SText>
      <SView width={90} height={20} style={{ alignItems: 'flex-end', position: "absolute", right: 70, top: 15 }}>
        {/* <SIcon name={"PrecioOriginalBottom"} /> */}
        <SImage src={require("../../../Assets/img/Banner_p.png")} />
        <SView style={{
          position: "absolute",
          right: 12,
          top: 3,
          transform: [{ rotate: "-3deg" }]
        }}>
          {descuento_monto ? <SText fontSize={9} color={"#fff"} bold>- {(descuento_monto).toFixed(0)} Bs.</SText> : null}
          {descuento_porcentaje ? <SText fontSize={9} color={"#fff"} bold>{((descuento_porcentaje * 100)).toFixed(0)} % OFF</SText> : null}

        </SView>
      </SView>
    </SView>

  }
  producto = (producto) => {
    // let datafilter = producto.find(a => a.key == this.state?.key_categoria);
    // console.log("datafilter: ", datafilter)
    // console.log("this.state.key_categoria", this.state.key_categoria)
    // console.log("producto", producto)

    let extra = {

    }
    if (!!producto.sub_productos && producto.sub_productos.length > 0) {



      extra.onPress = () => {

        const productos = Model?.carrito?.Action.getState().productos ?? {};
        let arrCarrito = Object.values(productos).filter(a => a.key_producto == producto?.key);
        let cantidad = 0;
        arrCarrito.map(a => cantidad += (a?.cantidad ?? 0))
        if (cantidad > 0) {
          CarritoFlotante.open(producto);
        } else {
          SNavigation.navigate("/restaurante/sub_producto", producto);
        }

      }
    }
    let colorHeart = STheme.color.black;

    return <SView col={"xs-12"} row center padding={15} style={{
      borderBottomWidth: 1,
      borderBottomColor: STheme.color.lightGray,
    }}>
      <SView flex >
        <SHr />
        <SText bold fontSize={16}>{producto.nombre}</SText>
        <SText fontSize={10} color={STheme.color.gray}>{producto.descripcion}</SText>
        {/* <SView flex /> */}
        {this.renderLabelOferta(producto.label_oferta)}
      </SView>
      <SView width={120} style={{ alignItems: 'flex-end' }}>
        {/* <SView width={20} height={20} style={{
          backgroundColor: STheme.color.white,
          borderRadius: 4,
          position: "absolute",
          top: 2,
          right: 2,
          zIndex: 99
        }} center
          onPress={() => {
            // console.log("colorHeart: ", colorHeart)
            colorHeart = (colorHeart == STheme.color.black) ? STheme.color.danger : STheme.color.black
            // colorHeart = STheme.color.danger
          }}>
          <SIcon name={"MenuFavoritos"} fill={colorHeart} width={13} height={13} />
        </SView> */}
        <SView width={70} height={70} style={{
          overflow: 'hidden',
          backgroundColor: STheme.color.card,
          borderRadius: 10
        }} onPress={() => {
          SPopup.open({
            key: "imgPreview",
            content: <SView col={"xs-11 md-8 lg-6 xl-4"} colSquare center style={{
              overflow: 'hidden',
              maxHeight: "100%",
              backgroundColor: "#000",
              borderRadius: 8,
            }} >

              <SImage src={SSocket.api.root + "producto/.512_" + producto.key + "?time=" + new Date().getTime()} />
            </SView>,
          })
        }}>
          <SImage src={SSocket.api.root + "producto/.128_" + producto.key + "?time=" + new Date().getTime()} style={{
            resizeMode: "cover"
          }} />
        </SView>
        <SHr h={4} />
        {this.renderPrecio(producto)}
        <SHr h={4} />
        <SView col={"xs-7"} center>
          <Cantidad data={{ ...producto, key_restaurante: this.props.key_restaurante }}
            limit={producto.limite_compra}
            pendiente={this.props.pendiente}
            {...extra}
          />
        </SView>


      </SView>

    </SView>
  }
  categoria = (categoria) => {
    // console.log("categoria: ", categoria)
    return <SView height backgroundColor={"#fff"} center onPress={() => {
      if ((this.state.selected == categoria.nombre)) {
        return;
      }
      this.setState({ selected: (this.state.selected == categoria.nombre) ? "" : categoria.nombre })
      this.setState({ key_categoria: categoria.key })
    }} >
      <SView col={"xs-12"} row style={{
        padding: 4,
        borderRadius: 5,
        borderBottomWidth: 3,
        borderBottomColor: (this.state.selected == categoria.nombre) ? STheme.color.primary : STheme.color.background
      }}>
        <SText bold fontSize={15} color={(this.state.selected == categoria.nombre) ? STheme.color.primary : STheme.color.text} >{this.Capitalize(categoria.nombre)}</SText>
      </SView>
      {/* <SHr height={8} /> */}
      {/* LISTA DE PRODUCTOS */}
      {/* <SList
        flex
        data={categoria.productos}
        space={16}
        order={[{ "key": "index", order: "asc" }]}
        render={this.producto.bind(this)}
      /> */}
    </SView>
  }

  render() {
    const space = 10;
    return <SView col={"xs-12"} center backgroundColor={STheme.color.white}  >
      {/* <SList
          horizontal
          data={this.state.data}
          render={this.categoria.bind(this)}
        /> */}
      <Animated.View style={[{
        width: "100%",
        height: 40,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: STheme.color.lightGray,
        zIndex: 999,
      }, this.props.headerStyle ?? {}]}>
        <FlatList
          data={(this.state.data)}
          renderItem={obj => {
            return this.categoria(obj.item)
          }}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListHeaderComponent={() => <SView width={8} />}
          ItemSeparatorComponent={() => <SView width={space} />}
        // ListFooterComponent={() => <SView width={space} />}
        />
      </Animated.View>
      <SHr height={10} />
      <SView col={"xs-12"}
        style={{
          // minHeight: 400,
        }}
      >
        {/* <SList
          data={this.state.data?.find(a => a.key == this.state?.key_categoria)?.productos}
          order={[{ "key": "index", order: "asc" }]}
          render={this.producto.bind(this)}
        /> */}
      
        <FlatList
          data={this.state.data?.find(a => a.key == this.state?.key_categoria)?.productos}
          renderItem={obj => {
            return this.producto(obj.item)
          }}
          ListHeaderComponent={() => <SView width={space} />}
          ItemSeparatorComponent={() => <SView width={space} />}
          ListFooterComponent={() => <SView width={space} />}
        />

      </SView>
    </SView >
  }
}