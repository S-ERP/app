import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SDate, SHr, SIcon, SList, SLoad, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { Parent } from "."
import Model from '../../../Model';
import { PopupSelectCuentaContable } from 'servisofts-rn-contabilidad';
import Container from '../../../Components/Container';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.codigo_cuenta = SNavigation.getParam("codigo");
        this.onSelect = SNavigation.getParam("onSelect");
    }



    loadData() {
        this.cuenta_contable = Model.cuenta_contable.Action.getByCode(this.codigo_cuenta);
        let data = Model.cuenta_centro_costo.Action.getAll();
        this.centro_costo = Model.centro_costo.Action.getAll();
        if (!data || !this.cuenta_contable || !this.centro_costo) return false;
        this.data = Object.values(data);
        this.data = this.data.filter(a => a.key_cuenta_contable == this.cuenta_contable.key && this.centro_costo[a.key_centro_costo]);
        return true;
    }

    handlePress() {
        SNavigation.navigate("/contabilidad/centro_costo", {
            onSelect: (item) => {
                let cch = this.data.find((a) => a.key_centro_costo == item.key);
                if (cch?.key) {
                    SPopup.alert("El centro de costo ya esta habilitado para esta cuenta.");
                    return;
                }
                Model.cuenta_centro_costo.Action.registro({
                    data: {
                        key_cuenta_contable: this.cuenta_contable.key,
                        key_centro_costo: item.key
                    }
                }).then(resp => {
                    console.log(resp);
                }).catch(e => {
                    console.error(e);
                })
            }
        });
    }
    renderData() {
        if (!this.loadData()) return <SLoad />;
        return <SView col={"xs-12"} center>
            <SText fontSize={18}>{this.cuenta_contable.codigo}</SText>
            <SText fontSize={18} bold>{this.cuenta_contable.descripcion}</SText>
            <SHr />
            <SHr />
            <SView card padding={16} onPress={this.handlePress.bind(this)}><SText color={STheme.color.success}>AGREGAR CENTRO DE COSTO</SText></SView>
            <SHr />
            <SHr />
            <SText col={"xs-12"} color={STheme.color.lightGray}>Centros de costos habilitados:</SText>
            <SHr />
            {this.renderListaDeCentrosDeCostos()}
        </SView>
    }

    renderListaDeCentrosDeCostos() {
        let items = this.data;
        if (items.length <= 0) return <SView>
            <SHr />
            <SText color={STheme.color.warning}>No tienes centros de costos habilitados para esta cuenta.</SText>
            <SHr />
        </SView>
        return <SList
            data={this.data}
            render={(obj) => {
                let cc = this.centro_costo[obj.key_centro_costo];
                return <SView col={'xs-12'} card padding={8} onPress={() => {
                    if (!this.onSelect) return null;
                    this.onSelect(cc);
                }}>
                    <SHr />
                    <SText fontSize={16}>{cc.codigo} - {cc.descripcion}</SText>
                    <SHr />
                </SView>
            }}
        />
    }
    render() {

        return (
            <SPage
                title={Parent.title}
                onRefresh={(end) => {
                }}>
                <Container>
                    {this.renderData()}
                </Container>

            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);