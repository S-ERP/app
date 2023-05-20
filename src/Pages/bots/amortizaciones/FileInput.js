import React, { Component } from 'react';
import { SHr, SInput, SLoad, SText, SView } from 'servisofts-component';
import * as xlsx from 'xlsx';

type FileInputPropsType = {
    onChange: (any) => any;
}
export default class FileInput extends Component<FileInputPropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    async onChangeValue(files) {
        this.setState({ loading: true });
        const file = files[0].file;
        const reader = new FileReader();
        const ele = this;
        const INSTANCE = this;
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = xlsx.read(data, { type: 'array', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            let json = xlsx.utils.sheet_to_json(sheet);
            let productos = [];
            let marcas = {};
            let modelos = {};
            let colores = {};
            let anos = {};
            let index;
            for (let i = 0; i < json.length; i++) {
                if (json[i]["MARCA:"]) {
                    productos.push(json[i]);
                    index = productos.length - 1;
                    if (!marcas[json[i]["MARCA:"]]) marcas[json[i]["MARCA:"]] = true;
                }
                if (json[i]["MODELO:"]) {
                    if (!modelos[json[i]["MODELO:"]]) modelos[json[i]["MODELO:"]] = true;
                }
                if (json[i]["COLOR:"]) {
                    if (!colores[json[i]["COLOR:"]]) colores[json[i]["COLOR:"]] = true;
                }
                if (json[i]["AÑO:"]) {
                    if (!anos[json[i]["AÑO:"]]) anos[json[i]["AÑO:"]] = true;
                }


                if (!productos[index]["cuotas"]) productos[index]["cuotas"] = [];
                let obj = {...json[i]}
                delete obj.cuotas;
                productos[index]["cuotas"].push(obj);
            }
            let obj = {};
            obj["productos"] = productos;
            obj["marcas"] = marcas;
            obj["modelos"] = modelos;
            obj["colores"] = colores;
            obj["anos"] = anos;
            if (INSTANCE.props.onChange) {
                INSTANCE.props.onChange(obj);
            }
            INSTANCE.setState({ loading: false });
        };
        reader.readAsArrayBuffer(file);
    }

    render() {
        return (
            <SView col={"xs-12"}>
                <SInput type={"file"} onChangeText={this.onChangeValue.bind(this)} />
                <SLoad hidden={!this.state.loading}/>
            </SView>
        );
    }
}
