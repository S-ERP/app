import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SForm, SHr, SIcon, SList, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../../Model';
import DatoItem from "./DatoItem";
import SSocket from 'servisofts-socket'
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    getDatos() {
        var datos = Model.inventario_dato.Action.getAllByKeyProducto(this.props.key_producto);
        this.producto_inventario_dato = Model.producto_inventario_dato.Action.getAllBy({
            key_producto: this.props.key_producto
        })
        if (!datos) return null;
        if (!this.producto_inventario_dato) return null;
        return <SList
            data={datos}
            space={0}
            order={[{ key: "tipo", order: "desc", peso: 1 }]}
            render={(obj) => {
                var dto = Object.values(this.producto_inventario_dato).find(o => o.key_inventario_dato == obj.key);
                return <DatoItem obj={obj} dto={dto} />
            }}
        />
    }
    render() {
        return (
            <SView col={"xs-12"} center >
                {/* <SText fontSize={16} bold>Datos y documentos</SText> */}
                {/* <SView row card width={100} center height={30} onPress={() => {
                        SNavigation.navigate("/usuario/profile/edit_datos", { pk: this.props.key_usuario })
                    }}>
                        <SIcon name='Pencil' fill={STheme.color.text} width={12} />
                        <SView width={8} />
                        <SText>Editar</SText>
                    </SView> */}
                {/* <SHr height={4}/> */}
                {this.getDatos()}
            </SView>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);