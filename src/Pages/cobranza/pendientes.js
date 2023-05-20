import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SList, SLoad, SMath, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../Model';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.onSelect = SNavigation.getParam("onSelect");
    }

    componentDidMount() {
        Model.cuota.Action.getPendientes().then(e => {
            this.setState({ data: e.data })
        })
    }

    render_data() {
        var cuotas = this.state.data
        if (!cuotas) return <SLoad />

        var cuotas_aux = {};
        
        Object.values(cuotas).map(cuota=>{
            if(cuota.tipo==="compra"){
                if(cuota.proveedor.nit == this.props.route.params.nit){
                    cuotas_aux[cuota.key] = cuota;
                }
            }else{
                if(cuota.cliente.nit == this.props.route.params.nit){
                    cuotas_aux[cuota.key] = cuota;
                }
            }
        });

        cuotas = cuotas_aux;

        return <SList
            order={[{ key: "fecha", type: "date", order: "asc" }]}
            data={cuotas}
            render={(obj) => {
                return <SView col={"xs-12"}  card style={{
                    padding: 8
                }} onPress={() => {
                    if (this.onSelect) {
                        this.onSelect(obj);
                        SNavigation.goBack();
                        return;
                    }
                    // Model.cuota_amortizacion.Action.registro({
                    //     data: {
                    //         descripcion: "Amortiazcion prueba",
                    //         observacion: "--",
                    //         monto: obj.monto,
                    //         fecha: "2023-01-06",
                    //         key_cuota: obj.key,
                    //     },
                    //     key_usuario: Model.usuario.Action.getKey()
                    // }).then(e => {

                    // }).catch(e => {
                    //     console.error(e);
                    // })
                }}>
                    <SView row >
                        <SView row>
                            <SText>{obj.codigo}</SText>
                            <SView width={8} />
                            <SText >{obj.descripcion}</SText>
                        </SView>
                        <SView flex />
                        <SView>
                            <SView center style={{padding:5, borderRadius:10}} backgroundColor={obj.tipo=="compra"?STheme.color.danger:STheme.color.success}>
                                <SText bold fontSize={16}>{obj.tipo}</SText>
                            </SView>
                            <SHr height={20}></SHr>
                            <SText bold fontSize={16}>Bs. {SMath.formatMoney(obj.monto ?? 0)}</SText>
                            <SText color={STheme.color.success}>Bs. {SMath.formatMoney(obj.amortizaciones ?? 0)}</SText>
                            <SText color={STheme.color.danger}>Bs. {SMath.formatMoney((obj.monto ?? 0) - (obj.amortizaciones ?? 0))}</SText>
                        </SView>
                    </SView>
                    <SHr />
                    <SText>{obj.tipo=="compra"?obj.proveedor.nit:obj.cliente.nit}</SText>
                    <SText>{obj.tipo=="compra"?obj.proveedor.razon_social:obj.cliente.razon_social}</SText>
                    <SText>{obj.tipo=="compra"?obj.proveedor.telefono:obj.cliente.telefono}</SText>
                    <SText>{obj.tipo=="compra"?obj.proveedor.correo:obj.cliente.correo}</SText>
                    <SText>{obj.tipo}</SText>
                </SView>
            }}
        />

    }
    render() {
        return (
            <SPage title={'Pendientes'}>
                <SView col={"xs-12"}>
                    {this.render_data()}
                </SView>
                <SView style={{height:150}}></SView>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);