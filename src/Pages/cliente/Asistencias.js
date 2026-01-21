import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SDate, SMath, SIcon, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import MDL from '../../MDL';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import FloatButtom from '../../Components/FloatButtom';
import PopupRegistrarAsistencia from './Components/PopupRegistrarAsistencia';

export default class Asistencias extends Component {
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
          {usuario?.key && (
            <SImage src={`${SSocket.api.root}usuario/${usuario.key}`} style={{ resizeMode: "cover" }} />
          )}
        </SView>
        <SView width={5} />
        <SText flex numberOfLines={1} style={{ fontSize: 12, color: STheme.color.lightGray }}>
          {nombre}
        </SText>
      </SView>
    );
  }

  renderCliente(cliente = {}) {
    const nombre = `${cliente?.nombres || "Sin"} ${cliente?.apellidos || "cliente"}`;
    return (
      <SView col="xs-12" center row>
        <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66", }} >
          {cliente?.key && (
            <SImage src={`${SSocket.api.root}usuario/${cliente.key}`} style={{ resizeMode: "cover" }} />
          )}
        </SView>
        <SView width={5} />
        <SText flex numberOfLines={1} style={{ fontSize: 10 }}>
          {nombre}
        </SText>
      </SView>
    );
  }

  renderSucursal(sucursal = {}) {
    if (!sucursal?.key) return null;
    return (
      <SView col="xs-12" center row>
        <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66", }} > <SImage src={`${SSocket.api.empresa}sucursal/${sucursal.key}`} style={{ resizeMode: "cover" }} /> </SView>
        <SView width={5} />
        <SText flex numberOfLines={1} style={{ fontSize: 10 }}>
          {sucursal?.descripcion || "Sucursal"}
        </SText>
      </SView>
    );
  }

  renderEmpresa(empresa = {}) {
    if (!empresa?.key) return null;
    return (
      <SView col="xs-12" center row>
        <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66", }} >
          <SImage src={`${SSocket.api.empresa}empresa/${empresa.key}`} style={{ resizeMode: "cover" }} />
        </SView>
        <SView width={5} />
        <SText flex numberOfLines={1} style={{ fontSize: 10 }}>
          {empresa?.razon_social || "empresa"}
        </SText>
      </SView>
    );
  }

  renderValidofecha(asistencia) {
    if (!asistencia?.fecha_on) return null;
    const fecha = new Date(asistencia.fecha_on);
    const now = new Date();
    let mensaje = "—";
    let backgroundColor = "#F0F0F0";

    if (fecha < now) {
      mensaje = "Vencido";
      backgroundColor = "#FF4D4F";
    } else if (fecha.toDateString() === now.toDateString() || fecha <= now) {
      mensaje = "Activo";
      backgroundColor = "#52C41A";
    } else if (fecha > now) {
      mensaje = "Futuro";
      backgroundColor = "#595959";
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
            elevation: 1,
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

  async loadInitialData() {
    try {
      const res = await MDL.inventario.asistencia.getAll();
      const empresa = await MDL.empresa.getFull();
      const sucursales = Object.values(empresa?.sucursales || {});
      const keysUsuarios = [...new Set(res.map(e => e.key_usuario).filter(Boolean))];
      const usuariosArr = await MDL.usuario.getByKeys(keysUsuarios) || [];
      const usuariosMap = Object.fromEntries(usuariosArr.map(u => [u.key, u]));
      const clientesArr = await MDL.crm.cliente.getAll() || [];
      const clientesMap = Object.fromEntries(clientesArr.map(c => [c.key, c]));
      const dataFinal = res.map(e => ({
        ...e,
        sucursal: sucursales.find(s => s.key === e.key_sucursal) || {},
        usuario: usuariosMap[e.key_usuario] || {},
        cliente: clientesMap[e.key_cliente] || {},
        empresa,
      }));
      return dataFinal;
    } catch (error) {
      console.error(error);
      SPopup.alert("Error al cargar asistencias");
      return [];
    }
  }

  mostrarTabla() {
    return (
      <DinamicTable
        ref={ref => (this.DinamicTable = ref)}
        loadData={this.loadInitialData.bind(this)}
        key="key"
        language="es"
        center
        {...Config.table.applyTheme()}
        selectType="single"
        loadInitialState={async () => ({ sorters: [{ key: "fecha_on", order: "desc", type: "date" }] })}

        onSelect={(e) => {
          console.log("Selected project:", e.row);
          FloatMenu.open({
            e: e.evt,
            label: `Asistencia cliente ${e.row?.cliente?.nombres || ''}`,
            options: [
              // {
              //   label: 'Editar',
              //   icon: <SIcon name="Edit" fill={STheme.color.text} />,
              //   onPress: () => {
              //     // 👉 Aquí puedes abrir un popup o navegar
              //     console.log('Editar asistencia:', e.row);
              //   },
              // },
              {
                label: 'Eliminar',
                icon: <SIcon name="Delete" fill={STheme.color.danger} />,
                onPress: () => {
                  SPopup.confirm({
                    title: 'Eliminar asistencia',
                    message: '¿Estás seguro de eliminar esta asistencia?',
                    onPress: () => {
                      MDL.inventario.asistencia
                        .editar({ key: e.row.key, estado: 0 })
                        .then(() => {
                          SNotification.send({
                            key: 'AsistenciaEliminada',
                            title: 'Asistencia eliminada',
                            body: 'La operación se realizó con éxito.',
                            color: STheme.color.success,
                            time: 4000,
                          });
                          this.DinamicTable?.loadData();
                        })
                        .catch(error => {
                          SNotification.send({
                            key: 'AsistenciaError',
                            title: 'Error al eliminar',
                            body: error?.error || JSON.stringify(error),
                            color: STheme.color.danger,
                            time: 4000,
                          });
                        });
                    },
                  });
                },
              },
            ],
          });
        }}
      >
        <DinamicTable.Col key="index" label="N°" width={30} data={(e) => e.index + 1} />
        <DinamicTable.Col key="key_sucursal" label="Sucursal" width={130} data={(e) => e.row.key_sucursal} customComponent={e => this.renderSucursal(e.row.sucursal)} />
        <DinamicTable.Col key="key_cliente_" label="Cliente" width={130} data={(e) => e.row.key_cliente} customComponent={e => this.renderCliente(e.row.cliente)} />
        {/* <DinamicTable.Col key="key_empresa" label="Empresa" width={120} data={(e) => e.row.key_empresa} customComponent={e => this.renderEmpresa(e.row.empresa)} /> */}
        {/* <DinamicTable.Col key="estado_fecha_" label="Estado" width={100} data={(e) => e.row.fecha_on} customComponent={e => this.renderValidofecha(e.row)} /> */}
        <DinamicTable.Col key={"fecha_on"} label="Fecha Asistencia" width={150} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.lightGray }} dateFormat="yyyy-MM-dd hh:mm" />
        <DinamicTable.Col key="key_usuario" label="Administrador" width={150} data={(e) => e.row.key_usuario} customComponent={e => this.renderUsuario(e.row.usuario)} />

      </DinamicTable>
    );
  }

  render() {
    return (
      <SPage title="Reporte de Asistencias" disableScroll>
        {this.mostrarTabla()}
        <SHr height={20} />
        {/* {MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'new' }) && ( */}
        <FloatButtom
          onPress={() =>
            PopupRegistrarAsistencia.open({
              onSuccess: () => this.DinamicTable.loadData(),
            })
          }
        />
        {/* )} */}
      </SPage>
    );
  }
}
