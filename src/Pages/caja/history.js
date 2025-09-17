import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SIcon } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import ReciboCarta from '../../Components/PDF/venta/ReciboCarta';
import MDL from '../../MDL';
import FloatMenu from '../../Components/FloatMenu';
import DateTimeBetween from '../../Components/DateTimeBetween';

export default class history extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fecha_inicio: null,
            fecha_fin: null,
        };

    }

    renderUsuario(srcKey) {
        const pintar = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
            <SImage src={`${SSocket.api.root}usuario/${srcKey}`} style={{ resizeMode: "cover" }} />
        </SView>;
        const nulo = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.lightGray + "66", }} />;
        return srcKey ? pintar : nulo;
    };
    renderCliente(srcKey) {
        const pintar = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
            <SImage src={`${SSocket.api.crm}cliente/${srcKey}`} style={{ resizeMode: "cover" }} />
        </SView>;
        const nulo = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.lightGray + "66", }} />;
        return srcKey ? pintar : nulo;
    };
    renderSucursal(suc, a) {
        if (!suc) return <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.lightGray + "66", }} />;
        return <>
            <SView row center>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                    <SImage src={`${SSocket.api.empresa}sucursal/${suc.key}`} style={{ resizeMode: "cover" }} />
                </SView>
                <SView width={4} />
                <SText flex numberOfLines={a.colData.wrap ? 0 : 1} style={a.textStyle}>{suc?.descripcion}</SText>
            </SView>
        </>
    };

    toISO(dateString) {
        // Si ya tiene hora, se respeta
        if (dateString.includes(":")) {
            return dateString.replace(" ", "T");
        }
        // Si no tiene hora, asumimos inicio de día
        return dateString + "T00:00:00";
    }

    toISOEnd(dateString) {
        // Si ya tiene hora, se respeta
        if (dateString.includes(":")) {
            return dateString.replace(" ", "T");
        }
        // Si no tiene hora, asumimos fin del día
        return dateString + "T23:59:59";
    }

    filtrarPorFechas(data, fecha_inicio, fecha_fin) {
        return data.filter(item => {
            const fechaItem = new Date(this.toISO(item.fecha));

            if (fecha_inicio && !fecha_fin) {
                // Solo desde fecha_inicio
                return fechaItem >= new Date(this.toISO(fecha_inicio));
            }

            if (!fecha_inicio && fecha_fin) {
                // Solo hasta fecha_fin
                return fechaItem <= new Date(this.toISOEnd(fecha_fin));
            }

            if (fecha_inicio && fecha_fin) {
                // Entre fecha_inicio y fecha_fin
                return fechaItem >= new Date(this.toISO(fecha_inicio)) && fechaItem <= new Date(this.toISOEnd(fecha_fin));
            }

            // Si no hay filtros, devuelve todo
            return true;
        });
    }

    async loadInitialData() {
        try {
            const history = await MDL.caja.getAll(MDL.empresa?.select?.key);
            const empresa = await MDL.empresa.getFull();

            console.log("history", history);
            console.log('Loading initial data... 🎈🎈🎈🎈', empresa);


            history.map(caja => {
                caja.sucursal = empresa.sucursales.find(a => a.key == caja.key_sucursal);
                empresa.sucursales.map(suc => {
                    const pv = suc.puntos_venta.find(a => a.key == caja.key_punto_venta);
                    if (pv) {
                        caja.punto_venta = pv;
                    }
                })
            })

            // Aplicar filtro por fechas si existen
            const { fecha_inicio, fecha_fin } = this.state;
            const filteredHistory = this.filtrarPorFechas(history, fecha_inicio, fecha_fin);
            console.log("Filtered History:", filteredHistory);
            return filteredHistory;
        } catch (error) {
            console.error('Error in loadData:', error);
            SPopup.alert('Error loading data. Please try again.');
            return [];
        }
    }
    // renderState(state) {
    //     const statesInfo = MDL.compra_venta.getStateInfo()[state];
    //     return <SView row center>
    //         <SView backgroundColor={statesInfo?.color} style={{ borderRadius: 4, padding: 5 }}>
    //             <SText color={STheme.color.text} fontSize={10}>{statesInfo?.label}</SText>
    //         </SView>
    //     </SView>
    // }
    renderTipoPago(values) {
        const statesTipo = MDL.compra_venta.getTipoPago()[values];
        return <SView row center>
            <SView backgroundColor={statesTipo?.color} style={{ borderRadius: 4, padding: 5 }}>
                <SText color={STheme.color.text} fontSize={10}>{statesTipo?.label}</SText>
            </SView>
        </SView>
    }
    renderCodigo(codigo) {
        return <SView row center>
            <SView border={STheme.color.card} style={{ borderRadius: 8, padding: 6, borderWidth: 1 }}>
                <SText color={STheme.color.text} fontSize={10} bold>{codigo}</SText>
            </SView>
        </SView>
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
                onSelect={(e) => {
                    FloatMenu.open({
                        e: e.evt,
                        label: "Tabla de ventas",
                        options: [
                            {
                                label: "Ver venta",
                                icon: <SIconApp name='addTarea' fill={STheme.color.text} />,
                                onPress: () => {
                                    SNavigation.navigate("/venta/profile", { pk: e?.row?.key })
                                }
                            },
                            {
                                label: "Imprimir tamaño carta",
                                icon: <SIcon name='imprimir' fill={STheme.color.text} />,
                                onPress: () => {
                                    ReciboCarta.imprimir(e?.row?.key)
                                }
                            },
                        ]
                    });
                }}
                loadInitialState={async () => {
                    return { sorters: [{ key: "fecha_on", order: "desc", type: "date" }] }
                }}
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={(e) => e.index + 1} />
                <DinamicTable.Col key="key" label="Key" width={60} textStyle={{
                    color: STheme.color.lightGray,
                    fontSize: 10
                }} data={(e) => e.row?.key ?? ""} />
                <DinamicTable.Col key="sucursal" label="Sucursal" width={100} data={(e) => e.row?.sucursal?.descripcion ?? ""} customComponent={a => this.renderSucursal(a.row.sucursal, a)} />
                <DinamicTable.Col key="punto_venta" label="Punto venta" width={100} data={(e) => e.row?.punto_venta?.descripcion ?? ""} />
                <DinamicTable.Col key="key_usuario" label="Usuario" width={50} data={(e) => e.row?.key_usuario ?? ""} customComponent={a => this.renderUsuario(a.data)} />
                <DinamicTable.Col key={"fecha_on"} label="Fecha" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
                <DinamicTable.Col key={"fecha_on_since"} label="Hace" width={120}
                    data={e => "Hace " + new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                />

            </DinamicTable>
        );
    }
    render() {
        return (
            <SPage title="Tabla Historial Caja" disableScroll>
                <SView width={260} center>
                    <DateTimeBetween
                        fecha_inicio='2024-01-01'
                        fecha_fin={new SDate().toString("yyyy-MM-dd")}
                        onChange={({ fecha_inicio, fecha_fin }) => {
                            console.log("Fechas seleccionadas:", fecha_inicio, fecha_fin);
                            this.setState({ fecha_inicio, fecha_fin }); // si lo quieres en el padre
                            this.DinamicTable?.loadData(); // recargar la tabla
                        }}
                    />
                </SView>
                {this.mostrarTabla()}
                <SHr height={20} />
            </SPage>
        );
    }
}
