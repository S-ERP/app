import React, { Component } from 'react';
import { SHr, SList, SLoad, SScrollView2, SScrollView3, SText, STheme, SUuid, SView } from 'servisofts-component';
import { connect } from 'react-redux';
import Model from '../../../../Model';
import Item from "./Item"
import { ItemStyle } from './styles';
import Container from '../../../../Components/Container';

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    loadData() {
        this.roles = Model.rol.Action.getAll();
        this.usuarios = Model.usuario.Action.getAll();
        this.usuarioRol = Model.usuarioRol.Action.getAll();
        if (!this.roles || !this.usuarios || !this.usuarioRol) return null;
        Object.values(this.usuarioRol).map(nan => {
            let usuario = this.usuarios[nan.key_usuario]
            let rol = this.roles[nan.key_rol]
            if (!usuario) return;
            if (!rol) return;
            if (!rol.usuarios) rol.usuarios = {};
            rol.usuarios[usuario.key] = usuario;
        })
        return true;
    }
    render_list() {

        if (!this.loadData()) return <SList
            col={"xs-12"}
            space={0}
            key={SUuid()}
            center
            horizontal
            data={new Array(8).fill("1")}
            render={(o) => <SLoad type='skeleton' {...ItemStyle} />}
        />
        return <SList
            col={"xs-12"}
            order={[{ key: "descripcion", order: "asc" }]}
            // style={{
            //     justifyContent: 'space-between',
            // }}
            flexEnd
            // center
            space={0}
            key={SUuid()}
            horizontal
            data={this.roles}
            render={(o) => <Item data={o} />}
        />
    }
    render() {
        return <SView col={"xs-12"} center>
            <SText col={"xs-12"} bold color={STheme.color.lightGray} center>Cantidad de usuarios activos en los roles.</SText>
            <SHr />
            {/* <SScrollView3 scroll={false}> */}
            {this.render_list()}
            {/* </SScrollView3> */}
        </SView>
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);