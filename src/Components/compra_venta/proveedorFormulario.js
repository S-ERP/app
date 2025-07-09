import React, { Component } from 'react';
import { SForm, SHr, SIcon, SInput, SPopup, SText, STheme, SUuid, SView } from 'servisofts-component';
import MDL from '../../MDL';
import PButtom from '../PButtom';
import Model from '../../Model';

export default class ProveedorFormulario extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.ProveedorItem = {
            key: "",
            razon_social: "",
            nit: "",
            nombre: "",
            telefono: "",
            key_cuenta_contable: "",
            key_empresa: "",
        }
    }


    componentDidMount() {
        if (!this.props.key_proveedor) return;
        // console.log("mira  " + this.props.key_proveedor)

        MDL.compra_venta.proveedor.getByKey(this.props.key_proveedor).then((res) => {
            this.ProveedorItem = res;
            this.forceUpdate();
        }).catch((err) => {
            console.log("Error al cargar proveedor:", err);
        });
    }




    render() {


        return <SView col={"xs-12"} flex>
            <SHr height={18} />
            <SView col={"xs-11.5"} row>
                <SView flex row ><SIcon name='clock' width={18} style={{ paddingRight: 8, }} stroke='white' />
                    <SText bold>{this.ProveedorItem.key ? "Editar Proveedor" : "Registrar Nuevo Proveedor"}</SText>
                </SView>
                <SView col={"xs-1"} center >
                    <SView col={"xs-12"} center onPress={() => {
                        SPopup.close("popup_config_horario");
                    }}>
                        <SIcon name="Cerrar" fill="white" width={14} />
                    </SView>
                </SView>
            </SView>

            <SHr height={14} />


            <SView col={"xs-11.5"} style={{ paddingHorizontal: 16 }} border={STheme.color.card} >
                <SForm
                    ref={(ref) => this.form = ref}
                    row
                    style={{ justifyContent: "space-between" }}
                    inputs={{
                        "razon_social": {
                            col: "xs-12",
                            label: "Razón Social",
                            // required: true,
                            defaultValue: this.props.data?.razon_social ,
                            onSubmitEditing: () => this.form?.focus("nit"),

                        },
                        "nit": {
                            col: "xs-12",
                            label: "NIT",
                            defaultValue: this.props.data?.nit,
                            onSubmitEditing: () => this.form?.focus("nombre"),

                        },
                        nombre: {
                            col: "xs-12",
                            label: "Nombre del contacto",
                            defaultValue: this.props.data?.nombre,
                            onSubmitEditing: () => this.form?.focus("telefono"),

                        },
                        telefono: {
                            col: "xs-6",
                            label: "Teléfono",
                            type: "telefono",
                            defaultValue: this.props.data?.telefono,
                            onSubmitEditing: () => this.form?.submit(),
                        },
                    }}
                    onSubmit={(val) => {
                        const data = {
                            ...val,
                            //   key_empresa: SNavigation.getState().empresa.key,
                            key_cuenta_contable: "1.0.1",
                        };

                        console.log("todo  " + JSON.stringify(data))

                        if (this.ProveedorItem?.key) {

                            data.key = this.ProveedorItem?.key;
                            MDL.compra_venta.proveedor.editar(data).then((res) => {
                                console.log("actualizacion exitosa  ")
                            }).catch(
                                console.log("actualizacion erronea  ")
                            )
                        } else {
                            // console.log("save " + data)
                            // data.key_empresa = Model.empresa.;

                            MDL.compra_venta.proveedor.registrar(data).then((res) => {
                                console.log("actualizacion exitosa  ")
                            }).catch(
                                console.log("actualizacion erronea  ")
                            )
                        }

                        this.forceUpdate();


                        SPopup.close("popup_config_horario");
                        // Aquí haces tu registro:
                        // MDL.compra_venta.registrarProveedor(data).then(...);
                    }}
                />
            </SView>

            <SHr />

            <SView row col={"xs-12"}>
                {/* {this.props.onCancel && <>
                    <PButtom flex type='danger' onPress={() => {
                        if (this.props.onCancel) this.props.onCancel()
                    }}>CANCELAR</PButtom>
                    <SView width={8} />
                </>} */}

                <PButtom flex type="primary" onPress={() => this.form?.submit()}>{this.ProveedorItem?.key ? "ACTUALIZAR" : "CREAR"}</PButtom>


            </SView>


        </SView>
    }
}
