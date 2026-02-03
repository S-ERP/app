import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../../../Config';
import PopupAgregarTipoCosto from './PopupAgregarTipoCosto';
import FloatButtom from '../../../../Components/FloatButtom';
import { Keyframe } from 'react-native-reanimated';

// aqui me pasas Keyframe,odelo y traigo sus contactos
export default class PopupDesgloseTipoCosto extends Component {
    static open({ data, key_modelo }) {
        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView col={"xs-11  "} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 700 }} padding={16} withoutFeedback >
                    <SView col={"xs-12"} height={470} center >
                        <PopupDesgloseTipoCosto data={data} key_modelo={key_modelo}   ></PopupDesgloseTipoCosto>
                    </SView>
                </SView>
            )
        });
    }
    constructor(props) {
        super(props);
        this.state = {
            _data: this.props.data,
        };
    }

    async loadData() {
        const contactos = (this.state._data?.contactos || []).map((c, index) => ({
            ...c, // todos los datos del contacto
            modelo: this.state._data.descripcion, // agregamos descripción del producto
            tipo_contable: this.state._data.tipo_producto.tipo, // agregamos descripción del producto
            tipo: this.state._data.tipo_producto.descripcion, // agregamos descripción del producto
            producto_key: this.state._data.key,   // agregamos key del producto
            index: index
        }));
        return contactos;
    }

    componentDidMount() {
        const aleluya = this.state._data;
        console.log("%c" + JSON.stringify(aleluya, null, 2), "color: #2ECC40; font-weight: bold;");
    }
    render() {


        return (<>

            <SText>sssss {this.props.key_modelo}</SText>
            <DinamicTable
                ref={ref => this.table = ref}
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                selectType='single'
                language='es'
                loadData={this.loadData.bind(this)} // <-- ahora la tabla recibe todos los contactos
            >
                <DinamicTable.Col key="index" label="#" width={24} data={e => e.row?.index + 1} />
                <DinamicTable.Col key="modelo" label="Modelo" width={200} data={e => e.row?.modelo} />
                <DinamicTable.Col key="cliente" label="Cliente" width={150} data={e => e.row?.cliente?.nombres} />
                <DinamicTable.Col key="comision" label="Comisión" width={50} data={e => e.row?.comision} />
                <DinamicTable.Col key="key_tipo_costo" label=" key Tipo Costo" width={150} data={e => e.row?.key_tipo_costo} />
                <DinamicTable.Col key="tipo_costo" label="Tipo Costo" width={120} data={e => e.row?.tipo_costo?.descripcion} />
                <DinamicTable.Col key="key_cuenta" label="key Cuenta Contable" width={150} data={e => e.row?.key_cuenta_contable} />
                <DinamicTable.Col key="tipo_contable" label="Cuenta Contable" width={80} data={e => e.row?.tipo_contable} />
                <DinamicTable.Col key="tipo" label="Tipo" width={120} data={e => e.row?.tipo} />
            </DinamicTable>
            <FloatButtom onPress={() => {
                PopupAgregarTipoCosto.open({
                    // key_modelo: null,
                    // editObject: null,
                    // onSuccess: () => {
                    //     if (this.table) {
                    //         this.table.loadData();
                    //         this.state.time = new Date().getTime();
                    //     }
                    // }
                });
            }} />
        </>

        );
    }


}
