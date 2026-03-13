import React from "react";
import { SPage, SPopup, SText, STheme, SView, SInput, SIcon, SHr, SNotification } from "servisofts-component";
import MDL from "../../../MDL";
import habilidad from "../../habilidad";
import { FlatList } from "react-native";
import CheckBox from "../../../Components/CheckBox";
import SSocket from "servisofts-socket";

type AdministrarTipoProps = {
    contacto: any[];
    key_usuario: string;
    onSuccess?: () => void;
}
export default class AdministrarTipo extends React.Component<AdministrarTipoProps> {
    static open(props: AdministrarTipoProps) {
        SPopup.open({
            key: AdministrarTipo.name,
            type: "2",
            content: <AdministrarTipo {...props} />
        })
    }
    static close() {
        SPopup.close(AdministrarTipo.name)
    }

    state = {
        tipos: [],
        searchText: "",
        selectAll: false
    }
    componentDidMount() {
        this.loadData();
    }
    async loadData() {
        // const tipos_usuarios = await MDL.habilidad.getAllByUsuario(this.props.key_usuario);
        // const tipos_usuarios= await MDL.crm.cliente.getAll();
        const tipos_usuarios = this.props.contacto?.tipo_cliente;
        const tipos = await MDL.crm.tipoCliente.getAll();
        console.log("tipos_usuarios", tipos_usuarios)
        console.log("tipos", tipos)
        tipos.sort((a: any, b: any) => {
            if (a.titulo < b.titulo) return -1;
            if (a.titulo > b.titulo) return 1;
            return 0;
        });
        tipos.forEach((tip: any) => {
            tip._selected = tipos_usuarios?.find((hu: any) => hu?.key == tip.key) ? true : false;
        });
        this.setState({ tipos: tipos });
    }

    filterHabilidades() {
        if (!this.state.searchText) return this.state.tipos;

        const searchLower = this.state.searchText.toLowerCase();
        return this.state.tipos.filter((tip: any) => {
            return Object.values(tip).some(value =>
                String(value).toLowerCase().includes(searchLower)
            );
        });
    }

    handleSelectAll = (value: boolean) => {
        const filtered = this.filterHabilidades();
        filtered.forEach((item: any) => {
            item._selected = value;
        });
        this.setState({ selectAll: value });
    }

    getSelectedCount = () => {
        return this.state.tipos.filter((item: any) => item._selected).length;
    }

