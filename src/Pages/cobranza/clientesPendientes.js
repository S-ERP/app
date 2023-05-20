import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SList, SLoad, SMath, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom } from 'servisofts-rn-roles_permisos';
import Model from '../../Model';
import usuario from '../usuario';
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

        let clientes = {};
        let proveedores = {};
        let cuentas_x_pagar = 0;
        let cuentas_x_cobrar = 0;
        Object.values(cuotas).map((cuota)=>{
            
            if(cuota.tipo==="compra"){
                cuentas_x_pagar+=cuota.monto;
                if(!proveedores[cuota.proveedor.nit]){
                    proveedores[cuota.proveedor.nit] = cuota.proveedor;
                    proveedores[cuota.proveedor.nit]["monto"] = cuota.monto;
                    proveedores[cuota.proveedor.nit]["cuotas"] = 1;
                }else{
                    proveedores[cuota.proveedor.nit]["monto"] += cuota.monto;
                    proveedores[cuota.proveedor.nit]["cuotas"] += 1;
                }
            }
            if(cuota.tipo==="venta"){
                cuentas_x_cobrar+=cuota.monto;
                if(!clientes[cuota.cliente.nit]){
                    clientes[cuota.cliente.nit] = cuota.cliente;
                    clientes[cuota.cliente.nit]["monto"] = cuota.monto;
                    clientes[cuota.cliente.nit]["cuotas"] = 1;
                }else{
                    clientes[cuota.cliente.nit]["monto"] += cuota.monto;
                    clientes[cuota.cliente.nit]["cuotas"] += 1;
                }
            }
        });



        return <SView>
            <SView center >
                <SHr/>
                
                <SView row>
                    <SText>{Object.values(clientes).length} cuentas por cobrar total: Bs. {SMath.formatMoney(cuentas_x_cobrar)}</SText>
                    <SIcon name='Ingreso' width={15} />
                </SView>
                <SHr/>
                <SList 
                    center
                    data={Object.values(clientes)}
                    render={(obj) => {
                        return <SView col={"xs-12 sm-10 md-8 lg-6 xl-4"}  card center style={{padding:8, marginTop:15}} onPress={()=>{
                            SNavigation.navigate("/cobranza/pendientes",{nit:obj.nit});
                        }}>
                            <SHr/>
                            <SText>{obj.razon_social}</SText>
                            <SHr/>
                            <SView row>
                                <SText color={STheme.color.gray}>Nit: </SText>
                                <SText>{obj.nit}</SText>
                            </SView>
                            <SHr/>
                            <SView row>
                                <SText color={STheme.color.gray}>Telefono: </SText>
                                <SText>{obj.telefono}</SText>
                            </SView>
                            <SText>{obj.direccion}</SText>
                            <SHr/>
                            <SText>{obj.cuotas} cuotas</SText>
                            <SHr/>
                            <SView row>
                                <SIcon name='Ingreso' width={15} />
                                <SText>Bs. {SMath.formatMoney(obj.monto)}</SText>
                            </SView>
                        </SView>
                    }}
                ></SList>
            </SView>
            <SHr/>
            <SHr/>
            <SView center>
                <SView row>
                    <SText>{Object.values(proveedores).length} cuentas por pagar total: Bs. {SMath.formatMoney(cuentas_x_pagar)}</SText>
                    <SIcon name='Egreso' width={15} />
                </SView>
                <SHr/>
                <SList 
                    center
                    data={Object.values(proveedores)}
                    render={(obj) => {
                        return <SView col={"xs-12 sm-10 md-8 lg-6 xl-4"}  card center style={{padding:8, marginTop:15}} onPress={()=>{
                            SNavigation.navigate("/cobranza/pendientes",{nit:obj.nit});
                        }}>
                            <SText>{obj.razon_social}</SText>
                            <SHr/>
                            <SView row>
                                <SText color={STheme.color.gray}>Nit: </SText>
                                <SText>{obj.nit}</SText>
                            </SView>
                            <SHr/>
                            <SView row>
                                <SText color={STheme.color.gray}>Telefono: </SText>
                                <SText>{obj.telefono}</SText>
                            </SView>
                            <SText>{obj.direccion}</SText>
                            <SHr/>
                            <SText>{obj.cuotas} cuotas</SText>
                            <SHr/>
                            <SView row>
                                <SIcon name='Egreso' width={15} />
                                <SText>Bs. {SMath.formatMoney(obj.monto)}</SText>
                            </SView>
                            
                        </SView>
                    }}
                ></SList>
                <SView style={{height:150}}></SView>
            </SView>
        </SView>


    }
    render() {
        return (
            <SPage title={'Clientes Pendientes'}>
                <SView col={"xs-12"}>
                    {this.render_data()}
                </SView>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);