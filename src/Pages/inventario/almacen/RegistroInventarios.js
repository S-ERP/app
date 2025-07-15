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


export default class RegistroInventarios extends Component {

    constructor(props) {
        super(props);
        this.state = {
            time: new Date().getTime()
        };
        this.key_almacen = SNavigation.getParam("pk");
        this.key_conteoxxx = SNavigation.getParam("key_conteo");
        this.pintarColor = STheme.color.card;
    }

    modelos = null;

    async loadData() {


        // const modelos = await MDL.inventario.getAllModeloStock();
        // const modelosByContador = await MDL.inventario.getByKey_reporte_conteo_inventario_detallado(this.key_conteoxxx);


        if (this.key_conteoxxx) {
            const modelosByContador = await MDL.inventario.getByKey_reporte_conteo_inventario_detallado(this.key_conteoxxx);
            this.modelos = modelosByContador;

        } else {
            const modelos = await MDL.inventario.getAllModeloStock();
            this.modelos = modelos;
        }
        // this.forceUpdate();


        console.log("ddd", this.modelos);

        // console.log("modelosByContador " + JSON.stringify(modelosByContador) )
        return this.modelos;
    }


    componentDidMount(): void {


        // if (this.key_conteoxxx) {

        // console.log("si  key_conteo", this.key_conteoxxx);
        // MDL.inventario.getByKey_reporte_conteo_inventario_detallado(this.key_conteoxxx).then((resp: any) => {
        //     this.modelos = Object.values(resp)
        // })

        // console.log("si  key_conteo con data ", this.inventariossss);
        // }
        // else {

        // MDL.inventario.getAllAlmacen().then((resp: any) => {
        //     this.almacenes = Object.values(resp)

        // })
        // console.log(" no  key_conteo", this.almacenes);

        // }






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



                {/* <BarcodeIcon onChange={(barcode) => {
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
                                image: SSocket.api.inventario + "modelo/" + modelo.key + "?date=" + this.state.time,
                                time: 5000,
                            })
                        }
                    }
                    console.log("Barcode read:", barcode);
                }} /> */}


                <SView width={20} />

                <SView width={140} height={26} center backgroundColor={STheme.color.card} style={{ borderRadius: 4 }}  >
                    <SText fontSize={12} color={STheme.color.white} onPress={() => {
                        const modelosCargados = this.modelos;
                        const modeloConDatos = this.table?.data || [];

                        const save_cacheV5 = (this.table?.data || [])
                            .filter(e => this.key_conteoxxx ? e.key_modelo: e.key)
                            .map(e => ({
                                key_modelo: this.key_conteoxxx ? e.key_modelo : e.key,
                                stock: Number(e.stock) || 0,
                                cantidad_real: Number(e.cantidad_real) || 0,
                                cantidad_baja: Number(e.cantidad_baja) || 0,
                                explicacion: e.explicacion?.toString().trim() || ""
                            }));


                        console.log("🧠 save_cache:");
                        console.log(JSON.stringify(save_cacheV5)); // OK: no circular

                        // return;

                        if (this.key_conteoxxx) {
                            // return;


                            MDL.inventario.updateConteoManualInventario(save_cacheV5, this.key_almacen, this.key_conteoxxx).then((resp) => {
                                console.log("Conteo actualizado:", resp);
                                this.forceUpdate();
                            }).catch((e: any) => {
                                console.error("Error al guardar el tipo de producto:", e);
                            })

                        } else {

                            console.log("🧠 save_cache:");
                            console.log(JSON.stringify(save_cacheV5)); // OK: no circular

                            // return;
                            MDL.inventario.saveConteoManualInventario({
                                key_almacen: this.key_almacen,
                                data: save_cacheV5
                            }).then((resp) => {
                                this.forceUpdate();
                            }).catch((e: any) => {
                                console.error("Error al guardar el tipo de producto:", e);
                            })
                        }
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
                    key={"cantidad_real"}
                    label="Cant. Inventario"
                    dataType="number"
                    width={120}
                    data={(e) => e.row.cantidad_real ? parseFloat(e.row.cantidad_real) : 0}
                    customComponent={(e) => {
                        const color = this.colorStock(e.row.stock, e.row.cantidad_real);
                        return (
                            <SInput
                                ref={(ref) => e.row.inputRef = ref} // guardamos ref si luego quieres acceder
                                type="number"
                                maxLength={3}
                                defaultValue={Number(e.row.cantidad_real) || 0}
                                style={{
                                    borderWidth: 0.1,
                                    borderColor: color,
                                    backgroundColor: "transparent",
                                    textAlign: "center",
                                    paddingStart: 0,
                                    paddingEnd: 0,
                                }}
                                onChangeText={(value) => {
                                    e.row.cantidad_real = Number(value); // actualiza el valor del row
                                    this.forceUpdate(); // para que se repinte el color dinámico
                                }}
                            />
                        );
                    }}
                />

                <DinamicTable.Col
                    key={"cantidad_baja"}
                    label="Cant. Baja"
                    dataType="number"
                    width={120}
                    data={(e) => e.row.cantidad_baja ? parseFloat(e.row.cantidad_baja) : 0}
                    customComponent={(e) => {
                        // const color = this.colorStock(e.row.stock, e.row.cant_inventario);
                        return (
                            <SInput
                                ref={(ref) => e.row.inputRef = ref} // guardamos ref si luego quieres acceder
                                type="number"
                                maxLength={3}
                                defaultValue={Number(e.row.cantidad_baja) || 0}
                                style={{
                                    borderWidth: 0.1,
                                    borderColor: STheme.color.card,
                                    backgroundColor: "transparent",
                                    textAlign: "center",
                                    paddingStart: 0,
                                    paddingEnd: 0,
                                }}
                                onChangeText={(value) => {
                                    e.row.cantidad_baja = Number(value); // actualiza el valor del row
                                    this.forceUpdate(); // para que se repinte el color dinámico
                                }}
                            />
                        );
                    }}
                />
                <DinamicTable.Col
                    key={"explicacion"}
                    label="Observación"
                    width={350}
                    data={(e) => e.row?.explicacion}
                    customComponent={(e) => {
                        // const color = this.colorStock(e.row.stock, e.row.cant_inventario);
                        return (
                            <SInput
                                ref={(ref) => e.row.inputRef = ref} // guardamos ref si luego quieres acceder
                                defaultValue={e.row?.explicacion || ""}
                                style={{
                                    borderWidth: 0.1,
                                    borderColor: STheme.color.card,
                                    backgroundColor: "transparent",
                                    textAlign: "center",
                                    paddingStart: 0,
                                    paddingEnd: 0,
                                }}
                                onChangeText={(value) => {
                                    e.row.explicacion = value; // actualiza el valor del row
                                    this.forceUpdate(); // para que se repinte el color dinámico
                                }}
                            />
                        );
                    }}
                />
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