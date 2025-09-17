import React, { useEffect } from "react";
import { SInput, SPage, SText, STheme, SThread, SView } from "servisofts-component";
import MDL from "../../../MDL";
import ToolTips from "../../../Components/ToolTips";
import SIconApp from "../../../Assets/SIconApp";
import SIconEmpresa from "../../../Assets/SIconEmpresa";

export default class PuntoDeVentaChoise extends React.Component {
    componentDidMount(): void {
        this.loadData();
    }
    state = {
        selects: []
    }
    loadData = async () => {

    }
    onAdd(e) {
        this.state.selects.push(e);
        this.forceUpdate();
    }
    render() {
        return <SView row style={{

        }}>
            {this.state.selects.map(e => {
                return <Tag label={e._code} />
            })}
            <TagInput onAdd={this.onAdd.bind(this)} filter={(a) => {
                if (this.state.selects.find(b => b._code == a._code)) {
                    return false;
                }
                return true;
            }} />
        </SView>
    }
}


const Tag = ({ label }) => {
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
    }}  row>
        <SText clean style={{
            fontSize: 10,
        }}>{label}</SText>
        <SView width={4}/>
        <SView width={12} height={12}>
            <SIconApp name="Close" fill={STheme.color.text}/>
        </SView>
    </SView>
}
const TagInput = ({ onAdd, filter }) => {
    const [data, setData] = React.useState([]);
    const inputRef = React.useRef<SInput>(null);
    const loadData = async () => {
        const empresa = await MDL.empresa.getFull();
        let pva: any[] = [];
        empresa.sucursales.map((suc: any) => {
            suc.puntos_venta.map((pv: any) => {
                pv._code = suc.descripcion + " - " + pv.descripcion;
                pva.push(pv)
            })
        })
        setData(pva);
        // this.setState({
        //     pva: pva
        // })
    }
    useEffect(() => {
        loadData();
    }, [])
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
Al activar un método de pago para un punto de venta, las \`Cajas\` asociadas podrán utilizarlo.`}/>}
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
                            setData([...data])
                            new SThread(200, "aca_2", true).start(() => {
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