    handleOnPress = () => {

        const selectedTipos = this.state.tipos.filter((item: any) => item._selected);
        const dataAntes = this.props.contacto?.tipo_cliente ?? [];

        const selectedKeys = new Set(selectedTipos.map((t: any) => t.key));
        const dataAntesKeys = new Set(dataAntes.map((t: any) => t.key));

        //cambios
        const paraAgregar = selectedTipos.filter((t: any) => !dataAntesKeys.has(t.key));
        const paraEliminar = dataAntes.filter((t: any) => !selectedKeys.has(t.key));

        console.log("Agregar:", paraAgregar);
        console.log("Eliminar:", paraEliminar);

        //eliminar
        paraEliminar.forEach((element: any) => {
            MDL.crm.tipoCliente.deleteClienteDeLaTabla(element.key_cliente_tipo_cliente)
                .then(() => {
                    SNotification.send({
                        title: `✅ "${element.titulo}" quitado`,
                        color: STheme.color.success,
                        time: 1500
                    });
                    if (this.props.onSuccess) {
                        this.props.onSuccess();
                    }
                })
                .catch(err => {
                    SNotification.send({
                        title: "❌ Error al quitar",
                        body: err,
                        color: STheme.color.danger
                    });
                });
        });

        //agregar
        paraAgregar.forEach((tip: any) => {
            MDL.crm.tipoCliente.addToCliente({
                key_cliente: this.props.contacto?.key,
                key_tipo_cliente: tip.key
            })
                .then(() => {
                    SNotification.send({
                        title: "✅ Cliente agregado",
                        color: STheme.color.success,
                        time: 1500
                    });

                    if (this.props.onSuccess) {
                        this.props.onSuccess();
                    }
                })
                .catch(err => {
                    SNotification.send({
                        title: "❌ Error",
                        body: err,
                        color: STheme.color.danger
                    });
                });
        });
        SPopup.close(AdministrarTipo.name);

    }
    render() {
        return <SView col={"xs-12"} style={{
            backgroundColor: STheme.color.background,
            width: "100%",
            maxHeight: "100%",
            borderRadius: 8,
            padding: 16,
            maxWidth: 500,
            height: 500,
            alignItems: "center",

        }} withoutFeedback>
            <SText fontSize={18} bold>Administrar Tipos</SText>
            {/* <SHr /> */}
            <SView padding={8} col={"xs-12"}>
                <SInput
                    placeholder="Buscar tipo..."
                    customStyle={"erp"}
                    icon={<SIcon name="Search" width={20} height={20} fill={STheme.color.text} />}
                    onChangeText={(text) => {
                        this.setState({ searchText: text });
                    }}
                />
            </SView>
            <SView row col={"xs-12"} style={{
                padding: 8,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center"
            }} >
                <CheckBox value={this.state.selectAll} onChange={(e) => {
                    this.handleSelectAll(e);
                }} />
                <SView flex />
                <SText color={STheme.color.lightGray}>Seleccionados: {this.getSelectedCount()}</SText>
            </SView>
            <SHr h={1} color={STheme.color.card} />
            <SView height={8} />
            <FlatList style={{ width: "100%" }}
                data={this.filterHabilidades()}
                renderItem={(obj) => {
                    return <Item item={obj.item} selectAll={this.state.selectAll} onChange={(e) => {
                        // console.log("onChange", e);
                        // obj.item._selected = e;
                        this.forceUpdate();
                    }} />
                }}
                ListFooterComponent={() => {
                    if (this.state.searchText && this.state.searchText.trim() !== "") {
                        return <SView row col={"xs-12"} style={{
                            padding: 8,
                            borderBottomWidth: 1,
                            borderBottomColor: STheme.color.card,
                            backgroundColor: STheme.color.card + "40",
                        }} onPress={() => {
                            console.log("Crear nueva habilidad:", this.state.searchText);
                            MDL.habilidad.registro({
                                descripcion: this.state.searchText.trim()
                            }).then((nuevaHabilidad: any) => {
                                nuevaHabilidad._selected = true;
                                this.state.tipos.push(nuevaHabilidad);
                                this.setState({ searchText: "" });
                            }).catch((error) => {
                                console.error("Error al crear habilidad:", error);
                            });
                            // Aquí puedes agregar la lógica para crear una nueva habilidad
                        }}>
                            <SIcon name="Add" width={20} height={20} fill={STheme.color.primary} />
                            <SView width={8} />
                            <SText >Crear: "{this.state.searchText}"</SText>
                        </SView>
                    }
                    return null;
                }}
            />
            <SView col={"xs-12"} row style={{
                justifyContent: "flex-end"
            }}>
                <SText padding={8} card
                    onPress={() => {
                        AdministrarTipo.close();
                    }}
                >{"CANCELAR"}</SText>
                <SView width={8} />
                <SText padding={8} card style={{
                    backgroundColor: STheme.color.success
                }} onPress={this.handleOnPress.bind(this)}>{"ACEPTAR"}</SText>
            </SView>
        </SView>
    }
}

const Item = (props) => {
    const [selected, setSelected] = React.useState(props.item._selected || false);
    const isFirstRender = React.useRef(true);

    React.useEffect(() => {
        // Solo actualizar si no es el primer render
        if (!isFirstRender.current) {
            setSelected(props.selectAll);
        }
    }, [props.selectAll]);

    React.useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
        }

        if (props.onChange) {
            props.onChange(selected);
        }
        props.item._selected = selected;
    }, [selected]);

    const item: any = props.item;
    return <SView row col={"xs-12"} style={{
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: STheme.color.card,
        flexDirection: "row",
    }} onPress={() => {
        setSelected(!selected);
    }}>
        <CheckBox value={selected} onChange={e => {
            setSelected(e);
        }} />
        <SView width={8} />
        <SText>{item.titulo}</SText>
    </SView>
}