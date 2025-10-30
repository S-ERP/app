import React, { useEffect } from "react";
import { SInput, SPage, SText, STheme, SThread, SView } from "servisofts-component";
import MDL from "../../../MDL";
import ToolTips from "../../../Components/ToolTips";
import SIconApp from "../../../Assets/SIconApp";

export default class PuntoDeVentaChoise extends React.Component {
    state: any = {
        selects: [],
        data: []
    }
    componentDidMount(): void {
        this.loadData();
    }

    loadData = async () => {
        const empresa = await MDL.empresa.getFull();
        let pva: any[] = [];
        empresa.sucursales.map((suc: any) => {
            if (suc.puntos_venta) {
                suc.puntos_venta.map((pv: any) => {
                    pv._code = suc.descripcion + " - " + pv.descripcion;
                    pva.push(pv)
                })
            }

        })
        this.state.data = pva;
        this.forceUpdate();
    }
    onAdd(e) {
        this.state.selects.push(e);
        if (this.props.onAdd) this.props.onAdd(e);
        this.forceUpdate();
    }
    render() {
        return <SView row style={{

        }}>
            {this.props.data.map(e => {
                const ef = this.state.data.find(a => a.key == e)
                if (!ef) return null;
                return <Tag label={ef._code} onPress={e => {
                    if (this.props.onPress) this.props.onPress(e, ef);
                }} />
            })}
            <TagInput onAdd={this.onAdd.bind(this)} data={this.state.data}
                filter={(a) => {
                    if (!!this.props.data.find(b => this.state.data.find(dt => dt.key == b)?._code == a._code)) {
                        return false;
                    }
                    // if (this.state.selects.find(b => b._code == a._code)) {
                    //     return false;
                    // }
                    return true;
                }} />
        </SView>
    }
}


const Tag = ({ label, onPress }) => {
    const color = STheme.colorFromText(label)
    return <SView style={{
        borderWidth: 1,
        borderRadius: 4,
        borderColor: color,
        backgroundColor: color + "44",
        padding: 2,
        paddingHorizontal: 4,
        margin: 1,
        justifyContent: "center",
        alignItems: "center"
    }} row onPress={onPress}>
        <SText clean style={{
            fontSize: 10,
        }}>{label}</SText>
        <SView width={4} />
        <SView width={12} height={12}>
            <SIconApp name="Close" fill={STheme.color.text} />
        </SView>
    </SView>
}
const TagInput = ({ onAdd, filter, data }) => {
    const inputRef = React.useRef<SInput>(null);

    const color = STheme.color.text;
    return <SView style={{
        // borderWidth: 1,
        borderRadius: 4,
        borderColor: color,
        backgroundColor: color + "44",
        // paddingHorizontal: 4,
        margin: 1,
        justifyContent: "center",
        alignItems: "center"
    }}>
        <SInput
            ref={inputRef}
            customStyle={"erp"}
            height={18}
            width={120}
            type="select2"
            options={data.filter(filter).map(a => a._code)}
            placeholder={"Hab. Punto de venta..."}
            // icon={<SIconEmpresa type="adicionar"/>}
            iconR={<ToolTips type="info" small width={14} descripcion={`Habilita un punto de venta escribiendo su nombre o seleccionándolo de la lista.
Al activar un método de pago para un punto de venta, las \`Cajas\` asociadas podrán utilizarlo.`} />}
            style={{
                fontSize: 10,
            }}
            selectStyle={{
                fontSize: 10,

            }}
            onChangeText={e => {
                console.log(e);
            }}
            onBlur={() => {
                new SThread(500, "aca", true).start(() => {
                    if (inputRef.current) {
                        const value = inputRef.current.getValue();
                        const pv = data.find(a => a._code == value);
                        if (pv) {
                            onAdd(pv);
                            inputRef.current.setValue("");
                            //  setData([...data])
                            new SThread(500, "aca_2", true).start(() => {
                                if (inputRef.current) {
                                    inputRef.current.focus();
                                }
                            })


                        }

                    }

                })

            }}
        />
    </SView>
}