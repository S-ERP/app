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

    armarJson(modelo: any, cantidad = 0) {

        let recetas: any = [];
        if (modelo.recetas) {

            modelo.recetas.map((rec: any) => {
                if (rec.selects && Object.keys(rec.selects).length > 0) {


                    let ingredientes: any = [];
                    Object.keys(rec.selects).map((key_modelo: any) => {
                        const select = rec.selects[key_modelo];
                        const modelo = rec.ingrediente.modelos.find((item: any) => item.key == key_modelo);
                        ingredientes.push(this.armarJson(modelo, select.cantidad))
                    })


                    const receta = {
                        key_receta: rec.key_receta,
                        key_ingrediente: rec.ingrediente.key,
                        descripcion: rec.ingrediente.descripcion,
                        igredientes: ingredientes
                    }
                    recetas.push(receta);
                    // ingredientes.push({

                    // })
                }
            })
        }

        let json: any = {
            key_modelo: modelo.key,
            descripcion: modelo.descripcion,
            cantidad: cantidad,
        }
        if (recetas.length > 0) {
            json.recetas = recetas;
        }
        console.log(json)

        return json;
    }
    render() {
        return <ScrollView>
            <SView padding={8}>
                <Modelo modelo={this.state.modelo} open onChangeStatus={(e) => {
                    console.log("Cambio el estado", e)
                    // this.setState({
                    //     valid:
                    // })
                }} />
                <SHr h={32} />
                <SView row center>
                    <SText card padding={8} onPress={() => {
                        const json = this.armarJson(this.state.modelo);
                        console.log(json)

                    }}>{"CONFIRMAR COMPRA"}</SText>
                </SView>
            </SView>

        </ScrollView>
    }
}

