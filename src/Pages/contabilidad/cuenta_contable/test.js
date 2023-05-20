import { Component } from 'react';
import { SPage } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { PlanDeCuentas } from 'servisofts-rn-contabilidad'
import Model from '../../../Model';

class index extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<SPage>
            <PlanDeCuentas />
        </SPage>)
    }
}
export default connect(index);