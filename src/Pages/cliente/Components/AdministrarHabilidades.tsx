import React from "react";
import { SPage, SPopup, SText, STheme, SView, SInput, SIcon, SHr } from "servisofts-component";
import MDL from "../../../MDL";
import habilidad from "../../habilidad";
import { FlatList } from "react-native";
import CheckBox from "../../../Components/CheckBox";
import SSocket from "servisofts-socket";

type AdminsitrarHabilidadesProps = {
    key_usuario: string;
    onSuccess?: () => void;
}
export default class AdminsitrarHabilidades extends React.Component<AdminsitrarHabilidadesProps> {
    static open(props: AdminsitrarHabilidadesProps) {
        SPopup.open({
            key: AdminsitrarHabilidades.name,
            type: "2",
            content: <AdminsitrarHabilidades {...props} />
        })
    }
    static close() {
        SPopup.close(AdminsitrarHabilidades.name)
    }

    state = {
        habilidades: [],
        searchText: "",
        selectAll: false
    }
    componentDidMount() {
        this.loadData();
    }
    async loadData() {
        const habilidades_usuarios = await MDL.habilidad.getAllByUsuario(this.props.key_usuario);
        const habilidades = await MDL.habilidad.getAll();
        habilidades.sort((a: any, b: any) => {
            if (a.descripcion < b.descripcion) return -1;
            if (a.descripcion > b.descripcion) return 1;
            return 0;
        });
        habilidades.forEach((hab: any) => {
            hab._selected = habilidades_usuarios.find((hu: any) => hu.key_habilidad == hab.key) ? true : false;
        });
        this.setState({ habilidades: habilidades });
    }

    filterHabilidades() {
        if (!this.state.searchText) return this.state.habilidades;

        const searchLower = this.state.searchText.toLowerCase();
        return this.state.habilidades.filter((hab: any) => {
            return Object.values(hab).some(value =>
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
        return this.state.habilidades.filter((item: any) => item._selected).length;
    }

    handleOnPress = () => {
        const selectedHabilidades = this.state.habilidades.filter((item: any) => item._selected);
        console.log("Habilidades seleccionadas:", selectedHabilidades);
        const keys = selectedHabilidades.map((hab: any) => hab.key);

        SSocket.sendPromise({
            component: "habilidad_usuario",
            type: "registro_all",
            key_habilidades: keys,
            key_usuario: this.props.key_usuario,
            key_empresa: MDL.empresa.select?.key,
        }).then(e => {
            AdminsitrarHabilidades.close();
            if (this.props.onSuccess) {
                this.props.onSuccess();
            }
            console.log("Habilidades registradas:", e);
        }).catch(e => {
            console.error("Error al registrar habilidades:", e);
        })
        // Aquí puedes agregar la lógica para manejar las habilidades seleccionadas
    }
    render() {
        return <SView col={"xs-12"}  style={{
            backgroundColor: STheme.color.background,
            width: "100%",
            maxHeight: "100%",
            borderRadius: 8,
            padding: 16,
            maxWidth: 500,
            height: 500,
            alignItems: "center",

        }} withoutFeedback>
            <SText fontSize={18} bold>Administrar Habilidades</SText>
            {/* <SHr /> */}
            <SView padding={8} col={"xs-12"}>
                <SInput
                    placeholder="Buscar habilidad..."
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
                                this.state.habilidades.push(nuevaHabilidad);
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
                        AdminsitrarHabilidades.close();
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
        <SText>{item.descripcion}</SText>
    </SView>
}