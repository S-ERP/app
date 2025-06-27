
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MDL from '../../../MDL';
import { DinamicTable } from 'servisofts-table';
import { SForm, SHr, SIcon, SNotification, SPopup, SText, STheme, SThread, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';
import SIconApp from '../../../Assets/SIconApp';


type FormRegistroType = {
    onRegister: (e: any) => void,
    onActualizar: (e: any) => void,
    onCancel?: () => void,
    state: any,
}

export default class FormRegistroLead extends Component<FormRegistroType & { defaultData?: any }> {
    static open(props: FormRegistroType) {
        SPopup.open({
            key: "ppupregistro",
            content: <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}>
                <FormRegistroLead {...props} onRegister={(e) => {
                    SPopup.close("ppupregistro")
                    if (props.onRegister) props.onRegister(e)
                }}
                    onCancel={() => {
                        SPopup.close("ppupregistro")
                        if (props.onCancel) props.onCancel()
                    }}
                />
            </SView>
        })
    }



    state = {}
    componentDidMount(): void {
        this.loadData();
    }
    async loadData() {
        const proyectos = await MDL.crm.proyecto.getAll()
        const campanas = await MDL.crm.campana.getAll()

        let finalArray: any = [];
        proyectos.map((proyecto: any) => {
            const campanasdelproyecto = campanas.filter((campana: any) => campana.key_proyecto === proyecto.key);
            finalArray = [...finalArray, ...campanasdelproyecto.map((campana: any) => {
                return {
                    "key": campana.key,
                    content: proyecto.nombre + " / " + campana.nombre
                }
            })]
            return proyecto;
        })
        this.setState({
            campanas: finalArray
        })


    }

    hanldeEditTelefono = () => {
        MDL.crm.cliente.buscar_telefono(this.form?.getValues().telefono).then(e => {
            this.form?.setValues({
                nombres: e?.nombres || "",
                departamento: e?.departamento || "",
            })
        }).catch(e => {
            this.form?.setValues({
                nombres: "",
                departamento: "",
            })
            console.log(e)
        })
    }
    form: SForm | null = null;
    render() {

        const { defaultData } = this.props;

        return <SView center>
            <SText bold>{defaultData ? "Actualizar lead" : "Registrar lead"}</SText>
            <SHr height={10} />
            <SForm row ref={(ref: any) => this.form = ref}
                style={{ justifyContent: "space-between" }}
                inputs={{
                    telefono: {
                        col: "xs-12",
                        label: "Teléfono",
                        type: 'phone',
                        required: true,
                        autoFocus: true,
                        defaultValue: defaultData?.telefono,
                        iconR:<SView width={30} height={30} center onPress={()=>{
                            this.hanldeEditTelefono();
                        }}>
                            <SIconApp name='Search' fill={STheme.color.lightGray}/>
                        </SView>,
                        //   type: "phone",
                        onChangeText: (text: string) => {
                            new SThread(2000, "buscar_telefono", true).start(() => {
                                this.hanldeEditTelefono();
                            })
                        },
                        onSubmitEditing: () => {
                            this.hanldeEditTelefono();
                            this.form?.focus("correo")
                        }
                    },
                    nombres: {
                        col: "xs-12",
                        label: "Nombre completo",
                        //   required: true,
                        defaultValue: defaultData?.nombres,
                        onSubmitEditing: () => this.form?.focus("departamento"),
                    },

                    // correo: {
                    //     col: "xs-12",
                    //     label: "Correo",
                    //     type: "email",
                    //     //   required: true,
                    //     defaultValue: defaultData?.correo,
                    //     onSubmitEditing: () => this.form?.focus("departamento"),
                    // },
                    departamento: {
                        col: "xs-12",
                        label: "Departamento",
                        type: "select2",
                        options: MDL.crm.paises[0].departamentos.map(a => {
                            return a.nombre
                        }),
                        required: true,
                        defaultValue: defaultData?.departamento,
                        onSubmitEditing: () => this.form?.focus("nit"),
                    },
                    key_campana: {
                        col: "xs-12",
                        label: "Proyecto / Campaña",
                        type: "select",
                        options: this.state.campanas || [],
                        required: true,
                        defaultValue: defaultData?.departamento,
                        onSubmitEditing: () => this.form?.focus("nit"),
                    },

                }}
                onSubmit={(e: any) => {

                    // const data = { ...defaultData, ...e };
                    // const prom = data?.key ? MDL.crm.cliente.editar(data) : MDL.crm.cliente.registrar(data);

                    // SNotification.send({ key: "registro", title: "Guardando...", type: "loading" });
                    e.state = this.props.state || "nuevo";
                    MDL.crm.campana.me_interesa(e).then((res) => {
                        // SNotification.send({ key: "registro", title: data?.key ? "Actualizado" : "Registrado", color: STheme.color.success, time: 5000 });
                        // if (data?.key) {
                        //     this.props.onActualizar?.(res);
                        // } else {
                        this.props.onRegister?.(res);
                        // }
                        SPopup.close("ppupregistro");
                    }).catch((err) => {
                        SNotification.send({ key: "registro", title: "Error", body: err, color: STheme.color.danger });
                    });



                }}
            />
            <SHr />
            <SView row col={"xs-12"}>
                {this.props.onCancel && <>
                    <PButtom flex type='danger' onPress={() => {
                        if (this.props.onCancel) this.props.onCancel()
                    }}>CANCELAR</PButtom>
                    <SView width={8} />
                </>}


                <PButtom flex type="secondary" onPress={() => this.form?.submit()}>{defaultData ? "ACTUALIZAR" : "ACEPTAR"}</PButtom>

            </SView>
        </SView >
    }
}
