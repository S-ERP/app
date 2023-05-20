import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SIcon, SList, SLoad, SText, STheme, SView } from 'servisofts-component';
import Tipo_pago from '.';
import Model from '../../../Model';

type indexPropsType = {
    onSelect: (tipo_pago) => any,
    select: any,
    exclude?: [],
    include?: [],
}
export default class index extends Component<indexPropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    isSelect(obj) {
        if (!this.props.select) return null;
        if (this.props.select != obj.key) return null;
        return <SIcon name={"Check"} />
    }
    render_data() {
        var tipos_pago = Model.tipo_pago.Action.getAll();
        if (!tipos_pago) return <SLoad />
        console.log(tipos_pago)

        return <SList
            data={tipos_pago}
            filter={(a) => ((this.props.include ?? []).indexOf(a.key) >= 0)}
            render={(obj) => {
                return <SView col={"xs-12"} card style={{ padding: 4 }} row center onPress={() => {
                    if (this.props.onSelect) {
                        this.props.onSelect(obj)
                    }
                }}>
                    <SView style={{ padding: 4 }}>
                        <SView width={40} height={40} card >
                            <Tipo_pago.Icon type={obj.key} />
                        </SView>
                    </SView>
                    <SView flex>
                        <SText>{obj.descripcion}</SText>
                        <SText fontSize={10} color={STheme.color.lightGray}>{obj.observacion}</SText>
                    </SView>
                    <SView style={{ padding: 4 }}>
                        <SView width={40} height={40} card >
                            {this.isSelect(obj)}
                        </SView>
                    </SView>
                </SView>
            }}
        />
    }

    render() {
        return (
            <SView col={"xs-12"} center >
                {this.render_data()}
            </SView>
        );
    }
}
