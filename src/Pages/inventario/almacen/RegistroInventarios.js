import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SIcon, SImage, SInput, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';

import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import Config from '../../../Config';
import FormularioModelo from '../../productos/Components/FormularioModelo';
import FloatButtom from '../../../Components/FloatButtom';
import FloatMenu from '../../../Components/FloatMenu';
import SIconApp from '../../../Assets/SIconApp';
import FormularioAgregarInventario from '../../productos/Components/FormularioAgregarInventario';
import BarcodeIcon from '../../../Components/BarcodeScanner/BarcodeIcon';
import PopupDetalleModelo from '../../productos/Components/PopupDetalleModelo';
import PopupDesglose from '../../productos/Components/PopupDesglose';

// import FormularioAgregarInventario from '../Components/FormularioAgregarInventario';
// import BarcodeIcon from '../../../Components/BarcodeScanner/BarcodeIcon';
// import PopupDetalleModelo from '../Components/PopupDetalleModelo';
// import PopupDesglose from '../Components/PopupDesglose';

export default class RegistroInventarios extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: new Date().getTime()
        };
        this.pintarColor = STheme.color.card;
    }

    // listenerQr = null;
    modelos = null;

    async loadData() {
        const modelos = await MDL.inventario.getAllModeloStock();
        this.modelos = modelos;
        return modelos;
    }


    colorStock(cant_stock, cant_inv) {

        if (cant_stock == null || cant_stock == "") return this.pintarColor = STheme.color.card;


        if (cant_stock > cant_inv) return this.pintarColor = "red";
        if (cant_stock < cant_inv) return this.pintarColor = "yellow";
        if (cant_stock == cant_inv) return this.pintarColor = "green";
        return this.pintarColor = STheme.color.card; // por si ocurre un caso inesperado
    }




    render() {
        return <SPage title={"Gestion de Inventario"} disableScroll >

            <SView row center>



                <BarcodeIcon onChange={(barcode) => {
                    if (this.modelos) {
                        const modelo = this.modelos.find(m => m.barcode === barcode);
                        if (modelo) {
                            const fil = this.table.filtros.find(f => f.col === "barcode");
                            this.table.filtros.splice(this.table.filtros.indexOf(fil), 1);
                            this.table.filtros.push({
                                col: "barcode",
                                value: modelo.barcode,
                                operator: "=",

                            })
                            this.table.applyFilter();
                            SNotification.send({
                                title: modelo.descripcion,
                                // body: `El modelo ${modelo.descripcion} ha sido encontrado.`,
                                image: SSocket.api.inventario + "modelo/" + modelo.key + "?date=" + this.state.time,
                                time: 5000,
                            })
                            // this.table.setSelect(modelo.key);
                        }
                    }
                    console.log("Barcode read:", barcode);
                }} />


                <SView width={20}/>

                <SView width={140} height={26} center backgroundColor={STheme.color.card} style={{ borderRadius: 4 }}  >
                    <SText fontSize={12} color={STheme.color.white} onPress={() => {
                        const modelosCargados = this.modelos;
                        const modeloConDatos = this.table?.data || [];

                        // console.log("🟦 Modelos cargados desde loadData:");
                        // console.log(modelosCargados); // OK: no circular

                        const save_cache = {};

                        (modeloConDatos || []).forEach((e, index) => {
                            if (!e.key) return; // ignorar si no hay key_modelo
                            save_cache[index] = {
                                // save_cache[e.key] = {
                                key_modelo: e.key,
                                 cant_inventario: e.cant_inventario
                            };
                        });



                        const save_cacheV2 = (this.table?.data || [])
                            .filter(e => e.key)
                            .map(e => [e.key, e.cant_inventario]);

                        const save_cacheV3 = {};

                        (this.table?.data || []).forEach(e => {
                            if (!e.key) return;
                            save_cacheV3[e.key] = e.cant_inventario ?? 0; // si viene null, lo pone en 0
                        });




                        console.log("🧠 save_cache:");
                        console.log(JSON.stringify(save_cacheV3)); // OK: no circular



                        // SNotification.send({
                        //     title: "Datos mostrados",
                        //     body: "Revisá consola para ver los modelos.",
                        //     color: STheme.color.info
                        // });
                    }}>
                        {"Confirmar inventario"}
                    </SText>

                </SView>

            </SView>
            <DinamicTable
                ref={ref => this.table = ref}
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                selectType='single'
                language='es'
                loadData={this.loadData.bind(this)}
            >
                <DinamicTable.Col key="index" label="#" textStyle={{ color: STheme.color.lightGray }} width={40} data={(e) => e.index + 1} />
                <DinamicTable.Col key={"tipo_producto"} label='Tipo' width={150} data={(e) => e.row?.tipo_producto?.descripcion}
                    customComponent={e => <ImageLabel {...e}
                        src={SSocket.api.inventario + "tipo_producto/.128_" + e.row.key_tipo_producto + "?date=" + this.state.time}
                        srcPreview={SSocket.api.inventario + "tipo_producto/" + e.row.key_tipo_producto + "?date=" + this.state.time}
                    />}
                />
                <DinamicTable.Col key={"marca"} label='Marca' width={150} data={(e) => e.row?.marca?.descripcion}
                    customComponent={e => <ImageLabel {...e}
                        src={SSocket.api.inventario + "marca/.128_" + e.row.key_marca + "?date=" + this.state.time}
                        srcPreview={SSocket.api.inventario + "marca/" + e.row.key_marca + "?date=" + this.state.time}
                    />}
                />
                <DinamicTable.Col key={"nombre"} label='Nombre' width={200} data={(e) => e.row.descripcion}
                    textStyle={{ fontWeight: "bold" }}
                    customComponent={e => <ImageLabel {...e}
                        src={SSocket.api.inventario + "modelo/.128_" + e.row.key + "?date=" + this.state.time}
                        srcPreview={SSocket.api.inventario + "modelo/" + e.row.key + "?date=" + this.state.time}
                    />}
                />


                <DinamicTable.Col key={"stock"} label='Stock' dataType='number' width={70} data={(e) => e.row.stock ? parseFloat(e.row.stock) : 0} />

                <DinamicTable.Col
                    key={"cant_inventario"}
                    label="Inventariar"
                    dataType="number"
                    width={120}
                    data={(e) => e.row.stock ? parseFloat(e.row.stock) : 0}
                    customComponent={(e) => {
                        const color = this.colorStock(e.row.stock, e.row.cant_inventario);
                        return (
                            <SInput
                                ref={(ref) => e.row.inputRef = ref} // guardamos ref si luego quieres acceder
                                type="number"
                                maxLength={3}
                                defaultValue={e.row.cant_inventario}
                                style={{
                                    borderWidth: 0.1,
                                    borderColor: color,
                                    backgroundColor: "transparent",
                                    textAlign: "center",
                                    paddingStart: 0,
                                    paddingEnd: 0,
                                }}
                                onChangeText={(value) => {
                                    e.row.cant_inventario = Number(value); // actualiza el valor del row
                                    this.forceUpdate(); // para que se repinte el color dinámico
                                }}
                            />
                        );
                    }}
                />

                {/* <DinamicTable.Col key={"tipo_producto_tipo"} label='Tipo Contable sd' width={150} data={(e) => e.row?.tipo_producto?.tipo} />
                <DinamicTable.Col key={"barcode"} label='BarCode' width={100} data={(e) => e.row?.barcode} /> */}
            </DinamicTable>


            {/* <FloatButtom onPress={() => {
                PopupDetalleModelo.open({
                    key_modelo: null,
                    editObject: null,
                    onSuccess: () => {
                        if (this.table) {
                            this.table.loadData();
                            this.state.time = new Date().getTime();
                        }
                    }
                });
            }} /> */}
        </SPage>
    }
}


const ImageLabel = (props) => {
    return <SView row style={{
        alignItems: "center",
    }}>
        <SView style={{
            width: 30,
            height: 30,
            borderRadius: 4,
            overflow: "hidden",
            backgroundColor: STheme.color.card + "66",
        }}>
            <SImage src={props.src} enablePreview
                srcPreview={props.srcPreview}
                style={{
                    resizeMode: "cover",
                }} />
        </SView>
        <SView width={8} />
        <SText flex style={props.textStyle} numberOfLines={1} >{props.data}</SText>
    </SView>
}