const Modelo = (props: {
    modelo: any, open?: boolean, ingrediente?: any,
    selects?: any,
    setSelects?: (selects: any) => void,
    onChangeStatus?: (valid: boolean) => void

}) => {
    const [valid, setValid] = React.useState(true);
    const inputRef = React.useRef<SInput>(null);
    const { modelo, ingrediente } = props;
    if (!modelo) return <SLoad />
    const isSingle = ingrediente?.cantidad == 1;
    const selectedObject = (props.selects ?? {})[modelo.key];

    const handleSelect = (select: boolean) => {
        const startItem = { cantidad: 0, valid: true, };
        if (props.setSelects) {
            if (ingrediente.cantidad > 1) {
                // Si hay varios seleccionados, dividir la cantidad entre ellos
                let nuevosSelects = { ...props.selects };

                if (select) {
                    nuevosSelects[modelo.key] = { ...startItem, };
                } else {
                    delete nuevosSelects[modelo.key];
                    // setValid(true);

                }

                const seleccionados = Object.keys(nuevosSelects);
                const cantidadTotal = ingrediente.cantidad;
                const cantidadPorModelo = seleccionados.length > 0
                    ? cantidadTotal / seleccionados.length
                    : 0;

                // Reasignar cantidades equitativamente
                let lastk = ""
                let sum = 0;
                seleccionados.forEach(key => {
                    lastk = key;
                    const c = Math.floor(cantidadPorModelo * 100) / 100;
                    sum += c;
                    nuevosSelects[key].cantidad = c;
                });
                if (sum != ingrediente.cantidad) {
                    if (lastk) {
                        nuevosSelects[lastk].cantidad += ingrediente.cantidad - sum;
                    }
                }

                props.setSelects(nuevosSelects);
                // verifyValid();


            } else {
                if (select) {
                    props.setSelects({
                        [modelo.key]: {
                            ...startItem,
                            cantidad: ingrediente.cantidad
                        }
                    })
                } else {
                    props.setSelects({})
                }
            }


        }
    }

    if (inputRef.current && selectedObject) {
        if (parseFloat(inputRef.current.getValue()) != selectedObject?.cantidad) {
            inputRef.current.setValue(selectedObject?.cantidad);
        }
    }
    if (selectedObject) selectedObject.valid = valid
    const verifyValid = () => {
        let valid_ = true;
        if (!modelo?.recetas) return;

        modelo.recetas.map((a: any) => {
            if (!a.valid) {
                valid_ = false;
            }
        })
        if (ingrediente && !selectedObject) {
            valid_ = true;
        }


        if (valid != valid_) {
            setValid(valid_);
            if (selectedObject) {
                selectedObject.valid = valid_;
            }
            if (props.onChangeStatus) {
                props.onChangeStatus(valid_);
            }
        }
        // if (selectedObject) {
        //     selectedObject.valid = valid_
        // }
    }
    verifyValid();
    return <SView style={{
        marginStart: 8,
        paddingStart: 8,
        // borderLeftWidth: 1,
        // borderColor: STheme.color.card,
    }}>
        <SView row style={{
            alignItems: "center"
        }}>

            {ingrediente && <CheckBox value={!!selectedObject} onChange={e => {
                handleSelect(e)
                // setOpen(e);
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
            <SView>
                <SText bold onPress={() => {
                    if (ingrediente) {
                        handleSelect(!selectedObject)
                    }
                }}
                    color={valid ? STheme.color.text : STheme.color.danger}
                >{modelo?.descripcion}</SText>
                {(!!ingrediente && !isSingle && selectedObject) && <SView style={{ width: 50, height: 16, }}>
                    <SInput
                        ref={inputRef}
                        type="money2" height={16} icon={<SView />}
                        defaultValue={selectedObject.cantidad}
                        onChangeText={e => {
                            if (props.setSelects) {
                                if (props.selects[modelo.key]) {
                                    console.log("entro aca", props.selects[modelo.key].cantidad, e)
                                    if (props.selects[modelo.key].cantidad + "" != e) {
                                        props.selects[modelo.key].cantidad = !e ? 0 : parseFloat(e);
                                        props.setSelects({ ...props.selects })
                                    }


                                }

                            }

                        }}
                        style={{
                            fontSize: 12,
                            padding: 1,
                        }}
                    />
                </SView>}
            </SView>



            {/* <SView width={16} /> */}
            {/* {modelo.recetas && <SText clean style={{ fontSize: 10,  backgroundColor: STheme.color.warning, borderRadius: 4, paddingHorizontal: 4, height: 12, }}>{modelo.recetas.length} ingredientes</SText>} */}

        </SView>
        <SHr />
        {
            ((selectedObject || props.open) && modelo.recetas) && modelo.recetas.map((receta: any) => {
                return <Receta receta={receta} open={true} onChangeStatus={(bol) => {
                    verifyValid();
                }} />
            })
        }
    </SView >
}
const Receta = (props: { receta: any, open?: boolean, onChangeStatus: (valid: boolean) => void }) => {
    const [open, setOpen] = React.useState(props.open);
    const [valid, setValid] = React.useState(true);
    const [selects, setSelects] = React.useState({});
    const { receta } = props;
    if (!receta) return null;
    const { ingrediente } = receta;
    if (!ingrediente) return null;
    let total = 0;
    Object.values(selects).map((a: any) => {
        total += a.cantidad;
    })
    const checkValid = () => {
        let totalValid = true;
        Object.values(selects).map((a: any) => {
            if (!a.valid) {
                totalValid = false;
            }
        })
        let isValid = false;
        if (Object.keys(selects).length <= 0) {
            if (!ingrediente.is_required) {
                isValid = true;
            } else {
                isValid = false;
            }
        } else {
            if (total == ingrediente.cantidad) {
                isValid = true;
            } else {
                isValid = false;
            }
        }
        if (!totalValid) {
            isValid = false;
        }

        if (receta.valid != isValid) {
            receta.valid = isValid;
            setSelects({ ...selects });
            setValid(receta.valid)
            if (props.onChangeStatus) {
                props.onChangeStatus(isValid);
            }
        }
    }
    receta.selects = selects;


    checkValid();
    return <SView style={{
        marginStart: 8,
        paddingStart: 8,
        borderLeftWidth: 1,
        borderColor: (total == ingrediente.cantidad) ? STheme.color.success : (ingrediente.is_required ? STheme.color.danger : STheme.color.card),
    }}>
        <SView row col={"xs-12"} style={{
            alignItems: "center"
        }} >
            <SView width={10} />
            {/* <IconOpenClose open={open} /> */}
            {/* {!valid && <SText>{"NO Valid"}</SText>} */}
            <SText color={STheme.color.lightGray}
                onPress={() => {
                    setOpen(!open)
                }}
            >{ingrediente.descripcion}</SText>
            <SView width={8} />
            <SText clean style={{
                fontSize: 10,
                backgroundColor: (total == ingrediente.cantidad) ? STheme.color.success : STheme.color.card,
                borderRadius: 4, paddingHorizontal: 8, height: 12,
            }}>{total}/{ingrediente.cantidad}</SText>
            {(ingrediente.is_required && (total != ingrediente.cantidad)) && <>
                <SView width={8} />
                <SText clean style={{
                    fontSize: 10,
                    backgroundColor: STheme.color.danger,
                    borderRadius: 4, paddingHorizontal: 2, height: 12,
                }}>{"Requerido"}</SText>
            </>}
        </SView>
        <SHr />
        <SView style={{
            // paddingStart: 8
        }}>
            {(open && ingrediente?.modelos) && ingrediente.modelos.map((modelo: any) => {
                return <Modelo modelo={modelo} ingrediente={ingrediente} selects={selects} setSelects={setSelects}
                    onChangeStatus={() => {
                        checkValid();
                    }} />
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