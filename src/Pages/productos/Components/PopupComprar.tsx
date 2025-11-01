import React from "react";
import { SHr, SImage, SInput, SLoad, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../../MDL";
import { ScrollView } from "react-native";
import SIconApp from "../../../Assets/SIconApp";
import CheckBox from "../../../Components/CheckBox";

type PopupComprarProps = {
    modelo: { descripcion: string, key: string, estado?: number },
    cantidad: number,
    precio: number,
}
export default class PopupComprar extends React.Component<PopupComprarProps> {
    static open(props: PopupComprarProps) {
        SPopup.open({
            key: "elaborar",
            content: <SView style={{
                width: "100%",
                height: 500,
                maxHeight: "100%",
                maxWidth: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background,
            }} withoutFeedback>
                <PopupComprar {...props} />
            </SView>
        })
    }

    state: { modelo?: any } = {

    }
    componentDidMount(): void {
        this.loadData()
    }
    async loadData() {
        try {
            const data = await MDL.inventario.exec(`SELECT get_arbol_modelo('${this.props.modelo?.key}') as modelo`)
            const modelo = data[0].modelo;
            this.setState({ modelo: modelo })
            console.log(modelo);
        } catch (error) {
            console.error(error)
        }
    }
    render() {
        return <ScrollView>
            <SView padding={8}>
                <Modelo modelo={this.state.modelo} open />
            </SView>
        </ScrollView>
    }
}

const Modelo = (props: { modelo: any, open?: boolean, ingrediente?: any }) => {
    const [open, setOpen] = React.useState(props.open);
    const { modelo, ingrediente } = props;
    if (!modelo) return <SLoad />
    const isSingle = ingrediente?.cantidad == 1;
    return <SView style={{
        marginStart: 8,
        paddingStart: 8,
        // borderLeftWidth: 1,
        // borderColor: STheme.color.card,
    }}>
        <SView row style={{
            alignItems: "center"
        }}>

            {ingrediente && <CheckBox value={open} onChange={e => {
                setOpen(e);
            }} />}
            {/* {modelo.recetas ? <IconOpenClose open={open} /> : <SView width={20} />} */}
            <SView width={8} />
            <SView style={{
                width: 25,
                height: 25,
                overflow: "hidden"
            }} card>
                <SImage src={(SSocket.api as any)?.inventario + "modelo/.128_" + modelo.key} style={{
                    resizeMode: "cover"
                }} />
            </SView>
            <SView width={8} />
            <SText bold onPress={() => {
                if (ingrediente) {
                    setOpen(!open)
                }
            }}>{modelo?.descripcion}</SText>

            {(!!ingrediente && !isSingle && open) && <SView style={{ marginLeft: 8, width: 50, height: 20, }}>
                <SInput type="money2" height={20} icon={<SView />}
                    defaultValue={ingrediente.cantidad}
                    style={{
                        fontSize: 12,
                        padding: 1,
                    }}
                />
            </SView>}
            {/* <SView width={16} /> */}
            {/* {modelo.recetas && <SText clean style={{ fontSize: 10,  backgroundColor: STheme.color.warning, borderRadius: 4, paddingHorizontal: 4, height: 12, }}>{modelo.recetas.length} ingredientes</SText>} */}

        </SView>
        <SHr />
        {
            (open && modelo.recetas) && modelo.recetas.map((receta: any) => {
                return <Receta receta={receta} open={true} />
            })
        }
    </SView >
}
const Receta = (props: { receta: any, open?: boolean }) => {
    const [open, setOpen] = React.useState(props.open);
    const { receta } = props;
    if (!receta) return null;
    const { ingrediente } = receta;
    if (!ingrediente) return null;
    return <SView style={{
        marginStart: 8,
        paddingStart: 8,
        borderLeftWidth: 1,
        borderColor: STheme.color.card,
    }}>
        <SView row col={"xs-12"} style={{
            alignItems: "center"
        }} >
            <SView width={10} />
            {/* <IconOpenClose open={open} /> */}
            <SText color={STheme.color.lightGray}
                onPress={() => {
                    setOpen(!open)
                }}
            >{ingrediente.descripcion}</SText>
            <SView width={8} />
            <SText clean style={{
                fontSize: 10, backgroundColor: STheme.color.card, borderRadius: 4, paddingHorizontal: 8, height: 12,
            }}>{0}/{ingrediente.cantidad}</SText>
            {ingrediente.is_required && <>
                <SView width={8} />
                <SText clean style={{
                    fontSize: 10, backgroundColor: STheme.color.danger, borderRadius: 4, paddingHorizontal: 2, height: 12,
                }}>{"Requerido"}</SText>
            </>}
        </SView>
        <SHr />
        <SView style={{
            // paddingStart: 8
        }}>
            {(open && ingrediente?.modelos) && ingrediente.modelos.map((modelo: any) => {
                return <Modelo modelo={modelo} ingrediente={ingrediente} />
            })}
        </SView>
    </SView>
}


const IconOpenClose = ({ open = false }) => {
    return <SView style={{
        width: 20,
        height: 20,
        padding: 4,
        transform: [
            { rotate: open ? "-90deg" : "180deg" }
        ]
    }}>
        <SIconApp name="Back" fill={STheme.color.card} />
    </SView>
}