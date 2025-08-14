import React, { Component } from 'react';
import { SButtom, SForm, SHr, SIcon, SInput, SPopup, SText, STheme, SUuid, SView } from 'servisofts-component';
// import MDL from '../../MDL';
// import PButtom from '../PButtom';
import SIconApp from '../../Assets/SIconApp';
import MDL from '../../MDL';
// import Model from '../../Model';
// import SIconApp from '../../Assets/SIconApp';

export default class Perfil extends Component {

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


        return <SView col={"xs-12"} flex center>
            {/* <SHr height={18} /> */}
            <SView col={"xs-10"} center   >


                <SView col={"xs-12"} row  >
                    <SView flex row >
                        <SView col={"xs-12"} row>

                            <SIconApp name='addUser' fill='white' height={14} width={16} style={{ paddingRight: 8, }} />
                            <SText bold fontSize={18}>{this.ProveedorItem.key ? "Editar Proveedor" : "Registrar Nuevo Proveedor"}</SText>
                            <SHr height={8} />
                            <SText fontSize={12}>Complete la información.</SText>
                        </SView>
                    </SView>

                    <SView col={"xs-1"} center >
                        <SView col={"xs-12"} center onPress={() => { SPopup.close("popup_config_horario"); }}>
                            <SIcon name="Cerrar" fill="white" width={14} />
                        </SView>
                    </SView>
                </SView>

                <SHr height={14} />


                <SView col={"xs-12"} style={{ paddingHorizontal: 16 }} border={STheme.color.card} >
                    <SForm
                        ref={(ref) => this.form = ref}
                        row
                        style={{ justifyContent: "space-between" }}
                        inputs={{
                            "razon_social": {
                                col: "xs-12",
                                label: "Razón Social",
                                // required: true,
                                defaultValue: this.props.data?.razon_social,
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
                                col: "xs-12",
                                label: "Teléfono",
                                type: "telefono",
                                defaultValue: this.props.data?.telefono,
                                onSubmitEditing: () => this.form?.submit(),
                            },

                            //   telefono: {
                            //     col: "xs-12",
                            //     label: "Teléfono",
                            //     type: "telefono",
                            //     defaultValue: this.props.data?.telefono,
                            //     onSubmitEditing: () => this.form?.submit(),
                            // },

                        }}
                        onSubmit={(val) => {
                            const data = {
                                ...val,
                                key_cuenta_contable: "1.0.1",
                            };

                            console.log("todo  " + JSON.stringify(data))

                            if (this.ProveedorItem?.key) {

                                data.key = this.ProveedorItem?.key;
                                MDL.compra_venta.proveedor.editar(data).then((res) => {
                                    this.props.onReload();
                                }).catch(
                                    console.log("Actualizae error")
                                )
                            } else {
                                MDL.compra_venta.proveedor.registrar(data).then((res) => {
                                    this.props.onReload();
                                }).catch(
                                    console.log("Registrar error")
                                )
                            }

                            this.forceUpdate();
                            SPopup.close("popup_config_horario");
                        }}
                    />
                </SView>

                <SHr />

                <SView row col={"xs-12"}  >
                    <SButtom type='danger' onPress={() => { SPopup.close("popup_config_horario"); }}>CANCELAR</SButtom>
                    <SView width={24} />
                    <SButtom type='outline' onPress={() => this.form?.submit()}>{this.ProveedorItem?.key ? "ACTUALIZAR" : "CREAR"}</SButtom>
                </SView>
            </SView>


        </SView>
    }
}
