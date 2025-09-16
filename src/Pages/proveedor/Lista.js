import React, { Component } from 'react';
import { SPage, SView, SText, STheme, SNavigation, SPopup, SHr, SNotification, SImage, SDate, SMath } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import PopupCrearProveedor from './Components/PopupCrearProveedor';

export default class Lista extends Component {
    onSelect = SNavigation.getParam('onSelect');

    constructor(props) {
        super(props);
        this.state = {};
    }

    async loadInitialData() {
        try {
            // Obtener proveedores
            const proveedores = await MDL.inventario.proveedor.getAllProveedor();
            if (!proveedores || !Object.keys(proveedores).length) {
                SNotification.send({
                    title: 'Advertencia',
                    body: 'No se encontraron proveedores.',
                    time: 3000,
                    color: STheme.color.warning,
                });
                return [];
            }

            // Obtener usuarios asociados a los proveedores
            const keysUsuarios = Object.values(proveedores)
                .map(p => p.key_usuario)
                .filter(Boolean);
            const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
            if (!usuarios || !Object.keys(usuarios).length) {
                console.warn('No se encontraron usuarios para los proveedores.');
            }

            // Obtener transacciones de compra
            const transacciones = await MDL.compra_venta.getTransaccion('compra', '2024-09-01', '2026-09-05');
            if (!transacciones || !transacciones.length) {
                SNotification.send({
                    title: 'Advertencia',
                    body: 'No se encontraron compras en el rango de fechas especificado.',
                    time: 3000,
                    color: STheme.color.warning,
                });
            }

            // Obtener resumen de cuotas
            const registros = await MDL.compra_venta.getCuotasResumenTotal_compras();

            // Mapear proveedores con sus datos asociados
            return Object.values(proveedores).map(proveedor => {
                proveedor.usuario = usuarios.find(u => u.key === proveedor.key_usuario) || null;
                proveedor.resumen_cuota = registros.find(r => r.key_proveedor === proveedor.key) || null;
                proveedor.compras = transacciones ? transacciones.filter(t => t.key_proveedor === proveedor.key) : [];
                return proveedor;
            });
        } catch (error) {
            console.error('Error al cargar los datos iniciales:', error);
            SNotification.send({
                title: 'Error',
                body: 'No se pudo cargar la lista de proveedores y sus compras.',
                time: 3000,
                color: STheme.color.danger,
            });
            return [];
        }
    }

    /**
     * Renderiza el componente de estado con color y etiqueta.
     * @param {string} state - Estado a renderizar.
     * @returns {JSX.Element} Componente visual del estado.
     */
    renderState(state) {
        const stateInfo = Model.compra_venta.Action.getStateInfo()[state] || {};
        return (
            <SView row center>
                <SView backgroundColor={stateInfo.color} style={{ borderRadius: 4, padding: 5 }}>
                    <SText color={STheme.color.text} fontSize={10}>
                        {stateInfo.label || state}
                    </SText>
                </SView>
            </SView>
        );
    }

    /**
     * Renderiza el componente de tipo de pago con color y etiqueta.
     * @param {string} value - Tipo de pago.
     * @returns {JSX.Element} Componente visual del tipo de pago.
     */
    renderTipoPago(value) {
        const tipoInfo = MDL.compra_venta.getTipoPago()[value] || {};
        return (
            <SView row center>
                <SView backgroundColor={tipoInfo.color} style={{ borderRadius: 4, padding: 5 }}>
                    <SText color={STheme.color.text} fontSize={10}>
                        {tipoInfo.label || value}
                    </SText>
                </SView>
            </SView>
        );
    }

    /**
     * Renderiza la tabla dinámica de proveedores.
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
                    if (this.onSelect) {
                        this.onSelect(e.row);
                        SNavigation.goBack();
                        return;
                    }
                    FloatMenu.open({
                        e: e.evt,
                        label: `Proveedor: ${e.row.razon_social}`,
                        options: [
                            {
                                icon: <SIconApp name="Edit" />,
                                label: 'Actualizar Proveedor',
                                onPress: () => {
                                    const proveedor = { ...e.row, key_usuario: MDL.usuario.session?.key };
                                    PopupCrearProveedor.open({
                                        editObject: proveedor,
                                        key_empresa: proveedor.key_empresa,
                                        onSuccess: () => this.DinamicTable.loadData(),
                                    });
                                },
                            },
                            e.row.compras.length > 0 && {
                                icon: <SIconApp name="Ajustes" />,
                                label: 'Pagar Deuda',
                                onPress: () => SNavigation.navigate('/caja/cuotas', { key_proveedor: e.row?.key }),
                            },
                            {
                                icon: <SIconApp name="Delete" />,
                                label: 'Eliminar Proveedor',
                                onPress: () => {
                                    SPopup.confirm({
                                        title: 'Eliminar Proveedor',
                                        message: '¿Estás seguro de eliminar este proveedor?',
                                        onPress: () => {
                                            const data = { ...e.row, estado: 0 };
                                            MDL.inventario.proveedor
                                                .editar(data)
                                                .then(() => {
                                                    this.DinamicTable.loadData();
                                                    SNotification.send({
                                                        title: 'Éxito',
                                                        body: 'Proveedor eliminado correctamente.',
                                                        time: 3000,
                                                        color: STheme.color.success,
                                                    });
                                                })
                                                .catch(error => {
                                                    console.error('Error al eliminar el proveedor:', error);
                                                    SNotification.send({
                                                        title: 'Error',
                                                        body: 'No se pudo eliminar el proveedor.',
                                                        time: 3000,
                                                        color: STheme.color.danger,
                                                    });
                                                });
                                        },
                                    });
                                },
                            },
                        ].filter(Boolean),
                    });
                }}
                loadData={() => this.loadInitialData()}
            >
                <DinamicTable.Col key="index" label="#" width={40} data={e => e.index + 1} />
                <DinamicTable.Col
                    key="key"
                    label="Foto"
                    width={40}
                    data={e => `${SSocket.api.inventario}proveedor/${e.row?.key}`}
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
                <DinamicTable.Col key="razon_social" label="Razón Social" width={150} data={e => e.row?.razon_social} />

                <DinamicTable.Col key="nit" label="NIT" width={150} data={e => e.row?.nit} />
                <DinamicTable.Col key="nombre" label="Nombre de Contacto" width={150} data={e => e.row?.nombre} />
                <DinamicTable.Col key="telefono" label="Teléfono" width={130} data={e => e.row?.telefono} />
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
                    key="pagos"
                    label="Pagos"
                    width={50}
                    data={e => e.row?.compras?.length}
                    customComponent={e =>
                        e.row?.compras?.length > 0 ? (
                            <SView
                                style={{ width: 28 }}
                                center
                                onPress={() => SNavigation.navigate('/caja/cuotas', { key_proveedor: e.row?.key })}
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
                                    <SIconApp name="Carrito" width={24} />
                                </SView>
                            </SView>
                        ) : null
                    }
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
            </DinamicTable>
        );
    }

    render() {
        return (
            <SPage title="Gestión de Proveedores" disableScroll>
                {this.mostrarTabla()}
                <SHr height={20} />
                <FloatButtom
                    onPress={() =>
                        PopupCrearProveedor.open({
                            onSuccess: () => this.DinamicTable.loadData(),
                        })
                    }
                />
            </SPage>
        );
    }
}