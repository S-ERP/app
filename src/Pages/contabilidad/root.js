import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import { Parent } from "."
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {
        return (
            <SPage title={Parent.title}>
                <SHr height={32} />
                <MenuPages path={Parent.path + "/"} blackList={["/contabilidad/asiento_contable"]} >
                    {/* <MenuButtom label={"Crear Asiento"} url={"/contabilidad/asiento"} /> */}
                </MenuPages>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);