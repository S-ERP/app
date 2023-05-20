import React, { Component } from 'react';
import { SHr, SImage, SList, SLoad, SScrollView2, SScrollView3, SText, STheme, SUuid, SView } from 'servisofts-component';
import { connect } from 'react-redux';
import Model from '../../../../Model';
import SSocket from "servisofts-socket"
import * as Graphic from './Graphic';

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    componentDidMount() {
        Model.caja.Action.reporte_cuentas({ fecha_inicio: "1999-01-01", fecha_fin: "2099-01-01" }).then(resp => {
            this.setState({ balance: resp.data });
        })
    }
    loadData() {
        this.cuentas_contables = Model.cuenta_contable.Action.getAll();
        if (!this.cuentas_contables) return false;
        if (!this.state.balance) return false;
        this.balance = this.state.balance;
        return true;
    }
    render_grafico() {
        var props_imp = {
            col: "xs-12", card: true, margin: 4,
            height: 300,
        }
        if (!this.loadData()) return <SLoad type='skeleton' {...props_imp} />
        var size = 20;
        var separation = 10;

        let max = 0;
        var arr = Object.values(this.balance)
        arr.sort((a, b) => b.monto - a.monto)
        arr.map(o => {
            if (o.monto > max) max = o.monto;
        })

        arr = arr.slice(0, 10)

        return <SView {...props_imp}>
            <SView col={"xs-12"} height>
                <SScrollView3 horizontal scroll={false} style={{
                    width: "100%",
                }}
                    contentContainerStyle={{
                        minWidth: 450,
                        width: "100%",
                        flex: 1,
                    }}
                >
                    <SView col={"xs-12"} height={300}>
                        <Graphic.Container >
                            {arr.map((obj, i) => {
                                let porc = (obj.monto / max) * 100
                                return <Graphic.Barra x={((size + separation) * (i)) + 8} width={size} porcentaje={porc}
                                    label={this.cuentas_contables[obj.key_cuenta_contable].codigo + " - " + this.cuentas_contables[obj.key_cuenta_contable].descripcion}
                                    monto={obj.monto}
                                />
                            })}
                        </Graphic.Container>
                    </SView>
                </SScrollView3>
            </SView>
        </SView>
    }

    render() {
        return <SView col={"xs-12"} center >
            <SText col={"xs-12"} center bold color={STheme.color.lightGray}>Grafico de cuentas.</SText>
            <SHr />
            {this.render_grafico()}
        </SView>
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);