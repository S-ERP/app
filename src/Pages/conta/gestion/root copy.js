import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../../MDL';
import FloatButtom from '../../../Components/FloatButtom';
import FloatMenu from '../../../Components/FloatMenu';
import SIconApp from '../../../Assets/SIconApp';
import Config from '../../../Config';
import Menu from 'servisofts-component/img/Menu';
import Model from '../../../Model';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
            permiso_crear: true,
            gestiones: null,
            loading: false,
            error: ""
        };
    }

    componentDidMount() {
        this.loadInitialData();
    }

    loadInitialData = async () => {
        const api = await MDL.contabilidad.gestion.getAll();
        const arr = api ? Object.values(api).filter(g => g.estado != 0) : [];
        this.setState({ gestiones: arr });
        return api;
    }

  abrir_nueva_gestion = async () => {
    let fecha = this.input_fecha.getValue();

    this.setState({
        loading: true,
        error: ""
    });

    try {
        console.log("Creando gestión...");

        const resp = await Model.gestion.Action.cerrar({
            fecha,
            key_usuario: Model.usuario.Action.getKey()
        });

        console.log("Respuesta:", resp);

        const data = await this.loadInitialData();

        console.log("Gestiones cargadas:", data);
// ss
        this.setState({
            loading: false
        });

    } catch (e) {
        console.error(e);

        this.setState({
            loading: false,
            error: e.error || "Ocurrió un error al crear la gestión."
        });
    }
}

    mostrarTabla() {
        return <DinamicTable
            key="tabla"
            ref={ref => this.table = ref}
            {...Config.table.applyTheme()}
            center
            language="es"
            selectType="single"
            loadInitialState={async () => {
                return { sorters: [{ key: "fecha", order: "desc", type: "date" }] }
            }}
            loadData={this.loadInitialData.bind(this)}
            onSelect={(e) => {
                if (this.onSelect) {
                    this.onSelect(e.row);
                    SNavigation.goBack();
                    return;
                }

                const MenuOptions = [];

                (e.row.estado == 1) ? MenuOptions.push({
                    icon: <SIconApp name='Edit' />,
                    label: "Abrir gestión",
                    onPress: () => {
                        SPopup.confirm({
                            title: "¿Estás seguro de abrir esta gestión?",
                            message: "Antes de continuar, queremos informarte que al abrir esta gestión, la que está actualmente abierta se cerrará automáticamente. Sin embargo, no te preocupes, todos los comprobantes que generes a partir de ahora se registrarán en esta gestión que estás abriendo. ¿Deseas continuar?",
                            onPress: () => {
                                MDL.contabilidad.gestion.abrir(e.row.key).then(resp => {
                                    this.table.loadData();
                                    this.forceUpdate();
                                }).catch(e => {
                                    console.log(e)
                                })
                            }
                        })
                    }
                }) :
                    MenuOptions.push({
                        icon: <SIconApp name='Edit' />,
                        label: "Cerrar gestión",
                        onPress: () => {
                            SPopup.confirm({
                                title: "¿Estás seguro de cerrar esta gestión?",
                                message: "Antes de continuar, queremos informarte que al cerrar esta gestión, se abrirá automáticamente la gestión más reciente disponible. En caso de que esta sea la gestión más reciente, se abrirá una nueva en el siguiente mes. No te preocupes, todos tus comprobantes y registros están seguros y disponibles en la gestión correspondiente. ¿Deseas continuar?",
                                onPress: () => {
                                    MDL.contabilidad.gestion.cerrar().then(resp => {
                                        this.table.loadData();
                                        this.forceUpdate();
                                    }).catch(e => {
                                        console.log(e)
                                    })
                                }
                            })
                        }
                    })

                FloatMenu.open({
                    e: e.evt,
                    label: "Gestión: " + new SDate(e.row?.fecha, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM"),
                    options: MenuOptions
                })
            }}
        >
            <DinamicTable.Col key="index" label="#" textStyle={{
                color: STheme.color.lightGray
            }} width={40} data={(e) => e.index + 1} />
            <DinamicTable.Col key={"-keyprofile"} label='Ver' width={40} data={(e) => e.row?.key}
                customComponent={e => <>
                    <SView row center card padding={2} onPress={() => { SNavigation.replace("/venta/profile2", { pk: e.row.key }) }}>
                        <SIconApp name='Eyes' height={14} fill={STheme.color.lightGray} ></SIconApp>
                    </SView>
                </>} />
            <DinamicTable.Col key="fecha" label="Año" width={120} dataType="date" data={(e) => new SDate(e.row?.fecha, "yyyy-MM-ddThh:mm:ss").date}
                dateFormat="yyyy-MM" textStyle={{ fontSize: 15, alignContent: "center", alignItems: "center" }}
                customComponent={e => <SText color={(e.row.estado == 2) ? STheme.color.success : STheme.color.gray}>{new SDate(e.row?.fecha, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM")}</SText>}
            />
            <DinamicTable.Col
                key={"fecha_on"} label="F.Registro" width={120} dataType="date"
                data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
                textStyle={{ fontSize: 10, color: STheme.color.lightGray }} dateFormat="yyyy-MM-dd hh:mm"
            />
        </DinamicTable>
    }

    render() {
        const { gestiones } = this.state;
console.log("gestiones", gestiones);
        if (!gestiones) return <SPage title="Gestiones" disableScroll><SLoad /></SPage>;

     if (gestiones.length === 0) {
    return (
        <SPage title="Crear primera gestión" disableScroll>

            <SView
                col={"xs-11 sm-10 md-8 lg-6"}
                center
                card
                padding={30}
                style={{
                    borderRadius: 20,
                    backgroundColor: STheme.color.card,
                    maxWidth: 850,
                    marginTop: 40,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)"
                }}
            >

                {/* ICONO */}
                <SView
                    width={90}
                    height={90}
                    center
                    style={{
                        borderRadius: 100,
                        backgroundColor: STheme.color.primary + "20"
                    }}
                >
                    <SIconApp
                        name='nuevaGestion'
                        width={45}
                        height={45}
                        fill={STheme.color.danger}
                        stroke='yellow'
                    />
                </SView>

                <SHr h={20} />

                {/* TITULO */}
                <SText
                    bold
                    fontSize={28}
                    center
                >
                    Crear primera gestión
                </SText>

                <SHr h={12} />

                {/* SUBTITULO */}
                <SText
                    center
                    color={STheme.color.lightGray}
                    fontSize={16}
                >
                    Comienza a registrar la información contable de tu empresa
                    creando una gestión para el período que deseas administrar.
                </SText>

                <SHr h={25} />

                {/* INFORMACION */}
                <SView
                    width={"100%"}
                    card
                    padding={20}
                    style={{
                        backgroundColor: STheme.color.background,
                        borderRadius: 12
                    }}
                >

                    <SText
                        bold
                        fontSize={16}
                    >
                        ¿Qué es una gestión?
                    </SText>

                    <SHr h={15} />

                    <SView row>
                        <SText color={STheme.color.success}>✓</SText>
                        <SView width={10} />
                        <SText>
                            Organiza la información contable por períodos.
                        </SText>
                    </SView>

                    <SHr h={10} />

                    <SView row>
                        <SText color={STheme.color.success}>✓</SText>
                        <SView width={10} />
                        <SText>
                            Permite registrar compras, ventas y movimientos financieros.
                        </SText>
                    </SView>

                    <SHr h={10} />

                    <SView row>
                        <SText color={STheme.color.success}>✓</SText>
                        <SView width={10} />
                        <SText>
                            Facilita la generación de reportes y balances.
                        </SText>
                    </SView>

                    <SHr h={10} />

                    <SView row>
                        <SText color={STheme.color.success}>✓</SText>
                        <SView width={10} />
                        <SText>
                            Es el punto de partida para utilizar el sistema.
                        </SText>
                    </SView>

                </SView>

                <SHr h={30} />

                {/* FECHA */}
                <SText
                    bold
                    fontSize={15}
                >
                    Mes y año de inicio
                </SText>

                <SHr h={10} />

                <SView width={180}>
                    <SInput
                        ref={ref => this.input_fecha = ref}
                        type='date_my'
                        defaultValue={new SDate().toString("yyyy-MM")}
                        style={{
                            textAlign: "center",
                            fontSize: 18
                        }}
                    />
                </SView>

                <SHr h={15} />

                {!!this.state.error && (
                    <>
                        <SText color={STheme.color.danger}>
                            {this.state.error}
                        </SText>
                        <SHr h={10} />
                    </>
                )}

                {/* BOTON */}
                {!this.state.loading ? (
                    <SView
                        row
                        center
                        width={280}
                        height={55}
                        onPress={this.abrir_nueva_gestion}
                        style={{
                            backgroundColor: STheme.color.primary,
                            borderRadius: 14,
                            cursor: "pointer"
                        }}
                    >

                        <SIconApp
                            name='Add'
                            width={18}
                            height={18}
                            fill={STheme.color.white}
                        />

                        <SView width={10} />

                        <SText
                            color={STheme.color.white}
                            bold
                            fontSize={16}
                        >
                            Crear gestión
                        </SText>

                    </SView>
                ) : (
                    <>
                        <SLoad />
                        <SHr h={10} />
                        <SText color={STheme.color.lightGray}>
                            Creando gestión...
                        </SText>
                    </>
                )}

                <SHr h={20} />

                <SText
                    center
                    color={STheme.color.lightGray}
                    fontSize={13}
                >
                    Podrás crear nuevas gestiones más adelante cuando lo necesites.
                </SText>

            </SView>

        </SPage>
    );
}
}
}