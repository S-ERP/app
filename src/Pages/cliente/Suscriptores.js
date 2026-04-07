

import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SDate, SMath, } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import MDL from '../../MDL';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import FormRegistroSuscriptor from './Components/FormRegistroSuscriptor';
//  import Config from '../Config';
//  import MDL from '../MDL';
//  import Model from '../Model';



export default class Suscriptores extends Component {

  constructor(props) {
    super(props);
    this.state = {
      time: new Date().getTime(),
    };
  }

  renderUsuario(usuario = {}) {
    const nombre = `${usuario?.Nombres || "Sin"} ${usuario?.Apellidos || "usuario"}`;

    return (
      <SView col="xs-12" center row>
        <SView
          style={{
            width: 24,
            height: 24,
            borderRadius: 100,
            overflow: "hidden",
            backgroundColor: STheme.color.card + "66",
          }}
        >
          {usuario?.key ? (
            <SImage
              src={`${SSocket.api.root}usuario/${usuario.key}`}
              style={{ resizeMode: "cover" }}
            />
          ) : null}
        </SView>

        <SView width={5} />
        <SText flex numberOfLines={1} style={{ fontSize: 10 }}>
          {nombre}
        </SText>
      </SView>
    );
  }

  renderCliente(cliente = {}) {
    const nombre = `${cliente?.nombres || "Sin"} ${cliente?.apellidos || "cliente"}`;

    return (
      <SView col="xs-12" center row>
        <SView
          style={{
            width: 24,
            height: 24,
            borderRadius: 100,
            overflow: "hidden",
            backgroundColor: STheme.color.card + "66",
          }}
        >
          {cliente?.key ? (
            <SImage
              src={`${SSocket.api.root}usuario/${cliente.key}`}
              style={{ resizeMode: "cover" }}
            />
          ) : null}
        </SView>

        <SView width={5} />
        <SText flex numberOfLines={1} style={{ fontSize: 10 }}>
          {nombre}
        </SText>
      </SView>
    );
  }

