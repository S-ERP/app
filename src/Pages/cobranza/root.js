import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SPage, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {
        return (
            <SPage title={'Cobranzas'}>
                <SHr height={32} />
                <MenuPages path={"/cobranza/"} >
                    <MenuButtom icon={<SIcon name='Alert' />} label={"Penalidades"} url={"/cobranza/penalidades"} />
                    {/* <MenuButtom icon={<SIcon name='Alert' />} label={"Test"} url={"/cobranza/test"} /> */}
                    {/* <MenuButtom icon={<SIcon name='Alert' />} label={"Cuotas"} url={"/cobranza/clientesPendientes"} />
                    <MenuButtom icon={<SIcon name='Alert' />} label={"Deudores"} url={"/cobranza/clientes_con_deuda"} />
                    <MenuButtom icon={<SIcon name='Alert' />} label={"Deudas"} url={"/cobranza/proveedores_que_debemos"} /> 
                    */}
                </MenuPages>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);