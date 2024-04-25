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
            <SPage title={'Productos'}>
                <SHr height={32} />
                <MenuPages path={"/productos/"} >
                    <MenuButtom label='Catalogo' url='/productos/catalogo' />
                    <MenuButtom label='Carrito' url='/productos/carrito' />
                </MenuPages>

            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);