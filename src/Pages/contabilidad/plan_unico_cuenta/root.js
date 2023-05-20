import { Component } from 'react';
import { SHr, SNavigation, SPage, STheme, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { PlanDeCuentas2, PlanDeCuentasTable } from 'servisofts-rn-contabilidad'

class index extends Component {
    constructor(props) {
        super(props);
        this.onSelect = SNavigation.getParam("onSelect");
        this.key_cuenta = SNavigation.getParam("key_cuenta");
        this.codigo = SNavigation.getParam("codigo");
    }

    render() {
        return (<SPage title={"Cuentas"} disableScroll center>
            <SView col={"xs-12"} height style={{
                padding: 8
            }} center>
                <PlanDeCuentasTable initialCode={this.codigo} onSelect={this.onSelect}
                    allowCreate allowEdit allowDelete allowExport allowImport
                    space={4}
                    width={500}
                    itemProps={{
                        padding: 12, space: 4,
                        underline: true,
                        underlineColor: STheme.color.card
                    }} />
            </SView>
            {/* <SView col={"xs-12"} center>
                <SView col={"xs-11 sm-10 md-8 lg-6 xl-4"} center>
                    <PlanDeCuentas2 initialCode={this.codigo} onSelect={this.onSelect} space={4} />
                </SView>
            </SView> */}
        </SPage>)
    }
}
export default connect(index);