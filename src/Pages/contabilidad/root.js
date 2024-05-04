import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SHr, SIcon, SLoad, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import { Parent } from "."
import Model from '../../Model';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {
        let empresa = Model.empresa.Action.getSelect();
        let gestion = Model.gestion.Action.getSelect();
        if (!empresa) return <SLoad />

        let fecha = new SDate(gestion?.fecha);
        let fecha_inicio = fecha.toString("yyyy-MM-dd");
        fecha.addMonth(1).addDay(-1);
        let fecha_fin = fecha.toString("yyyy-MM-dd");
        return (
            <SPage title={Parent.title} onRefresh={(end) => {
                Model.usuarioPage.Action.CLEAR();
                end()
            }}>
                <SHr height={32} />
                <MenuPages path={Parent.path + "/"} blackList={["/contabilidad/asiento_contable"]}
                    params={{
                        key_empresa: empresa.key,
                        fecha_inicio: fecha_inicio,
                        fecha_fin: fecha_fin
                    }}
                    onPress={(e) => {
                        e.preventDefault();
                        console.log(e);
                    }}
                >
                    <MenuButtom label={"Init"} url={"/contabilidad/init"} icon={<SIcon name={"Salir"} />} />
                    <MenuButtom label={"Impuestos"} url={"/contabilidad/enviroment"} icon={<SIcon name={"Ajustes"} />} />
                    {/* <MenuButtom label={"Asientos"} url={gestion?.key ? "/contabilidad/gestion/profile" : "/contabilidad/gestion"} params={{ pk: gestion?.key }} icon={<SIcon name={"Box"} fill={"#6ff"} />} /> */}
                </MenuPages>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);