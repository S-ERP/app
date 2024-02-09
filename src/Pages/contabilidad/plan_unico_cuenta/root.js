import { Component } from 'react';
import { SHr, SNavigation, SPage, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { PlanDeCuentas } from 'servisofts-rn-contabilidad'
import Model from '../../../Model';

class index extends Component {
    constructor(props) {
        super(props);
        this.onSelect = SNavigation.getParam("onSelect");
        this.key_cuenta = SNavigation.getParam("key_cuenta");
        this.codigo = SNavigation.getParam("codigo");
    }

    render() {
        return (<SPage>
            <SView col={"xs-12"} center>
                <SView col={"xs-12 sm-10 md-8 lg-6 xl-4"} >
                    <PlanDeCuentas buscador onSelect={this.onSelect} defaultCode={this.codigo} defaultKey={this.key_cuenta} disabled={!!this.onSelect} open={false}/>
                </SView>
                <SHr height={40} />
            </SView>
        </SPage>)
    }
}
export default connect(index);