  renderValidofecha(obj) {
    if (!obj) return null;

    const now = new Date();
    const fechaInicio = obj.fecha_inicio ? new Date(obj.fecha_inicio) : null;
    const fechaFin = obj.fecha_fin ? new Date(obj.fecha_fin) : null;

    let mensaje = "—";
    let backgroundColor = "#F0F0F0"; // gris por defecto

    if (fechaFin && fechaFin < now) {
      mensaje = "Vencido";
      backgroundColor = "#FF4D4F"; // rojo
    } else if (fechaInicio && fechaInicio <= now && fechaFin && fechaFin >= now) {
      mensaje = "Activo";
      backgroundColor = "#52C41A"; // verde
    } else if (fechaInicio && fechaInicio > now) {
      mensaje = "Futuro";
      backgroundColor = "#595959"; // gris oscuro
    }

    return (
      <SView col="xs-12" center row style={{ justifyContent: "center" }}>
        <SView
          style={{
            backgroundColor: backgroundColor,
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
            minWidth: 60,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1,
            elevation: 1, // para Android
          }}
        >
          <SText
            numberOfLines={1}
            style={{
              fontSize: 11,
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {mensaje}
          </SText>
        </SView>
      </SView>
    );
  }


  renderSucursal(sucursal = {}) {
    if (!sucursal?.key) return null;

    return (
      <SView col="xs-12" center row>
        <SView
          style={{
            width: 24,
            height: 24,
            borderRadius: 100,
            overflow: "hidden",
            backgroundColor: STheme.color.card + "66",
          }}
        >
          <SImage
            src={`${SSocket.api.empresa}sucursal/${sucursal.key}`}
            style={{ resizeMode: "cover" }}
          />
        </SView>

        <SView width={5} />
        <SText flex numberOfLines={1} style={{ fontSize: 10 }}> {sucursal?.descripcion || "Sucursal"} </SText>
      </SView>
    );
  }

  renderEmpresa(empresa = {}) {
    if (!empresa?.key) return null;

    return (
      <SView col="xs-12" center row>
        <SView
          style={{
            width: 24,
            height: 24,
            borderRadius: 100,
            overflow: "hidden",
            backgroundColor: STheme.color.card + "66",
          }}
        >

          <SImage src={`${SSocket.api.empresa}empresa/${empresa?.key}`} style={{ resizeMode: "cover" }} />

        </SView>

        <SView width={5} />
        <SText flex numberOfLines={1} style={{ fontSize: 10 }}> {empresa?.razon_social || "empresa"} </SText>
      </SView>
    );
  }



  async loadInitialData() {
    try {
      console.log('🚀 Iniciando carga de datos...');

      const empresaKey = MDL.empresa.select?.key;

      const res = await MDL.inventario.execute_function(
        "_get_suscripciones",
        [empresaKey]
      ) || [];

      if (!Array.isArray(res)) return [];

      const empresa = await MDL.empresa.getFull();
      const sucursales = Object.values(empresa?.sucursales || {});

      // keys de usuarios
      const keysUsuarios = [
        ...new Set(
          res.flatMap(e => [e.key_usuario, e.key_cliente]).filter(Boolean)
        )
      ];

      const usuariosArr = await MDL.usuario.getByKeys(keysUsuarios) || [];
      const usuariosMap = Object.fromEntries(
        usuariosArr.map(u => [u.key, u])
      );

      // clientes
      const clientesArr = await MDL.crm.cliente.getAll();
      if (!Array.isArray(clientesArr)) {
        throw new Error("No se pudieron obtener clientes.");
      }

      const clientesMap = Object.fromEntries(
        clientesArr.map(c => [c.key, c])
      );

      const data_mejorada = res.map(e => ({
        ...e,
        sucursal: sucursales.find(s => s.key === e.key_sucursal) || {},
        usuario: usuariosMap[e.key_usuario] || {},
        cliente: clientesMap[e.key_cliente] || {},
        empresa,
      }));

      console.log("✅ Data final:", data_mejorada);
      return data_mejorada;

    } catch (error) {
      console.error("❌ Error en loadInitialData:", error);
      SPopup.alert("Error al cargar los datos.");
      return [];
    }
  }





  mostrarTabla() {
    return (
      <DinamicTable
        ref={ref => (this.DinamicTable = ref)}
        loadData={async () => {
          return this.loadInitialData();
        }}
        key="id"
        language="es"
        center
        {...Config.table.applyTheme()}
        selectType="single"
        keyExtractor={(e) => e.key}

        loadInitialState={async () => {
          return { sorters: [{ key: "fecha_on", order: "desc", type: "date" }] }
        }}

        onSelect={(e) => {

          console.log("Selected project:", e.row);
          const { row, evt } = e;
          const nombreTurno = `Suscripción: ${row?.cliente?.nombres ?? 'Sin nombre'}`;
          const options = [];

          // Opción de editar suscriptor
          // if (MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'delete' })) {
          options.push({
            label: 'Editar Fechas',
            icon: <SIconApp name="Edit" fill={STheme.color.text} />,
            onPress: () => {
              FormRegistroSuscriptor.open({
                defaultData: row,
                onActualizar: (nuevoDato) => {
                  this.DinamicTable.loadData();
                  console.log("Cliente actualizado:", nuevoDato);
                }
              });
            }
          });
          // }

          // Opción de eliminar suscriptor
          // if (MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'delete' })) {
          // options.push({
          //   label: 'Eliminar',
          //   icon: <SIconApp name="Delete" fill={STheme.color.text} />,
          //   onPress: () => {
          //     SPopup.confirm({
          //       title: 'Eliminar Cliente',
          //       message: `¿Estás seguro de eliminar a ${nombreTurno}?`,
          //       onPress: () => {
          //         SSocket.sendPromise({
          //           service: 'empresa',
          //           component: 'horario_atencion',
          //           type: '_editarTurnosHorariosAtencion',
          //           data: { ...row, estado: 0 },
          //         })
          //           .then(() => {
          //             SNotification.send({
          //               key: 'eliminar_ok',
          //               title: 'Éxito',
          //               body: `${nombreTurno} fue eliminado correctamente.`,
          //               time: 1500,
          //               color: STheme.color.success,
          //             });
          //             this.DinamicTable.loadData();
          //           })
          //           .catch(err => {
          //             console.error('Error al eliminar turno:', err);
          //             SNotification.send({
          //               key: 'eliminar_error',
          //               title: 'Error',
          //               body: 'Ocurrió un error al eliminar. Intenta nuevamente.',
          //               time: 3000,
          //               color: STheme.color.danger,
          //             });
          //           });
          //       },
          //     });
          //   },
          // });
          // }

          FloatMenu.open({
            e: evt,
            label: nombreTurno,
            options,
          });

          // this.mostrarPopup(e.row.key)
        }}
      >

        <DinamicTable.Col key="index" label="N°" width={30} data={(e) => e.index + 1} />
        <DinamicTable.Col key="key_cliente_" label="Cliente" width={100} data={(e) => e.row?.key_cliente ?? ""} customComponent={e => this.renderCliente(e.row?.cliente)} />
        <DinamicTable.Col key="key_sucursal" label="key_sucursal" width={100} data={(e) => e.row?.key_sucursal ?? ""} customComponent={e => this.renderSucursal(e.row?.sucursal)} />
        {/* <DinamicTable.Col key="key_empresa" label="key_empresa" width={100} data={(e) => e.row?.key_empresa ?? ""} customComponent={e => this.renderEmpresa(e.row?.empresa)} /> */}




        {/* <DinamicTable.Col key="cliente" label="Cliente" width={100} data={(e) => e.row?.key_cliente ?? ""}
         customComponent={e => <>
           {(e.row?.key_cliente) ?
             <SView col={"xs-12"} center row  >
               <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                 <SImage src={`${SSocket.api.root}usuario/${e.row?.key_cliente}`} style={{ resizeMode: "cover" }} />
               </SView>
               <SView width={5} />
              </SView> : null}
         </>}
       /> */}


        {/* luego lo utilizaremos */}
        {/* <DinamicTable.Col key="var0_" label="Producto" width={120} data={e => e.row?.producto?.nombre} />
         <DinamicTable.Col key="var0s_" label="Producto" width={120} data={e => e.row?.producto?.key} />
         <DinamicTable.Col key="var0ss_" label="Producto" width={120} data={e => e.row?.key_producto} /> */}


        {/* <DinamicTable.Col key={"producto_"} label='producto_' width={50} data={(e) => e.row.producto?.key}
           customComponent={e => <SImage src={SSocket.api.inventario + "tipo_producto/" + e.row?.key_producto} />} /> */}

        {/* <DinamicTable.Col key={"modelo_"} label='modelo' width={200} data={(e) => e.row.producto?.modelo?.key} wrap textStyle={{ fontWeight: "bold" }} customComponent={e => <SImage src={SSocket.api.inventario + "modelo/" + e.row?.producto?.modelo?.key} />} /> */}
        <DinamicTable.Col key={"modelo_"} label='modelo' width={120} data={(e) => e.row.producto?.modelo?.key} wrap textStyle={{ fontWeight: "bold" }} customComponent={e => <SView row style={{ alignItems: "center", }}>
          <SView style={{ width: 25, height: 25, borderRadius: 4, borderWidth: 1, borderColor: STheme.color.card, overflow: "hidden", backgroundColor: STheme.color.card + "66", }}>
            <SImage src={SSocket.api.inventario + "modelo/.128_" + e.row?.producto?.modelo?.key} enablePreview srcPreview={SSocket.api.inventario + "modelo/" + e.row?.producto?.modelo?.key} style={{ resizeMode: "cover", }} /> </SView> <SView width={8} />
          <SText flex style={{ fontSize: 10 }} numberOfLines={0} >{e.row?.producto?.modelo?.descripcion}</SText>
        </SView>} />

        <DinamicTable.Col key={"duracion_"} label='duracion' width={120} data={(e) => e.row.producto?.modelo?.key} wrap textStyle={{ fontWeight: "bold" }} customComponent={e => <SView row style={{ alignItems: "center", }}>
          <SText flex style={{ fontSize: 10 }} numberOfLines={0} >{e.row?.producto?.modelo?.duracion} {e.row?.producto?.modelo?.duracion_medida}</SText>
        </SView>} />

        <DinamicTable.Col key={"cant_suscriptores_"} label='suscriptores' width={120} data={(e) => e.row.producto?.modelo?.key} wrap textStyle={{ fontWeight: "bold" }} customComponent={e => <SView row style={{ alignItems: "center", }}>
          <SText flex style={{ fontSize: 10 }} numberOfLines={0} >{e.row?.producto?.modelo?.cantidad_suscriptores}</SText>
        </SView>} />

        <DinamicTable.Col key={"marca_"} label='marca' width={120} data={(e) => e.row.producto?.marca?.key} wrap textStyle={{ fontWeight: "bold" }} customComponent={e => <SView row style={{ alignItems: "center", }}>
          <SView style={{ width: 25, height: 25, borderRadius: 4, borderWidth: 1, borderColor: STheme.color.card, overflow: "hidden", backgroundColor: STheme.color.card + "66", }}>
            <SImage src={SSocket.api.inventario + "marca/.128_" + e.row?.producto?.marca?.key} enablePreview srcPreview={SSocket.api.inventario + "marca/" + e.row?.producto?.marca?.key} style={{ resizeMode: "cover", }} /> </SView> <SView width={8} />
          <SText flex style={{ fontSize: 10 }} numberOfLines={0} >{e.row?.producto?.marca?.descripcion}</SText>
        </SView>} />
        <DinamicTable.Col key={"tipo_producto_"} label='tipo_producto' width={120} data={(e) => e.row.producto?.tipo_producto?.key} wrap textStyle={{ fontWeight: "bold" }} customComponent={e => <SView row style={{ alignItems: "center", }}>
          <SView style={{ width: 25, height: 25, borderRadius: 4, borderWidth: 1, borderColor: STheme.color.card, overflow: "hidden", backgroundColor: STheme.color.card + "66", }}>
            <SImage src={SSocket.api.inventario + "tipo_producto/.128_" + e.row?.producto?.tipo_producto?.key} enablePreview srcPreview={SSocket.api.inventario + "tipo_producto/" + e.row?.producto?.tipo_producto?.key} style={{ resizeMode: "cover", }} /> </SView> <SView width={8} />
          <SText flex style={{ fontSize: 10 }} numberOfLines={0} >{e.row?.producto?.tipo_producto?.descripcion}</SText>
        </SView>} />


        {/* luego traer la marca y el tipo producto */}
        <DinamicTable.Col key={"var1_"} label='Precio' width={70} data={(e) => e.row?.producto?.precio && SMath.formatMoney(e.row?.producto?.precio)} />
        <DinamicTable.Col key="var2_" label="Modelo" width={120} data={e => e.row?.producto?.modelo?.descripcion} />

        <DinamicTable.Col key="estado_fecha_" label="Estado" width={100} data={(e) => e.row?.fecha_fin ?? ""} customComponent={e => this.renderValidofecha(e.row)} />

        {/* <DinamicTable.Col key="var3_" label="Unidad de duración" width={120} data={e => e.row?.producto?.modelo?.duracion_medida} /> */}
        {/* <DinamicTable.Col key="var4_" label="Duración" width={120} data={e => e.row?.producto?.modelo?.duracion} /> */}
        {/* <DinamicTable.Col key="var5_" label="Cantidad de suscriptores" width={120} data={e => e.row?.producto?.modelo?.cantidad_suscriptores} /> */}

        {/* calendairo */}
        <DinamicTable.Col key="fecha_inicio" label="Fecha de inicio" width={120} data={e => e.row?.fecha_inicio?.substring(0, 10)} />
        <DinamicTable.Col key="fecha_fin" label="Fecha de fin" width={120} data={e => e.row?.fecha_fin?.substring(0, 10)} />

        {/* <DinamicTable.Col key="key_empresa" label="Empresa" width={120} data={e => e.row?.key_empresa} /> */}
        {/* <DinamicTable.Col key="estado" label="Estado" width={120} data={e => e.row?.estado} /> */}
        <DinamicTable.Col key={"fecha_on"} label="Fecha de registro" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.lightGray }} dateFormat="yyyy-MM-dd hh:mm" />
        <DinamicTable.Col key="key_usuario" label="Administrador" width={100} data={(e) => e.row?.key_usuario ?? ""} customComponent={e => this.renderUsuario(e.row?.usuario)} />


      </DinamicTable>
    );
  }
  render() {
    return (
      <SPage title="Suscriptores" disableScroll>
        {this.mostrarTabla()}
        <SHr height={20} />
      </SPage>
    );
  }
}
