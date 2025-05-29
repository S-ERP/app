
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MDL from '../../../MDL';
import { DinamicTable } from 'servisofts-table';
import { SForm, SHr, SIcon, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';


type FormRegistroType = {
 onRegister: (e: any) => void,
 onActualizar: (e: any) => void,
 onCancel?: () => void,
}

export default class FormRegistroCliente extends Component<FormRegistroType & { defaultData?: any }> {
 static open(props: FormRegistroType) {
  SPopup.open({
   key: "ppupregistro",
   content: <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}>
    <FormRegistroCliente {...props} onRegister={(e) => {
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
 form: SForm | null = null;
 render() {

  const { defaultData } = this.props;


  return <SView center>
   <SText bold>{defaultData ? "Editar Cliente" : "Crear Cliente"}</SText>

   <SForm
    ref={(ref: any) => this.form = ref}
    inputs={{
     nombres: {
      label: "Nombres",
      required: true,
      defaultValue: defaultData?.nombres,
      autoFocus: true,
      onSubmitEditing: () => this.form?.focus("apellidos"),
     },
     apellidos: {
      label: "Apellidos",
      required: true,
      defaultValue: defaultData?.apellidos,
      onSubmitEditing: () => this.form?.focus("telefono"),
     },
     telefono: {
      label: "Teléfono",
      required: true,
      defaultValue: defaultData?.telefono,
      type: "phone",
      onSubmitEditing: () => this.form?.focus("correo"),
     },
     // correo: {
     //  label: "Correo",
     //  type: "email",
     //  defaultValue: defaultData?.correo,
     //  onSubmitEditing: () => this.form?.focus("nit"),
     // },
     // nit: {
     //  label: "NIT",
     //  defaultValue: defaultData?.nit,
     //  onSubmitEditing: () => this.form?.focus("razon_social"),
     // },
     // razon_social: {
     //  label: "Razón Social",
     //  defaultValue: defaultData?.razon_social,
     //  onSubmitEditing: () => this.form?.focus("direccion"),
     // },
     // direccion: {
     //  label: "Dirección",
     //  defaultValue: defaultData?.direccion,
     //  onSubmitEditing: () => this.form?.focus("lat"),
     // },
     // lat: {
     //  label: "Latitud",
     //  type: "number",
     //  defaultValue: defaultData?.lat,
     //  onSubmitEditing: () => this.form?.focus("lng"),
     // },
     // lng: {
     //  label: "Longitud",
     //  type: "number",
     //  defaultValue: defaultData?.lng,
     //  onSubmitEditing: () => this.form?.focus("fecha_nacimiento"),
     // },
     // fecha_nacimiento: {
     //  label: "Fecha de Nacimiento",
     //  type: "date",
     //  defaultValue: defaultData?.fecha_nacimiento,
     //  onSubmitEditing: () => this.form?.focus("sexo"),
     // },
     // sexo: {
     //  label: "Sexo",
     //  type: "select",
     //  options: ["Masculino", "Femenino", "Otro"],
     //  defaultValue: defaultData?.sexo,
     //  onSubmitEditing: () => this.form?.focus("descripcion"),
     // },
     descripcion: {
      label: "Descripción",
      type: "textArea",
      defaultValue: defaultData?.descripcion,
      onSubmitEditing: () => this.form?.submit(),
     }
    }}
    onSubmit={(e: any) => {

     const data = { ...defaultData, ...e };
     const prom = data?.key ? MDL.crm.cliente.editar(data) : MDL.crm.cliente.registrar(data);

     SNotification.send({ key: "registro", title: "Guardando...", type: "loading" });

     prom.then((res) => {
      SNotification.send({ key: "registro", title: data?.key ? "Actualizado" : "Registrado", color: STheme.color.success, time: 5000 });
      if (data?.key) {
       this.props.onActualizar?.(res);
      } else {
       this.props.onRegister?.(res);
      }
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

    <PButtom flex type="primary" onPress={() => this.form?.submit()}>{defaultData ? "ACTUALIZAR" : "CREAR"}</PButtom>

    {/* <PButtom flex type='primary' onPress={() => {
                    if (this.form) this.form.submit();
                }}>CREAR</PButtom> */}
   </SView>
  </SView >
 }
}
