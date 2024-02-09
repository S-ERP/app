import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { AsientoContable2 } from 'servisofts-rn-contabilidad';
import Container from '../../Components/Container';
import Model from '../../Model';

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.pk = SNavigation.getParam("pk")
        this.clone = SNavigation.getParam("clone")
        this.key_gestion = SNavigation.getParam("key_gestion", Model.gestion.Action.getSelect()?.key)
    }


    render() {
        return (
            <SPage title={"Asiento contable"} disableScroll center>
                <SView col={"xs-11.5 sm-10 md-8"} height>
                    <AsientoContable2 key_gestion={this.key_gestion} key_asiento_contable={this.pk} clone={this.clone} />
                </SView>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);