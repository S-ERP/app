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
            return <SPage title="Gestiones Nueva" disableScroll border={"red"} center>
                <SView col={"xs-9"} center row >
                    <SView col={"xs-12"} center border={"yellow"}>
                        <SHr h={16} />
                        <SIcon name='Alert' fill='transparent' width={50} />
                        <SHr h={8} />
                        <SText fontSize={20} bold>{"¿Primera vez que abrirás una gestión?"}</SText>
                        <SHr h={8} />
                        <SText fontSize={16} color={STheme.color.lightGray} justify>{`Es necesario abrir una gestión en el sistema contable para que puedas registrar correctamente tus actividades económicas y mantener un seguimiento adecuado de las mismas. Si no abres una gestión, es posible que la información financiera de tu empresa no esté completa o no sea precisa, lo que podría dificultar la toma de decisiones en el futuro.\n\nPor lo tanto, te recomendamos abrir una gestión en el sistema contable tan pronto como sea posible para comenzar a registrar tus actividades económicas y tener un registro ordenado y preciso de tus transacciones financieras.`}</SText>
                        <SHr h={16} />
                        <SHr h={1} color={STheme.color.card} />
                        <SHr h={16} />
                        <SText fontSize={16} color={STheme.color.lightGray}>{"Ingresa el mes y el año de la gestión: "}</SText>
                        <SHr h={4} />
                        <SView width={100}>
                            <SInput ref={ref => this.input_fecha = ref} type='date_my' iconR={<SView width={10} />} style={{ textAlign: "center" }} defaultValue={new SDate().toString("yyyy-MM")} />
                        </SView>
                        <SHr h={16} />
                        <SText color={STheme.color.danger}>
                            {this.state.error}
                        </SText>

                        <SHr h={8} />

                        {!this.state.loading
                            ? <SView
                                row
                                center
                                width={280}
                                height={52}
                                card
                                onPress={this.abrir_nueva_gestion}
                                style={{
                                    backgroundColor: STheme.color.primary,
                                    borderRadius: 14
                                }}
                            >
                                <SIconApp
                                    name='Add'
                                    width={18}
                                    height={18}
                                    fill={STheme.color.white}
                                />

                                <SView width={8} />

                                <SText
                                    bold
                                    fontSize={16}
                                    color={STheme.color.white}
                                >
                                    Crear primera gestión
                                </SText>
                            </SView>
                            : <>
                                <SLoad />
                                <SHr h={8} />
                                <SText color={STheme.color.lightGray}>
                                    Creando gestión...
                                </SText>
                            </>
                        }
                        <SHr h={16} />
                    </SView>
                </SView>
            </SPage>;
        }

        return (
            <SPage title="Gestiones" disableScroll>
                {this.mostrarTabla()}
                {this.state.permiso_crear && <FloatButtom onPress={() => {
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
                }} />}
            </SPage>
        );
    }
}
