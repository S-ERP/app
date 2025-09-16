import React, { Component } from 'react';
import { SDate, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from "servisofts-socket";
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import PopupCrearCliente from './Components/PopupCrearCliente';
import SIconApp from '../../Assets/SIconApp';

const URL = "/crm/cliente";

export default class ListaClientes extends Component {
    componentDidMount() {
        // Verificar permiso de visualización
        MDL.rolesPermisos
            .getPermisoAsync({ url: URL, permiso: 'ver' })
            .then(e => {
                if (!e) {
                    SNavigation.goBack();
                    return;
                }
                this.forceUpdate();
            })
            .catch(error => {
                console.error('Error al verificar permisos:', error);
                SNotification.send({
                    title: 'Error',
                    body: 'No se pudo verificar los permisos.',
                    time: 3000,
                    color: STheme.color.danger,
                });
            });
    }

    /**
     * Carga los datos iniciales de clientes, usuarios y transacciones.
     * @returns {Promise<Array>} Lista de clientes con sus datos asociados.
     */
    async loadInitialData() {
        try {
            // Cargar clientes y transacciones en paralelo
            const [clientes, transacciones] = await Promise.all([
                MDL.crm.cliente.getAll(),
                MDL.compra_venta.getTransaccion('venta', '2024-09-01', '2026-09-05'),
            ]);

            if (!clientes || !Object.keys(clientes).length) {
                SNotification.send({
                    title: 'Advertencia',
                    body: 'No se encontraron clientes.',
                    time: 3000,
                    color: STheme.color.warning,
                });
                return [];
            }

            if (!transacciones || !transacciones.length) {
                SNotification.send({
                    title: 'Advertencia',
                    body: 'No se encontraron ventas en el rango de fechas especificado.',
                    time: 3000,
                    color: STheme.color.warning,
                });
            }

            // Obtener usuarios asociados a los clientes
            const keysUsuarios = Object.values(clientes)
                .map(c => c.key_usuario)
                .filter(Boolean);
            const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
            if (!usuarios || !Object.keys(usuarios).length) {
                console.warn('No se encontraron usuarios para los clientes.');
            }

            // Obtener resumen de cuotas
            const registros = await MDL.compra_venta.getCuotasResumenTotal_ventas();

            // Mapear clientes con sus datos asociados
            return Object.values(clientes).map(cliente => {
                cliente.usuario = usuarios.find(u => u.key === cliente.key_usuario) || null;
                cliente.resumen_cuota = registros.find(r => r.key_cliente === cliente.key) || null;
                cliente.ventas = transacciones ? transacciones.filter(t => t.key_cliente === cliente.key) : [];
                return cliente;
            });
        } catch (error) {
            console.error('Error al cargar los datos iniciales:', error);
            SNotification.send({
                title: 'Error',
                body: 'No se pudo cargar la lista de clientes.',
                time: 3000,
                color: STheme.color.danger,
            });
            return [];
        }
    }

    /**
     * Renderiza la tabla dinámica de clientes.
     * @returns {JSX.Element} Componente de la tabla.
     */
    mostrarTabla() {
        return (
            <DinamicTable
                key="tabla"
                {...Config.table.applyTheme()}
                ref={ref => (this.DinamicTable = ref)}
                center
                language="es"
                selectType="single"
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                loadInitialState={async () => ({
                    sorters: [{ key: 'fecha_on', order: 'asc', type: 'date' }],
                })}
                onSelect={e => {
                    const { row, evt } = e;
                    const nombreCliente = `CLIENTE: ${row?.nombres ?? 'Sin nombre'}`;
                    const options = [];

                    // Opción de editar cliente
                    if (MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'edit' })) {
                        options.push({
                            label: 'Editar',
                            icon: <SIcon name="Edit" fill={STheme.color.text} />,
                            onPress: () => {
                                const cliente = { ...row, key_usuario: MDL.usuario.session?.key };
                                PopupCrearCliente.open({
                                    editObject: cliente,
                                    key_empresa: cliente.key_empresa,
                                    onSuccess: () => this.DinamicTable.loadData(),
                                });
                            },
                        });
                    }

                    // Opción de pagar deuda
                    if (row.ventas.length > 0) {
                        options.push({
                            label: 'Pagar Deuda',
                            icon: <SIconApp name="addUser" />,
                            onPress: () => SNavigation.navigate('/caja/cuotas', { key_cliente: row?.key }),
                        });
                    }

                    // Opción de eliminar cliente
                    if (MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'delete' })) {
                        options.push({
                            label: 'Eliminar',
                            icon: <SIcon name="Delete" fill={STheme.color.text} />,
                            onPress: () => {
                                SPopup.confirm({
                                    title: 'Eliminar Cliente',
                                    message: `¿Estás seguro de eliminar a ${nombreCliente}?`,
                                    onPress: () => {
                                        SSocket.sendPromise({
                                            service: 'crm',
                                            component: 'cliente',
                                            type: 'editar',
                                            data: { ...row, estado: 0 },
                                        })
                                            .then(() => {
                                                SNotification.send({
                                                    key: 'eliminar_ok',
                                                    title: 'Éxito',
                                                    body: `${nombreCliente} fue eliminado correctamente.`,
                                                    time: 1500,
                                                    color: STheme.color.success,
                                                });
                                                this.DinamicTable.loadData();
                                            })
                                            .catch(err => {
                                                console.error('Error al eliminar cliente:', err);
                                                SNotification.send({
                                                    key: 'eliminar_error',
                                                    title: 'Error',
                                                    body: 'Ocurrió un error al eliminar. Intenta nuevamente.',
                                                    time: 3000,
                                                    color: STheme.color.danger,
                                                });
                                            });
                                    },
                                });
                            },
                        });
                    }

                    FloatMenu.open({
                        e: evt,
                        label: nombreCliente,
                        options,
                    });
                }}
                loadData={() => this.loadInitialData()}
            >
                <DinamicTable.Col key="index" label="#" width={40} data={e => e.index + 1} />
                <DinamicTable.Col
                    key="key"
                    label="Foto"
                    width={40}
                    data={e => `${SSocket.api.root}usuario/${e.row?.key}`}
                    customComponent={e => (
                        <SView col="xs-12" center row>
                            <SView
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 100,
                                    overflow: 'hidden',
                                    backgroundColor: `${STheme.color.card}66`,
                                }}
                            >
                                <SImage src={`${e.data}?date=${new Date().getTime()}`} style={{ resizeMode: 'cover' }} />
                            </SView>
                        </SView>
                    )}
                />
                <DinamicTable.Col key="nombres" label="Nombre Completo" width={120} data={e => e.row?.nombres} />
                <DinamicTable.Col key="telefono" label="Teléfono" width={120} data={e => e.row?.telefono} />
                <DinamicTable.Col key="correo" label="Correo" width={150} data={e => e.row?.correo} />
                <DinamicTable.Col key="nit" label="NIT" width={90} data={e => e.row?.nit} />
                <DinamicTable.Col key="razon_social" label="Razón Social" width={90} data={e => e.row?.razon_social} />
                <DinamicTable.Col key="direccion" label="Dirección" width={100} data={e => e.row?.direccion} />
                <DinamicTable.Col key="fecha_nacimiento" label="F. Nacimiento" width={110} data={e => e.row?.fecha_nacimiento} />
                <DinamicTable.Col key="sexo" label="Sexo" width={80} data={e => e.row?.sexo} />
                <DinamicTable.Col key="departamento" label="Departamento" width={100} data={e => e.row?.departamento} />
                <DinamicTable.Col
                    key="cuota_1"
                    wrap
                    sumExcel
                    label="Monto Pagado"
                    width={90}
                    data={e => e.row?.resumen_cuota?.monto_pagado ?? ''}
                    cellStyle={{
                        alignItems: 'flex-end',
                        backgroundColor: `${STheme.color.success}33`,
                    }}
                    format={e => (e.data ? `Bs ${SMath.formatMoney(e.data)}` : '')}
                />
                <DinamicTable.Col
                    key="cuota_2"
                    wrap
                    label="Cuotas Pagadas"
                    width={60}
                    data={e => e.row?.resumen_cuota?.cantidad_pagada ?? ''}
                    cellStyle={{
                        alignItems: 'flex-end',
                        backgroundColor: `${STheme.color.success}33`,
                    }}
                    format={e => (e.data ? SMath.formatMoney(e.data) : '')}
                />
                <DinamicTable.Col
                    key="cuota_3"
                    wrap
                    label="Monto Mora"
                    width={90}
                    data={e => e.row?.resumen_cuota?.monto_en_mora ?? ''}
                    cellStyle={{
                        alignItems: 'flex-end',
                        backgroundColor: `${STheme.color.danger}33`,
                    }}
                    format={e => (e.data ? `Bs ${SMath.formatMoney(e.data)}` : '')}
                />
                <DinamicTable.Col
                    key="cuota_4"
                    wrap
                    label="Cuotas Mora"
                    width={60}
                    data={e => e.row?.resumen_cuota?.cantidad_en_mora ?? ''}
                    cellStyle={{
                        alignItems: 'flex-end',
                        backgroundColor: `${STheme.color.danger}33`,
                    }}
                    format={e => (e.data ? SMath.formatMoney(e.data) : '')}
                />
                <DinamicTable.Col
                    key="cuota_5"
                    wrap
                    label="Monto Pendiente"
                    width={90}
                    data={e => e.row?.resumen_cuota?.monto_pendiente ?? ''}
                    cellStyle={{
                        alignItems: 'flex-end',
                        backgroundColor: `${STheme.color.warning}33`,
                    }}
                    format={e => (e.data ? `Bs ${SMath.formatMoney(e.data)}` : '')}
                />
                <DinamicTable.Col
                    key="cuota_6"
                    wrap
                    label="Cuotas Pendientes"
                    width={60}
                    data={e => e.row?.resumen_cuota?.cantidad_pendiente ?? ''}
                    cellStyle={{
                        alignItems: 'flex-end',
                        backgroundColor: `${STheme.color.warning}33`,
                    }}
                    format={e => (e.data ? SMath.formatMoney(e.data) : '')}
                />
                <DinamicTable.Col
                    key="estado_pago"
                    wrap
                    label="Estado de Pago"
                    width={80}
                    data={e => {
                        const resumen = e.row?.resumen_cuota;
                        if (!resumen) return 'Sin Deuda';
                        if (resumen.cantidad_en_mora > 0 || resumen.monto_en_mora > 0) return 'En Mora';
                        if (resumen.monto_pendiente <= 0) return 'Pagado';
                        return 'Al Día';
                    }}
                    customComponent={e => {
                        const statesTipo = {
                            'Sin Deuda': { color: STheme.color.gray, label: 'Sin Deuda' },
                            'Al Día': { color: STheme.color.warning, label: 'Al Día' },
                            'En Mora': { color: STheme.color.danger, label: 'En Mora' },
                            'Pagado': { color: STheme.color.success, label: 'Pagado' },
                        }[e.data] || { color: STheme.color.gray, label: 'Desconocido' };
                        return (
                            <SView row center>
                                <SView backgroundColor={statesTipo.color} style={{ borderRadius: 4, padding: 5 }}>
                                    <SText color={STheme.color.text} fontSize={10}>
                                        {statesTipo.label}
                                    </SText>
                                </SView>
                            </SView>
                        );
                    }}
                />
                <DinamicTable.Col
                    key="fecha_on"
                    label="F. Creación"
                    width={120}
                    dataType="date"
                    data={e => new SDate(e.row?.fecha_on, 'yyyy-MM-ddThh:mm:ss').date}
                    textStyle={{ fontSize: 12, color: STheme.color.lightGray }}
                    dateFormat="yyyy-MM-dd hh:mm"
                />
                <DinamicTable.Col
                    key="admin"
                    label="Admin"
                    width={120}
                    data={e => e.row?.usuario?.Nombres ?? ''}
                    customComponent={e =>
                        e.row?.key_usuario ? (
                            <SView col="xs-12" row>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: 'hidden' }}>
                                    <SImage
                                        src={`${SSocket.api.root}usuario/${e.row?.key_usuario}`}
                                        style={{ resizeMode: 'cover' }}
                                    />
                                </SView>
                                <SView width={5} />
                                <SText center color={STheme.color.lightGray} fontSize={12}>
                                    {e.row?.usuario?.Nombres}
                                </SText>
                            </SView>
                        ) : null
                    }
                />
                <DinamicTable.Col
                    key="cobros"
                    label="Pagar Cuotas"
                    width={90}
                    center
                    data={e => e.row?.ventas?.length}
                    customComponent={e =>
                        e.row?.ventas?.length > 0 ? (
                            <SView
                                style={{ width: 28 }}
                                center
                                onPress={() => SNavigation.navigate('/caja/cuotas', { key_cliente: e.row?.key })}
                            >
                                <SView
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 100,
                                        overflow: 'hidden',
                                        backgroundColor: `${STheme.color.card}66`,
                                    }}
                                >
                                    <SIconApp name="pagoefectivo" fill="#37be01ff" width={24} />
                                </SView>
                            </SView>
                        ) : null
                    }
                />
            </DinamicTable>
        );
    }

    render() {
        return (
            <SPage title="Gestión de Clientes" disableScroll>
                {this.mostrarTabla()}
                {MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'new' }) && (
                    <FloatButtom
                        onPress={() =>
                            PopupCrearCliente.open({
                                onSuccess: () => this.DinamicTable.loadData(),
                            })
                        }
                    />
                )}
            </SPage>
        );
    }
}